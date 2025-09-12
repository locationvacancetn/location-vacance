import { supabase } from '@/integrations/supabase/client';

export interface EmailConfig {
  id: number;
  smtp_host: string;
  smtp_port: number;
  smtp_user: string;
  smtp_password: string;
  from_email: string;
  from_name: string;
  is_active: boolean;
  is_ssl: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
}

export interface EmailConfigUpdate {
  smtp_host: string;
  smtp_port: number;
  smtp_user: string;
  smtp_password: string;
  from_email: string;
  from_name: string;
  is_ssl: boolean;
}

// Clé de chiffrement simple (en production, utilisez une clé plus sécurisée)
const ENCRYPTION_KEY = 'location-vacance-email-2024';

/**
 * Service de gestion de la configuration email
 */
export class EmailConfigService {
  /**
   * Chiffre un mot de passe
   */
  private static encryptPassword(password: string): string {
    // Chiffrement simple (en production, utilisez une bibliothèque de chiffrement robuste)
    try {
      const encoded = btoa(password);
      return encoded;
    } catch (error) {
      console.error('Erreur de chiffrement:', error);
      return password; // Retourne le mot de passe tel quel si le chiffrement échoue
    }
  }

  /**
   * Déchiffre un mot de passe
   */
  private static decryptPassword(encryptedPassword: string): string {
    try {
      // Vérifier si le mot de passe est déjà chiffré (base64)
      if (this.isBase64(encryptedPassword)) {
        return atob(encryptedPassword);
      } else {
        // Le mot de passe n'est pas chiffré, le retourner tel quel
        return encryptedPassword;
      }
    } catch (error) {
      console.error('Erreur de déchiffrement:', error);
      return encryptedPassword; // Retourne le mot de passe tel quel si le déchiffrement échoue
    }
  }

  /**
   * Vérifie si une chaîne est en base64
   */
  private static isBase64(str: string): boolean {
    try {
      // Tenter de décoder et re-encoder pour vérifier
      const decoded = atob(str);
      const encoded = btoa(decoded);
      return encoded === str;
    } catch (error) {
      return false;
    }
  }

