import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'jsr:@supabase/supabase-js@2'
import { getCorsHeaders, getPreflightHeaders, validateOrigin } from '../_shared/cors.ts'

interface EmailRequest {
  to: string;
  subject: string;
  message: string;
  isTest?: boolean;
  isHtml?: boolean;
}

serve(async (req) => {
  // 🔒 SEC-006: Récupérer l'origine de la requête
  const origin = req.headers.get('origin');
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: getPreflightHeaders(origin) })
  }

  // 🔒 SEC-006: Valider l'origine (optionnel - plus strict)
  // const originError = validateOrigin(origin);
  // if (originError) return originError;

  try {
    // Initialize Supabase client with service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Parse request body
    const emailData: EmailRequest = await req.json();

    // Validate required fields
    if (!emailData.to || !emailData.subject || !emailData.message) {
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Les champs to, subject et message sont requis' 
        }),
        { 
          status: 400, 
          headers: { ...getCorsHeaders(origin), 'Content-Type': 'application/json' } 
        }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailData.to)) {
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Format d\'email invalide' 
        }),
        { 
          status: 400, 
          headers: { ...getCorsHeaders(origin), 'Content-Type': 'application/json' } 
        }
      )
    }

    // ✅ SÉCURITÉ : Récupérer la config email depuis la base de données (côté serveur)
    const { data: emailConfig, error: configError } = await supabase
      .from('email_config')
      .select('*')
      .eq('is_active', true)
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();

    if (configError || !emailConfig) {
      console.error('Erreur récupération config email:', configError);
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Configuration email non trouvée',
          message: 'Aucune configuration email active. Veuillez configurer l\'envoi d\'emails.'
        }),
        { 
          status: 500, 
          headers: { ...getCorsHeaders(origin), 'Content-Type': 'application/json' } 
        }
      );
    }

    // ✅ SÉCURITÉ : Décoder le mot de passe côté serveur (pas côté client)
    const smtpPassword = emailConfig.smtp_password;
    let decodedPassword = smtpPassword;
    
    // Vérifier si c'est encodé en Base64 et décoder
    try {
      // Tenter de décoder si c'est du Base64
      const decoded = atob(smtpPassword);
      const reencoded = btoa(decoded);
      if (reencoded === smtpPassword) {
        decodedPassword = decoded;
      }
    } catch (e) {
      // Pas en Base64, utiliser tel quel
      decodedPassword = smtpPassword;
    }

    console.log('📧 Envoi email sécurisé via Edge Function...', {
      to: emailData.to,
      subject: emailData.subject,
      smtp_host: emailConfig.smtp_host,
      smtp_user: emailConfig.smtp_user
    });

    // ✅ Appeler l'API PHP avec la configuration complète (depuis le serveur)
    const response = await fetch('https://location-vacance.tn/send-email.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: emailData.to,
        subject: emailData.subject,
        message: emailData.message,
        isTest: emailData.isTest || false,
        isHtml: emailData.isHtml || false,
        // Configuration SMTP envoyée depuis le serveur (sécurisé)
        smtp_config: {
          host: emailConfig.smtp_host,
          port: emailConfig.smtp_port,
          user: emailConfig.smtp_user,
          password: decodedPassword, // ✅ Mot de passe décodé côté serveur uniquement
          ssl: emailConfig.is_ssl,
          from_email: emailConfig.from_email,
          from_name: emailConfig.from_name
        }
      }),
    });

    console.log('📡 Réponse API PHP:', response.status, response.statusText);

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || `Erreur HTTP ${response.status}`);
    }

    // Log success
    console.log(`✅ Email envoyé avec succès à ${emailData.to}`, {
      subject: emailData.subject,
      isTest: emailData.isTest,
      timestamp: new Date().toISOString(),
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Email envoyé avec succès',
        to: emailData.to,
        subject: emailData.subject,
        isTest: emailData.isTest
      }),
      { 
        status: 200, 
        headers: { ...getCorsHeaders(origin), 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi d\'email sécurisé:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue',
        message: 'Erreur lors de l\'envoi de l\'email'
      }),
      { 
        status: 500, 
        headers: { ...getCorsHeaders(origin), 'Content-Type': 'application/json' } 
      }
    );
  }
});

