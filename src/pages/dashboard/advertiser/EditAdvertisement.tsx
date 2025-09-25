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
import { Tables } from "@/integrations/supabase/types";
import { 
  Megaphone, 
  Save,
  ArrowLeft,
  Calendar,
  DollarSign,
  Target,
  Eye,
  Image as ImageIcon,
  Loader
} from "lucide-react";

type Advertisement = Tables<'advertisements'>;

const EditAdvertisement = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    ad_type: "",
    budget: "",
    start_date: "",
    end_date: "",
    target_audience: "",
    image_url: "",
    link_url: ""
  });

  // Charger la publicité existante
  const loadAdvertisement = async () => {
    try {
      setInitialLoading(true);
      
      if (!id || !user?.id) return;

      const { data, error } = await supabase
        .from('advertisements')
        .select('*')
        .eq('id', id)
        .eq('advertiser_id', user.id) // S'assurer que l'utilisateur est le propriétaire
        .single();

      if (error) throw error;

      if (!data) {
        toast({
          title: "Erreur",
          description: "Publicité non trouvée",
          variant: "destructive"
        });
        navigate('/dashboard/advertiser/ads');
        return;
      }

      // Remplir le formulaire avec les données existantes
      setFormData({
        title: data.title,
        description: data.description || "",
        ad_type: data.ad_type,
        budget: data.budget.toString(),
        start_date: data.start_date,
        end_date: data.end_date,
        target_audience: data.target_audience || "",
        image_url: data.image_url || "",
        link_url: data.link_url || ""
      });

    } catch (error: any) {
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

  useEffect(() => {
    loadAdvertisement();
  }, [id, user?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id || !id) {
      toast({
        title: "Erreur",
        description: "Informations manquantes",
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

    if (!formData.ad_type) {
      toast({
        title: "Erreur",
        description: "Le type de publicité est requis",
        variant: "destructive"
      });
      return;
    }

    if (!formData.budget || parseFloat(formData.budget) <= 0) {
      toast({
        title: "Erreur",
        description: "Le budget doit être supérieur à 0",
        variant: "destructive"
      });
      return;
    }

    if (!formData.start_date || !formData.end_date) {
      toast({
        title: "Erreur",
        description: "Les dates de début et fin sont requises",
        variant: "destructive"
      });
      return;
    }

    if (new Date(formData.start_date) >= new Date(formData.end_date)) {
      toast({
        title: "Erreur",
        description: "La date de fin doit être après la date de début",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('advertisements')
        .update({
          title: formData.title.trim(),
          description: formData.description.trim() || null,
          ad_type: formData.ad_type,
          budget: parseFloat(formData.budget),
          start_date: formData.start_date,
          end_date: formData.end_date,
          target_audience: formData.target_audience.trim() || null,
          image_url: formData.image_url.trim() || null,
          link_url: formData.link_url.trim() || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('advertiser_id', user.id);

      if (error) throw error;

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
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate('/dashboard/advertiser/ads')}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Modifier la Publicité</h1>
            <p className="text-muted-foreground">Chargement...</p>
          </div>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader className="w-8 h-8 animate-spin text-primary mx-auto mb-2" />
            <p className="text-muted-foreground">Chargement de la publicité...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate('/dashboard/advertiser/ads')}
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Modifier la Publicité</h1>
          <p className="text-muted-foreground">
            Modifiez votre campagne publicitaire
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Formulaire principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Informations de base */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Megaphone className="w-5 h-5" />
                  Informations de base
                </CardTitle>
                <CardDescription>
                  Modifiez les informations principales de votre publicité
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Titre *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Titre accrocheur de votre publicité"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Description détaillée de votre publicité"
                    rows={4}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="ad_type">Type de publicité *</Label>
                  <Select
                    value={formData.ad_type}
                    onValueChange={(value) => setFormData({ ...formData, ad_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez le type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="banner">
                        <div className="flex items-center gap-2">
                          <Eye className="w-4 h-4" />
                          Bannière - Affichage sur le site
                        </div>
                      </SelectItem>
                      <SelectItem value="sponsored">
                        <div className="flex items-center gap-2">
                          <Target className="w-4 h-4" />
                          Sponsorisé - Mise en avant dans les résultats
                        </div>
                      </SelectItem>
                      <SelectItem value="featured">
                        <div className="flex items-center gap-2">
                          <Megaphone className="w-4 h-4" />
                          Vedette - Position premium
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Budget et calendrier */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Budget et Calendrier
                </CardTitle>
                <CardDescription>
                  Modifiez votre budget et la période de diffusion
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="budget">Budget total (DT) *</Label>
                  <Input
                    id="budget"
                    type="number"
                    min="1"
                    step="0.01"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                    placeholder="100.00"
                    required
                  />
                  <p className="text-sm text-muted-foreground">
                    Budget total pour toute la durée de la campagne
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start_date">Date de début *</Label>
                    <Input
                      id="start_date"
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="end_date">Date de fin *</Label>
                    <Input
                      id="end_date"
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                      min={formData.start_date}
                      required
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Ciblage et médias */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Ciblage et Médias
                </CardTitle>
                <CardDescription>
                  Modifiez votre audience et vos médias
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="target_audience">Audience cible</Label>
                  <Textarea
                    id="target_audience"
                    value={formData.target_audience}
                    onChange={(e) => setFormData({ ...formData, target_audience: e.target.value })}
                    placeholder="Décrivez votre audience cible (âge, localisation, centres d'intérêt...)"
                    rows={3}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="image_url">URL de l'image</Label>
                  <Input
                    id="image_url"
                    type="url"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    placeholder="https://exemple.com/image.jpg"
                  />
                  <p className="text-sm text-muted-foreground">
                    URL de l'image à afficher avec votre publicité
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="link_url">URL de destination</Label>
                  <Input
                    id="link_url"
                    type="url"
                    value={formData.link_url}
                    onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                    placeholder="https://votre-site.com"
                  />
                  <p className="text-sm text-muted-foreground">
                    URL vers laquelle les utilisateurs seront redirigés
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar avec aperçu */}
          <div className="space-y-6">
            {/* Aperçu */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Aperçu
                </CardTitle>
                <CardDescription>
                  Aperçu de votre publicité modifiée
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg p-4 space-y-3">
                  {formData.image_url && (
                    <div className="w-full h-32 bg-muted rounded-lg flex items-center justify-center">
                      <ImageIcon className="w-8 h-8 text-muted-foreground" />
                    </div>
                  )}
                  
                  <div>
                    <h4 className="font-semibold">
                      {formData.title || "Titre de votre publicité"}
                    </h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {formData.description || "Description de votre publicité"}
                    </p>
                  </div>
                  
                  {formData.ad_type && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                        {formData.ad_type === 'banner' ? 'Bannière' :
                         formData.ad_type === 'sponsored' ? 'Sponsorisé' : 'Vedette'}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="space-y-3">
              <Button type="submit" className="w-full" disabled={loading}>
                <Save className="w-4 h-4 mr-2" />
                {loading ? "Sauvegarde..." : "Sauvegarder les modifications"}
              </Button>
              
              <Button 
                type="button" 
                variant="outline" 
                className="w-full"
                onClick={() => navigate('/dashboard/advertiser/ads')}
              >
                Annuler
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EditAdvertisement;
