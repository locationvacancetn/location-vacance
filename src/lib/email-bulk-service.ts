import { supabase } from '@/integrations/supabase/client';
import { EmailService } from './email-service';
import { USER_ROLES } from './constants';
import { validateEmailList } from './utils/validation';

export interface BulkEmailRequest {
  recipients: 'single' | 'all' | 'role' | 'specific';
  role?: string;
  specificEmails?: string[];
  subject: string;
  message: string;
  isTest?: boolean;
  isHtml?: boolean;
}

export interface BulkEmailResponse {
  success: boolean;
  totalSent: number;
  totalFailed: number;
  errors: string[];
  details: {
    sent: string[];
    failed: { email: string; error: string }[];
  };
}

export class EmailBulkService {
  /**
   * Récupère tous les utilisateurs actifs
   */
  static async getAllActiveUsers() {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('email, full_name, role, is_active')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Erreur lors de la récupération des utilisateurs:', error);
      throw new Error('Impossible de récupérer la liste des utilisateurs');
    }
  }

  /**
   * Récupère les utilisateurs par rôle
   */
  static async getUsersByRole(role: string) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('email, full_name, role, is_active')
        .eq('role', role)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Erreur lors de la récupération des utilisateurs par rôle:', error);
      throw new Error('Impossible de récupérer la liste des utilisateurs');
    }
  }

  /**
   * Valide les emails spécifiques
   * ✅ CODE-003 : Utilise la fonction centralisée de validation
   */
  static validateSpecificEmails(emails: string[]): { valid: string[]; invalid: string[] } {
    return validateEmailList(emails);
  }

  /**
   * Envoie des emails en masse
   */
  static async sendBulkEmail(request: BulkEmailRequest): Promise<BulkEmailResponse> {
    try {
      let recipients: string[] = [];
      const errors: string[] = [];
      const sent: string[] = [];
      const failed: { email: string; error: string }[] = [];

      // Déterminer les destinataires selon le type
      switch (request.recipients) {
        case 'single':
          // Pour l'envoi unique, on utilise EmailService directement
          // Cette méthode ne devrait pas être appelée pour 'single'
          throw new Error('L\'envoi unique doit être géré par EmailService.sendEmail()');
          
        case 'all':
          const allUsers = await this.getAllActiveUsers();
          recipients = allUsers.map(user => user.email);
          break;

        case 'role':
          if (!request.role) {
            throw new Error('Le rôle doit être spécifié pour l\'envoi par rôle');
          }
          const roleUsers = await this.getUsersByRole(request.role);
          recipients = roleUsers.map(user => user.email);
          break;

        case 'specific':
          if (!request.specificEmails || request.specificEmails.length === 0) {
            throw new Error('Les emails spécifiques doivent être fournis');
          }
          const { valid, invalid } = this.validateSpecificEmails(request.specificEmails);
          if (invalid.length > 0) {
            errors.push(`Emails invalides: ${invalid.join(', ')}`);
          }
          recipients = valid;
          break;

        default:
          throw new Error('Type de destinataires invalide');
      }

      if (recipients.length === 0) {
        return {
          success: false,
          totalSent: 0,
          totalFailed: 0,
          errors: ['Aucun destinataire valide trouvé'],
          details: { sent, failed }
        };
      }

      // Envoyer les emails un par un

      
      for (const email of recipients) {
        try {
          const result = await EmailService.sendEmail({
            to: email,
            subject: request.subject,
            message: request.message,
            isTest: request.isTest || false,
            isHtml: request.isHtml || false
          });

          if (result.success) {
            sent.push(email);

          } else {
            failed.push({ email, error: result.error || 'Erreur inconnue' });
            console.error(`❌ Échec envoi à ${email}:`, result.error);
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
          failed.push({ email, error: errorMessage });
          console.error(`❌ Erreur envoi à ${email}:`, error);
        }

        // Petite pause entre les envois pour éviter la surcharge
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      const totalSent = sent.length;
      const totalFailed = failed.length;

      return {
        success: totalFailed === 0,
        totalSent,
        totalFailed,
        errors: [...errors, ...failed.map(f => `${f.email}: ${f.error}`)],
        details: { sent, failed }
      };

    } catch (error) {
      console.error('Erreur lors de l\'envoi en masse:', error);
      return {
        success: false,
        totalSent: 0,
        totalFailed: 0,
        errors: [error instanceof Error ? error.message : 'Erreur inconnue'],
        details: { sent: [], failed: [] }
      };
    }
  }

  /**
   * Récupère les statistiques des utilisateurs par rôle
   */
  static async getUserStats() {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role, is_active')
        .eq('is_active', true);

      if (error) {
        throw error;
      }

      const stats = {
        total: data.length,
        byRole: {
          [USER_ROLES.ADMIN]: 0,
          [USER_ROLES.OWNER]: 0,
          [USER_ROLES.ADVERTISER]: 0,
          [USER_ROLES.TENANT]: 0
        }
      };

      data.forEach(user => {
        if (stats.byRole[user.role as keyof typeof stats.byRole] !== undefined) {
          stats.byRole[user.role as keyof typeof stats.byRole]++;
        }
      });

      return stats;
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      throw new Error('Impossible de récupérer les statistiques des utilisateurs');
    }
  }
}
