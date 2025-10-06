import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate, useParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { usePageTitle } from "@/hooks/usePageTitle";
import { Save, Plus, X, GripVertical, Check } from "lucide-react";
import { saveSubscriptionPlan, getSubscriptionPlanById, updateSubscriptionPlan } from "@/lib/subscriptionService";

interface Feature {
  id: string;
  text: string;
}

const AddSubscriptionPlan = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { title, description } = usePageTitle();
  const { id } = useParams();
  const isEditing = Boolean(id);
  const [isLoading, setIsLoading] = useState(false);

  // État du formulaire
  const [formData, setFormData] = useState({
    productType: "",
    name: "",
    price: "",
    pricePromo: "",
    duration: "",
    gracePeriod: "0",
    badge: "",
    subtitle: "Switch plans or cancel anytime.",
    description: "",
    // Limitations spécifiques
    maxAnnounces: "",
    maxImagesPerAnnounce: "",
    maxDaysFeatured: "",
    maxAds: "",
    adDurationDays: "",
  });

  // État des fonctionnalités
  const [features, setFeatures] = useState<Feature[]>([]);
  const [newFeature, setNewFeature] = useState("");
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // Le titre est maintenant géré automatiquement par usePageTitle

  // Charger les données du plan si on est en mode édition
  useEffect(() => {
    if (isEditing && id) {
      loadSubscriptionPlan(id);
    }
  }, [isEditing, id]);

  // Charger les données d'un plan existant
  const loadSubscriptionPlan = async (planId: string) => {
    try {
      setIsLoading(true);
      const result = await getSubscriptionPlanById(planId);
      
      if (!result.success || !result.plan) {
        toast({
          title: "Erreur",
          description: result.error || "Impossible de charger le plan d'abonnement",
          variant: "destructive",
        });
        navigate("/dashboard/admin/subscriptions");
        return;
      }

      const plan = result.plan;
      
      // Mapper le slug du produit vers le type
      const productTypeMap: Record<string, string> = {
        "annonce-listing": "annonce",
        "featured-listing": "vedette", 
        "advertisement": "pub"
      };

      // Récupérer les limitations
      const limitations: Record<string, string> = {};
      if (plan.limitations) {
        plan.limitations.forEach((lim: any) => {
          limitations[lim.limitation_key] = lim.limitation_value;
        });
      }

      // Récupérer les fonctionnalités
      const planFeatures: Feature[] = [];
      if (plan.features) {
        plan.features
          .filter((f: any) => f.feature_type === "feature")
          .sort((a: any, b: any) => a.sort_order - b.sort_order)
          .forEach((f: any) => {
            planFeatures.push({
              id: f.id,
              text: f.feature_text
            });
          });
      }

      // Remplir le formulaire
      setFormData({
        productType: productTypeMap[plan.product.slug] || "",
        name: plan.name || "",
        price: plan.price?.toString() || "",
        pricePromo: plan.price_promo?.toString() || "",
        duration: plan.duration_days?.toString() || "",
        gracePeriod: plan.grace_period_months?.toString() || "0",
        badge: plan.badge || "",
        subtitle: plan.subtitle || "Switch plans or cancel anytime.",
        description: plan.description || "",
        // Limitations
        maxAnnounces: limitations.max_announces || "",
        maxImagesPerAnnounce: limitations.max_images_per_announce || "",
        maxDaysFeatured: limitations.max_days_featured || "",
        maxAds: limitations.max_ads || "",
        adDurationDays: limitations.ad_duration_days || "",
      });

      setFeatures(planFeatures);

    } catch (error: any) {
      console.error("Erreur lors du chargement du plan:", error);
      toast({
        title: "Erreur",
        description: "Erreur inattendue lors du chargement du plan",
        variant: "destructive",
      });
      navigate("/dashboard/admin/subscriptions");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Charger les fonctionnalités par défaut selon le type de produit
    if (field === "productType" && value) {
      loadDefaultFeatures(value);
    }
  };

  const loadDefaultFeatures = (productType: string) => {
    let defaultFeatures: string[] = [];

    switch (productType) {
      case "annonce":
        defaultFeatures = [
          "Page dédiée pour chaque annonce",
          "X annonces actives simultanément",
          "X photos par annonce",
          "Bouton WhatsApp intégré",
          "Calendrier de disponibilité",
          "Référencement SEO optimisé",
          "Statistiques de vues et appels",
          "Assistance 24/7"
        ];
        break;
      case "vedette":
        defaultFeatures = [
          "Badge \"En vedette\"",
          "Priorité dans les résultats",
          "Visibilité accrue",
          "Partage sur réseaux sociaux",
          "Assistance 24/7"
        ];
        break;
      case "pub":
        defaultFeatures = [
          "Bannière personnalisée",
          "Ciblage géographique",
          "Ciblage par audience",
          "Rapport de performance détaillé",
          "Assistance 24/7"
        ];
        break;
    }

    // Charger les fonctionnalités par défaut
    if (defaultFeatures.length > 0) {
      const newFeatures = defaultFeatures.map((text, index) => ({
        id: `default-${Date.now()}-${index}`,
        text
      }));
      setFeatures(newFeatures);
    }
  };

  const handleAddFeature = () => {
    if (newFeature.trim()) {
      setFeatures((prev) => [
        ...prev,
        { id: Date.now().toString(), text: newFeature.trim() },
      ]);
      setNewFeature("");
    }
  };

  const handleRemoveFeature = (id: string) => {
    setFeatures((prev) => prev.filter((f) => f.id !== id));
  };

  const handleEditFeature = (id: string, newText: string) => {
    setFeatures((prev) =>
      prev.map((f) => (f.id === id ? { ...f, text: newText } : f))
    );
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newFeatures = [...features];
    const draggedItem = newFeatures[draggedIndex];
    newFeatures.splice(draggedIndex, 1);
    newFeatures.splice(index, 0, draggedItem);

    setFeatures(newFeatures);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleSave = async () => {
    // Validation
    if (!formData.productType) {
      toast({
        title: "Erreur de validation",
        description: "Veuillez sélectionner un type de produit",
        variant: "destructive",
      });
      return;
    }

    if (!formData.name.trim()) {
      toast({
        title: "Erreur de validation",
        description: "Le nom de l'abonnement est obligatoire",
        variant: "destructive",
      });
      return;
    }

    if (!formData.price || parseFloat(formData.price) < 0) {
      toast({
        title: "Erreur de validation",
        description: "Le prix doit être supérieur ou égal à 0",
        variant: "destructive",
      });
      return;
    }

    if (!formData.duration || parseInt(formData.duration) <= 0) {
      toast({
        title: "Erreur de validation",
        description: "La durée doit être supérieure à 0",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      console.log("📝 Sauvegarde du plan d'abonnement...");
      console.log("Données du formulaire:", formData);
      console.log("Fonctionnalités:", features);

      // Séparer les features par type (on n'utilise que features, pas highlights)
      const featuresList = features.filter(f => f.text.trim() !== "");
      const highlightsList: typeof features = []; // Vide pour l'instant

      // Appel du service de sauvegarde
      let result;
      if (isEditing && id) {
        result = await updateSubscriptionPlan(id, formData, featuresList, highlightsList);
      } else {
        result = await saveSubscriptionPlan(formData, featuresList, highlightsList);
      }

      if (!result.success) {
        throw new Error(result.error || "Erreur lors de la sauvegarde");
      }

      console.log("✅ Plan sauvegardé avec succès, ID:", result.planId);

      toast({
        title: "Succès",
        description: isEditing ? "Le plan d'abonnement a été modifié avec succès" : "Le plan d'abonnement a été créé avec succès",
      });

      // Redirection vers la liste
      navigate("/dashboard/admin/subscriptions");
    } catch (error: any) {
      console.error("❌ Erreur lors de la sauvegarde:", error);
      toast({
        title: "Erreur",
        description: error?.message || "Erreur lors de la création du plan",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/dashboard/admin/subscriptions");
  };

  // Déterminer les limitations à afficher selon le type de produit
  const renderLimitations = () => {
    switch (formData.productType) {
      case "annonce":
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="maxAnnounces">
                Nombre maximum d'annonces <span className="text-red-500">*</span>
              </Label>
              <Input
                id="maxAnnounces"
                type="number"
                min="1"
                value={formData.maxAnnounces}
                onChange={(e) => handleInputChange("maxAnnounces", e.target.value)}
                placeholder="Ex: 3, 10, 50"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxImagesPerAnnounce">
                Nombre maximum d'images par annonce <span className="text-red-500">*</span>
              </Label>
              <Input
                id="maxImagesPerAnnounce"
                type="number"
                min="1"
                value={formData.maxImagesPerAnnounce}
                onChange={(e) => handleInputChange("maxImagesPerAnnounce", e.target.value)}
                placeholder="Ex: 5, 15, 50"
                required
              />
            </div>
          </>
        );
      case "vedette":
        return (
          <div className="space-y-2">
            <Label htmlFor="maxDaysFeatured">
              Durée en vedette (jours) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="maxDaysFeatured"
              type="number"
              min="1"
              value={formData.maxDaysFeatured}
              onChange={(e) => handleInputChange("maxDaysFeatured", e.target.value)}
              placeholder="Ex: 7, 15, 30, 90"
              required
            />
          </div>
        );
      case "pub":
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="maxAds">
                Nombre maximum de publicités <span className="text-red-500">*</span>
              </Label>
              <Input
                id="maxAds"
                type="number"
                min="1"
                value={formData.maxAds}
                onChange={(e) => handleInputChange("maxAds", e.target.value)}
                placeholder="Ex: 1, 3, 10"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="adDurationDays">
                Durée de la publicité (jours) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="adDurationDays"
                type="number"
                min="1"
                value={formData.adDurationDays}
                onChange={(e) => handleInputChange("adDurationDays", e.target.value)}
                placeholder="Ex: 7, 15, 30, 90"
                required
              />
            </div>
          </>
        );
      default:
        return null;
    }
  };

  // Badge styles
  const getBadgeStyles = () => {
    switch (formData.badge) {
      case "promo":
        return "bg-red-500 text-white";
      case "populaire":
        return "bg-green-500 text-white";
      case "reduction":
        return "bg-orange-500 text-white";
      case "special":
        return "bg-blue-500 text-white";
      case "nouveau":
        return "bg-purple-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const getBadgeLabel = () => {
    switch (formData.badge) {
      case "promo":
        return "PROMO";
      case "populaire":
        return "POPULAIRE";
      case "reduction":
        return "RÉDUCTION";
      case "special":
        return "SPÉCIAL";
      case "nouveau":
        return "NOUVEAU";
      default:
        return "";
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Formulaire - 2/3 de la largeur */}
      <div className="lg:col-span-2 space-y-6">
        {/* Informations générales */}
        <Card className="lg:block hidden">
          <CardHeader>
            <CardTitle className="text-base">Informations de base</CardTitle>
            <CardDescription>
              Définissez les informations principales du plan d'abonnement
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Type de produit */}
            <div className="space-y-2">
              <Label htmlFor="productType">
                Type de produit <span className="text-red-500">*</span>
              </Label>
              <Select value={formData.productType} onValueChange={(value) => handleInputChange("productType", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez un type de produit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="annonce">Mise en ligne d'annonce</SelectItem>
                  <SelectItem value="vedette">Mise en vedette</SelectItem>
                  <SelectItem value="pub">Publicité</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Nom du plan */}
            <div className="space-y-2">
              <Label htmlFor="name">
                Nom du plan <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Ex: Basic, Premium, Pro"
                required
              />
            </div>

            {/* Prix et Prix promo */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">
                  Prix (TND) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => handleInputChange("price", e.target.value)}
                  placeholder="Ex: 50"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pricePromo">Prix promo (TND)</Label>
                <Input
                  id="pricePromo"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.pricePromo}
                  onChange={(e) => handleInputChange("pricePromo", e.target.value)}
                  placeholder="Ex: 70 (sera affiché barré)"
                />
                <p className="text-xs text-muted-foreground">
                  Le prix promo sera affiché barré à côté du prix normal
                </p>
              </div>
            </div>

            {/* Durée et Période de grâce */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="duration">
                  Durée (jours) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="duration"
                  type="number"
                  min="1"
                  value={formData.duration}
                  onChange={(e) => handleInputChange("duration", e.target.value)}
                  placeholder="Ex: 30, 90, 365"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gracePeriod">Période de grâce (mois gratuits)</Label>
                <Input
                  id="gracePeriod"
                  type="number"
                  min="0"
                  value={formData.gracePeriod}
                  onChange={(e) => handleInputChange("gracePeriod", e.target.value)}
                  placeholder="Ex: 0, 1, 2"
                />
                <p className="text-xs text-muted-foreground">
                  Nombre de mois gratuits inclus dans l'abonnement
                </p>
              </div>
            </div>

            {/* Badge */}
            <div className="space-y-2">
              <Label htmlFor="badge">Badge</Label>
              <Select value={formData.badge} onValueChange={(value) => handleInputChange("badge", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez un badge (optionnel)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="promo">Promo</SelectItem>
                  <SelectItem value="populaire">Populaire</SelectItem>
                  <SelectItem value="reduction">Réduction</SelectItem>
                  <SelectItem value="special">Spécial</SelectItem>
                  <SelectItem value="nouveau">Nouveau</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Le badge sera affiché sur la fiche de l'abonnement
              </p>
            </div>

            {/* Sous-titre */}
            <div className="space-y-2">
              <Label htmlFor="subtitle">Sous-titre</Label>
              <Input
                id="subtitle"
                value={formData.subtitle}
                onChange={(e) => handleInputChange("subtitle", e.target.value)}
                placeholder="Ex: Switch plans or cancel anytime."
              />
              <p className="text-xs text-muted-foreground">
                Texte affiché sous le nom du plan
              </p>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description du plan</Label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Ex: Notre plan Mise en ligne d'annonce vous permet de publier vos propriétés..."
                className="w-full min-h-[100px] px-3 py-2 text-sm rounded-md border border-input bg-background"
              />
              <p className="text-xs text-muted-foreground">
                Description détaillée du plan affichée dans l'aperçu
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Version mobile - Informations générales sans cadre */}
        <div className="lg:hidden space-y-4">
          <div>
            <h3 className="text-base font-semibold mb-2">Informations de base</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Définissez les informations principales du plan d'abonnement
            </p>
          </div>
          
          {/* Type de produit */}
          <div className="space-y-2">
            <Label htmlFor="productType-mobile">
              Type de produit <span className="text-red-500">*</span>
            </Label>
            <Select value={formData.productType} onValueChange={(value) => handleInputChange("productType", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez un type de produit" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="annonce">Mise en ligne d'annonce</SelectItem>
                <SelectItem value="vedette">Mise en vedette</SelectItem>
                <SelectItem value="pub">Publicité</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Nom du plan */}
          <div className="space-y-2">
            <Label htmlFor="name-mobile">
              Nom du plan <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name-mobile"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="Ex: Basic, Premium, Pro"
              required
            />
          </div>

          {/* Prix et Prix promo */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price-mobile">
                Prix (TND) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="price-mobile"
                type="number"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) => handleInputChange("price", e.target.value)}
                placeholder="Ex: 50"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pricePromo-mobile">Prix promo (TND)</Label>
              <Input
                id="pricePromo-mobile"
                type="number"
                min="0"
                step="0.01"
                value={formData.pricePromo}
                onChange={(e) => handleInputChange("pricePromo", e.target.value)}
                placeholder="Ex: 70 (sera affiché barré)"
              />
              <p className="text-xs text-muted-foreground">
                Le prix promo sera affiché barré à côté du prix normal
              </p>
            </div>
          </div>

          {/* Durée et Période de grâce */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration-mobile">
                Durée (jours) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="duration-mobile"
                type="number"
                min="1"
                value={formData.duration}
                onChange={(e) => handleInputChange("duration", e.target.value)}
                placeholder="Ex: 30, 90, 365"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gracePeriod-mobile">Période de grâce (mois gratuits)</Label>
              <Input
                id="gracePeriod-mobile"
                type="number"
                min="0"
                value={formData.gracePeriod}
                onChange={(e) => handleInputChange("gracePeriod", e.target.value)}
                placeholder="Ex: 0, 1, 2"
              />
              <p className="text-xs text-muted-foreground">
                Nombre de mois gratuits inclus dans l'abonnement
              </p>
            </div>
          </div>

          {/* Badge */}
          <div className="space-y-2">
            <Label htmlFor="badge-mobile">Badge</Label>
            <Select value={formData.badge} onValueChange={(value) => handleInputChange("badge", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez un badge (optionnel)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="promo">Promo</SelectItem>
                <SelectItem value="populaire">Populaire</SelectItem>
                <SelectItem value="reduction">Réduction</SelectItem>
                <SelectItem value="special">Spécial</SelectItem>
                <SelectItem value="nouveau">Nouveau</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Le badge sera affiché sur la fiche de l'abonnement
            </p>
          </div>

          {/* Sous-titre */}
          <div className="space-y-2">
            <Label htmlFor="subtitle-mobile">Sous-titre</Label>
            <Input
              id="subtitle-mobile"
              value={formData.subtitle}
              onChange={(e) => handleInputChange("subtitle", e.target.value)}
              placeholder="Ex: Switch plans or cancel anytime."
            />
            <p className="text-xs text-muted-foreground">
              Texte affiché sous le nom du plan
            </p>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description-mobile">Description du plan</Label>
            <textarea
              id="description-mobile"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Ex: Notre plan Mise en ligne d'annonce vous permet de publier vos propriétés..."
              className="w-full min-h-[100px] px-3 py-2 text-sm rounded-md border border-input bg-background"
            />
            <p className="text-xs text-muted-foreground">
              Description détaillée du plan affichée dans l'aperçu
            </p>
          </div>
        </div>

        {/* Limitations */}
        <Card className="lg:block hidden">
          <CardHeader>
            <CardTitle className="text-base">Limitations du plan</CardTitle>
            <CardDescription>
              Définissez les limitations spécifiques selon le type de produit
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!formData.productType ? (
              <div className="text-center py-8 text-muted-foreground">
                Veuillez d'abord sélectionner un type de produit
              </div>
            ) : (
              renderLimitations()
            )}
          </CardContent>
        </Card>

        {/* Version mobile - Limitations sans cadre */}
        <div className="lg:hidden space-y-4">
          <div>
            <h3 className="text-base font-semibold mb-2">Limitations du plan</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Définissez les limitations spécifiques selon le type de produit
            </p>
          </div>
          
          {!formData.productType ? (
            <div className="text-center py-8 text-muted-foreground">
              Veuillez d'abord sélectionner un type de produit
            </div>
          ) : (
            renderLimitations()
          )}
        </div>

        {/* Fonctionnalités */}
        <Card className="lg:block hidden">
          <CardHeader>
            <CardTitle className="text-base">Fonctionnalités incluses</CardTitle>
            <CardDescription>
              Ajoutez les fonctionnalités incluses dans ce plan
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Liste des fonctionnalités */}
            {features.length > 0 && (
              <div className="space-y-2">
                {features.map((feature, index) => (
                  <div
                    key={feature.id}
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragEnd={handleDragEnd}
                    className={`flex items-center gap-2 p-3 bg-gray-50 rounded-lg group cursor-move transition-opacity ${
                      draggedIndex === index ? 'opacity-50' : 'opacity-100'
                    }`}
                  >
                    <GripVertical className="w-4 h-4 text-gray-400 flex-shrink-0 cursor-grab active:cursor-grabbing" />
                    <Input
                      value={feature.text}
                      onChange={(e) => handleEditFeature(feature.id, e.target.value)}
                      className="flex-1 text-sm border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveFeature(feature.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 h-6 w-6 p-0 hover:bg-red-500 hover:text-white"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Ajouter une fonctionnalité */}
            <div className="flex gap-2">
              <Input
                value={newFeature}
                onChange={(e) => setNewFeature(e.target.value)}
                placeholder="Ex: 10 annonces max"
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddFeature();
                  }
                }}
              />
              <Button onClick={handleAddFeature} variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Ajouter
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Version mobile - Fonctionnalités sans cadre */}
        <div className="lg:hidden space-y-4">
          <div>
            <h3 className="text-base font-semibold mb-2">Fonctionnalités incluses</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Ajoutez les fonctionnalités incluses dans ce plan
            </p>
          </div>
          
          {/* Liste des fonctionnalités */}
          {features.length > 0 && (
            <div className="space-y-2">
              {features.map((feature, index) => (
                <div
                  key={feature.id}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                  className={`flex items-center gap-2 p-3 bg-gray-50 rounded-lg group cursor-move transition-opacity ${
                    draggedIndex === index ? 'opacity-50' : 'opacity-100'
                  }`}
                >
                  <GripVertical className="w-4 h-4 text-gray-400 flex-shrink-0 cursor-grab active:cursor-grabbing" />
                  <Input
                    value={feature.text}
                    onChange={(e) => handleEditFeature(feature.id, e.target.value)}
                    className="flex-1 text-sm border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveFeature(feature.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 h-6 w-6 p-0 hover:bg-red-500 hover:text-white"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Ajouter une fonctionnalité */}
          <div className="flex gap-2">
            <Input
              value={newFeature}
              onChange={(e) => setNewFeature(e.target.value)}
              placeholder="Ex: 10 annonces max"
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddFeature();
                }
              }}
            />
            <Button onClick={handleAddFeature} variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Ajouter
            </Button>
          </div>
        </div>

      </div>

      {/* Aperçu - 1/3 de la largeur */}
      <div className="lg:col-span-1">
        <div className="sticky top-6">
          <Card className="bg-white shadow-lg">
            <CardHeader className="text-center pb-2">
              <div className="flex justify-center mb-2">
                {formData.badge && (
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase ${getBadgeStyles()}`}>
                    {getBadgeLabel()}
                  </span>
                )}
              </div>
              <CardTitle className="text-2xl font-bold" style={{ color: '#32323a' }}>
                {formData.name || "Nom du plan"}
              </CardTitle>
              <CardDescription className="text-sm">
                {formData.subtitle || "Switch plans or cancel anytime."}
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              {/* Prix */}
              <div className="py-4">
                {formData.pricePromo && parseFloat(formData.pricePromo) > 0 && (
                  <div className="text-gray-400 line-through text-lg">
                    {parseFloat(formData.pricePromo).toFixed(2)} TND
                  </div>
                )}
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold" style={{ color: '#32323a' }}>
                    {formData.price ? parseFloat(formData.price).toFixed(2) : "0.00"}
                  </span>
                  <span className="text-xl text-gray-600">TND</span>
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  / {formData.duration || "0"} jours
                </div>
              </div>

              {/* Description du produit */}
              {formData.description && (
                <p className="text-sm text-gray-600 pt-1">
                  {formData.description}
                </p>
              )}

              {/* Fonctionnalités */}
              {features.length > 0 && (
                <div className="text-left space-y-2 pt-4 p-4 bg-gray-50 rounded-lg">
                  {features.map((feature) => (
                    <div key={feature.id} className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700">{feature.text}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Bouton */}
              <Button className="w-full" size="lg" disabled>
                SELECT
              </Button>

              {/* Info supplémentaire */}
              {formData.gracePeriod && parseInt(formData.gracePeriod) > 0 && (
                <p className="text-xs text-gray-500">
                  {formData.gracePeriod} mois gratuits inclus
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Actions - Version mobile en dessous de l'aperçu */}
      <div className="lg:hidden space-y-4">
        <div className="space-y-3">
          <Button 
            onClick={handleSave} 
            disabled={isLoading}
            className="w-full"
          >
            <Save className="w-4 h-4 mr-2" />
            {isLoading ? "Enregistrement..." : "Enregistrer"}
          </Button>
          <Button 
            variant="outline" 
            onClick={handleCancel} 
            disabled={isLoading}
            className="w-full hover:bg-[#32323a] hover:text-white hover:border-[#32323a] active:bg-[#32323a] active:text-white active:border-[#32323a]"
          >
            Annuler
          </Button>
        </div>
      </div>

      {/* Actions - Version desktop (conservée) */}
      <div className="hidden lg:block lg:col-span-2">
        <div className="flex justify-end gap-4">
          <Button variant="outline" onClick={handleCancel} disabled={isLoading}>
            Annuler
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            <Save className="w-4 h-4 mr-2" />
            {isLoading ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AddSubscriptionPlan;
