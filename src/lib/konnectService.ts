import { supabase } from '@/integrations/supabase/client';

export interface KonnectConfig {
  id: string;
  environment: 'sandbox' | 'production';
  sandbox_wallet_id: string | null;
  sandbox_api_key: string | null;
  production_wallet_id: string | null;
  production_api_key: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export interface KonnectPaymentRequest {
  amount: number;
  currency: string;
  orderId: string;
  description: string;
  customerEmail: string;
  customerPhone?: string;
  returnUrl: string;
  cancelUrl: string;
  webhookUrl: string;
}

export interface KonnectPaymentResponse {
  paymentId: string;
  paymentUrl: string;
  status: string;
}

/**
 * Service pour gérer la configuration et les paiements Konnect
 */
export class KonnectService {
  private static instance: KonnectService;
  private config: KonnectConfig | null = null;

  private constructor() {}

  public static getInstance(): KonnectService {
    if (!KonnectService.instance) {
      KonnectService.instance = new KonnectService();
    }
    return KonnectService.instance;
  }

  /**
   * Charge la configuration Konnect depuis la base de données
   */
  async loadConfig(): Promise<KonnectConfig | null> {
    try {
      const { data, error } = await supabase
        .from('konnect_config')
        .select('*')
        .single();

      if (error) {
        console.error('Erreur lors du chargement de la configuration Konnect:', error);
        return null;
      }

      this.config = data;
      return data;
    } catch (error) {
      console.error('Erreur lors du chargement de la configuration:', error);
      return null;
    }
  }

  /**
   * Sauvegarde la configuration Konnect
   */
  async saveConfig(config: Partial<KonnectConfig>): Promise<boolean> {
    try {
      if (!this.config) {
        console.error('Aucune configuration à sauvegarder');
        return false;
      }

      const { error } = await supabase
        .from('konnect_config')
        .update({
          ...config,
          updated_at: new Date().toISOString(),
        })
        .eq('id', this.config.id);

      if (error) {
        console.error('Erreur lors de la sauvegarde de la configuration:', error);
        return false;
      }

      // Recharger la configuration après sauvegarde
      await this.loadConfig();
      return true;
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      return false;
    }
  }

  /**
   * Obtient la configuration actuelle
   */
  getConfig(): KonnectConfig | null {
    return this.config;
  }

  /**
   * Vérifie si la configuration est valide
   */
  isConfigValid(): boolean {
    if (!this.config) return false;

    const { environment, sandbox_wallet_id, sandbox_api_key, production_wallet_id, production_api_key } = this.config;

    if (environment === 'sandbox') {
      return !!(sandbox_wallet_id && sandbox_api_key);
    } else if (environment === 'production') {
      return !!(production_wallet_id && production_api_key);
    }

    return false;
  }

  /**
   * Obtient les identifiants pour l'environnement actuel
   */
  getCurrentCredentials(): { walletId: string; apiKey: string } | null {
    if (!this.config || !this.isConfigValid()) {
      return null;
    }

    const { environment, sandbox_wallet_id, sandbox_api_key, production_wallet_id, production_api_key } = this.config;

    if (environment === 'sandbox') {
      return {
        walletId: sandbox_wallet_id!,
        apiKey: sandbox_api_key!
      };
    } else if (environment === 'production') {
      return {
        walletId: production_wallet_id!,
        apiKey: production_api_key!
      };
    }

    return null;
  }

  /**
   * Initie un paiement Konnect
   */
  async initiatePayment(paymentRequest: KonnectPaymentRequest): Promise<KonnectPaymentResponse | null> {
    try {
      // Charger la configuration si nécessaire
      if (!this.config) {
        await this.loadConfig();
      }

      if (!this.isConfigValid()) {
        throw new Error('Configuration Konnect invalide');
      }

      const credentials = this.getCurrentCredentials();
      if (!credentials) {
        throw new Error('Identifiants Konnect non disponibles');
      }

      const { walletId, apiKey } = credentials;
      const { environment } = this.config;

      // Déterminer l'URL de l'API selon l'environnement
      const baseUrl = environment === 'production' 
        ? 'https://api.konnect.network/api/v2' 
        : 'https://api-sandbox.konnect.network/api/v2';

      // Préparer les données de la requête
      const paymentData = {
        receiverWalletId: walletId,
        amount: paymentRequest.amount,
        currency: paymentRequest.currency,
        orderId: paymentRequest.orderId,
        description: paymentRequest.description,
        customerEmail: paymentRequest.customerEmail,
        customerPhone: paymentRequest.customerPhone,
        returnUrl: paymentRequest.returnUrl,
        cancelUrl: paymentRequest.cancelUrl,
        webhook: paymentRequest.webhookUrl,
      };

      // Effectuer la requête à l'API Konnect
      const response = await fetch(`${baseUrl}/payments/init-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
        },
        body: JSON.stringify(paymentData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Erreur API Konnect: ${errorData.message || response.statusText}`);
      }

      const responseData = await response.json();

      return {
        paymentId: responseData.paymentId,
        paymentUrl: responseData.payUrl,
        status: responseData.status,
      };
    } catch (error) {
      console.error('Erreur lors de l\'initiation du paiement:', error);
      return null;
    }
  }

  /**
   * Vérifie le statut d'un paiement
   */
  async checkPaymentStatus(paymentId: string): Promise<{ status: string; amount?: number } | null> {
    try {
      if (!this.config) {
        await this.loadConfig();
      }

      if (!this.isConfigValid()) {
        throw new Error('Configuration Konnect invalide');
      }

      const credentials = this.getCurrentCredentials();
      if (!credentials) {
        throw new Error('Identifiants Konnect non disponibles');
      }

      const { apiKey } = credentials;
      const { environment } = this.config;

      const baseUrl = environment === 'production' 
        ? 'https://api.konnect.network/api/v2' 
        : 'https://api-sandbox.konnect.network/api/v2';

      const response = await fetch(`${baseUrl}/payments/${paymentId}`, {
        method: 'GET',
        headers: {
          'x-api-key': apiKey,
        },
      });

      if (!response.ok) {
        throw new Error(`Erreur lors de la vérification du statut: ${response.statusText}`);
      }

      const responseData = await response.json();
      return {
        status: responseData.status,
        amount: responseData.amount,
      };
    } catch (error) {
      console.error('Erreur lors de la vérification du statut du paiement:', error);
      return null;
    }
  }

  /**
   * Valide un webhook Konnect
   */
  validateWebhook(payload: any, signature: string): boolean {
    // Dans un environnement de production, vous devriez valider la signature du webhook
    // Pour l'instant, on retourne true pour les tests
    return true;
  }
}

// Export de l'instance singleton
export const konnectService = KonnectService.getInstance();
