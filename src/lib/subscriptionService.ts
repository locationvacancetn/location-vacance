import { supabase } from "@/integrations/supabase/client";

/**
 * Interface pour les données du formulaire d'abonnement
 */
export interface SubscriptionPlanFormData {
  productType: string;
  name: string;
  price: string;
  pricePromo: string;
  duration: string;
  gracePeriod: string;
  badge: string;
  // Limitations spécifiques
  maxAnnounces?: string;
  maxImagesPerAnnounce?: string;
  maxDaysFeatured?: string;
  maxAds?: string;
  adDurationDays?: string;
}

/**
 * Interface pour une fonctionnalité ou un point fort
 */
export interface Feature {
  id: string;
  text: string;
}

/**
 * Crée un slug à partir d'un nom
 */
function createSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Supprime les accents
    .replace(/[^a-z0-9\s-]/g, "") // Supprime les caractères spéciaux
    .trim()
    .replace(/\s+/g, "-") // Remplace les espaces par des tirets
    .replace(/-+/g, "-"); // Supprime les tirets multiples
}

/**
 * Récupère l'ID du produit selon le type
 */
async function getProductId(productType: string): Promise<string | null> {
  const slugMap: Record<string, string> = {
    annonce: "annonce-listing",
    vedette: "featured-listing",
    pub: "advertisement",
  };

  const slug = slugMap[productType];
  if (!slug) {
    throw new Error(`Type de produit invalide: ${productType}`);
  }

  const { data, error } = await supabase
    .from("subscription_products")
    .select("id")
    .eq("slug", slug)
    .single();

  if (error) {
    console.error("Erreur lors de la récupération du produit:", error);
    return null;
  }

  return data?.id || null;
}

/**
 * Prépare les limitations selon le type de produit
 */
function prepareLimitations(
  productType: string,
  formData: SubscriptionPlanFormData
): Record<string, string> {
  const limitations: Record<string, string> = {};

  switch (productType) {
    case "annonce":
      if (formData.maxAnnounces) {
        limitations.max_announces = formData.maxAnnounces;
      }
      if (formData.maxImagesPerAnnounce) {
        limitations.max_images_per_announce = formData.maxImagesPerAnnounce;
      }
      break;

    case "vedette":
      if (formData.maxDaysFeatured) {
        limitations.max_days_featured = formData.maxDaysFeatured;
      }
      break;

    case "pub":
      if (formData.maxAds) {
        limitations.max_ads = formData.maxAds;
      }
      if (formData.adDurationDays) {
        limitations.ad_duration_days = formData.adDurationDays;
      }
      break;
  }

  return limitations;
}

/**
 * Sauvegarde un plan d'abonnement complet avec toutes ses données
 * 
 * ATTENTION AUX DÉTAILS :
 * - L'ordre des fonctionnalités est préservé via sort_order
 * - Les prix sont convertis en nombres
 * - Le slug est généré automatiquement
 * - Toutes les insertions sont en transaction
 */
export async function saveSubscriptionPlan(
  formData: SubscriptionPlanFormData,
  features: Feature[],
  highlights: Feature[]
): Promise<{ success: boolean; planId?: string; error?: string }> {
  try {
    // 1. Validation des données
    if (!formData.productType) {
      throw new Error("Le type de produit est obligatoire");
    }

    if (!formData.name.trim()) {
      throw new Error("Le nom du plan est obligatoire");
    }

    if (!formData.price || parseFloat(formData.price) < 0) {
      throw new Error("Le prix doit être supérieur ou égal à 0");
    }

    if (!formData.duration || parseInt(formData.duration) <= 0) {
      throw new Error("La durée doit être supérieure à 0");
    }

    // 2. Récupérer l'ID du produit
    const productId = await getProductId(formData.productType);
    if (!productId) {
      throw new Error("Produit non trouvé");
    }

    // 3. Générer le slug unique
    const slug = createSlug(formData.name);

    // Vérifier si le slug existe déjà
    const { data: existingPlan } = await supabase
      .from("subscription_plans")
      .select("id")
      .eq("slug", slug)
      .single();

    if (existingPlan) {
      throw new Error(`Un plan avec le nom "${formData.name}" existe déjà`);
    }

    // 4. Préparer les données du plan
    const planData = {
      product_id: productId,
      name: formData.name.trim(),
      slug: slug,
      price: parseFloat(formData.price),
      price_promo: formData.pricePromo ? parseFloat(formData.pricePromo) : null,
      duration_days: parseInt(formData.duration),
      grace_period_months: formData.gracePeriod ? parseInt(formData.gracePeriod) : 0,
      badge: formData.badge || null,
      subtitle: formData.subtitle || "Switch plans or cancel anytime.",
      description: formData.description || null,
      is_active: true,
      sort_order: 0, // Par défaut, peut être modifié plus tard
    };



    // 5. Insérer le plan
    const { data: insertedPlan, error: planError } = await supabase
      .from("subscription_plans")
      .insert(planData)
      .select()
      .single();

    if (planError) {
      console.error("❌ Erreur lors de l'insertion du plan:", planError);
      throw new Error(`Erreur lors de la création du plan: ${planError.message}`);
    }

    const planId = insertedPlan.id;


    // 6. Insérer les limitations
    const limitations = prepareLimitations(formData.productType, formData);
    if (Object.keys(limitations).length > 0) {
      const limitationsToInsert = Object.entries(limitations).map(([key, value]) => ({
        plan_id: planId,
        limitation_key: key,
        limitation_value: value,
      }));



      const { error: limitationsError } = await supabase
        .from("subscription_plan_limitations")
        .insert(limitationsToInsert);

      if (limitationsError) {
        console.error("❌ Erreur lors de l'insertion des limitations:", limitationsError);
        // Rollback : supprimer le plan créé
        await supabase.from("subscription_plans").delete().eq("id", planId);
        throw new Error(`Erreur lors de l'ajout des limitations: ${limitationsError.message}`);
      }


    }

    // 7. Insérer les fonctionnalités (avec ordre préservé)
    if (features.length > 0) {
      const featuresToInsert = features.map((feature, index) => ({
        plan_id: planId,
        feature_type: "feature",
        feature_text: feature.text.trim(),
        sort_order: index, // ⭐ IMPORTANT : préserver l'ordre
      }));



      const { error: featuresError } = await supabase
        .from("subscription_plan_features")
        .insert(featuresToInsert);

      if (featuresError) {
        console.error("❌ Erreur lors de l'insertion des fonctionnalités:", featuresError);
        // Rollback : supprimer le plan et les limitations
        await supabase.from("subscription_plans").delete().eq("id", planId);
        throw new Error(`Erreur lors de l'ajout des fonctionnalités: ${featuresError.message}`);
      }


    }

    // 8. Insérer les points forts (avec ordre préservé)
    if (highlights.length > 0) {
      const highlightsToInsert = highlights.map((highlight, index) => ({
        plan_id: planId,
        feature_type: "highlight",
        feature_text: highlight.text.trim(),
        sort_order: index, // ⭐ IMPORTANT : préserver l'ordre
      }));



      const { error: highlightsError } = await supabase
        .from("subscription_plan_features")
        .insert(highlightsToInsert);

      if (highlightsError) {
        console.error("❌ Erreur lors de l'insertion des points forts:", highlightsError);
        // Rollback : supprimer le plan, limitations et fonctionnalités
        await supabase.from("subscription_plans").delete().eq("id", planId);
        throw new Error(`Erreur lors de l'ajout des points forts: ${highlightsError.message}`);
      }


    }


    return { success: true, planId };

  } catch (error: any) {
    console.error("❌ Erreur lors de la sauvegarde du plan:", error);
    return { success: false, error: error.message || "Erreur inconnue" };
  }
}

/**
 * Récupère tous les plans d'abonnement avec leurs détails
 */
