import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate, useParams } from "react-router-dom";
import { usePageTitle } from "@/hooks/usePageTitle";
import AdvertisementImageUpload from "@/components/AdvertisementImageUpload";
import { AdvertisementService } from "@/lib/advertisementService";
import { useAdvertisementImage } from "@/hooks/useAdvertisementImage";
import { 
  Megaphone, 
  Save,
  Target,
  Eye,
  Image as ImageIcon,
  Check,
  AlertTriangle,
  X,
  Lightbulb,
  ExternalLink
} from "lucide-react";

const EditAdvertisement = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { setPageTitle, setPageDescription } = usePageTitle();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    ad_type: "",
    image_url: "",
    link_url: ""
  });

  // Hook pour la gestion d'image
  const { imageState, setImage, replaceImage, removeImage, isSupabaseImage } = useAdvertisementImage();
  
  // États pour la prévisualisation
  const [showImagePreview, setShowImagePreview] = useState(false);

  // Définir le titre de la page
  useEffect(() => {
    setPageTitle("Modifier la Publicité");
    setPageDescription("Modifiez les informations de votre campagne publicitaire");
  }, [setPageTitle, setPageDescription]);

  // Charger les données de la publicité
  useEffect(() => {
    const loadAdvertisement = async () => {
      if (!id || !user?.id) return;

      try {
        setInitialLoading(true);
        
        const { data: advertisement, error } = await supabase
          .from('advertisements')
          .select('*')
          .eq('id', id)
          .eq('advertiser_id', user.id)
          .single();

        if (error) {
          throw error;
        }

        if (!advertisement) {
          toast({
            title: "Erreur",
            description: "Publicité non trouvée",
            variant: "destructive"
          });
          navigate('/dashboard/advertiser/ads');
          return;
        }

        // Fonction pour détecter si l'URL est une image Supabase
        const isSupabaseImage = (url: string | null): boolean => {
          if (!url) return false;
          return url.includes('supabase.co/storage/v1/object/public/advertisement-images/');
        };

        // Remplir le formulaire avec les données existantes
        setFormData({
          title: advertisement.title || "",
          description: advertisement.description || "",
          ad_type: advertisement.ad_type || "",
          image_url: isSupabaseImage(advertisement.image_url) ? "" : (advertisement.image_url || ""),
          link_url: advertisement.link_url || ""
        });

        // Si il y a une image existante, la définir comme URL
        if (advertisement.image_url) {
          setImage(null, advertisement.image_url);
        }

      } catch (error: any) {
        console.error('Erreur lors du chargement de la publicité:', error);
        toast({
          title: "Erreur",
          description: error.message || "Impossible de charger la publicité",
          variant: "destructive"
        });
        navigate('/dashboard/advertiser/ads');
      } finally {
        setInitialLoading(false);
      }
    };

    loadAdvertisement();
  }, [id, user?.id, navigate, toast]);

  // Gérer le changement d'image
  const handleImageChange = (file: File | null, imageUrl: string | null) => {
    setImage(file, imageUrl);
    
    // Si une image est uploadée, vider le champ URL externe
    if (file && formData.image_url) {
      setFormData({ ...formData, image_url: "" });
    }
  };

  // Fonctions pour la prévisualisation
  const handlePreviewImage = () => {
    if (formData.image_url.trim()) {
      setShowImagePreview(true);
    } else {
      toast({
        title: "Erreur",
        description: "Veuillez d'abord saisir une URL d'image",
        variant: "destructive"
      });
    }
  };

  const handlePreviewWebsite = () => {
    if (formData.link_url.trim()) {
      try {
        new URL(formData.link_url);
        window.open(formData.link_url, '_blank', 'noopener,noreferrer');
      } catch {
        toast({
          title: "Erreur",
          description: "L'URL du site web n'est pas valide",
          variant: "destructive"
        });
      }
    } else {
      toast({
        title: "Erreur",
        description: "Veuillez d'abord saisir une URL de site web",
        variant: "destructive"
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id || !id) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté",
        variant: "destructive"
      });
      return;
    }

    // Validation
    if (!formData.title.trim()) {
      toast({
        title: "Erreur",
        description: "Le titre est requis",
        variant: "destructive"
      });
      return;
    }

    if (formData.title.length > 30) {
      toast({
        title: "Erreur",
        description: "Le titre ne doit pas dépasser 30 caractères",
        variant: "destructive"
      });
      return;
    }

    if (!formData.description.trim()) {
      toast({
        title: "Erreur",
        description: "La description est requise",
        variant: "destructive"
      });
      return;
    }

    if (formData.description.length > 160) {
      toast({
        title: "Erreur",
        description: "La description ne doit pas dépasser 160 caractères",
        variant: "destructive"
      });
      return;
    }

    if (!formData.ad_type) {
      toast({
        title: "Erreur",
        description: "Le type de publicité est requis",
        variant: "destructive"
      });
      return;
    }

    if (!formData.link_url.trim()) {
      toast({
        title: "Erreur",
        description: "L'URL de destination est requise",
        variant: "destructive"
      });
      return;
    }

    // Validation de l'URL
    try {
      new URL(formData.link_url);
    } catch {
      toast({
        title: "Erreur",
        description: "L'URL de destination n'est pas valide",
        variant: "destructive"
      });
      return;
    }

    // Validation de l'URL d'image si fournie
    if (formData.image_url.trim()) {
      try {
        new URL(formData.image_url);
      } catch {
        toast({
          title: "Erreur",
          description: "L'URL de l'image n'est pas valide",
          variant: "destructive"
        });
        return;
      }
    }

    try {
      setLoading(true);
      let finalImageUrl = formData.image_url.trim() || null;

      // Remplacer l'image si un fichier a été sélectionné
      if (imageState.file && user.id && id) {
        try {
          finalImageUrl = await replaceImage(id, user.id);
        } catch (replaceError) {
          return; // L'erreur est déjà gérée dans le hook
        }
      }

      // Mettre à jour la publicité
      await AdvertisementService.updateAdvertisement(id, {
        title: formData.title.trim(),
        description: formData.description.trim(),
        ad_type: formData.ad_type as 'B2C' | 'B2B',
        image_url: finalImageUrl,
        link_url: formData.link_url.trim()
      });

      toast({
        title: "Succès",
        description: "Publicité modifiée avec succès"
      });

      navigate('/dashboard/advertiser/ads');
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de modifier la publicité",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement de la publicité...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Layout en deux colonnes pour les sections principales */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Informations de base */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Megaphone className="w-5 h-5" />
                  Informations de base
                </CardTitle>
                <CardDescription>
                  Définissez les informations principales de votre publicité
                </CardDescription>
              </CardHeader>
               <CardContent className="space-y-4">
                 <div className="space-y-2">
                   <Label htmlFor="ad_type">Type de publicité *</Label>
                   <Select
                     value={formData.ad_type}
                     onValueChange={(value) => setFormData({ ...formData, ad_type: value })}
                   >
                     <SelectTrigger className="h-auto py-2 [&>span]:line-clamp-none">
                       <SelectValue placeholder="Sélectionnez le type">
                         {formData.ad_type && (
                           <div className="flex flex-col items-start gap-1">
                             <div className="flex items-center gap-2">
                               <span>{formData.ad_type === 'B2C' ? 'B to C' : 'B to B'}</span>
                             </div>
                             <span className="text-xs text-muted-foreground">
                               {formData.ad_type === 'B2C' 
                                 ? 'Publicité destinée aux vacanciers consultant le site'
                                 : 'Publicité destinée aux propriétaires de maisons de vacances'
                               }
                             </span>
                           </div>
                         )}
                       </SelectValue>
                     </SelectTrigger>
                     <SelectContent>
                       <SelectItem value="B2C">
                         <div className="flex flex-col items-start gap-1">
                           <div className="flex items-center gap-2">
                             <span>B to C</span>
                           </div>
                           <span className="text-xs text-muted-foreground">
                             Publicité destinée aux vacanciers consultant le site
                           </span>
                         </div>
                       </SelectItem>
                       <SelectItem value="B2B">
                         <div className="flex flex-col items-start gap-1">
                           <div className="flex items-center gap-2">
                             <span>B to B</span>
                           </div>
                           <span className="text-xs text-muted-foreground">
                             Publicité destinée aux propriétaires de maisons de vacances
                           </span>
                         </div>
                       </SelectItem>
                     </SelectContent>
                   </Select>
                 </div>

                 <div className="space-y-2">
                   <Label htmlFor="title">Titre *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Titre accrocheur de votre publicité"
                    maxLength={30}
                    required
                  />
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">
                      {formData.title.length}/30 caractères
                    </span>
                     <div className="flex items-center gap-1">
                       <span className={`${formData.title.length === 0 ? 'text-red-500' : formData.title.length < 10 ? 'text-yellow-500' : 'text-green-500'}`} style={formData.title.length === 0 ? {color: '#bc2d2b'} : formData.title.length > 0 && formData.title.length < 10 ? {color: 'rgb(234 179 8)'} : {}}>
                         {formData.title.length === 0 ? <X className="w-4 h-4" /> : 
                          formData.title.length < 10 ? <AlertTriangle className="w-4 h-4" /> : 
                          <Check className="w-4 h-4" />}
                       </span>
                       <span className={`text-xs font-bold ${formData.title.length === 0 ? 'text-red-500' : formData.title.length < 10 ? 'text-yellow-500' : 'text-green-500'}`} style={formData.title.length === 0 ? {color: '#bc2d2b'} : formData.title.length > 0 && formData.title.length < 10 ? {color: 'rgb(234 179 8)'} : {}}>
                         {formData.title.length === 0 ? 'Vide' : 
                          formData.title.length < 10 ? 'Trop court' : 
                          'Bon'}
                       </span>
                     </div>
                   </div>
                 </div>

                 {/* Hint pour le titre */}
                 <div className="bg-muted/50 p-3 rounded-lg">
                   <h4 className="font-medium text-sm mb-2 flex items-center gap-2 text-muted-foreground">
                     <Lightbulb className="w-4 h-4" style={{color: 'rgb(234 179 8)'}} />
                     Conseils pour un titre efficace :
                   </h4>
                   <div className="text-xs space-y-1">
                     <div className="flex items-start gap-2">
                       <Check className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                       <div>
                         <span className="font-bold text-muted-foreground">Nom de l'enseigne :</span>
                         <span className="text-muted-foreground"> Incluez le nom de votre entreprise pour la reconnaissance</span>
                       </div>
                     </div>
                     <div className="flex items-start gap-2">
                       <Check className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                       <div>
                         <span className="font-bold text-muted-foreground">Mémorable :</span>
                         <span className="text-muted-foreground"> Facile à retenir et à retrouver par les clients</span>
                       </div>
                     </div>
                     <div className="flex items-start gap-2">
                       <Check className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                       <div>
                         <span className="font-bold text-muted-foreground">Représentatif :</span>
                         <span className="text-muted-foreground"> Reflète votre marque et votre activité</span>
                       </div>
                     </div>
                   </div>
                 </div>
                 
                 <div className="space-y-2">
                   <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Description détaillée de votre publicité"
                    maxLength={160}
                    rows={4}
                    required
                  />
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">
                      {formData.description.length}/160 caractères
                    </span>
                     <div className="flex items-center gap-1">
                       <span className={`${formData.description.length === 0 ? 'text-red-500' : formData.description.length < 50 ? 'text-yellow-500' : 'text-green-500'}`} style={formData.description.length === 0 ? {color: '#bc2d2b'} : formData.description.length > 0 && formData.description.length < 50 ? {color: 'rgb(234 179 8)'} : {}}>
                         {formData.description.length === 0 ? <X className="w-4 h-4" /> : 
                          formData.description.length < 50 ? <AlertTriangle className="w-4 h-4" /> : 
                          <Check className="w-4 h-4" />}
                       </span>
                       <span className={`text-xs font-bold ${formData.description.length === 0 ? 'text-red-500' : formData.description.length < 50 ? 'text-yellow-500' : 'text-green-500'}`} style={formData.description.length === 0 ? {color: '#bc2d2b'} : formData.description.length > 0 && formData.description.length < 50 ? {color: 'rgb(234 179 8)'} : {}}>
                         {formData.description.length === 0 ? 'Vide' : 
                          formData.description.length < 50 ? 'Trop court' : 
                          'Bon'}
                       </span>
                     </div>
                   </div>
                 </div>

                 {/* Hint pour la description */}
                 <div className="bg-muted/50 p-3 rounded-lg">
                   <h4 className="font-medium text-sm mb-2 flex items-center gap-2 text-muted-foreground">
                     <Lightbulb className="w-4 h-4" style={{color: 'rgb(234 179 8)'}} />
                     Conseils pour une description efficace :
                   </h4>
                   <div className="text-xs space-y-1">
                     <div className="flex items-start gap-2">
                       <Check className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                       <div>
                         <span className="font-bold text-muted-foreground">Claire et concise :</span>
                         <span className="text-muted-foreground"> Décrivez votre service de manière simple et directe</span>
                       </div>
                     </div>
                     <div className="flex items-start gap-2">
                       <Check className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                       <div>
                         <span className="font-bold text-muted-foreground">Appel à l'action :</span>
                         <span className="text-muted-foreground"> Incitez les clients à vous contacter ou visiter</span>
                       </div>
                     </div>
                     <div className="flex items-start gap-2">
                       <Check className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                       <div>
                         <span className="font-bold text-muted-foreground">Bénéfices clés :</span>
                         <span className="text-muted-foreground"> Mettez en avant les avantages de votre service</span>
                       </div>
                     </div>
                   </div>
                 </div>
              </CardContent>
            </Card>

            {/* Médias et liens */}
            <Card>
              <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                  <ImageIcon className="w-5 h-5" />
                  Médias et Liens
                </CardTitle>
                <CardDescription>
                  Ajoutez une image et définissez le lien de destination
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Upload d'image */}
                <AdvertisementImageUpload
                  onImageChange={handleImageChange}
                  disabled={loading || imageState.isUploading}
                  initialImageUrl={imageState.url}
                />
                
                {/* Alternative : URL d'image */}
                <div className="space-y-2">
                  <Label htmlFor="image_url">Ou URL de l'image (alternative)</Label>
                <div className="flex gap-2">
                  <Input
                    id="image_url"
                    type="url"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    placeholder="https://exemple.com/image.jpg"
                    disabled={!!imageState.file || loading}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={handlePreviewImage}
                    disabled={!!imageState.file || loading || !formData.image_url.trim()}
                    title="Voir l'image"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                    {imageState.file 
                      ? "Une image a été uploadée. L'URL sera ignorée."
                      : "URL de l'image à afficher avec votre publicité (optionnel)"
                    }
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="link_url">URL de destination *</Label>
                <div className="flex gap-2">
                  <Input
                    id="link_url"
                    type="url"
                    value={formData.link_url}
                    onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                    placeholder="https://votre-site.com"
                    required
                    disabled={loading}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={handlePreviewWebsite}
                    disabled={loading || !formData.link_url.trim()}
                    title="Voir le site web"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                    URL vers laquelle les utilisateurs seront redirigés
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

        {/* Actions en bas */}
        <div className="flex flex-col sm:flex-row gap-3 justify-end">
          <Button 
            type="button" 
            variant="outline"
            onClick={() => navigate('/dashboard/advertiser/ads')}
            disabled={loading || imageState.isUploading}
          >
            Annuler
          </Button>
          
              <Button 
                type="submit" 
                disabled={loading || imageState.isUploading}
              >
                <Save className="w-4 h-4 mr-2" />
                {imageState.isUploading 
                  ? "Upload de l'image..." 
                  : loading 
                    ? "Modification..." 
                    : "Modifier la publicité"
                }
              </Button>
        </div>
      </form>

      {/* Modal de prévisualisation de l'image */}
      {showImagePreview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">Aperçu de l'image</h3>
              <Button 
                variant="ghost"
                size="icon"
                onClick={() => setShowImagePreview(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="p-4">
              <div className="flex items-center justify-center bg-muted rounded-lg min-h-[300px]">
                <img
                  src={formData.image_url}
                  alt="Aperçu de l'image"
                  className="max-w-full max-h-[70vh] object-contain rounded-lg"
                  onError={() => {
                    toast({
                      title: "Erreur",
                      description: "Impossible de charger l'image. Vérifiez l'URL.",
                      variant: "destructive"
                    });
                    setShowImagePreview(false);
                  }}
                />
              </div>
              <div className="mt-4 text-xs text-muted-foreground">
                <p><strong>URL :</strong> {formData.image_url}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditAdvertisement;