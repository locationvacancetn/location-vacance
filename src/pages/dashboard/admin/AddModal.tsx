import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { usePageTitle } from "@/hooks/usePageTitle";
import { modalService, type CreateModalData, type Modal } from "@/lib/modalService";
import { 
  ArrowLeft,
  Save,
  Eye,
  Home,
  LogIn,
  Monitor,
  Image,
  MousePointer,
  X
} from "lucide-react";

// Types pour le modal
interface ModalFormData {
  title: string;
  content: string;
  trigger_type: 'site_entry' | 'after_login' | 'dashboard_entry';
  target_type: 'anonymous' | 'authenticated';
  target_roles: string[];
  has_image: boolean;
  image_url: string;
  has_button: boolean;
  button_text: string;
  button_action: string;
  button_style: 'primary' | 'secondary';
  is_active: boolean;
  expires_at: string;
}

const AddModal = () => {
  const { toast } = useToast();
  const { title, description, setPageTitle } = usePageTitle();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // État du formulaire
  const [modalForm, setModalForm] = useState<ModalFormData>({
    title: "",
    content: "",
    trigger_type: "site_entry",
    target_type: "authenticated",
    target_roles: [],
    has_image: false,
    image_url: "",
    has_button: false,
    button_text: "",
    button_action: "",
    button_style: "primary",
    is_active: true,
    expires_at: ""
  });

  // Options pour les rôles
  const roleOptions = [
    { value: "tenant", label: "Locataire" },
    { value: "owner", label: "Propriétaire" },
    { value: "advertiser", label: "Annonceur" }
  ];

  // Options pour les triggers
  const triggerOptions = [
    { value: "site_entry", label: "Ouverture du site", icon: Home },
    { value: "after_login", label: "Après connexion", icon: LogIn },
    { value: "dashboard_entry", label: "Ouverture dashboard", icon: Monitor }
  ];

  // Définir le titre de la page
  useEffect(() => {
    if (isEditing) {
      setPageTitle("Modifier le Modal");
    } else {
      setPageTitle("Créer un Modal");
    }
  }, [isEditing, setPageTitle]);

  // Charger les données du modal si on est en mode édition
  useEffect(() => {
    if (isEditing && id) {
      loadModal(id);
    }
  }, [isEditing, id]);

  const loadModal = async (modalId: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await modalService.getModalById(modalId);

      if (error) {
        toast({
          title: "Erreur",
          description: error,
          variant: "destructive"
        });
        navigate('/dashboard/admin/modals');
        return;
      }

      if (data) {
        setModalForm({
          title: data.title,
          content: data.content,
          trigger_type: data.trigger_type,
          target_type: data.target_type,
          target_roles: data.target_roles || [],
          has_image: data.has_image,
          image_url: data.image_url || "",
          has_button: data.has_button,
          button_text: data.button_text || "",
          button_action: data.button_action || "",
          button_style: data.button_style,
          is_active: data.is_active,
          expires_at: data.expires_at ? data.expires_at.split('T')[0] : ""
        });
      }
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Erreur inattendue lors du chargement",
        variant: "destructive"
      });
      navigate('/dashboard/admin/modals');
    } finally {
      setIsLoading(false);
    }
  };

  // Gestion des rôles dans le formulaire
  const handleRoleChange = (role: string, checked: boolean) => {
    if (checked) {
      setModalForm(prev => ({
        ...prev,
        target_roles: [...prev.target_roles, role]
      }));
    } else {
      setModalForm(prev => ({
        ...prev,
        target_roles: prev.target_roles.filter(r => r !== role)
      }));
    }
  };

  // Sauvegarder le modal
  const handleSaveModal = async () => {
    try {
      setIsSubmitting(true);

      const modalData: CreateModalData = {
        title: modalForm.title.trim(),
        content: modalForm.content.trim(),
        trigger_type: modalForm.trigger_type,
        target_type: modalForm.target_type,
        target_roles: modalForm.target_type === 'authenticated' ? modalForm.target_roles : null,
        has_image: modalForm.has_image,
        image_url: modalForm.has_image && modalForm.image_url ? modalForm.image_url.trim() : null,
        has_button: modalForm.has_button,
        button_text: modalForm.has_button && modalForm.button_text ? modalForm.button_text.trim() : null,
        button_action: modalForm.has_button && modalForm.button_action ? modalForm.button_action.trim() : null,
        button_style: modalForm.button_style,
        is_active: modalForm.is_active,
        expires_at: modalForm.expires_at ? new Date(modalForm.expires_at).toISOString() : null
      };

      let result;
      if (isEditing && id) {
        // Mise à jour
        result = await modalService.updateModal({ id, ...modalData });
      } else {
        // Création
        result = await modalService.createModal(modalData);
      }

      if (result.error) {
        toast({
          title: "Erreur",
          description: result.error,
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Succès",
        description: isEditing ? "Modal mis à jour avec succès" : "Modal créé avec succès"
      });

      navigate('/dashboard/admin/modals');

    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Erreur inattendue lors de la sauvegarde",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Composant d'aperçu du modal
  const ModalPreview = () => {
    const getTriggerIcon = () => {
      const option = triggerOptions.find(opt => opt.value === modalForm.trigger_type);
      if (!option) return <Home className="h-4 w-4" />;
      const Icon = option.icon;
      return <Icon className="h-4 w-4" />;
    };

    const getTriggerLabel = () => {
      const option = triggerOptions.find(opt => opt.value === modalForm.trigger_type);
      return option?.label || modalForm.trigger_type;
    };

    const getTargetLabel = () => {
      if (modalForm.target_type === 'anonymous') {
        return "Utilisateurs anonymes";
      }
      
      if (modalForm.target_roles.length === 0) {
        return "Tous les utilisateurs connectés";
      }
      
      return modalForm.target_roles
        .map(role => roleOptions.find(opt => opt.value === role)?.label || role)
        .join(", ");
    };

     return (
       <div className="space-y-4">
         {/* Informations du modal */}
         <div className="space-y-2">
           <div className="flex items-center gap-2">
             <Badge variant="outline" className="flex items-center gap-1">
               {getTriggerIcon()}
               {getTriggerLabel()}
             </Badge>
           </div>
           <div className="text-sm text-gray-600">
             <strong>Cible :</strong> {getTargetLabel()}
           </div>
           {modalForm.expires_at && (
             <div className="text-sm text-gray-600">
               <strong>Expire le :</strong> {new Date(modalForm.expires_at).toLocaleDateString('fr-FR')}
             </div>
           )}
         </div>

         {/* Aperçu du modal - Style moderne */}
         <div className="border rounded-xl bg-white shadow-lg max-w-sm mx-auto overflow-hidden">

           {/* Image en pleine largeur si présente */}
           {modalForm.has_image && modalForm.image_url && (
             <div className="w-full">
               <img 
                 src={modalForm.image_url} 
                 alt="Aperçu" 
                 className="w-full h-48 object-cover"
                 onError={(e) => {
                   const target = e.target as HTMLImageElement;
                   target.style.display = 'none';
                 }}
               />
             </div>
           )}

           {/* Contenu centré */}
           <div className="px-6 py-6 text-center space-y-4">
             {/* Titre centré */}
             <h3 className="text-xl font-semibold text-gray-900 leading-tight">
               {modalForm.title || "Welcome to your dashboard"}
             </h3>
             
             {/* Contenu texte centré */}
             <div className="text-sm text-gray-600 leading-relaxed">
               {modalForm.content ? (
                 <div dangerouslySetInnerHTML={{ __html: modalForm.content }} />
               ) : (
                 <p>We're glad to have you onboard. Here are some quick tips to get you up and running.</p>
               )}
             </div>


             {/* Bouton principal ou fermer */}
             <div className="pt-2">
               {modalForm.has_button && modalForm.button_text ? (
                 <Button 
                   variant={modalForm.button_style === 'primary' ? 'default' : 'outline'}
                   className="w-full rounded-lg font-medium"
                 >
                   {modalForm.button_text}
                 </Button>
               ) : (
                 <Button 
                   variant="outline"
                   className="w-full rounded-lg font-medium hover:bg-[#32323a] hover:text-white hover:border-[#32323a] active:bg-[#32323a] active:text-white active:border-[#32323a]"
                 >
                   Fermer
                 </Button>
               )}
             </div>
           </div>
         </div>

         {/* Statut */}
         <div className="text-center">
           <Badge variant={modalForm.is_active ? "default" : "secondary"}>
             {modalForm.is_active ? "Actif" : "Inactif"}
           </Badge>
         </div>
       </div>
     );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Layout principal : 2/3 formulaire - 1/3 aperçu */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulaire (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Informations de base */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Informations de base
              </CardTitle>
              <CardDescription>
                Définissez le titre et le contenu de votre modal
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Titre *</Label>
                <Input
                  id="title"
                  value={modalForm.title}
                  onChange={(e) => setModalForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Titre du modal"
                />
              </div>

              <div>
                <Label htmlFor="content">Contenu *</Label>
                <Textarea
                  id="content"
                  value={modalForm.content}
                  onChange={(e) => setModalForm(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Contenu du modal (HTML supporté)"
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Configuration du déclencheur */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Déclencheur</CardTitle>
              <CardDescription>
                Choisissez quand le modal doit s'afficher
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div>
                <Label htmlFor="trigger">Type de déclencheur</Label>
                <Select 
                  value={modalForm.trigger_type} 
                  onValueChange={(value: any) => setModalForm(prev => ({ ...prev, trigger_type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {triggerOptions.map(option => {
                      const Icon = option.icon;
                      return (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4" />
                            {option.label}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Configuration de la cible */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Cible</CardTitle>
              <CardDescription>
                Définissez qui peut voir ce modal
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="target-type">Type d'utilisateur</Label>
                <Select 
                  value={modalForm.target_type} 
                  onValueChange={(value: any) => setModalForm(prev => ({ 
                    ...prev, 
                    target_type: value,
                    target_roles: value === 'anonymous' ? [] : prev.target_roles
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="anonymous">Utilisateurs anonymes</SelectItem>
                    <SelectItem value="authenticated">Utilisateurs connectés</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {modalForm.target_type === 'authenticated' && (
                <div>
                  <Label>Rôles ciblés *</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {roleOptions.map(role => (
                      <div key={role.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={role.value}
                          checked={modalForm.target_roles.includes(role.value)}
                          onCheckedChange={(checked) => handleRoleChange(role.value, checked as boolean)}
                        />
                        <Label htmlFor={role.value} className="text-sm">
                          {role.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Configuration de l'image */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Image className="h-5 w-5" />
                Image
              </CardTitle>
              <CardDescription>
                Ajoutez une image à votre modal (optionnel)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="has-image"
                  checked={modalForm.has_image}
                  onCheckedChange={(checked) => setModalForm(prev => ({ 
                    ...prev, 
                    has_image: checked,
                    image_url: checked ? prev.image_url : ""
                  }))}
                />
                <Label htmlFor="has-image">Inclure une image</Label>
              </div>

              {modalForm.has_image && (
                <div>
                  <Label htmlFor="image-url">URL de l'image</Label>
                  <Input
                    id="image-url"
                    value={modalForm.image_url}
                    onChange={(e) => setModalForm(prev => ({ ...prev, image_url: e.target.value }))}
                    placeholder="https://exemple.com/image.jpg"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Configuration du bouton */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <MousePointer className="h-5 w-5" />
                Bouton d'action
              </CardTitle>
              <CardDescription>
                Ajoutez un bouton d'action à votre modal (optionnel)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="has-button"
                  checked={modalForm.has_button}
                  onCheckedChange={(checked) => setModalForm(prev => ({ 
                    ...prev, 
                    has_button: checked,
                    button_text: checked ? prev.button_text : "",
                    button_action: checked ? prev.button_action : ""
                  }))}
                />
                <Label htmlFor="has-button">Inclure un bouton d'action</Label>
              </div>

              {modalForm.has_button && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="button-text">Texte du bouton</Label>
                    <Input
                      id="button-text"
                      value={modalForm.button_text}
                      onChange={(e) => setModalForm(prev => ({ ...prev, button_text: e.target.value }))}
                      placeholder="En savoir plus"
                    />
                  </div>
                  <div>
                    <Label htmlFor="button-action">Action (URL)</Label>
                    <Input
                      id="button-action"
                      value={modalForm.button_action}
                      onChange={(e) => setModalForm(prev => ({ ...prev, button_action: e.target.value }))}
                      placeholder="https://exemple.com"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="button-style">Style du bouton</Label>
                    <Select 
                      value={modalForm.button_style} 
                      onValueChange={(value: any) => setModalForm(prev => ({ ...prev, button_style: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="primary">Principal</SelectItem>
                        <SelectItem value="secondary">Secondaire</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Configuration générale */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Configuration générale</CardTitle>
              <CardDescription>
                Paramètres d'activation et d'expiration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="is-active"
                  checked={modalForm.is_active}
                  onCheckedChange={(checked) => setModalForm(prev => ({ ...prev, is_active: checked }))}
                />
                <Label htmlFor="is-active">Modal actif</Label>
              </div>

              <div>
                <Label htmlFor="expires-at">Date d'expiration (optionnelle)</Label>
                <Input
                  id="expires-at"
                  type="date"
                  value={modalForm.expires_at}
                  onChange={(e) => setModalForm(prev => ({ ...prev, expires_at: e.target.value }))}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Aperçu (1/3) */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Aperçu
              </CardTitle>
              <CardDescription>
                Prévisualisation en temps réel de votre modal
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ModalPreview />
            </CardContent>
          </Card>
         </div>
       </div>

       {/* Boutons d'action en bas */}
       <div className="flex items-center justify-between pt-6 border-t">
         <Button 
           variant="outline" 
           onClick={() => navigate('/dashboard/admin/modals')}
           className="flex items-center gap-2"
         >
           <ArrowLeft className="h-4 w-4" />
           Retour
         </Button>
         <Button 
           onClick={handleSaveModal} 
           disabled={isSubmitting}
           className="flex items-center gap-2"
         >
           <Save className="h-4 w-4" />
           {isSubmitting ? "Sauvegarde..." : isEditing ? "Mettre à jour" : "Créer"}
         </Button>
       </div>
     </div>
   );
 };
 
 export default AddModal;
