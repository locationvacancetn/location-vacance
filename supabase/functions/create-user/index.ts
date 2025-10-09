import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';
import { validateEmail } from '../_shared/validation.ts';
import { getCorsHeaders, getPreflightHeaders } from '../_shared/cors.ts';

// Interface pour les données de création d'utilisateur
// Correspond EXACTEMENT aux champs de votre table profiles
interface CreateUserRequest {
  email: string;
  password: string;
  full_name: string;
  role: 'admin' | 'owner' | 'advertiser' | 'tenant';
  phone?: string;
  bio?: string;
  whatsapp_number?: string;
  website_url?: string;
  facebook_url?: string;
  instagram_url?: string;
  tiktok_url?: string;
  messenger_url?: string;
  company_name?: string;
  company_website?: string;
  business_phone?: string;
  business_email?: string;
  linkedin_url?: string;
  twitter_url?: string;
}

// Interface pour la réponse
interface CreateUserResponse {
  success: boolean;
  user?: any;
  error?: string;
}

Deno.serve(async (req: Request) => {
  const origin = req.headers.get('origin');
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: getPreflightHeaders(origin) });
  }
  
  // Vérifier que la méthode est POST
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ success: false, error: 'Méthode non autorisée' }),
      { 
        status: 405, 
        headers: { ...getCorsHeaders(origin), 'Content-Type': 'application/json' } 
      }
    );
  }

  try {
    // Récupérer les variables d'environnement
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Configuration Supabase manquante');
    }

    // Créer le client Supabase avec la clé service_role
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Vérifier l'authentification de l'utilisateur qui fait la requête
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ success: false, error: 'Token d\'authentification requis' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Vérifier que l'utilisateur est authentifié et est admin
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: 'Token d\'authentification invalide' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Vérifier que l'utilisateur est admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (profileError || !profile || profile.role !== 'admin') {
      return new Response(
        JSON.stringify({ success: false, error: 'Accès refusé. Seuls les administrateurs peuvent créer des utilisateurs.' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Parser les données de la requête
    const userData: CreateUserRequest = await req.json();

    // Validation des données obligatoires
    if (!userData.email || !userData.password || !userData.full_name || !userData.role) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Données obligatoires manquantes: email, password, full_name, role' 
        }),
        { 
          status: 400, 
          headers: { 'Content-Type': 'application/json' } 
        }
      );
    }

    // Validation du rôle
    const validRoles = ['admin', 'owner', 'advertiser', 'tenant'];
    if (!validRoles.includes(userData.role)) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Rôle invalide. Rôles autorisés: admin, owner, advertiser, tenant' 
        }),
        { 
          status: 400, 
          headers: { 'Content-Type': 'application/json' } 
        }
      );
    }

    // Validation de l'email
    // ✅ CODE-003 : Utilise la fonction centralisée de validation
    if (!validateEmail(userData.email)) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Format d\'email invalide' 
        }),
        { 
          status: 400, 
          headers: { 'Content-Type': 'application/json' } 
        }
      );
    }

    // Validation du mot de passe
    if (userData.password.length < 6) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Le mot de passe doit contenir au moins 6 caractères' 
        }),
        { 
          status: 400, 
          headers: { 'Content-Type': 'application/json' } 
        }
      );
    }

    // ✅ IMP-001 : Créer l'utilisateur Auth SANS user_metadata métier
    // user_metadata ne doit contenir que des données Auth, pas des données métier
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: userData.email,
      password: userData.password,
      email_confirm: true, // Auto-confirmer l'email
      user_metadata: {} // ✅ Vide - Les données métier vont dans profiles
    });

    if (authError) {
      console.error('Erreur lors de la création de l\'utilisateur:', authError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Erreur lors de la création: ${authError.message}` 
        }),
        { 
          status: 400, 
          headers: { 'Content-Type': 'application/json' } 
        }
      );
    }

    if (!authUser.user) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Aucun utilisateur créé' 
        }),
        { 
          status: 500, 
          headers: { 'Content-Type': 'application/json' } 
        }
      );
    }

    // ✅ IMP-001 : Créer le profil DIRECTEMENT avec TOUS les champs
    // Le trigger handle_new_user() créera un profil minimal (pour inscription normale)
    // mais on le remplace ici avec les données complètes (pour création admin)
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .upsert({
        user_id: authUser.user.id,
        email: userData.email,
        full_name: userData.full_name,
        role: userData.role,
        phone: userData.phone || null,
        bio: userData.bio || null,
        whatsapp_number: userData.whatsapp_number || null,
        website_url: userData.website_url || null,
        facebook_url: userData.facebook_url || null,
        instagram_url: userData.instagram_url || null,
        tiktok_url: userData.tiktok_url || null,
        messenger_url: userData.messenger_url || null,
        company_name: userData.company_name || null,
        company_website: userData.company_website || null,
        business_phone: userData.business_phone || null,
        business_email: userData.business_email || null,
        linkedin_url: userData.linkedin_url || null,
        twitter_url: userData.twitter_url || null
      }, {
        onConflict: 'user_id' // Si le trigger a déjà créé un profil, on le met à jour
      })
      .select()
      .single();

    if (profileError) {
      console.error('Erreur lors de la création du profil:', profileError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Utilisateur créé mais erreur lors de la création du profil: ${profileError.message}` 
        }),
        { 
          status: 500, 
          headers: { 'Content-Type': 'application/json' } 
        }
      );
    }

    // Réponse de succès
    const response: CreateUserResponse = {
      success: true,
      user: {
        id: authUser.user.id,
        email: authUser.user.email,
        full_name: userData.full_name,
        role: userData.role,
        email_confirmed_at: authUser.user.email_confirmed_at,
        created_at: authUser.user.created_at,
        profile: profile
      }
    };

    return new Response(
      JSON.stringify(response),
      { 
        status: 201, 
        headers: { 
          ...getCorsHeaders(origin),
          'Content-Type': 'application/json'
        } 
      }
    );

  } catch (error) {
    console.error('Erreur dans create-user function:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Erreur interne du serveur' 
      }),
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  }
});
