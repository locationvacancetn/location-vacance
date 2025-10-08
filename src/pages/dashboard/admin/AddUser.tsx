import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { UserPlus, Mail, User, Phone, Building, Megaphone, Home, Shield } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { USER_ROLES } from '@/lib/constants';
import { supabase } from '@/integrations/supabase/client';
import { config } from '@/lib/config';

const AddUser = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    role: USER_ROLES.OWNER,
    phone: '',
    bio: '',
    whatsapp_number: '',
    website_url: '',
    facebook_url: '',
    instagram_url: '',
    tiktok_url: '',
    messenger_url: '',
    company_name: '',
    company_website: '',
    business_phone: '',
    business_email: '',
    linkedin_url: '',
    twitter_url: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Validation des champs
  const validateField = (name: string, value: string) => {
    const newErrors = { ...errors };
    
    switch (name) {
      case 'email':
        if (!value) {
          newErrors.email = 'L\'email est obligatoire';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          newErrors.email = 'Format d\'email invalide';
        } else {
          delete newErrors.email;
        }
        break;
      
      case 'password':
        if (!value) {
          newErrors.password = 'Le mot de passe est obligatoire';
        } else if (value.length < 6) {
          newErrors.password = 'Le mot de passe doit contenir au moins 6 caractères';
        } else {
          delete newErrors.password;
        }
        break;
      
      case 'full_name':
        if (!value) {
          newErrors.full_name = 'Le nom complet est obligatoire';
        } else {
          delete newErrors.full_name;
        }
        break;
      
      case 'whatsapp_number':
        // WhatsApp obligatoire seulement pour les propriétaires
        if (formData.role === USER_ROLES.OWNER && !value) {
          newErrors.whatsapp_number = 'Le numéro WhatsApp est obligatoire pour les propriétaires';
        } else if (value && !/^[\+]?[0-9\s\-\(\)]{10,}$/.test(value)) {
          newErrors.whatsapp_number = 'Format de numéro invalide';
        } else {
          delete newErrors.whatsapp_number;
        }
        break;
      
      case 'role':
        if (!value) {
          newErrors.role = 'Le rôle est obligatoire';
        } else {
          delete newErrors.role;
        }
        break;
      
      case 'business_email':
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          newErrors.business_email = 'Format d\'email invalide';
        } else {
          delete newErrors.business_email;
        }
        break;
      
      case 'website_url':
        if (value && !/^https?:\/\/.+/.test(value)) {
          newErrors.website_url = 'L\'URL doit commencer par http:// ou https://';
        } else {
          delete newErrors.website_url;
        }
        break;
      
      default:
        delete newErrors[name];
    }
    
    setErrors(newErrors);
  };

  const handleInputChange = (name: string, value: string) => {
    const newFormData = { ...formData, [name]: value };
    setFormData(newFormData);
    validateField(name, value);
    
    // Si on change de rôle, revalider le WhatsApp avec le nouveau rôle
    if (name === 'role') {
      // Créer une nouvelle fonction de validation temporaire avec le nouveau rôle
      const newErrors = { ...errors };
      if (value === USER_ROLES.OWNER && !formData.whatsapp_number) {
        newErrors.whatsapp_number = 'Le numéro WhatsApp est obligatoire pour les propriétaires';
      } else if (formData.whatsapp_number && !/^[\+]?[0-9\s\-\(\)]{10,}$/.test(formData.whatsapp_number)) {
        newErrors.whatsapp_number = 'Format de numéro invalide';
      } else {
        delete newErrors.whatsapp_number;
      }
      setErrors(newErrors);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case USER_ROLES.ADMIN: return <Shield className="h-4 w-4" />;
      case USER_ROLES.OWNER: return <Building className="h-4 w-4" />;
      case USER_ROLES.ADVERTISER: return <Megaphone className="h-4 w-4" />;
      case USER_ROLES.TENANT: return <Home className="h-4 w-4" />;
      default: return <User className="h-4 w-4" />;
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case USER_ROLES.ADMIN: return 'Administrateur';
      case USER_ROLES.OWNER: return 'Propriétaire';
      case USER_ROLES.ADVERTISER: return 'Publicitaire';
      case USER_ROLES.TENANT: return 'Locataire';
      default: return role;
    }
  };

  const isFormValid = () => {
    const baseValidation = formData.email && 
                          formData.password && 
                          formData.full_name && 
                          formData.role &&
                          Object.keys(errors).length === 0;
    
    // WhatsApp obligatoire seulement pour les propriétaires
    if (formData.role === USER_ROLES.OWNER) {
      return baseValidation && formData.whatsapp_number;
    }
    
    return baseValidation;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isFormValid()) {
      toast({
        title: "Erreur de validation",
        description: "Veuillez corriger les erreurs dans le formulaire",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      // Vérifier l'authentification avant l'appel
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        throw new Error('Vous devez être connecté pour créer un utilisateur');
      }




      // Données à envoyer
      const requestData = {
        email: formData.email,
        password: formData.password,
        full_name: formData.full_name,
        role: formData.role,
        phone: formData.phone || undefined,
        bio: formData.bio || undefined,
        whatsapp_number: formData.whatsapp_number || undefined,
        website_url: formData.website_url || undefined,
        facebook_url: formData.facebook_url || undefined,
        instagram_url: formData.instagram_url || undefined,
        tiktok_url: formData.tiktok_url || undefined,
        messenger_url: formData.messenger_url || undefined,
        company_name: formData.company_name || undefined,
        company_website: formData.company_website || undefined,
        business_phone: formData.business_phone || undefined,
        business_email: formData.business_email || undefined,
        linkedin_url: formData.linkedin_url || undefined,
        twitter_url: formData.twitter_url || undefined,
      };



      // Appel à la Edge Function sécurisée pour créer l'utilisateur

      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 secondes timeout
      
      const response = await fetch(`${config.supabase.url}/functions/v1/create-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(requestData),
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);


      // Vérifier si la réponse est valide
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Erreur HTTP:', response.status, errorText);
        throw new Error(`Erreur HTTP ${response.status}: ${errorText}`);
      }

      // Vérifier si la réponse contient du JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const responseText = await response.text();
        console.error('Réponse non-JSON:', responseText);
        throw new Error(`Réponse invalide du serveur: ${responseText}`);
      }

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Erreur lors de la création de l\'utilisateur');
      }

      toast({
        title: "Utilisateur créé avec succès",
        description: `L'utilisateur ${formData.full_name} a été créé avec succès.`,
      });
      
      // Rediriger vers la page de gestion des utilisateurs
      navigate('/dashboard/admin/users');
      
    } catch (error) {
      console.error('Erreur lors de la création:', error);
      
      let errorMessage = "Impossible de créer l'utilisateur. Veuillez réessayer.";
      
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch')) {
          errorMessage = "Erreur de connexion. Vérifiez votre connexion internet et que la fonction est déployée.";
        } else if (error.message.includes('authentification')) {
          errorMessage = "Problème d'authentification. Veuillez vous reconnecter.";
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Formulaire */}
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Section Informations de base */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <User className="h-5 w-5" />
                Informations de base
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2 text-sm font-medium">
                    <Mail className="h-4 w-4" />
                    Email <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="exemple@email.com"
                    className={`h-10 ${errors.email ? 'border-red-500' : ''}`}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500">{errors.email}</p>
                  )}
                </div>

                {/* Mot de passe temporaire */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">
                    Mot de passe temporaire <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    placeholder="Mot de passe temporaire"
                    className={`h-10 ${errors.password ? 'border-red-500' : ''}`}
                  />
                  {errors.password && (
                    <p className="text-sm text-red-500">{errors.password}</p>
                  )}
                </div>

                {/* Nom complet */}
                <div className="space-y-2">
                  <Label htmlFor="full_name" className="flex items-center gap-2 text-sm font-medium">
                    <User className="h-4 w-4" />
                    Nom complet <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) => handleInputChange('full_name', e.target.value)}
                    placeholder="Prénom Nom"
                    className={`h-10 ${errors.full_name ? 'border-red-500' : ''}`}
                  />
                  {errors.full_name && (
                    <p className="text-sm text-red-500">{errors.full_name}</p>
                  )}
                </div>

                {/* WhatsApp */}
                <div className="space-y-2">
                  <Label htmlFor="whatsapp_number" className="flex items-center gap-2 text-sm font-medium">
                    <Phone className="h-4 w-4" />
                    Numéro WhatsApp {formData.role === USER_ROLES.OWNER && <span className="text-red-500">*</span>}
                  </Label>
                  <Input
                    id="whatsapp_number"
                    value={formData.whatsapp_number}
                    onChange={(e) => handleInputChange('whatsapp_number', e.target.value)}
                    placeholder="+33 6 12 34 56 78"
                    className={`h-10 ${errors.whatsapp_number ? 'border-red-500' : ''}`}
                  />
                  {errors.whatsapp_number && (
                    <p className="text-sm text-red-500">{errors.whatsapp_number}</p>
                  )}
                </div>

                {/* Rôle */}
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="role" className="text-sm font-medium">
                    Rôle <span className="text-red-500">*</span>
                  </Label>
                  <Select value={formData.role} onValueChange={(value) => handleInputChange('role', value)}>
                    <SelectTrigger className={`h-10 ${errors.role ? 'border-red-500' : ''}`}>
                      <SelectValue placeholder="Sélectionner un rôle" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={USER_ROLES.ADMIN}>
                        <div className="flex items-center gap-2">
                          {getRoleIcon(USER_ROLES.ADMIN)}
                          {getRoleLabel(USER_ROLES.ADMIN)}
                        </div>
                      </SelectItem>
                      <SelectItem value={USER_ROLES.OWNER}>
                        <div className="flex items-center gap-2">
                          {getRoleIcon(USER_ROLES.OWNER)}
                          {getRoleLabel(USER_ROLES.OWNER)}
                        </div>
                      </SelectItem>
                      <SelectItem value={USER_ROLES.ADVERTISER}>
                        <div className="flex items-center gap-2">
                          {getRoleIcon(USER_ROLES.ADVERTISER)}
                          {getRoleLabel(USER_ROLES.ADVERTISER)}
                        </div>
                      </SelectItem>
                      <SelectItem value={USER_ROLES.TENANT}>
                        <div className="flex items-center gap-2">
                          {getRoleIcon(USER_ROLES.TENANT)}
                          {getRoleLabel(USER_ROLES.TENANT)}
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.role && (
                    <p className="text-sm text-red-500">{errors.role}</p>
                  )}
                </div>
              </div>
            </div>



            {/* Section Réseaux sociaux */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Réseaux sociaux</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Facebook */}
                <div className="space-y-2">
                  <Label htmlFor="facebook_url">Facebook</Label>
                  <Input
                    id="facebook_url"
                    value={formData.facebook_url}
                    onChange={(e) => handleInputChange('facebook_url', e.target.value)}
                    placeholder="https://facebook.com/profil"
                  />
                </div>

                {/* Instagram */}
                <div className="space-y-2">
                  <Label htmlFor="instagram_url">Instagram</Label>
                  <Input
                    id="instagram_url"
                    value={formData.instagram_url}
                    onChange={(e) => handleInputChange('instagram_url', e.target.value)}
                    placeholder="https://instagram.com/profil"
                  />
                </div>

                {/* LinkedIn */}
                <div className="space-y-2">
                  <Label htmlFor="linkedin_url">LinkedIn</Label>
                  <Input
                    id="linkedin_url"
                    value={formData.linkedin_url}
                    onChange={(e) => handleInputChange('linkedin_url', e.target.value)}
                    placeholder="https://linkedin.com/in/profil"
                  />
                </div>

                {/* Twitter */}
                <div className="space-y-2">
                  <Label htmlFor="twitter_url">Twitter</Label>
                  <Input
                    id="twitter_url"
                    value={formData.twitter_url}
                    onChange={(e) => handleInputChange('twitter_url', e.target.value)}
                    placeholder="https://twitter.com/profil"
                  />
                </div>

                {/* TikTok */}
                <div className="space-y-2">
                  <Label htmlFor="tiktok_url">TikTok</Label>
                  <Input
                    id="tiktok_url"
                    value={formData.tiktok_url}
                    onChange={(e) => handleInputChange('tiktok_url', e.target.value)}
                    placeholder="https://tiktok.com/@profil"
                  />
                </div>

                {/* Messenger */}
                <div className="space-y-2">
                  <Label htmlFor="messenger_url">Messenger</Label>
                  <Input
                    id="messenger_url"
                    value={formData.messenger_url}
                    onChange={(e) => handleInputChange('messenger_url', e.target.value)}
                    placeholder="https://m.me/profil"
                  />
                </div>
              </div>
            </div>

            {/* Boutons d'action */}
            <div className="flex justify-end gap-4 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/dashboard/admin/users')}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={!isFormValid() || loading}
                className="bg-primary hover:bg-primary/90"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Création...
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Créer l'utilisateur
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddUser;
