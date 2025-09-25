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

const AddUser = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '123456789',
    full_name: '',
    whatsapp_number: '',
    role: USER_ROLES.OWNER,
    bio: '',
    address: '',
    city: '',
    postal_code: '',
    company_name: '',
    business_email: '',
    business_phone: '',
    website_url: '',
    facebook_url: '',
    instagram_url: '',
    linkedin_url: '',
    twitter_url: '',
    tiktok_url: '',
    messenger_url: ''
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
        if (!value) {
          newErrors.whatsapp_number = 'Le numéro WhatsApp est obligatoire';
        } else if (!/^[\+]?[0-9\s\-\(\)]{10,}$/.test(value)) {
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
    setFormData(prev => ({ ...prev, [name]: value }));
    validateField(name, value);
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
    return formData.email && 
           formData.password && 
           formData.full_name && 
           formData.whatsapp_number && 
           formData.role &&
           Object.keys(errors).length === 0;
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
      // TODO: Implémenter la logique de création d'utilisateur
      console.log('Données du formulaire:', formData);
      
      // Simulation d'un délai
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Utilisateur créé avec succès",
        description: `L'utilisateur ${formData.full_name} a été créé avec succès.`,
      });
      
      // Réinitialiser le formulaire
      setFormData({
        email: '',
        password: '123456789',
        full_name: '',
        whatsapp_number: '',
        role: USER_ROLES.OWNER,
        bio: '',
        address: '',
        city: '',
        postal_code: '',
        company_name: '',
        business_email: '',
        business_phone: '',
        website_url: '',
        facebook_url: '',
        instagram_url: '',
        linkedin_url: '',
        twitter_url: '',
        tiktok_url: '',
        messenger_url: ''
      });
      
    } catch (error) {
      console.error('Erreur lors de la création:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer l'utilisateur. Veuillez réessayer.",
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
                    Numéro WhatsApp <span className="text-red-500">*</span>
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
