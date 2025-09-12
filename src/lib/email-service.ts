import { EmailConfigService, EmailConfig } from './email-config-service';

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

export class EmailService {
  /**
   * Envoie un email via l'API PHP avec configuration dynamique
   */
  static async sendEmail(emailData: EmailRequest): Promise<EmailResponse> {
    try {
      // Récupérer la configuration email active
      const emailConfig = await EmailConfigService.getActiveConfig();
      
      if (!emailConfig) {
        console.error('❌ Aucune configuration email active trouvée');
        return {
          success: false,
          error: 'Configuration email non trouvée',
          message: 'Aucune configuration email active. Veuillez configurer l\'envoi d\'emails.'
        };
      }

      console.log('🚀 Envoi d\'email via API PHP avec config dynamique...', {
        to: emailData.to,
        subject: emailData.subject,
        smtp_host: emailConfig.smtp_host,
        smtp_user: emailConfig.smtp_user
      });
      
      const response = await fetch('https://location-vacance.tn/send-email.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...emailData,
          // Ajouter la configuration SMTP
          smtp_config: {
            host: emailConfig.smtp_host,
            port: emailConfig.smtp_port,
            user: emailConfig.smtp_user,
            password: emailConfig.smtp_password,
            ssl: emailConfig.is_ssl,
            from_email: emailConfig.from_email,
            from_name: emailConfig.from_name
          }
        }),
      });
      
      console.log('📡 Réponse PHP reçue:', response.status, response.statusText);

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || `Erreur HTTP ${response.status}`);
      }

      return result;
    } catch (error) {
      console.error('Erreur EmailService:', error);
      
      if (error instanceof Error) {
        return {
          success: false,
          error: error.message,
          details: error.stack,
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
  static async sendTestEmail(to: string, subject?: string, message?: string, isHtml: boolean = false): Promise<EmailResponse> {
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