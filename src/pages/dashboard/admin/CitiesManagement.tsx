import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  Plus, 
  Edit, 
  Trash2, 
  MapPin, 
  Building2, 
  Power, 
  PowerOff,
  ChevronDown,
  ChevronRight
} from "lucide-react";
import { Tables } from "@/integrations/supabase/types";

type City = Tables<'cities'>;
type Region = Tables<'regions'>;

interface CityWithRegions extends City {
  regions: Region[];
}

const CitiesManagement = () => {
  const { toast } = useToast();
  const [cities, setCities] = useState<CityWithRegions[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedCities, setExpandedCities] = useState<Set<string>>(new Set());

  // États pour les formulaires
  const [isCityDialogOpen, setIsCityDialogOpen] = useState(false);
  const [isRegionDialogOpen, setIsRegionDialogOpen] = useState(false);
  const [editingCity, setEditingCity] = useState<City | null>(null);
  const [editingRegion, setEditingRegion] = useState<Region | null>(null);
  const [selectedCityId, setSelectedCityId] = useState<string>("");

  // États des formulaires
  const [cityForm, setCityForm] = useState({
    name: "",
    slug: "",
    is_active: true
  });

  const [regionForm, setRegionForm] = useState({
    name: "",
    slug: "",
    is_active: true
  });

  // Charger les données
  const fetchCities = async () => {
    try {
      setLoading(true);
      const { data: citiesData, error: citiesError } = await supabase
        .from('cities')
        .select(`
          *,
          regions (*)
        `)
        .order('name');

      if (citiesError) throw citiesError;

      setCities(citiesData || []);
    } catch (error) {
      console.error('Erreur lors du chargement des villes:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les villes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCities();
  }, []);

  // Gestion des villes
  const handleCreateCity = async () => {
    try {
      const { error } = await supabase
        .from('cities')
        .insert([cityForm]);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Ville créée avec succès",
      });

      setIsCityDialogOpen(false);
      setCityForm({ name: "", slug: "", is_active: true });
      fetchCities();
    } catch (error) {
      console.error('Erreur lors de la création de la ville:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer la ville",
        variant: "destructive",
      });
    }
  };

  const handleUpdateCity = async () => {
    if (!editingCity) return;

    try {
      const { error } = await supabase
        .from('cities')
        .update(cityForm)
        .eq('id', editingCity.id);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Ville mise à jour avec succès",
      });

      setIsCityDialogOpen(false);
      setEditingCity(null);
      setCityForm({ name: "", slug: "", is_active: true });
      fetchCities();
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la ville:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour la ville",
        variant: "destructive",
      });
    }
  };

  const handleDeleteCity = async (cityId: string) => {
    try {
      const { error } = await supabase
        .from('cities')
        .delete()
        .eq('id', cityId);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Ville supprimée avec succès",
      });

      fetchCities();
    } catch (error) {
      console.error('Erreur lors de la suppression de la ville:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la ville",
        variant: "destructive",
      });
    }
  };

  const handleToggleCityStatus = async (cityId: string, isActive: boolean) => {
    try {
      const { error } = await supabase.rpc(
        isActive ? 'activate_city' : 'deactivate_city',
        { city_uuid: cityId }
      );

      if (error) throw error;

      toast({
        title: "Succès",
        description: isActive ? "Ville activée" : "Ville désactivée",
      });

      fetchCities();
    } catch (error) {
      console.error('Erreur lors du changement de statut:', error);
      toast({
        title: "Erreur",
        description: "Impossible de changer le statut",
        variant: "destructive",
      });
    }
  };

  // Gestion des régions
  const handleCreateRegion = async () => {
    if (!selectedCityId) return;

    try {
      const { error } = await supabase
        .from('regions')
        .insert([{
          ...regionForm,
          city_id: selectedCityId
        }]);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Région créée avec succès",
      });

      setIsRegionDialogOpen(false);
      setRegionForm({ name: "", slug: "", is_active: true });
      setSelectedCityId("");
      fetchCities();
    } catch (error) {
      console.error('Erreur lors de la création de la région:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer la région",
        variant: "destructive",
      });
    }
  };

  const handleUpdateRegion = async () => {
    if (!editingRegion) return;

    try {
      const { error } = await supabase
        .from('regions')
        .update(regionForm)
        .eq('id', editingRegion.id);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Région mise à jour avec succès",
      });

      setIsRegionDialogOpen(false);
      setEditingRegion(null);
      setRegionForm({ name: "", slug: "", is_active: true });
      fetchCities();
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la région:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour la région",
        variant: "destructive",
      });
    }
  };

  const handleDeleteRegion = async (regionId: string) => {
    try {
      const { error } = await supabase
        .from('regions')
        .delete()
        .eq('id', regionId);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Région supprimée avec succès",
      });

      fetchCities();
    } catch (error) {
      console.error('Erreur lors de la suppression de la région:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la région",
        variant: "destructive",
      });
    }
  };

  const handleToggleRegionStatus = async (regionId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('regions')
        .update({ is_active: isActive })
        .eq('id', regionId);

      if (error) throw error;

      toast({
        title: "Succès",
        description: isActive ? "Région activée" : "Région désactivée",
      });

      fetchCities();
    } catch (error) {
      console.error('Erreur lors du changement de statut:', error);
      toast({
        title: "Erreur",
        description: "Impossible de changer le statut",
        variant: "destructive",
      });
    }
  };

  // Ouvrir les formulaires
  const openCityDialog = (city?: City) => {
    if (city) {
      setEditingCity(city);
      setCityForm({
        name: city.name,
        slug: city.slug,
        is_active: city.is_active
      });
    } else {
      setEditingCity(null);
      setCityForm({ name: "", slug: "", is_active: true });
    }
    setIsCityDialogOpen(true);
  };

  const openRegionDialog = (region?: Region, cityId?: string) => {
    if (region) {
      setEditingRegion(region);
      setRegionForm({
        name: region.name,
        slug: region.slug,
        is_active: region.is_active
      });
      setSelectedCityId(region.city_id);
    } else {
      setEditingRegion(null);
      setRegionForm({ name: "", slug: "", is_active: true });
      setSelectedCityId(cityId || "");
    }
    setIsRegionDialogOpen(true);
  };

  // Toggle expansion des villes
  const toggleCityExpansion = (cityId: string) => {
    const newExpanded = new Set(expandedCities);
    if (newExpanded.has(cityId)) {
      newExpanded.delete(cityId);
    } else {
      newExpanded.add(cityId);
    }
    setExpandedCities(newExpanded);
  };

  // Générer le slug automatiquement
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Bouton d'action principal */}
      <div className="flex justify-end">
        <Button onClick={() => openCityDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle Ville
        </Button>
      </div>

      {/* Liste des villes */}
      <div className="space-y-2">
        {cities.map((city) => (
          <Card key={city.id}>
            <CardHeader className="py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleCityExpansion(city.id)}
                    className="h-8 w-8 p-0"
                  >
                    {expandedCities.has(city.id) ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </Button>
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    <div className="flex flex-col justify-center">
                      <CardTitle className="text-base leading-tight">{city.name}</CardTitle>
                      <p className="text-xs text-muted-foreground leading-tight">
                        {city.slug}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={city.is_active ? "default" : "secondary"} className="text-xs">
                    {city.is_active ? "Active" : "Inactive"}
                  </Badge>
                  <Switch
                    checked={city.is_active}
                    onCheckedChange={(checked) => handleToggleCityStatus(city.id, checked)}
                    className="scale-90"
                  />
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" className="h-8 w-8 p-0 hover:text-red-600 hover:border-red-300">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Supprimer la ville</AlertDialogTitle>
                        <AlertDialogDescription>
                          Êtes-vous sûr de vouloir supprimer la ville "{city.name}" ? 
                          Cette action supprimera également toutes ses régions.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="hover:bg-[#32323a] hover:text-white hover:border-[#32323a] active:bg-[#32323a] active:text-white active:border-[#32323a]">Annuler</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeleteCity(city.id)} className="bg-[#bc2d2b] hover:bg-[#a82523] text-white">
                          Supprimer
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openCityDialog(city)}
                    className="h-8 w-8 p-0 hover:text-[#385aa2] hover:border-[#385aa2]"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            {/* Régions de la ville */}
            {expandedCities.has(city.id) && (
              <CardContent className="pt-0">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-sm">Régions ({city.regions.length})</h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openRegionDialog(undefined, city.id)}
                      className="h-7 text-xs"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Ajouter
                    </Button>
                  </div>
                  
                  {city.regions.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-2">
                      Aucune région pour cette ville
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                      {city.regions.map((region) => (
                        <div
                          key={region.id}
                          className="flex items-center justify-between p-2 border rounded-md min-h-[40px]"
                        >
                          <div className="flex items-center space-x-2">
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                            <div className="flex flex-col justify-center">
                              <p className="font-medium text-xs leading-tight">{region.name}</p>
                              <p className="text-xs text-muted-foreground leading-tight">
                                {region.slug}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Switch
                              checked={region.is_active}
                              onCheckedChange={(checked) => handleToggleRegionStatus(region.id, checked)}
                              className="scale-90"
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openRegionDialog(region)}
                              className="h-7 w-7 p-0"
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Supprimer la région</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Êtes-vous sûr de vouloir supprimer la région "{region.name}" ?
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel className="hover:bg-[#32323a] hover:text-white hover:border-[#32323a] active:bg-[#32323a] active:text-white active:border-[#32323a]">Annuler</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDeleteRegion(region.id)} className="bg-[#bc2d2b] hover:bg-[#a82523] text-white">
                                    Supprimer
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {/* Dialog pour créer/modifier une ville */}
      <Dialog open={isCityDialogOpen} onOpenChange={setIsCityDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCity ? "Modifier la ville" : "Nouvelle ville"}
            </DialogTitle>
            <DialogDescription>
              {editingCity 
                ? "Modifiez les informations de la ville" 
                : "Ajoutez une nouvelle ville à la plateforme"
              }
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="city-name">Nom de la ville</Label>
              <Input
                id="city-name"
                value={cityForm.name}
                onChange={(e) => {
                  const name = e.target.value;
                  setCityForm({
                    ...cityForm,
                    name,
                    slug: generateSlug(name)
                  });
                }}
                placeholder="Ex: Nabeul"
              />
            </div>
            <div>
              <Label htmlFor="city-slug">Slug</Label>
              <Input
                id="city-slug"
                value={cityForm.slug}
                onChange={(e) => setCityForm({ ...cityForm, slug: e.target.value })}
                placeholder="Ex: nabeul"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="city-active"
                checked={cityForm.is_active}
                onCheckedChange={(checked) => setCityForm({ ...cityForm, is_active: checked })}
              />
              <Label htmlFor="city-active">Ville active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={editingCity ? handleUpdateCity : handleCreateCity}>
              {editingCity ? "Mettre à jour" : "Créer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog pour créer/modifier une région */}
      <Dialog open={isRegionDialogOpen} onOpenChange={setIsRegionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingRegion ? "Modifier la région" : "Nouvelle région"}
            </DialogTitle>
            <DialogDescription>
              {editingRegion 
                ? "Modifiez les informations de la région" 
                : "Ajoutez une nouvelle région à la ville"
              }
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {!editingRegion && (
              <div>
                <Label htmlFor="region-city">Ville</Label>
                <Select value={selectedCityId} onValueChange={setSelectedCityId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez une ville" />
                  </SelectTrigger>
                  <SelectContent>
                    {cities.map((city) => (
                      <SelectItem key={city.id} value={city.id}>
                        {city.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div>
              <Label htmlFor="region-name">Nom de la région</Label>
              <Input
                id="region-name"
                value={regionForm.name}
                onChange={(e) => {
                  const name = e.target.value;
                  setRegionForm({
                    ...regionForm,
                    name,
                    slug: generateSlug(name)
                  });
                }}
                placeholder="Ex: Hammamet"
              />
            </div>
            <div>
              <Label htmlFor="region-slug">Slug</Label>
              <Input
                id="region-slug"
                value={regionForm.slug}
                onChange={(e) => setRegionForm({ ...regionForm, slug: e.target.value })}
                placeholder="Ex: hammamet"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="region-active"
                checked={regionForm.is_active}
                onCheckedChange={(checked) => setRegionForm({ ...regionForm, is_active: checked })}
              />
              <Label htmlFor="region-active">Région active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button 
              onClick={editingRegion ? handleUpdateRegion : handleCreateRegion}
              disabled={!editingRegion && !selectedCityId}
            >
              {editingRegion ? "Mettre à jour" : "Créer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CitiesManagement;
