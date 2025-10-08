import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Send, CheckCircle, XCircle, Settings, Server, Save, TestTube, Mail, Users, UserCheck, Filter, Eye, Code } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { usePageTitle } from "@/hooks/usePageTitle";
import { EmailService } from "@/lib/email-service";
import { EmailConfigService, EmailConfig, EmailConfigUpdate } from "@/lib/email-config-service";
import { EmailBulkService, BulkEmailRequest } from "@/lib/email-bulk-service";
import { USER_ROLES } from "@/lib/constants";

// ✅ SEC-007 : URL du site depuis variable d'environnement
const SITE_URL = import.meta.env.VITE_SITE_URL || 'https://location-vacance.tn';

interface EmailTestForm {
  to: string;
  subject: string;
  message: string;
}

interface BulkEmailForm {
  recipients: 'single' | 'all' | 'role' | 'specific';
  role: string;
  specificEmails: string;
  subject: string;
  message: string;
}

export default function EmailSettings() {
  const { toast } = useToast();
  const { setPageTitle } = usePageTitle();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isMigrating, setIsMigrating] = useState(false);
  const [isBulkSending, setIsBulkSending] = useState(false);
  const [isHtmlMode, setIsHtmlMode] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [bulkResult, setBulkResult] = useState<{
    success: boolean;
    totalSent: number;
    totalFailed: number;
    errors: string[];
  } | null>(null);

  // État pour la configuration SMTP
  const [emailConfig, setEmailConfig] = useState<EmailConfig | null>(null);
  const [configForm, setConfigForm] = useState<EmailConfigUpdate>({
    smtp_host: '',
    smtp_port: 465,
    smtp_user: '',
    smtp_password: '',
    from_email: '',
    from_name: 'Location Vacance',
    is_ssl: true
  });

  const [formData, setFormData] = useState<EmailTestForm>({
    to: "",
    subject: "Test d'envoi d'email - Location Vacance",
    message: "Ceci est un email de test pour vérifier la configuration SMTP de votre application Location Vacance."
  });

  const [bulkFormData, setBulkFormData] = useState<BulkEmailForm>({
    recipients: 'single',
    role: USER_ROLES.OWNER,
    specificEmails: '',
    subject: "Communication importante - Location Vacance",
    message: "Ceci est un message important de l'équipe Location Vacance."
  });

  // Template HTML par défaut avec logo et couleurs du thème
  const defaultHtmlTemplate = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href="https://fonts.googleapis.com/css2?family=Quicksand:wght@300;400;700&display=swap" rel="stylesheet">
    <style>
        .custom-div{max-width:600px;padding:20px;background-color:#ffffff;border-radius:3px;margin:0 auto;font-family:"Quicksand",sans-serif; border: 1px solid #efefef}
        .username,.password{font-weight:400}
        .message{font-weight:700;color:#387e64;font-size:18px}
        .thank-you{font-weight:700}
        a.btn-custom,a.btn-custom-v{display:inline-block;background-color:hsl(145, 71%, 40%);color:white;padding:10px 30px;border-radius:5px;text-align:center;text-decoration:none;font-weight:400;transition:background-color .3s ease;margin-top:15px;margin-bottom:15px}
        a.btn-custom-v{background-color:#f7aa2f}
        a.btn-custom:hover,a.btn-custom-v:hover{opacity:.85}
        .centered{text-align:center}
        img.logo{display:block;margin:0 auto 20px;max-width:30%;height:auto;margin-bottom:35px}
        .social-icons svg{width:40px;height:auto;margin:0 10px;fill:#333}
        .social-icons a:hover svg{fill:hsl(145, 71%, 40%)}
        body{background-color:#fff}
    </style>
</head>
<body>
    <div class="custom-div">
        <br>
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
            <td style="padding-right: 0px;padding-left: 0px;" align="center">
            <a href="${SITE_URL}" target="_blank">
                <img align="center" border="0" src="/icons/logo.svg" alt="Location Vacance" title="Location Vacance" style="outline: none;text-decoration: none;-ms-interpolation-mode: bicubic;clear: both;display: inline-block !important;border: none;height: auto;float: none;width: 31%;max-width: 148.8px;" width="148.8"/>
            </a>
            </td>
        </tr>
        </table>
        <br>
        <br>
        <!-- Ajoutez le code ici -->
        <p class="message">Félicitations ! Une reservation attend votre confirmation sur <strong>Location Vacance</strong>.</p>
        <p>Vous avez reçu une nouvelle demande de réservation ! Pour maintenir une expérience optimale pour nos utilisateurs, nous vous encourageons à confirmer la disponibilité dans les <strong><span style="color:#b9052d">24 heures</span></strong> afin de garantir cette réservation.</p>
    
        <br>
        Pour confirmer cette réservation, veuillez cliquer sur le bouton ci-dessous :
        <p class="centered">
            <a href="{reservation_detail_url}" class="btn-custom" target="_blank">Confirmer la disponibilité</a>
        </p>
        <br>    
        Veuillez noter : Cette demande de réservation expirera après <strong><span style="color:#b9052d">24 heures</span></strong> si aucune confirmation n'est reçue de la part de votre hôte.
        <p class="message">Nous sommes à votre disposition pour simplifier ce processus de réservation. <br />L'équipe Location Vacance.</p>
        <p style="margin: 40px 0 10px; color: #777777; font-size:13px; text-align: center;">Copyright © 2024 Location Vacance, Tous droits réservés.</p>
        <!--Fin du custom code -->
    </div>
</body>
</html>`;

  // Charger la configuration email au montage du composant
  useEffect(() => {
    setPageTitle("Configuration Email");
    loadEmailConfig();
  }, [setPageTitle]);

  const loadEmailConfig = async () => {
    try {
      const config = await EmailConfigService.getActiveConfig();
      if (config) {
        setEmailConfig(config);
        setConfigForm({
          smtp_host: config.smtp_host,
          smtp_port: config.smtp_port,
          smtp_user: config.smtp_user,
          smtp_password: config.smtp_password,
          from_email: config.from_email,
          from_name: config.from_name,
          is_ssl: config.is_ssl
        });
      }
    } catch (error) {
      console.error('Erreur lors du chargement de la config:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger la configuration email",
        variant: "destructive"
      });
    }
  };

  const handleInputChange = (field: keyof EmailTestForm, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleBulkInputChange = (field: keyof BulkEmailForm, value: string) => {
    setBulkFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleConfigChange = (field: keyof EmailConfigUpdate, value: string | number | boolean) => {
    setConfigForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveConfig = async () => {
    setIsSaving(true);
    try {
      let result;
      if (emailConfig) {
        // Mise à jour de la configuration existante
        result = await EmailConfigService.updateConfig(emailConfig.id, configForm);
      } else {
        // Création d'une nouvelle configuration
        result = await EmailConfigService.createConfig(configForm);
      }

      if (result.success) {
        toast({
          title: "Succès",
          description: "Configuration SMTP sauvegardée avec succès",
        });
        await loadEmailConfig(); // Recharger la configuration
      } else {
        toast({
          title: "Erreur",
          description: result.error || "Erreur lors de la sauvegarde",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast({
        title: "Erreur",
        description: "Erreur lors de la sauvegarde de la configuration",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestConfig = async () => {
    setIsTesting(true);
    setTestResult(null);
    
    try {
      const result = await EmailConfigService.testConfig(configForm);
      
      if (result.success) {
        setTestResult({
          success: true,
          message: "Configuration SMTP testée avec succès !"
        });
        toast({
          title: "Succès",
          description: "Configuration SMTP validée",
        });
      } else {
        setTestResult({
          success: false,
          message: result.error || "Erreur lors du test de configuration"
        });
        toast({
          title: "Erreur",
          description: result.error || "Erreur lors du test de configuration",
          variant: "destructive"
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erreur de connexion";
      setTestResult({
        success: false,
        message: errorMessage
      });
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleMigratePasswords = async () => {
    setIsMigrating(true);
    try {
      const result = await EmailConfigService.migratePasswords();
      
      if (result.success) {
        toast({
          title: "Succès",
          description: `${result.migrated} mot(s) de passe migré(s) avec succès`,
        });
        await loadEmailConfig(); // Recharger la configuration
      } else {
        toast({
          title: "Erreur",
          description: result.error || "Erreur lors de la migration",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Erreur lors de la migration:', error);
      toast({
        title: "Erreur",
        description: "Erreur lors de la migration des mots de passe",
        variant: "destructive"
      });
    } finally {
      setIsMigrating(false);
    }
  };

  const handleSendTest = async () => {
    // Validation côté client
    const validation = EmailService.validateEmailData(formData);
    if (!validation.isValid) {
      toast({
        title: "Erreur de validation",
        description: validation.errors.join(', '),
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    setTestResult(null);

    try {
      const result = await EmailService.sendTestEmail(
        formData.to,
        formData.subject,
        formData.message,
        isHtmlMode
      );

      if (result.success) {
        setTestResult({
          success: true,
          message: "Email envoyé avec succès ! Vérifiez votre boîte de réception."
        });
        toast({
          title: "Succès",
          description: "Email de test envoyé avec succès",
        });
      } else {
        setTestResult({
          success: false,
          message: result.error || "Erreur lors de l'envoi de l'email"
        });
        toast({
          title: "Erreur",
          description: result.error || "Erreur lors de l'envoi de l'email",
          variant: "destructive"
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erreur de connexion";
      setTestResult({
        success: false,
        message: errorMessage
      });
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkSend = async () => {
    // Validation
    if (!bulkFormData.subject.trim() || !bulkFormData.message.trim()) {
      toast({
        title: "Erreur de validation",
        description: "Le sujet et le message sont obligatoires",
        variant: "destructive"
      });
      return;
    }

    if (bulkFormData.recipients === 'specific' && !bulkFormData.specificEmails.trim()) {
      toast({
        title: "Erreur de validation",
        description: "Veuillez saisir au moins un email",
        variant: "destructive"
      });
      return;
    }

    setIsBulkSending(true);
    setBulkResult(null);

    try {
      const request: BulkEmailRequest = {
        recipients: bulkFormData.recipients,
        role: bulkFormData.recipients === 'role' ? bulkFormData.role : undefined,
        specificEmails: bulkFormData.recipients === 'specific' 
          ? bulkFormData.specificEmails.split(',').map(email => email.trim()).filter(email => email)
          : undefined,
        subject: bulkFormData.subject,
        message: bulkFormData.message,
        isTest: false,
        isHtml: isHtmlMode
      };

      const result = await EmailBulkService.sendBulkEmail(request);

      setBulkResult({
        success: result.success,
        totalSent: result.totalSent,
        totalFailed: result.totalFailed,
        errors: result.errors
      });

      if (result.success) {
        toast({
          title: "Succès",
          description: `${result.totalSent} email(s) envoyé(s) avec succès`,
        });
      } else {
        toast({
          title: "Envoi partiel",
          description: `${result.totalSent} envoyé(s), ${result.totalFailed} échec(s)`,
          variant: "destructive"
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erreur de connexion";
      setBulkResult({
        success: false,
        totalSent: 0,
        totalFailed: 0,
        errors: [errorMessage]
      });
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsBulkSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="send" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="send" className="flex items-center space-x-2">
            <Send className="h-4 w-4" />
            <span>Envoi</span>
          </TabsTrigger>
          <TabsTrigger value="config" className="flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <span>Configuration</span>
          </TabsTrigger>
        </TabsList>

        {/* Onglet Envoi */}
        <TabsContent value="send" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            {/* Formulaire d'envoi */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-lg">
                  <Send className="h-4 w-4" />
                  <span>Envoi d'email</span>
                </CardTitle>
                <CardDescription>
                  Envoyez un email à une personne, par rôle ou à tous les utilisateurs
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Type d'envoi */}
                <div>
                  <Label>Type d'envoi</Label>
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="single"
                        name="emailType"
                        value="single"
                        checked={!bulkFormData.recipients || bulkFormData.recipients === 'single'}
                        onChange={() => setBulkFormData(prev => ({ ...prev, recipients: 'single' }))}
                        className="h-4 w-4"
                      />
                      <Label htmlFor="single" className="text-sm">Email unique</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="role"
                        name="emailType"
                        value="role"
                        checked={bulkFormData.recipients === 'role'}
                        onChange={() => setBulkFormData(prev => ({ ...prev, recipients: 'role' }))}
                        className="h-4 w-4"
                      />
                      <Label htmlFor="role" className="text-sm">Par rôle</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="all"
                        name="emailType"
                        value="all"
                        checked={bulkFormData.recipients === 'all'}
                        onChange={() => setBulkFormData(prev => ({ ...prev, recipients: 'all' }))}
                        className="h-4 w-4"
                      />
                      <Label htmlFor="all" className="text-sm">Tous les utilisateurs</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="specific"
                        name="emailType"
                        value="specific"
                        checked={bulkFormData.recipients === 'specific'}
                        onChange={() => setBulkFormData(prev => ({ ...prev, recipients: 'specific' }))}
                        className="h-4 w-4"
                      />
                      <Label htmlFor="specific" className="text-sm">Emails spécifiques</Label>
                    </div>
                  </div>
                </div>

                {/* Destinataire unique */}
                {(!bulkFormData.recipients || bulkFormData.recipients === 'single') && (
                  <div>
                    <Label htmlFor="to">Destinataire *</Label>
                    <Input
                      id="to"
                      type="email"
                      placeholder="exemple@email.com"
                      value={formData.to}
                      onChange={(e) => handleInputChange('to', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                )}

                {/* Sélection par rôle */}
                {bulkFormData.recipients === 'role' && (
                  <div>
                    <Label htmlFor="role">Rôle *</Label>
                    <select
                      id="role"
                      value={bulkFormData.role}
                      onChange={(e) => handleBulkInputChange('role', e.target.value)}
                      className="mt-1 flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value={USER_ROLES.ADMIN}>Administrateurs</option>
                      <option value={USER_ROLES.OWNER}>Propriétaires</option>
                      <option value={USER_ROLES.ADVERTISER}>Publicitaires</option>
                      <option value={USER_ROLES.TENANT}>Locataires</option>
                    </select>
                  </div>
                )}

                {/* Emails spécifiques */}
                {bulkFormData.recipients === 'specific' && (
                  <div>
                    <Label htmlFor="specificEmails">Emails (séparés par des virgules) *</Label>
                    <Textarea
                      id="specificEmails"
                      placeholder="email1@example.com, email2@example.com, email3@example.com"
                      value={bulkFormData.specificEmails}
                      onChange={(e) => handleBulkInputChange('specificEmails', e.target.value)}
                      rows={3}
                      className="mt-1"
                    />
                  </div>
                )}

                {/* Sujet */}
                <div>
                  <Label htmlFor="subject">Sujet *</Label>
                  <Input
                    id="subject"
                    value={bulkFormData.recipients === 'single' ? formData.subject : bulkFormData.subject}
                    onChange={(e) => {
                      if (bulkFormData.recipients === 'single') {
                        handleInputChange('subject', e.target.value);
                      } else {
                        handleBulkInputChange('subject', e.target.value);
                      }
                    }}
                    className="mt-1"
                  />
                </div>

                {/* Message */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label htmlFor="message">Message *</Label>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="message-html-mode"
                        checked={isHtmlMode}
                        onCheckedChange={setIsHtmlMode}
                      />
                      <Label htmlFor="message-html-mode" className="text-xs">
                        HTML
                      </Label>
                    </div>
                  </div>
                  <Textarea
                    id="message"
                    value={bulkFormData.recipients === 'single' ? formData.message : bulkFormData.message}
                    onChange={(e) => {
                      if (bulkFormData.recipients === 'single') {
                        handleInputChange('message', e.target.value);
                      } else {
                        handleBulkInputChange('message', e.target.value);
                      }
                    }}
                    rows={isHtmlMode ? 8 : 4}
                    className="mt-1 font-mono text-sm"
                    placeholder={isHtmlMode ? "Entrez votre code HTML ici..." : "Entrez votre message ici..."}
                  />
                  {isHtmlMode && (
                    <p className="text-xs text-muted-foreground mt-1">
                      💡 Utilisez le bouton "Charger le template HTML" dans l'aperçu pour commencer
                    </p>
                  )}
                </div>

                {/* Bouton d'envoi */}
                <Button 
                  onClick={bulkFormData.recipients === 'single' ? handleSendTest : handleBulkSend}
                  disabled={
                    (bulkFormData.recipients === 'single' && (isLoading || !formData.to.trim() || !emailConfig)) ||
                    (bulkFormData.recipients !== 'single' && (isBulkSending || !bulkFormData.subject.trim() || !bulkFormData.message.trim() || !emailConfig))
                  }
                  className="w-full"
                >
                  {bulkFormData.recipients === 'single' ? (
                    isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Envoi en cours...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Envoyer l'email
                      </>
                    )
                  ) : (
                    isBulkSending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Envoi en cours...
                      </>
                    ) : (
                      <>
                        <Users className="h-4 w-4 mr-2" />
                        Envoyer en masse
                      </>
                    )
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Aperçu du mail */}
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-lg">
                  <Eye className="h-4 w-4" />
                  <span>Aperçu du mail</span>
                </CardTitle>
                <CardDescription>
                  Prévisualisation de votre email
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Toggle HTML/Text */}
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="html-mode"
                      checked={isHtmlMode}
                      onCheckedChange={setIsHtmlMode}
                    />
                    <Label htmlFor="html-mode" className="text-sm">
                      Mode HTML
                    </Label>
                  </div>

                  {/* Aperçu */}
                  <div className="border rounded-md p-4 bg-muted/50 max-h-96 overflow-auto">
                    {isHtmlMode ? (
                      <div 
                        dangerouslySetInnerHTML={{ 
                          __html: bulkFormData.recipients === 'single' ? formData.message : bulkFormData.message 
                        }}
                        className="prose prose-sm max-w-none"
                      />
                    ) : (
                      <div className="whitespace-pre-wrap text-sm">
                        {bulkFormData.recipients === 'single' ? formData.message : bulkFormData.message}
                      </div>
                    )}
                  </div>

                  {/* Bouton pour charger le template HTML */}
                  {isHtmlMode && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (bulkFormData.recipients === 'single') {
                          handleInputChange('message', defaultHtmlTemplate);
                        } else {
                          handleBulkInputChange('message', defaultHtmlTemplate);
                        }
                      }}
                      className="w-full"
                    >
                      <Code className="h-4 w-4 mr-2" />
                      Charger le template HTML
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Onglet Configuration & Test */}
        <TabsContent value="config" className="space-y-6">
          {/* Configuration actuelle */}
          {emailConfig ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-lg">
                  <Server className="h-4 w-4" />
                  <span>Configuration Actuelle</span>
                </CardTitle>
                <CardDescription>
                  Paramètres SMTP actuellement utilisés
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Serveur SMTP</Label>
                    <div className="mt-1 p-2 bg-muted rounded-md text-sm">
                      {emailConfig.smtp_host}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Port</Label>
                    <div className="mt-1 p-2 bg-muted rounded-md text-sm">
                      {emailConfig.smtp_port}
                    </div>
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium">Email d'envoi</Label>
                  <div className="mt-1 p-2 bg-muted rounded-md text-sm">
                    {emailConfig.smtp_user}
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Nom d'envoi</Label>
                  <div className="mt-1 p-2 bg-muted rounded-md text-sm">
                    {emailConfig.from_name}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Badge variant={emailConfig.is_ssl ? "default" : "secondary"}>
                    {emailConfig.is_ssl ? "SSL/TLS" : "Non sécurisé"}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    Connexion sécurisée
                  </span>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-lg">
                  <Server className="h-4 w-4" />
                  <span>Configuration Actuelle</span>
                </CardTitle>
                <CardDescription>
                  Aucune configuration trouvée
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Server className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-2">Aucune configuration SMTP trouvée</p>
                  <p className="text-sm text-muted-foreground">
                    Configurez les paramètres SMTP ci-dessous
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Configuration SMTP */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-lg">
                <Settings className="h-4 w-4" />
                <span>Configuration SMTP</span>
              </CardTitle>
              <CardDescription>
                Modifiez les paramètres de votre serveur SMTP
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="smtp_host">Serveur SMTP *</Label>
                  <Input
                    id="smtp_host"
                    value={configForm.smtp_host}
                    onChange={(e) => handleConfigChange('smtp_host', e.target.value)}
                    placeholder="mail.votre-domaine.com"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="smtp_port">Port *</Label>
                  <Input
                    id="smtp_port"
                    type="number"
                    value={configForm.smtp_port}
                    onChange={(e) => handleConfigChange('smtp_port', parseInt(e.target.value) || 465)}
                    placeholder="465"
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="smtp_user">Nom d'utilisateur SMTP *</Label>
                  <Input
                    id="smtp_user"
                    value={configForm.smtp_user}
                    onChange={(e) => handleConfigChange('smtp_user', e.target.value)}
                    placeholder="votre-email@votre-domaine.com"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="smtp_password">Mot de passe SMTP *</Label>
                  <Input
                    id="smtp_password"
                    type="password"
                    value={configForm.smtp_password}
                    onChange={(e) => handleConfigChange('smtp_password', e.target.value)}
                    placeholder="Votre mot de passe SMTP"
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="from_email">Email d'envoi *</Label>
                  <Input
                    id="from_email"
                    type="email"
                    value={configForm.from_email}
                    onChange={(e) => handleConfigChange('from_email', e.target.value)}
                    placeholder="noreply@votre-domaine.com"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="from_name">Nom d'envoi *</Label>
                  <Input
                    id="from_name"
                    value={configForm.from_name}
                    onChange={(e) => handleConfigChange('from_name', e.target.value)}
                    placeholder="Location Vacance"
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_ssl"
                  checked={configForm.is_ssl}
                  onCheckedChange={(checked) => handleConfigChange('is_ssl', checked)}
                />
                <Label htmlFor="is_ssl">Utiliser SSL/TLS</Label>
              </div>

              <div className="flex space-x-2">
                <Button 
                  onClick={handleSaveConfig}
                  disabled={isSaving}
                  className="flex-1"
                >
                  {isSaving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Sauvegarde...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Sauvegarder
                    </>
                  )}
                </Button>
                <Button 
                  onClick={handleTestConfig}
                  disabled={isTesting}
                  variant="outline"
                  className="flex-1"
                >
                  {isTesting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                      Test...
                    </>
                  ) : (
                    <>
                      <TestTube className="h-4 w-4 mr-2" />
                      Tester
                    </>
                  )}
                </Button>
              </div>

              {/* Bouton de migration pour les mots de passe existants */}
              <div className="pt-4 border-t">
                <div className="text-sm text-muted-foreground mb-2">
                  Si vous rencontrez des erreurs de déchiffrement, migrez les mots de passe existants :
                </div>
                <Button 
                  onClick={handleMigratePasswords}
                  disabled={isMigrating}
                  variant="secondary"
                  size="sm"
                >
                  {isMigrating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                      Migration...
                    </>
                  ) : (
                    <>
                      <Settings className="h-4 w-4 mr-2" />
                      Migrer les mots de passe
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Résultat du test */}
      {testResult && (
        <Card>
          <CardContent className="pt-6">
            <Alert className={testResult.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
              <div className="flex items-center space-x-2">
                {testResult.success ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-600" />
                )}
                <AlertDescription className={testResult.success ? "text-green-800" : "text-red-800"}>
                  {testResult.message}
                </AlertDescription>
              </div>
            </Alert>
          </CardContent>
        </Card>
      )}

      {/* Résultat de l'envoi en masse */}
      {bulkResult && (
        <Card>
          <CardContent className="pt-6">
            <Alert className={bulkResult.success ? "border-green-200 bg-green-50" : "border-orange-200 bg-orange-50"}>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  {bulkResult.success ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-orange-600" />
                  )}
                  <AlertDescription className={bulkResult.success ? "text-green-800" : "text-orange-800"}>
                    <strong>Envoi en masse terminé :</strong> {bulkResult.totalSent} envoyé(s), {bulkResult.totalFailed} échec(s)
                  </AlertDescription>
                </div>
                {bulkResult.errors.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm font-medium text-orange-800 mb-1">Erreurs :</p>
                    <ul className="text-xs text-orange-700 space-y-1">
                      {bulkResult.errors.slice(0, 5).map((error, index) => (
                        <li key={index}>• {error}</li>
                      ))}
                      {bulkResult.errors.length > 5 && (
                        <li>• ... et {bulkResult.errors.length - 5} autres erreurs</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            </Alert>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