  /**
   * Récupère la configuration email active
   */
  static async getActiveConfig(): Promise<EmailConfig | null> {
    try {
      const { data, error } = await supabase
        .from('email_config')
        .select('*')
        .eq('is_active', true)
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        console.error('Erreur lors de la récupération de la config email:', error);
        return null;
      }

      if (data) {
        // Déchiffrer le mot de passe
        data.smtp_password = this.decryptPassword(data.smtp_password);
      }

      return data;
    } catch (error) {
      console.error('Erreur EmailConfigService.getActiveConfig:', error);
      return null;
    }
  }

  /**
   * Récupère toutes les configurations email
   */
  static async getAllConfigs(): Promise<EmailConfig[]> {
    try {
      const { data, error } = await supabase
        .from('email_config')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Erreur lors de la récupération des configs email:', error);
        return [];
      }

      // Déchiffrer les mots de passe
      return data?.map(config => ({
        ...config,
        smtp_password: this.decryptPassword(config.smtp_password)
      })) || [];
    } catch (error) {
      console.error('Erreur EmailConfigService.getAllConfigs:', error);
      return [];
    }
  }

  /**
   * Met à jour la configuration email
   */
  static async updateConfig(configId: number, config: EmailConfigUpdate): Promise<{ success: boolean; error?: string }> {
    try {
      // Chiffrer le mot de passe
      const encryptedConfig = {
        ...config,
        smtp_password: this.encryptPassword(config.smtp_password),
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('email_config')
        .update(encryptedConfig)
        .eq('id', configId);

      if (error) {
        console.error('Erreur lors de la mise à jour de la config email:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Erreur EmailConfigService.updateConfig:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erreur inconnue' 
      };
    }
  }

  /**
   * Crée une nouvelle configuration email
   */
  static async createConfig(config: EmailConfigUpdate): Promise<{ success: boolean; error?: string; id?: number }> {
    try {
      // Désactiver toutes les autres configurations
      await supabase
        .from('email_config')
        .update({ is_active: false })
        .eq('is_active', true);

      // Chiffrer le mot de passe
      const encryptedConfig = {
        ...config,
        smtp_password: this.encryptPassword(config.smtp_password),
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('email_config')
        .insert(encryptedConfig)
        .select('id')
        .single();

      if (error) {
        console.error('Erreur lors de la création de la config email:', error);
        return { success: false, error: error.message };
      }

      return { success: true, id: data.id };
    } catch (error) {
      console.error('Erreur EmailConfigService.createConfig:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erreur inconnue' 
      };
    }
  }

  /**
   * Active une configuration email
   */
  static async activateConfig(configId: number): Promise<{ success: boolean; error?: string }> {
    try {
      // Désactiver toutes les autres configurations
      await supabase
        .from('email_config')
        .update({ is_active: false })
        .eq('is_active', true);

      // Activer la configuration sélectionnée
      const { error } = await supabase
        .from('email_config')
        .update({ 
          is_active: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', configId);

      if (error) {
        console.error('Erreur lors de l\'activation de la config email:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Erreur EmailConfigService.activateConfig:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erreur inconnue' 
      };
    }
  }

  /**
   * Supprime une configuration email
   */
  static async deleteConfig(configId: number): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('email_config')
        .delete()
        .eq('id', configId);

      if (error) {
        console.error('Erreur lors de la suppression de la config email:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Erreur EmailConfigService.deleteConfig:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erreur inconnue' 
      };
    }
  }

  /**
   * Teste une configuration email
   */
  static async testConfig(config: EmailConfigUpdate): Promise<{ success: boolean; error?: string }> {
    try {
      // Utiliser l'API PHP pour tester la configuration
      const response = await fetch('https://location-vacance.tn/send-email.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: config.from_email, // Envoyer à soi-même pour le test
          subject: 'Test de configuration SMTP',
          message: 'Ceci est un test de configuration SMTP.',
          isTest: true,
          // Paramètres SMTP personnalisés
          smtp_config: {
            host: config.smtp_host,
            port: config.smtp_port,
            user: config.smtp_user,
            password: config.smtp_password,
            ssl: config.is_ssl
          }
        }),
      });

      const result = await response.json();
      
      if (!response.ok || !result.success) {
        return { 
          success: false, 
          error: result.error || `Erreur HTTP ${response.status}` 
        };
      }

      return { success: true };
    } catch (error) {
      console.error('Erreur EmailConfigService.testConfig:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erreur de connexion' 
      };
    }
  }

  /**
   * Migre les mots de passe non chiffrés vers le format chiffré
   */
  static async migratePasswords(): Promise<{ success: boolean; error?: string; migrated: number }> {
    try {
      const { data: configs, error } = await supabase
        .from('email_config')
        .select('id, smtp_password')
        .not('smtp_password', 'is', null);

      if (error) {
        console.error('Erreur lors de la récupération des configs:', error);
        return { success: false, error: error.message, migrated: 0 };
      }

      let migrated = 0;
      for (const config of configs || []) {
        // Vérifier si le mot de passe est déjà chiffré
        if (!this.isBase64(config.smtp_password)) {
          const encryptedPassword = this.encryptPassword(config.smtp_password);
          
          const { error: updateError } = await supabase
            .from('email_config')
            .update({ smtp_password: encryptedPassword })
            .eq('id', config.id);

          if (updateError) {
            console.error(`Erreur lors de la migration du config ${config.id}:`, updateError);
          } else {
            migrated++;
          }
        }
      }

      return { success: true, migrated };
    } catch (error) {
      console.error('Erreur EmailConfigService.migratePasswords:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erreur inconnue',
        migrated: 0
      };
    }
  }
}
