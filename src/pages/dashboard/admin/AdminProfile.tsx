import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useUserRole } from "@/hooks/useUserRole";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { usePageTitle } from "@/hooks/usePageTitle";
import { 
  User,
  Upload,
  Save,
  X,
  Shield
} from "lucide-react";

const AdminProfile = () => {
  const { userProfile, refreshUserData } = useUserRole();
  const { user } = useAuth();
  const { toast } = useToast();
  const { title, description } = usePageTitle();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    phoneCountryCode: '+216',
    // Champs de contact social
    whatsappNumber: '',
    websiteUrl: '',
    facebookUrl: '',
    instagramUrl: '',
    tiktokUrl: '',
    messengerUrl: '',
    // Langues parlées
    spokenLanguages: [] as string[],
  });
  const [avatarUrl, setAvatarUrl] = useState('');

  // Mettre à jour les données du formulaire quand userProfile change
  useEffect(() => {
    if (userProfile) {
      // Diviser le numéro de téléphone en code pays et numéro
      const phoneParts = userProfile.phone?.split(' ') || ['', ''];
      const countryCode = phoneParts[0] || '+216';
      const phoneNumber = phoneParts.slice(1).join(' ') || '';
      
      // Extraire la partie variable des URLs
      const extractUrlPart = (url: string | null, prefix: string) => {
        if (!url) return '';
        if (url.startsWith(prefix)) {
          return url.substring(prefix.length);
        }
        return url;
      };

      setFormData({
        fullName: userProfile.full_name || '',
        phone: phoneNumber,
        phoneCountryCode: countryCode,
        whatsappNumber: userProfile.whatsapp_number || '',
        websiteUrl: extractUrlPart(userProfile.website_url, 'https://'),
        facebookUrl: extractUrlPart(userProfile.facebook_url, 'https://facebook.com/'),
        instagramUrl: extractUrlPart(userProfile.instagram_url, 'https://instagram.com/'),
        tiktokUrl: extractUrlPart(userProfile.tiktok_url, 'https://tiktok.com/@'),
        messengerUrl: extractUrlPart(userProfile.messenger_url, 'https://m.me/'),
        spokenLanguages: userProfile.spoken_languages || [],
      });

      setAvatarUrl(userProfile.avatar_url || '');
    }
  }, [userProfile]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLanguageChange = (language: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      spokenLanguages: checked
        ? [...prev.spokenLanguages, language]
        : prev.spokenLanguages.filter(lang => lang !== language)
    }));
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "Erreur",
        description: "La taille du fichier ne doit pas dépasser 2MB",
        variant: "destructive",
      });
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Erreur",
        description: "Format de fichier non supporté. Utilisez JPEG, PNG, GIF ou WebP",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    let uploadedFilePath = null;
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id}-${Date.now()}.${fileExt}`;
      const filePath = fileName;
      uploadedFilePath = filePath;

      if (avatarUrl) {
        const oldFileName = avatarUrl.split('/').pop();
        if (oldFileName) {
          await supabase.storage
            .from('avatars')
            .remove([oldFileName]);
        }
      }

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);
      
      if (user) {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ avatar_url: publicUrl })
          .eq('user_id', user.id);
        
        if (updateError) {
          await supabase.storage
            .from('avatars')
            .remove([filePath]);
          throw new Error(`Database update failed: ${updateError.message}`);
        } else {
          setAvatarUrl(publicUrl);
          refreshUserData();
        }
      }
      
      toast({
        title: "Succès",
        description: "Photo de profil mise à jour avec succès",
      });
      
    } catch (error) {
      if (uploadedFilePath) {
        try {
          await supabase.storage
            .from('avatars')
            .remove([uploadedFilePath]);
        } catch (rollbackError) {
          console.error('Rollback failed:', rollbackError);
        }
      }
      
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors du téléchargement de la photo",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAvatar = async () => {
    if (!user || !avatarUrl) return;

    setIsLoading(true);
    try {
      const fileName = avatarUrl.split('/').pop();
      if (fileName) {
        const { error: deleteError } = await supabase.storage
          .from('avatars')
          .remove([fileName]);

        if (deleteError) {
          throw new Error(`File deletion failed: ${deleteError.message}`);
        }
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: null })
        .eq('user_id', user.id);

      if (updateError) {
        throw new Error(`Database update failed: ${updateError.message}`);
      }

      setAvatarUrl('');
      refreshUserData();

      toast({
        title: "Succès",
        description: "Photo de profil supprimée avec succès",
      });

    } catch (error) {
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors de la suppression de la photo",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    if (!formData.phone.trim()) {
      toast({
        title: "Erreur de validation",
        description: "Le numéro de téléphone est obligatoire",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const phoneWithCountryCode = `${formData.phoneCountryCode} ${formData.phone}`.trim();
      
      const facebookUrl = formData.facebookUrl.trim() ? `https://facebook.com/${formData.facebookUrl.trim()}` : null;
      const messengerUrl = formData.messengerUrl.trim() ? `https://m.me/${formData.messengerUrl.trim()}` : null;
      const instagramUrl = formData.instagramUrl.trim() ? `https://instagram.com/${formData.instagramUrl.trim()}` : null;
      const tiktokUrl = formData.tiktokUrl.trim() ? `https://tiktok.com/@${formData.tiktokUrl.trim()}` : null;
      const websiteUrl = formData.websiteUrl.trim() ? `https://${formData.websiteUrl.trim()}` : null;

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.fullName,
          phone: phoneWithCountryCode,
          avatar_url: avatarUrl,
          whatsapp_number: formData.whatsappNumber,
          website_url: websiteUrl,
          facebook_url: facebookUrl,
          instagram_url: instagramUrl,
          tiktok_url: tiktokUrl,
          messenger_url: messengerUrl,
          spoken_languages: formData.spokenLanguages,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }

      refreshUserData();

      toast({
        title: "Succès",
        description: "Profil mis à jour avec succès",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: error?.message || "Erreur lors de la mise à jour du profil",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Section Photo de profil */}
      <Card>
        <CardHeader>
          <CardDescription>
            Votre photo apparaîtra sur votre profil et dans vos interactions.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-6">
            <div className="relative group">
              <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                {avatarUrl ? (
                  <img 
                    src={avatarUrl} 
                    alt="Photo de profil" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <span className="text-2xl font-semibold text-gray-600">
                      {userProfile?.full_name?.charAt(0) || 'A'}
                    </span>
                  </div>
                )}
              </div>
              
              {/* Bouton de suppression superposé - seulement sur desktop */}
              {avatarUrl && (
                <button
                  onClick={handleDeleteAvatar}
                  disabled={isLoading}
                  className="hidden sm:flex absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-md items-center justify-center disabled:opacity-50"
                  title="Supprimer la photo"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
            
            <div className="text-center sm:text-left">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                {isLoading ? "Téléchargement..." : "Télécharger une photo"}
        </Button>
              <p className="text-sm text-muted-foreground mt-2">
                Taille maximale : 2MB.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section Informations personnelles */}
      <Card>
        <CardHeader>
          <CardDescription>
            Vos informations de base.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Email et Nom complet côte à côte */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Email - non modifiable */}
            <div className="space-y-2">
              <Label htmlFor="email">
                Email
              </Label>
              <Input
                id="email"
                value={userProfile?.email || ''}
                disabled
                className="bg-gray-50"
              />
            </div>

            {/* Nom complet */}
            <div className="space-y-2">
              <Label htmlFor="fullName">Nom complet</Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                placeholder="Votre nom complet"
              />
            </div>
          </div>
          
          <div className="space-y-4">
            {/* Téléphone et WhatsApp côte à côte */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Téléphone */}
              <div className="space-y-2">
                <Label htmlFor="phone">
                  Téléphone <span className="text-red-500">*</span>
                </Label>
                <div className="flex gap-2">
                  <Select 
                    value={formData.phoneCountryCode} 
                    onValueChange={(value) => handleInputChange('phoneCountryCode', value)}
                  >
                    <SelectTrigger className="w-24">
                      <span className="truncate">{formData.phoneCountryCode}</span>
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      {/* Pays prioritaires - Maghreb et Europe */}
                      <SelectItem value="+216">+216 Tunisie</SelectItem>
                      <SelectItem value="+213">+213 Algérie</SelectItem>
                      <SelectItem value="+212">+212 Maroc</SelectItem>
                      <SelectItem value="+218">+218 Libye</SelectItem>
                      <SelectItem value="+33">+33 France</SelectItem>
                      <SelectItem value="+39">+39 Italie</SelectItem>
                      <SelectItem value="+49">+49 Allemagne</SelectItem>
                      <SelectItem value="+1">+1 Canada/États-Unis</SelectItem>
                      <SelectItem value="+44">+44 Royaume-Uni</SelectItem>
                      <SelectItem value="+34">+34 Espagne</SelectItem>
                      <SelectItem value="+30">+30 Grèce</SelectItem>
                      <SelectItem value="+31">+31 Pays-Bas</SelectItem>
                      <SelectItem value="+32">+32 Belgique</SelectItem>
                      <SelectItem value="+41">+41 Suisse</SelectItem>
                      <SelectItem value="+43">+43 Autriche</SelectItem>
                      <SelectItem value="+45">+45 Danemark</SelectItem>
                      <SelectItem value="+46">+46 Suède</SelectItem>
                      <SelectItem value="+47">+47 Norvège</SelectItem>
                      <SelectItem value="+48">+48 Pologne</SelectItem>
                      <SelectItem value="+351">+351 Portugal</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="25100200"
                    className="flex-1"
                    required
                  />
                </div>
              </div>

              {/* WhatsApp */}
              <div className="space-y-2">
                <Label htmlFor="whatsappNumber">
                  WhatsApp
                </Label>
                <Input
                  id="whatsappNumber"
                  value={formData.whatsappNumber}
                  onChange={(e) => handleInputChange('whatsappNumber', e.target.value)}
                  placeholder="Numéro WhatsApp"
                />
              </div>
            </div>
            
            <p className="text-xs text-muted-foreground">
              Ces numéros seront visibles par les utilisateurs pour vous contacter.
            </p>
      </div>

        </CardContent>
      </Card>

      {/* Section Langues parlées */}
      <Card>
        <CardHeader>
          <CardDescription>
            Indiquez les langues que vous parlez pour faciliter la communication.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { id: 'arabe', label: 'Arabe' },
              { id: 'français', label: 'Français' },
              { id: 'anglais', label: 'Anglais' },
              { id: 'espagnol', label: 'Espagnol' },
              { id: 'allemand', label: 'Allemand' },
              { id: 'italien', label: 'Italien' }
            ].map((language) => (
              <div key={language.id} className="flex items-center space-x-2">
                <Checkbox
                  id={language.id}
                  checked={formData.spokenLanguages.includes(language.id)}
                  onCheckedChange={(checked) => 
                    handleLanguageChange(language.id, checked as boolean)
                  }
                />
                <Label 
                  htmlFor={language.id}
                  className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {language.label}
                </Label>
              </div>
            ))}
          </div>
          
          {formData.spokenLanguages.length > 0 && (
            <div className="mt-4">
              <p className="text-sm text-muted-foreground mb-2">Langues sélectionnées :</p>
              <div className="flex flex-wrap gap-2">
                {formData.spokenLanguages.map((language) => (
                  <span
                    key={language}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
                  >
                    {language.charAt(0).toUpperCase() + language.slice(1)}
                  </span>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Section Contacts sociaux */}
      <Card>
        <CardHeader>
          <CardDescription>
            Vos informations de contact pour les utilisateurs.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Facebook et Messenger */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Facebook */}
            <div className="space-y-2">
              <Label htmlFor="facebookUrl">Page Facebook</Label>
              <div className="flex">
                <span className="inline-flex items-center px-3 text-sm text-gray-500 bg-gray-50 border border-r-0 border-gray-300 rounded-l-md">
                  https://facebook.com/
                </span>
                <Input
                  id="facebookUrl"
                  value={formData.facebookUrl}
                  onChange={(e) => handleInputChange('facebookUrl', e.target.value)}
                  placeholder="votre-page"
                  className="rounded-l-none"
                />
              </div>
            </div>

            {/* Messenger */}
            <div className="space-y-2">
              <Label htmlFor="messengerUrl">Lien Messenger</Label>
              <div className="flex">
                <span className="inline-flex items-center px-3 text-sm text-gray-500 bg-gray-50 border border-r-0 border-gray-300 rounded-l-md">
                  https://m.me/
                </span>
                <Input
                  id="messengerUrl"
                  value={formData.messengerUrl}
                  onChange={(e) => handleInputChange('messengerUrl', e.target.value)}
                  placeholder="votre-page"
                  className="rounded-l-none"
                />
              </div>
            </div>
            </div>

          {/* Instagram et TikTok */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Instagram */}
            <div className="space-y-2">
              <Label htmlFor="instagramUrl">Page Instagram</Label>
              <div className="flex">
                <span className="inline-flex items-center px-3 text-sm text-gray-500 bg-gray-50 border border-r-0 border-gray-300 rounded-l-md">
                  https://instagram.com/
                </span>
                <Input
                  id="instagramUrl"
                  value={formData.instagramUrl}
                  onChange={(e) => handleInputChange('instagramUrl', e.target.value)}
                  placeholder="votre-compte"
                  className="rounded-l-none"
                />
            </div>
            </div>

            {/* TikTok */}
            <div className="space-y-2">
              <Label htmlFor="tiktokUrl">Page TikTok</Label>
              <div className="flex">
                <span className="inline-flex items-center px-3 text-sm text-gray-500 bg-gray-50 border border-r-0 border-gray-300 rounded-l-md">
                  https://tiktok.com/@
                </span>
                <Input
                  id="tiktokUrl"
                  value={formData.tiktokUrl}
                  onChange={(e) => handleInputChange('tiktokUrl', e.target.value)}
                  placeholder="votre-compte"
                  className="rounded-l-none"
                />
              </div>
            </div>
          </div>

          {/* Site web */}
          <div className="space-y-2">
            <Label htmlFor="websiteUrl">Site web</Label>
            <div className="flex max-w-md">
              <span className="inline-flex items-center px-3 text-sm text-gray-500 bg-gray-50 border border-r-0 border-gray-300 rounded-l-md">
                https://
              </span>
              <Input
                id="websiteUrl"
                value={formData.websiteUrl}
                onChange={(e) => handleInputChange('websiteUrl', e.target.value)}
                placeholder="votre-site.com"
                className="rounded-l-none"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Votre site web personnel ou professionnel.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Section Informations système */}
      <Card>
        <CardHeader>
          <CardDescription>
            Vos privilèges et permissions système
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Niveau d'accès</label>
              <p className="text-foreground">Super Administrateur</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Permissions</label>
              <p className="text-foreground">Accès complet à toutes les fonctionnalités</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-4 sm:w-full">
        <Button onClick={handleSave} disabled={isLoading} className="w-full sm:w-auto">
          <Save className="w-4 h-4 mr-2" />
          {isLoading ? "Enregistrement..." : "Enregistrer"}
        </Button>
      </div>
    </div>
  );
};

export default AdminProfile;
