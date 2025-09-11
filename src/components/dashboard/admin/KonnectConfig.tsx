import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  CreditCard, 
  Save, 
  Eye, 
  EyeOff, 
  Settings,
  AlertCircle,
  CheckCircle,
  Info
} from "lucide-react";

interface KonnectConfig {
  id: string;
  environment: 'sandbox' | 'production';
  sandbox_wallet_id: string | null;
  sandbox_api_key: string | null;
  production_wallet_id: string | null;
  production_api_key: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const KonnectConfig = () => {
  const { toast } = useToast();
  const [config, setConfig] = useState<KonnectConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSandboxKey, setShowSandboxKey] = useState(false);
  const [showProductionKey, setShowProductionKey] = useState(false);

  // Charger la configuration
  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('konnect_config')
        .select('*')
        .single();

      if (error) {
        console.error('Erreur lors du chargement de la configuration:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger la configuration Konnect",
          variant: "destructive",
        });
        return;
      }

      setConfig(data as KonnectConfig);
    } catch (error) {
      console.error('Erreur:', error);
      toast({
        title: "Erreur",
        description: "Une erreur inattendue s'est produite",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!config) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('konnect_config')
        .update({
          environment: config.environment,
          sandbox_wallet_id: config.sandbox_wallet_id,
          sandbox_api_key: config.sandbox_api_key,
          production_wallet_id: config.production_wallet_id,
          production_api_key: config.production_api_key,
          is_active: config.is_active,
          updated_at: new Date().toISOString(),
        })
        .eq('id', config.id);

      if (error) {
        console.error('Erreur lors de la sauvegarde:', error);
        toast({
          title: "Erreur",
          description: "Impossible de sauvegarder la configuration",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Succès",
        description: "Configuration Konnect sauvegardée avec succès",
      });
    } catch (error) {
      console.error('Erreur:', error);
      toast({
        title: "Erreur",
        description: "Une erreur inattendue s'est produite",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const updateConfig = (updates: Partial<KonnectConfig>) => {
    if (config) {
      setConfig({ ...config, ...updates });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="text-center p-8">
        <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">Configuration Konnect non trouvée</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-end">
        <Badge variant={config.is_active ? "default" : "secondary"} className="flex items-center gap-2">
          {config.is_active ? (
            <CheckCircle className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          {config.is_active ? "Actif" : "Inactif"}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configuration principale */}
        <div className="lg:col-span-2 space-y-6">
          {/* Configuration Konnect */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Configuration Konnect
              </CardTitle>
              <CardDescription>
                Configurez les paramètres de paiement pour l'intégration avec Konnect
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Environnement */}
              <div className="space-y-3">
                <Label className="text-base font-medium">Environnement</Label>
                <RadioGroup
                  value={config.environment}
                  onValueChange={(value) => updateConfig({ environment: value as 'sandbox' | 'production' })}
                  className="flex space-x-6"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="sandbox" id="sandbox" />
                    <Label htmlFor="sandbox">Sandbox (Test)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="production" id="production" />
                    <Label htmlFor="production">Production</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Configuration selon l'environnement sélectionné */}
              {config.environment === 'sandbox' ? (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Configuration Sandbox</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="sandbox-wallet">ID du Portefeuille (Sandbox)</Label>
                      <Input
                        id="sandbox-wallet"
                        value={config.sandbox_wallet_id || ''}
                        onChange={(e) => updateConfig({ sandbox_wallet_id: e.target.value })}
                        placeholder="Entrez l'ID du portefeuille sandbox"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sandbox-key">Clé API (Sandbox)</Label>
                      <div className="relative">
                        <Input
                          id="sandbox-key"
                          type={showSandboxKey ? "text" : "password"}
                          value={config.sandbox_api_key || ''}
                          onChange={(e) => updateConfig({ sandbox_api_key: e.target.value })}
                          placeholder="Entrez la clé API sandbox"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowSandboxKey(!showSandboxKey)}
                        >
                          {showSandboxKey ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Configuration Production</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="production-wallet">ID du Portefeuille (Production)</Label>
                      <Input
                        id="production-wallet"
                        value={config.production_wallet_id || ''}
                        onChange={(e) => updateConfig({ production_wallet_id: e.target.value })}
                        placeholder="Entrez l'ID du portefeuille production"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="production-key">Clé API (Production)</Label>
                      <div className="relative">
                        <Input
                          id="production-key"
                          type={showProductionKey ? "text" : "password"}
                          value={config.production_api_key || ''}
                          onChange={(e) => updateConfig({ production_api_key: e.target.value })}
                          placeholder="Entrez la clé API production"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowProductionKey(!showProductionKey)}
                        >
                          {showProductionKey ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Environnement actif */}
              <div className="space-y-2">
                <Label className="text-base font-medium">Environnement actif</Label>
                <p className="text-sm text-muted-foreground">
                  L'environnement actuellement utilisé pour les paiements
                </p>
                <Badge variant={config.environment === 'production' ? 'destructive' : 'secondary'}>
                  {config.environment === 'production' ? 'Production' : 'Sandbox'}
                </Badge>
              </div>

              {/* Bouton de sauvegarde */}
              <div className="flex justify-end pt-4">
                <Button onClick={handleSave} disabled={saving} className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  {saving ? "Sauvegarde..." : "Sauvegarder"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Documentation */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Documentation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <h4 className="font-medium text-sm">Environnement Sandbox</h4>
                <p className="text-xs text-muted-foreground">
                  L'environnement de test vous permet de tester les paiements sans effectuer de transactions réelles. 
                  Pour accéder à vos identifiants de test, connectez-vous à votre compte sandbox Konnect.
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium text-sm">Environnement Production</h4>
                <p className="text-xs text-muted-foreground">
                  L'environnement de production traitera des paiements réels. Assurez-vous d'avoir correctement 
                  configuré et testé votre intégration avant de passer en production. Consultez votre compte 
                  production Konnect pour obtenir vos identifiants de production.
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium text-sm">Support technique</h4>
                <p className="text-xs text-muted-foreground">
                  En cas de problème avec l'intégration de paiement, contactez l'équipe technique ou consultez 
                  la documentation officielle de Konnect.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default KonnectConfig;