export async function getAllSubscriptionPlans() {
  try {
    const { data: plans, error } = await supabase
      .from("subscription_plans")
      .select(`
        *,
        product:subscription_products(*),
        limitations:subscription_plan_limitations(*),
        features:subscription_plan_features(*)
      `)
      .order("sort_order", { ascending: true });

    if (error) {
      console.error("Erreur lors de la récupération des plans:", error);
      return { success: false, error: error.message };
    }

    // Trier les features par sort_order pour chaque plan
    const plansWithSortedFeatures = plans?.map(plan => ({
      ...plan,
      features: plan.features?.sort((a: any, b: any) => a.sort_order - b.sort_order) || []
    }));

    return { success: true, plans: plansWithSortedFeatures };
  } catch (error: any) {
    console.error("Erreur lors de la récupération des plans:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Met à jour un plan d'abonnement existant
 */
export async function updateSubscriptionPlan(
  planId: string,
  formData: SubscriptionPlanFormData,
  features: Feature[],
  highlights: Feature[]
): Promise<{ success: boolean; planId?: string; error?: string }> {
  try {
    // 1. Validation des données
    if (!formData.productType) {
      throw new Error("Le type de produit est obligatoire");
    }

    if (!formData.name.trim()) {
      throw new Error("Le nom du plan est obligatoire");
    }

    if (!formData.price || parseFloat(formData.price) < 0) {
      throw new Error("Le prix doit être supérieur ou égal à 0");
    }

    if (!formData.duration || parseInt(formData.duration) <= 0) {
      throw new Error("La durée doit être supérieure à 0");
    }

    // 2. Récupérer l'ID du produit
    const productId = await getProductId(formData.productType);
    if (!productId) {
      throw new Error("Produit non trouvé");
    }

    // 3. Générer le slug unique (vérifier s'il existe déjà pour un autre plan)
    const slug = createSlug(formData.name);

    const { data: existingPlan } = await supabase
      .from("subscription_plans")
      .select("id")
      .eq("slug", slug)
      .neq("id", planId) // Exclure le plan actuel
      .single();

    if (existingPlan) {
      throw new Error(`Un autre plan avec le nom "${formData.name}" existe déjà`);
    }

    // 4. Préparer les données du plan
    const planData = {
      product_id: productId,
      name: formData.name.trim(),
      slug: slug,
      price: parseFloat(formData.price),
      price_promo: formData.pricePromo ? parseFloat(formData.pricePromo) : null,
      duration_days: parseInt(formData.duration),
      grace_period_months: formData.gracePeriod ? parseInt(formData.gracePeriod) : 0,
      badge: formData.badge || null,
      subtitle: formData.subtitle || "Switch plans or cancel anytime.",
      description: formData.description || null,
      is_active: true,
      sort_order: 0,
    };



    // 5. Mettre à jour le plan
    const { data: updatedPlan, error: planError } = await supabase
      .from("subscription_plans")
      .update(planData)
      .eq("id", planId)
      .select()
      .single();

    if (planError) {
      console.error("❌ Erreur lors de la mise à jour du plan:", planError);
      throw new Error(`Erreur lors de la mise à jour du plan: ${planError.message}`);
    }



    // 6. Supprimer les anciennes limitations
    const { error: deleteLimitationsError } = await supabase
      .from("subscription_plan_limitations")
      .delete()
      .eq("plan_id", planId);

    if (deleteLimitationsError) {
      console.error("❌ Erreur lors de la suppression des limitations:", deleteLimitationsError);
      throw new Error(`Erreur lors de la suppression des limitations: ${deleteLimitationsError.message}`);
    }

    // 7. Insérer les nouvelles limitations
    const limitations = prepareLimitations(formData.productType, formData);
    if (Object.keys(limitations).length > 0) {
      const limitationsToInsert = Object.entries(limitations).map(([key, value]) => ({
        plan_id: planId,
        limitation_key: key,
        limitation_value: value,
      }));



      const { error: limitationsError } = await supabase
        .from("subscription_plan_limitations")
        .insert(limitationsToInsert);

      if (limitationsError) {
        console.error("❌ Erreur lors de l'insertion des limitations:", limitationsError);
        throw new Error(`Erreur lors de l'ajout des limitations: ${limitationsError.message}`);
      }


    }

    // 8. Supprimer les anciennes fonctionnalités
    const { error: deleteFeaturesError } = await supabase
      .from("subscription_plan_features")
      .delete()
      .eq("plan_id", planId);

    if (deleteFeaturesError) {
      console.error("❌ Erreur lors de la suppression des fonctionnalités:", deleteFeaturesError);
      throw new Error(`Erreur lors de la suppression des fonctionnalités: ${deleteFeaturesError.message}`);
    }

    // 9. Insérer les nouvelles fonctionnalités
    if (features.length > 0) {
      const featuresToInsert = features.map((feature, index) => ({
        plan_id: planId,
        feature_type: "feature",
        feature_text: feature.text.trim(),
        sort_order: index,
      }));



      const { error: featuresError } = await supabase
        .from("subscription_plan_features")
        .insert(featuresToInsert);

      if (featuresError) {
        console.error("❌ Erreur lors de l'insertion des fonctionnalités:", featuresError);
        throw new Error(`Erreur lors de l'ajout des fonctionnalités: ${featuresError.message}`);
      }


    }

    // 10. Insérer les nouveaux points forts
    if (highlights.length > 0) {
      const highlightsToInsert = highlights.map((highlight, index) => ({
        plan_id: planId,
        feature_type: "highlight",
        feature_text: highlight.text.trim(),
        sort_order: index,
      }));



      const { error: highlightsError } = await supabase
        .from("subscription_plan_features")
        .insert(highlightsToInsert);

      if (highlightsError) {
        console.error("❌ Erreur lors de l'insertion des points forts:", highlightsError);
        throw new Error(`Erreur lors de l'ajout des points forts: ${highlightsError.message}`);
      }


    }


    return { success: true, planId };

  } catch (error: any) {
    console.error("❌ Erreur lors de la mise à jour du plan:", error);
    return { success: false, error: error.message || "Erreur inconnue" };
  }
}

/**
 * Récupère un plan d'abonnement par son ID
 */
export async function getSubscriptionPlanById(planId: string) {
  try {
    const { data: plan, error } = await supabase
      .from("subscription_plans")
      .select(`
        *,
        product:subscription_products(*),
        limitations:subscription_plan_limitations(*),
        features:subscription_plan_features(*)
      `)
      .eq("id", planId)
      .single();

    if (error) {
      console.error("Erreur lors de la récupération du plan:", error);
      return { success: false, error: error.message };
    }

    // Trier les features par sort_order
    if (plan.features) {
      plan.features.sort((a: any, b: any) => a.sort_order - b.sort_order);
    }

    return { success: true, plan };
  } catch (error: any) {
    console.error("Erreur lors de la récupération du plan:", error);
    return { success: false, error: error.message };
  }
}

