import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUserRole } from "@/hooks/useUserRole";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  User,
  Upload,
  Save,
  X
} from "lucide-react";

const AdvertiserProfile = () => {
  const { userProfile, refreshUserData } = useUserRole();
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    phoneCountryCode: '+216',
    // Champs professionnels pour les annonceurs
    companyName: '',
    companyWebsite: '',
    businessPhone: '',
    businessEmail: '',
    linkedinUrl: '',
    twitterUrl: '',
  });
  const [avatarUrl, setAvatarUrl] = useState('');

  // Mettre à jour les données du formulaire quand userProfile change
  useEffect(() => {
    if (userProfile) {
      // Diviser le numéro de téléphone en code pays et numéro
      const phoneParts = userProfile.phone?.split(' ') || ['', ''];
      const countryCode = phoneParts[0] || '+216';
      const phoneNumber = phoneParts.slice(1).join(' ') || '';
      
      setFormData({
        fullName: userProfile.full_name || '',
        phone: phoneNumber,
        phoneCountryCode: countryCode, // Seulement l'indicatif
        // Champs professionnels pour les annonceurs
        companyName: userProfile.company_name || '',
        companyWebsite: userProfile.company_website || '',
        businessPhone: userProfile.business_phone || '',
        businessEmail: userProfile.business_email || '',
        linkedinUrl: userProfile.linkedin_url || '',
        twitterUrl: userProfile.twitter_url || '',
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

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validation de la taille (2MB max)
    if (file.size > 2 * 1024 * 1024) { // 2MB limit
      toast({
        title: "Erreur",
        description: "La taille du fichier ne doit pas dépasser 2MB",
        variant: "destructive",
      });
      return;
    }

    // Validation du type de fichier
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

      // Supprimer l'ancien fichier s'il existe
      if (avatarUrl) {
        const oldFileName = avatarUrl.split('/').pop();
        if (oldFileName) {
          console.log('Deleting old file:', oldFileName);
          const { error: deleteError } = await supabase.storage
            .from('avatars')
            .remove([oldFileName]);
          
          if (deleteError) {
            console.warn('Warning: Could not delete old file:', deleteError);
            // Ne pas arrêter le processus pour cette erreur
          } else {
            console.log('Old file deleted successfully');
          }
        }
      }

      // Upload du nouveau fichier
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

      console.log('Generated public URL:', publicUrl);
      
      // Sauvegarder l'URL dans la base de données
      if (user) {
        console.log('Saving avatar URL to database:', publicUrl);
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ avatar_url: publicUrl })
          .eq('user_id', user.id);
        
        if (updateError) {
          // Rollback: supprimer le fichier uploadé si la sauvegarde DB échoue
          console.error('Database update failed, rolling back file upload:', updateError);
          await supabase.storage
            .from('avatars')
            .remove([filePath]);
          
          throw new Error(`Database update failed: ${updateError.message}`);
        } else {
          console.log('Avatar URL saved successfully');
          // Mettre à jour l'état local seulement après succès complet
          setAvatarUrl(publicUrl);
          // Rafraîchir les données utilisateur
          refreshUserData();
        }
      }
      
      toast({
        title: "Succès",
        description: "Photo de profil mise à jour avec succès",
      });
      
    } catch (error) {
      console.error('Error in avatar upload process:', error);
      
      // Rollback: supprimer le fichier uploadé en cas d'erreur
      if (uploadedFilePath) {
        try {
          await supabase.storage
            .from('avatars')
            .remove([uploadedFilePath]);
          console.log('Rollback: Uploaded file removed due to error');
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
      // Supprimer le fichier du storage
      const fileName = avatarUrl.split('/').pop();
      if (fileName) {
        const { error: deleteError } = await supabase.storage
          .from('avatars')
          .remove([fileName]);

        if (deleteError) {
          throw new Error(`File deletion failed: ${deleteError.message}`);
        }
      }

      // Supprimer l'URL de la base de données
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: null })
        .eq('user_id', user.id);

      if (updateError) {
        throw new Error(`Database update failed: ${updateError.message}`);
      }

      // Mettre à jour l'état local
      setAvatarUrl('');
      refreshUserData();

      toast({
        title: "Succès",
        description: "Photo de profil supprimée avec succès",
      });

    } catch (error) {
      console.error('Error deleting avatar:', error);
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

    // Validation côté client
    if (!formData.whatsappNumber.trim()) {
      toast({
        title: "Erreur de validation",
        description: "Le numéro WhatsApp est obligatoire pour les propriétaires",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const phoneWithCountryCode = `${formData.phoneCountryCode} ${formData.phone}`.trim();
      
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.fullName,
          phone: phoneWithCountryCode,
          avatar_url: avatarUrl,
          // Champs de contact social
          phone_secondary: formData.phoneSecondary,
          whatsapp_number: formData.whatsappNumber,
          facebook_url: formData.facebookUrl,
          instagram_url: formData.instagramUrl,
          tiktok_url: formData.tiktokUrl,
          messenger_url: formData.messengerUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      if (error) throw error;

      // Rafraîchir les données utilisateur
      refreshUserData();

      toast({
        title: "Succès",
        description: "Profil mis à jour avec succès",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Erreur",
        description: "Erreur lors de la mise à jour du profil",
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
          <CardTitle className="text-lg">Photo de profil</CardTitle>
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
                      {userProfile?.full_name?.charAt(0) || 'U'}
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
          <CardTitle className="text-lg">Informations personnelles</CardTitle>
          <CardDescription>
            Vos informations de base.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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

          <div className="space-y-2">
            <Label htmlFor="fullName">Nom complet</Label>
            <Input
              id="fullName"
              value={formData.fullName}
              onChange={(e) => handleInputChange('fullName', e.target.value)}
              placeholder="Votre nom complet"
            />
            </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone">Téléphone</Label>
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
                  
                  {/* Reste par ordre alphabétique */}
                  <SelectItem value="+355">+355 Albanie</SelectItem>
                  <SelectItem value="+376">+376 Andorre</SelectItem>
                  <SelectItem value="+244">+244 Angola</SelectItem>
                  <SelectItem value="+1264">+1264 Anguilla</SelectItem>
                  <SelectItem value="+1268">+1268 Antigua-et-Barbuda</SelectItem>
                  <SelectItem value="+966">+966 Arabie saoudite</SelectItem>
                  <SelectItem value="+54">+54 Argentine</SelectItem>
                  <SelectItem value="+374">+374 Arménie</SelectItem>
                  <SelectItem value="+61">+61 Australie</SelectItem>
                  <SelectItem value="+43">+43 Autriche</SelectItem>
                  <SelectItem value="+994">+994 Azerbaïdjan</SelectItem>
                  <SelectItem value="+1242">+1242 Bahamas</SelectItem>
                  <SelectItem value="+973">+973 Bahreïn</SelectItem>
                  <SelectItem value="+880">+880 Bangladesh</SelectItem>
                  <SelectItem value="+1246">+1246 Barbade</SelectItem>
                  <SelectItem value="+375">+375 Biélorussie</SelectItem>
                  <SelectItem value="+32">+32 Belgique</SelectItem>
                  <SelectItem value="+501">+501 Belize</SelectItem>
                  <SelectItem value="+229">+229 Bénin</SelectItem>
                  <SelectItem value="+1441">+1441 Bermudes</SelectItem>
                  <SelectItem value="+975">+975 Bhoutan</SelectItem>
                  <SelectItem value="+591">+591 Bolivie</SelectItem>
                  <SelectItem value="+387">+387 Bosnie-Herzégovine</SelectItem>
                  <SelectItem value="+267">+267 Botswana</SelectItem>
                  <SelectItem value="+55">+55 Brésil</SelectItem>
                  <SelectItem value="+673">+673 Brunei</SelectItem>
                  <SelectItem value="+359">+359 Bulgarie</SelectItem>
                  <SelectItem value="+226">+226 Burkina Faso</SelectItem>
                  <SelectItem value="+257">+257 Burundi</SelectItem>
                  <SelectItem value="+855">+855 Cambodge</SelectItem>
                  <SelectItem value="+237">+237 Cameroun</SelectItem>
                  <SelectItem value="+1">+1 Canada</SelectItem>
                  <SelectItem value="+238">+238 Cap-Vert</SelectItem>
                  <SelectItem value="+1345">+1345 Îles Caïmans</SelectItem>
                  <SelectItem value="+236">+236 République centrafricaine</SelectItem>
                  <SelectItem value="+235">+235 Tchad</SelectItem>
                  <SelectItem value="+56">+56 Chili</SelectItem>
                  <SelectItem value="+86">+86 Chine</SelectItem>
                  <SelectItem value="+57">+57 Colombie</SelectItem>
                  <SelectItem value="+269">+269 Comores</SelectItem>
                  <SelectItem value="+242">+242 République du Congo</SelectItem>
                  <SelectItem value="+243">+243 République démocratique du Congo</SelectItem>
                  <SelectItem value="+682">+682 Îles Cook</SelectItem>
                  <SelectItem value="+506">+506 Costa Rica</SelectItem>
                  <SelectItem value="+385">+385 Croatie</SelectItem>
                  <SelectItem value="+53">+53 Cuba</SelectItem>
                  <SelectItem value="+357">+357 Chypre</SelectItem>
                  <SelectItem value="+420">+420 République tchèque</SelectItem>
                  <SelectItem value="+45">+45 Danemark</SelectItem>
                  <SelectItem value="+253">+253 Djibouti</SelectItem>
                  <SelectItem value="+1767">+1767 Dominique</SelectItem>
                  <SelectItem value="+1809">+1809 République dominicaine</SelectItem>
                  <SelectItem value="+593">+593 Équateur</SelectItem>
                  <SelectItem value="+20">+20 Égypte</SelectItem>
                  <SelectItem value="+971">+971 Émirats arabes unis</SelectItem>
                  <SelectItem value="+291">+291 Érythrée</SelectItem>
                  <SelectItem value="+34">+34 Espagne</SelectItem>
                  <SelectItem value="+372">+372 Estonie</SelectItem>
                  <SelectItem value="+251">+251 Éthiopie</SelectItem>
                  <SelectItem value="+679">+679 Fidji</SelectItem>
                  <SelectItem value="+358">+358 Finlande</SelectItem>
                  <SelectItem value="+33">+33 France</SelectItem>
                  <SelectItem value="+241">+241 Gabon</SelectItem>
                  <SelectItem value="+220">+220 Gambie</SelectItem>
                  <SelectItem value="+995">+995 Géorgie</SelectItem>
                  <SelectItem value="+233">+233 Ghana</SelectItem>
                  <SelectItem value="+350">+350 Gibraltar</SelectItem>
                  <SelectItem value="+30">+30 Grèce</SelectItem>
                  <SelectItem value="+1473">+1473 Grenade</SelectItem>
                  <SelectItem value="+299">+299 Groenland</SelectItem>
                  <SelectItem value="+590">+590 Guadeloupe</SelectItem>
                  <SelectItem value="+1671">+1671 Guam</SelectItem>
                  <SelectItem value="+502">+502 Guatemala</SelectItem>
                  <SelectItem value="+224">+224 Guinée</SelectItem>
                  <SelectItem value="+240">+240 Guinée équatoriale</SelectItem>
                  <SelectItem value="+245">+245 Guinée-Bissau</SelectItem>
                  <SelectItem value="+592">+592 Guyana</SelectItem>
                  <SelectItem value="+509">+509 Haïti</SelectItem>
                  <SelectItem value="+504">+504 Honduras</SelectItem>
                  <SelectItem value="+852">+852 Hong Kong</SelectItem>
                  <SelectItem value="+36">+36 Hongrie</SelectItem>
                  <SelectItem value="+91">+91 Inde</SelectItem>
                  <SelectItem value="+62">+62 Indonésie</SelectItem>
                  <SelectItem value="+98">+98 Iran</SelectItem>
                  <SelectItem value="+964">+964 Irak</SelectItem>
                  <SelectItem value="+353">+353 Irlande</SelectItem>
                  <SelectItem value="+354">+354 Islande</SelectItem>
                  <SelectItem value="+972">+972 Israël</SelectItem>
                  <SelectItem value="+1876">+1876 Jamaïque</SelectItem>
                  <SelectItem value="+81">+81 Japon</SelectItem>
                  <SelectItem value="+962">+962 Jordanie</SelectItem>
                  <SelectItem value="+7">+7 Kazakhstan</SelectItem>
                  <SelectItem value="+254">+254 Kenya</SelectItem>
                  <SelectItem value="+996">+996 Kirghizistan</SelectItem>
                  <SelectItem value="+686">+686 Kiribati</SelectItem>
                  <SelectItem value="+965">+965 Koweït</SelectItem>
                  <SelectItem value="+383">+383 Kosovo</SelectItem>
                  <SelectItem value="+856">+856 Laos</SelectItem>
                  <SelectItem value="+266">+266 Lesotho</SelectItem>
                  <SelectItem value="+371">+371 Lettonie</SelectItem>
                  <SelectItem value="+961">+961 Liban</SelectItem>
                  <SelectItem value="+231">+231 Liberia</SelectItem>
                  <SelectItem value="+218">+218 Libye</SelectItem>
                  <SelectItem value="+423">+423 Liechtenstein</SelectItem>
                  <SelectItem value="+370">+370 Lituanie</SelectItem>
                  <SelectItem value="+352">+352 Luxembourg</SelectItem>
                  <SelectItem value="+853">+853 Macao</SelectItem>
                  <SelectItem value="+389">+389 Macédoine du Nord</SelectItem>
                  <SelectItem value="+261">+261 Madagascar</SelectItem>
                  <SelectItem value="+60">+60 Malaisie</SelectItem>
                  <SelectItem value="+265">+265 Malawi</SelectItem>
                  <SelectItem value="+960">+960 Maldives</SelectItem>
                  <SelectItem value="+223">+223 Mali</SelectItem>
                  <SelectItem value="+356">+356 Malte</SelectItem>
                  <SelectItem value="+692">+692 Îles Marshall</SelectItem>
                  <SelectItem value="+596">+596 Martinique</SelectItem>
                  <SelectItem value="+222">+222 Mauritanie</SelectItem>
                  <SelectItem value="+230">+230 Maurice</SelectItem>
                  <SelectItem value="+262">+262 Mayotte</SelectItem>
                  <SelectItem value="+52">+52 Mexique</SelectItem>
                  <SelectItem value="+691">+691 Micronésie</SelectItem>
                  <SelectItem value="+373">+373 Moldavie</SelectItem>
                  <SelectItem value="+377">+377 Monaco</SelectItem>
                  <SelectItem value="+976">+976 Mongolie</SelectItem>
                  <SelectItem value="+1664">+1664 Montserrat</SelectItem>
                  <SelectItem value="+382">+382 Monténégro</SelectItem>
                  <SelectItem value="+212">+212 Maroc</SelectItem>
                  <SelectItem value="+258">+258 Mozambique</SelectItem>
                  <SelectItem value="+95">+95 Myanmar</SelectItem>
                  <SelectItem value="+264">+264 Namibie</SelectItem>
                  <SelectItem value="+674">+674 Nauru</SelectItem>
                  <SelectItem value="+977">+977 Népal</SelectItem>
                  <SelectItem value="+31">+31 Pays-Bas</SelectItem>
                  <SelectItem value="+687">+687 Nouvelle-Calédonie</SelectItem>
                  <SelectItem value="+64">+64 Nouvelle-Zélande</SelectItem>
                  <SelectItem value="+505">+505 Nicaragua</SelectItem>
                  <SelectItem value="+227">+227 Niger</SelectItem>
                  <SelectItem value="+234">+234 Nigeria</SelectItem>
                  <SelectItem value="+683">+683 Niue</SelectItem>
                  <SelectItem value="+850">+850 Corée du Nord</SelectItem>
                  <SelectItem value="+1670">+1670 Îles Mariannes du Nord</SelectItem>
                  <SelectItem value="+47">+47 Norvège</SelectItem>
                  <SelectItem value="+968">+968 Oman</SelectItem>
                  <SelectItem value="+92">+92 Pakistan</SelectItem>
                  <SelectItem value="+680">+680 Palaos</SelectItem>
                  <SelectItem value="+970">+970 Palestine</SelectItem>
                  <SelectItem value="+507">+507 Panama</SelectItem>
                  <SelectItem value="+675">+675 Papouasie-Nouvelle-Guinée</SelectItem>
                  <SelectItem value="+595">+595 Paraguay</SelectItem>
                  <SelectItem value="+51">+51 Pérou</SelectItem>
                  <SelectItem value="+63">+63 Philippines</SelectItem>
                  <SelectItem value="+48">+48 Pologne</SelectItem>
                  <SelectItem value="+351">+351 Portugal</SelectItem>
                  <SelectItem value="+1787">+1787 Porto Rico</SelectItem>
                  <SelectItem value="+974">+974 Qatar</SelectItem>
                  <SelectItem value="+40">+40 Roumanie</SelectItem>
                  <SelectItem value="+7">+7 Russie</SelectItem>
                  <SelectItem value="+250">+250 Rwanda</SelectItem>
                  <SelectItem value="+290">+290 Sainte-Hélène</SelectItem>
                  <SelectItem value="+1869">+1869 Saint-Kitts-et-Nevis</SelectItem>
                  <SelectItem value="+1758">+1758 Sainte-Lucie</SelectItem>
                  <SelectItem value="+1784">+1784 Saint-Vincent-et-les-Grenadines</SelectItem>
                  <SelectItem value="+378">+378 Saint-Marin</SelectItem>
                  <SelectItem value="+508">+508 Saint-Pierre-et-Miquelon</SelectItem>
                  <SelectItem value="+685">+685 Samoa</SelectItem>
                  <SelectItem value="+1684">+1684 Samoa américaines</SelectItem>
                  <SelectItem value="+378">+378 Saint-Marin</SelectItem>
                  <SelectItem value="+239">+239 Sao Tomé-et-Principe</SelectItem>
                  <SelectItem value="+966">+966 Arabie saoudite</SelectItem>
                  <SelectItem value="+221">+221 Sénégal</SelectItem>
                  <SelectItem value="+381">+381 Serbie</SelectItem>
                  <SelectItem value="+248">+248 Seychelles</SelectItem>
                  <SelectItem value="+232">+232 Sierra Leone</SelectItem>
                  <SelectItem value="+65">+65 Singapour</SelectItem>
                  <SelectItem value="+421">+421 Slovaquie</SelectItem>
                  <SelectItem value="+386">+386 Slovénie</SelectItem>
                  <SelectItem value="+677">+677 Îles Salomon</SelectItem>
                  <SelectItem value="+252">+252 Somalie</SelectItem>
                  <SelectItem value="+27">+27 Afrique du Sud</SelectItem>
                  <SelectItem value="+82">+82 Corée du Sud</SelectItem>
                  <SelectItem value="+211">+211 Soudan du Sud</SelectItem>
                  <SelectItem value="+34">+34 Espagne</SelectItem>
                  <SelectItem value="+94">+94 Sri Lanka</SelectItem>
                  <SelectItem value="+249">+249 Soudan</SelectItem>
                  <SelectItem value="+597">+597 Suriname</SelectItem>
                  <SelectItem value="+268">+268 Eswatini</SelectItem>
                  <SelectItem value="+46">+46 Suède</SelectItem>
                  <SelectItem value="+41">+41 Suisse</SelectItem>
                  <SelectItem value="+963">+963 Syrie</SelectItem>
                  <SelectItem value="+992">+992 Tadjikistan</SelectItem>
                  <SelectItem value="+255">+255 Tanzanie</SelectItem>
                  <SelectItem value="+66">+66 Thaïlande</SelectItem>
                  <SelectItem value="+228">+228 Togo</SelectItem>
                  <SelectItem value="+676">+676 Tonga</SelectItem>
                  <SelectItem value="+1868">+1868 Trinité-et-Tobago</SelectItem>
                  <SelectItem value="+216">+216 Tunisie</SelectItem>
                  <SelectItem value="+993">+993 Turkménistan</SelectItem>
                  <SelectItem value="+90">+90 Turquie</SelectItem>
                  <SelectItem value="+1649">+1649 Îles Turques-et-Caïques</SelectItem>
                  <SelectItem value="+688">+688 Tuvalu</SelectItem>
                  <SelectItem value="+256">+256 Ouganda</SelectItem>
                  <SelectItem value="+380">+380 Ukraine</SelectItem>
                  <SelectItem value="+598">+598 Uruguay</SelectItem>
                  <SelectItem value="+998">+998 Ouzbékistan</SelectItem>
                  <SelectItem value="+678">+678 Vanuatu</SelectItem>
                  <SelectItem value="+58">+58 Venezuela</SelectItem>
                  <SelectItem value="+84">+84 Vietnam</SelectItem>
                  <SelectItem value="+1340">+1340 Îles Vierges américaines</SelectItem>
                  <SelectItem value="+1284">+1284 Îles Vierges britanniques</SelectItem>
                  <SelectItem value="+967">+967 Yémen</SelectItem>
                  <SelectItem value="+260">+260 Zambie</SelectItem>
                  <SelectItem value="+263">+263 Zimbabwe</SelectItem>
                </SelectContent>
              </Select>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="25100200"
                className="flex-1"
              />
            </div>
          </div>

        </CardContent>
      </Card>

      {/* Section Contacts sociaux */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Contacts sociaux</CardTitle>
          <CardDescription>
            Vos informations de contact pour les locataires et prospects.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 2ème numéro de téléphone */}
          <div className="space-y-2">
            <Label htmlFor="phoneSecondary">2ème numéro de téléphone</Label>
            <Input
              id="phoneSecondary"
              value={formData.phoneSecondary}
              onChange={(e) => handleInputChange('phoneSecondary', e.target.value)}
              placeholder="Numéro de téléphone secondaire"
            />
          </div>

          {/* WhatsApp */}
          <div className="space-y-2">
            <Label htmlFor="whatsappNumber">
              Numéro WhatsApp <span className="text-red-500">*</span>
            </Label>
            <Input
              id="whatsappNumber"
              value={formData.whatsappNumber}
              onChange={(e) => handleInputChange('whatsappNumber', e.target.value)}
              placeholder="Numéro WhatsApp (obligatoire)"
              required
            />
            <p className="text-sm text-muted-foreground">
              Ce numéro sera visible par les locataires pour vous contacter.
            </p>
          </div>

          {/* Facebook */}
          <div className="space-y-2">
            <Label htmlFor="facebookUrl">Page Facebook</Label>
            <Input
              id="facebookUrl"
              value={formData.facebookUrl}
              onChange={(e) => handleInputChange('facebookUrl', e.target.value)}
              placeholder="https://facebook.com/votre-page"
            />
          </div>

          {/* Instagram */}
          <div className="space-y-2">
            <Label htmlFor="instagramUrl">Page Instagram</Label>
            <Input
              id="instagramUrl"
              value={formData.instagramUrl}
              onChange={(e) => handleInputChange('instagramUrl', e.target.value)}
              placeholder="https://instagram.com/votre-compte"
            />
          </div>

          {/* TikTok */}
          <div className="space-y-2">
            <Label htmlFor="tiktokUrl">Page TikTok</Label>
            <Input
              id="tiktokUrl"
              value={formData.tiktokUrl}
              onChange={(e) => handleInputChange('tiktokUrl', e.target.value)}
              placeholder="https://tiktok.com/@votre-compte"
            />
          </div>

          {/* Messenger */}
          <div className="space-y-2">
            <Label htmlFor="messengerUrl">Lien Messenger</Label>
            <Input
              id="messengerUrl"
              value={formData.messengerUrl}
              onChange={(e) => handleInputChange('messengerUrl', e.target.value)}
              placeholder="https://m.me/votre-page"
            />
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

export default AdvertiserProfile;

