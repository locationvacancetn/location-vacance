import { supabase } from '@/integrations/supabase/client';

export interface EmailRequest {
  to: string;
  subject: string;
  message: string;
  isTest?: boolean;
  isHtml?: boolean;
}

export interface EmailResponse {
  success: boolean;
  message: string;
  to?: string;
  subject?: string;
  isTest?: boolean;
  error?: string;
  details?: string;
}

/**
 * ✅ SERVICE EMAIL SÉCURISÉ
 * 
 * Utilise une Edge Function Supabase pour envoyer des emails de manière sécurisée.
 * Le mot de passe SMTP n'est JAMAIS exposé côté client.
 * 
 * Avantages :
 * - 🔒 Sécurité maximale : mot de passe reste côté serveur
 * - ⚡ Performance : moins de requêtes réseau
 * - 🎯 Simplicité : une seule requête depuis le frontend
 */
export class EmailServiceSecure {
  /**
   * Envoie un email via l'Edge Function sécurisée
   */
  static async sendEmail(emailData: EmailRequest): Promise<EmailResponse> {
    try {
      console.log('🔒 Envoi email via Edge Function sécurisée...', {
        to: emailData.to,
        subject: emailData.subject,
      });

      // Récupérer le token d'authentification pour l'Edge Function
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('Utilisateur non authentifié');
      }

      // Appeler l'Edge Function sécurisée
      const { data, error } = await supabase.functions.invoke('send-email-secure', {
        body: emailData,
      });

      if (error) {
        console.error('❌ Erreur Edge Function:', error);
        throw error;
      }

      console.log('✅ Email envoyé avec succès via Edge Function sécurisée');
      
      return data as EmailResponse;
      
    } catch (error) {
      console.error('❌ Erreur EmailServiceSecure:', error);
      
      if (error instanceof Error) {
        return {
          success: false,
          error: error.message,
          message: 'Erreur lors de l\'envoi de l\'email'
        };
      }

      return {
        success: false,
        error: 'Erreur inconnue lors de l\'envoi d\'email',
        message: 'Erreur lors de l\'envoi de l\'email'
      };
    }
  }

  /**
   * Envoie un email de test
   */
  static async sendTestEmail(
    to: string, 
    subject?: string, 
    message?: string, 
    isHtml: boolean = false
  ): Promise<EmailResponse> {
    return this.sendEmail({
      to,
      subject: subject || 'Test d\'envoi d\'email - Location Vacance',
      message: message || 'Ceci est un email de test pour vérifier la configuration SMTP de votre application Location Vacance.',
      isTest: true,
      isHtml
    });
  }

  /**
   * Valide le format d'un email
   */
  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Valide les données d'email avant envoi
   */
  static validateEmailData(emailData: EmailRequest): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!emailData.to?.trim()) {
      errors.push('L\'adresse email de destination est requise');
    } else if (!this.validateEmail(emailData.to)) {
      errors.push('Format d\'email invalide');
    }

    if (!emailData.subject?.trim()) {
      errors.push('Le sujet est requis');
    }

    if (!emailData.message?.trim()) {
      errors.push('Le message est requis');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

