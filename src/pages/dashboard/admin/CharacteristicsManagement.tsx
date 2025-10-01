import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter,
  Star,
  Check,
  X,
  Settings
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Characteristic = Tables<'property_characteristics'>;

const CharacteristicsManagement = () => {
  const { toast } = useToast();
  const [characteristics, setCharacteristics] = useState<Characteristic[]>([]);
  const [filteredCharacteristics, setFilteredCharacteristics] = useState<Characteristic[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  
  // États pour la modal d'ajout/modification
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCharacteristic, setEditingCharacteristic] = useState<Characteristic | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    icon: "",
    is_active: true
  });

  // Charger les caractéristiques
  const loadCharacteristics = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('property_characteristics')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setCharacteristics(data || []);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les caractéristiques",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCharacteristics();
  }, []);

  // Générer un slug à partir du nom
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

  // Fonction pour traiter et normaliser les SVG
  const processSvgIcon = (svgContent: string): string => {
    if (!svgContent || !svgContent.includes('<svg')) {
      return svgContent;
    }

    try {
      // Nettoyer le SVG des échappements
      let cleanSvg = svgContent
        .replace(/\\"/g, '"')
        .replace(/\\n/g, '')
        .replace(/\\t/g, '')
        .trim();

      // Normaliser les dimensions à 24px
      cleanSvg = cleanSvg
        .replace(/width="[^"]*"/g, 'width="24"')
        .replace(/height="[^"]*"/g, 'height="24"')
        .replace(/width='[^']*'/g, "width='24'")
        .replace(/height='[^']*'/g, "height='24'");

      // Appliquer la couleur rgb(100,116,139)
      cleanSvg = cleanSvg
        .replace(/fill="#000000"/g, 'fill="rgb(100,116,139)"')
        .replace(/fill="#000"/g, 'fill="rgb(100,116,139)"')
        .replace(/stroke="#000000"/g, 'stroke="rgb(100,116,139)"')
        .replace(/stroke="#000"/g, 'stroke="rgb(100,116,139)"')
        .replace(/fill:#000000/g, 'fill:rgb(100,116,139)')
        .replace(/fill:#000/g, 'fill:rgb(100,116,139)')
        .replace(/stroke:#000000/g, 'stroke:rgb(100,116,139)')
        .replace(/stroke:#000/g, 'stroke:rgb(100,116,139)')
        .replace(/fill:none/g, 'fill:rgb(100,116,139)');

      return cleanSvg;
    } catch (error) {
      console.error('Erreur lors du traitement du SVG:', error);
      return svgContent;
    }
  };

  // Gérer les changements de formulaire
  const handleInputChange = (field: string, value: string | boolean) => {
    let processedValue = value;

    // Traiter le SVG si c'est le champ icon
    if (field === 'icon' && typeof value === 'string') {
      processedValue = processSvgIcon(value);
    }

    setFormData(prev => ({
      ...prev,
      [field]: processedValue
    }));

    // Auto-générer le slug quand le nom change
    if (field === 'name' && typeof value === 'string') {
      setFormData(prev => ({
        ...prev,
        name: value,
        slug: generateSlug(value)
      }));
    }
  };

  // Filtrer les caractéristiques
  useEffect(() => {
    let filtered = characteristics;

    if (searchTerm) {
      filtered = filtered.filter(characteristic =>
        characteristic.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (characteristic.description && characteristic.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(characteristic =>
        statusFilter === "active" ? characteristic.is_active : !characteristic.is_active
      );
    }

    setFilteredCharacteristics(filtered);
  }, [characteristics, searchTerm, statusFilter]);

  // Fonction pour obtenir l'icône d'une caractéristique
  const getIconComponent = (iconName: string | null) => {
    if (!iconName) return null;
    
    // Si c'est un SVG (commence par <svg ou contient <svg)
    if (iconName.includes('<svg')) {
      // Traiter le SVG avec la même logique que dans le formulaire
      const processedSvg = processSvgIcon(iconName);
      
      return (
        <div 
          className="h-4 w-4 flex items-center justify-center [&>svg]:h-4 [&>svg]:w-4"
          dangerouslySetInnerHTML={{ __html: processedSvg }}
        />
      );
    }
    
    // Si c'est une URL d'image
    if (iconName.startsWith('http') || iconName.startsWith('/')) {
      return <img src={iconName} alt="icon" className="h-4 w-4" />;
    }
    
    return null;
  };

  // Gérer l'ajout/modification
  const handleSubmit = async () => {
    try {
      if (!formData.name.trim() || !formData.slug.trim()) {
        toast({
          title: "Erreur",
          description: "Le nom et le slug sont obligatoires",
          variant: "destructive"
        });
        return;
      }

      const characteristicData = {
        name: formData.name.trim(),
        slug: formData.slug.trim(),
        description: formData.description.trim() || null,
        icon: formData.icon.trim() || null,
        is_active: formData.is_active,
        updated_at: new Date().toISOString()
      };

      if (editingCharacteristic) {
        // Modification
        const { error } = await supabase
          .from('property_characteristics')
          .update(characteristicData)
          .eq('id', editingCharacteristic.id);

        if (error) throw error;

        toast({
          title: "Succès",
          description: "Point fort modifié avec succès"
        });
      } else {
        // Ajout
        const { error } = await supabase
          .from('property_characteristics')
          .insert(characteristicData);

        if (error) throw error;

        toast({
          title: "Succès",
          description: "Point fort ajouté avec succès"
        });
      }

      setIsDialogOpen(false);
      resetForm();
      loadCharacteristics();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue",
        variant: "destructive"
      });
    }
  };

  // Supprimer une caractéristique
  const handleDelete = async (id: string) => {
    try {
      // Supprimer d'abord les assignments liées
      await supabase
        .from('property_characteristic_assignments')
        .delete()
        .eq('characteristic_id', id);

      // Puis supprimer la caractéristique
      const { error } = await supabase
        .from('property_characteristics')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Caractéristique supprimée avec succès"
      });
      loadCharacteristics();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de supprimer la caractéristique",
        variant: "destructive"
      });
    }
  };

  // Réinitialiser le formulaire
  const resetForm = () => {
    setFormData({
      name: "",
      slug: "",
      description: "",
      icon: "",
      is_active: true
    });
    setEditingCharacteristic(null);
  };

  // Ouvrir la modal pour modification
  const openEditDialog = (characteristic: Characteristic) => {
    setEditingCharacteristic(characteristic);
    
    // Traiter le SVG existant s'il y en a un
    const processedIcon = characteristic.icon ? processSvgIcon(characteristic.icon) : "";
    
    setFormData({
      name: characteristic.name,
      slug: characteristic.slug,
      description: characteristic.description || "",
      icon: processedIcon,
      is_active: characteristic.is_active
    });
    setIsDialogOpen(true);
  };

  // Ouvrir la modal pour ajout
  const openAddDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  // Basculer l'état actif/inactif
  const toggleActive = async (characteristic: Characteristic, checked?: boolean) => {
    try {
      const newStatus = checked !== undefined ? checked : !characteristic.is_active;
      
      const { error } = await supabase
        .from('property_characteristics')
        .update({ 
          is_active: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', characteristic.id);

      if (error) throw error;

      toast({
        title: "Succès",
        description: `Point fort ${newStatus ? 'activé' : 'désactivé'} avec succès`,
      });

      loadCharacteristics();
    } catch (error: any) {
      console.error('Erreur lors du changement d\'état:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de modifier l'état du point fort",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Chargement...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-end">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openAddDialog} className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Ajouter un point fort</span>
              <span className="sm:hidden">Ajouter</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {editingCharacteristic ? 'Modifier le point fort' : 'Ajouter un point fort'}
              </DialogTitle>
              <DialogDescription>
                {editingCharacteristic 
                  ? 'Modifiez les informations du point fort.' 
                  : 'Ajoutez un nouveau point fort à la liste.'
                }
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nom *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Ex: Vue sur mer, Piscine privée..."
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="slug">Slug *</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => handleInputChange('slug', e.target.value)}
                  placeholder="Ex: vue-mer, piscine-privee..."
                />
                <p className="text-xs text-muted-foreground">
                  Le slug sera utilisé dans l'URL (ex: /characteristics/vue-mer)
                </p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Description du point fort..."
                  rows={3}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="icon">Icône</Label>
                <div className="flex items-center gap-3">
                  <Input
                    id="icon"
                    value={formData.icon}
                    onChange={(e) => handleInputChange('icon', e.target.value)}
                    placeholder="Ex: SVG complet, URL d'image..."
                    className="flex-1"
                  />
                  {formData.icon && (
                    <div className="flex items-center justify-center w-12 h-12 border rounded bg-muted p-2">
                      {getIconComponent(formData.icon)}
                    </div>
                  )}
                </div>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>• SVG complet : sera automatiquement dimensionné à 24px et coloré</p>
                  <p>• URL d'image : sera affichée telle quelle</p>
                  {formData.icon && formData.icon.includes('<svg') && (
                    <p className="text-green-600">✓ SVG détecté - traitement automatique appliqué</p>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => handleInputChange('is_active', checked)}
                />
                <Label htmlFor="is_active">Actif</Label>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleSubmit}>
                {editingCharacteristic ? 'Modifier' : 'Ajouter'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Barre de recherche */}
      <div className="space-y-4">
        {/* Version desktop - Recherche et filtre sur la même ligne */}
        <div className="hidden lg:flex lg:items-center lg:gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par nom de point fort"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-10 placeholder:text-sm placeholder:text-muted-foreground"
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSearchTerm("")}
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>

          {/* Filtre par statut */}
          <div className="flex-1">
            <Select value={statusFilter} onValueChange={(value: "all" | "active" | "inactive") => setStatusFilter(value)}>
              <SelectTrigger className="w-full">
                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <SelectValue placeholder="Filtrer par statut" className="text-sm text-muted-foreground" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les points forts</SelectItem>
                <SelectItem value="active">Points forts actifs</SelectItem>
                <SelectItem value="inactive">Points forts inactifs</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Version mobile - Recherche et filtre empilés */}
        <div className="lg:hidden space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par nom de point fort"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-10 placeholder:text-sm placeholder:text-muted-foreground"
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSearchTerm("")}
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>

          {/* Filtre par statut - Pleine largeur */}
          <Select value={statusFilter} onValueChange={(value: "all" | "active" | "inactive") => setStatusFilter(value)}>
            <SelectTrigger className="w-full">
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <SelectValue placeholder="Filtrer par statut" className="text-sm text-muted-foreground" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les points forts</SelectItem>
              <SelectItem value="active">Points forts actifs</SelectItem>
              <SelectItem value="inactive">Points forts inactifs</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Statistiques des résultats */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            {filteredCharacteristics.length} point fort{filteredCharacteristics.length !== 1 ? 's' : ''} 
            {searchTerm && ` trouvé${filteredCharacteristics.length !== 1 ? 's' : ''}`}
            {statusFilter !== "all" && ` (${statusFilter === "active" ? "actifs" : "inactifs"})`}
          </span>
          {(searchTerm || statusFilter !== "all") && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("all");
              }}
              className="h-6 text-xs"
            >
              Effacer les filtres
            </Button>
          )}
        </div>
      </div>

      {/* Liste des points forts */}
      {filteredCharacteristics.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            {searchTerm || statusFilter !== "all" 
              ? 'Aucun point fort ne correspond aux critères de recherche.' 
              : 'Aucun point fort trouvé.'
            }
          </p>
        </div>
      ) : (
        <>
          {/* Version desktop - Table complète avec Card */}
          <div className="hidden lg:block">
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nom</TableHead>
                        <TableHead>Slug</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Icône</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCharacteristics.map((characteristic) => (
                        <TableRow key={characteristic.id}>
                          <TableCell className="font-medium">
                            {characteristic.name}
                          </TableCell>
                          <TableCell>
                            <code className="text-xs bg-muted px-2 py-1 rounded">
                              {characteristic.slug}
                            </code>
                          </TableCell>
                          <TableCell className="max-w-xs">
                            <div className="truncate" title={characteristic.description || ''}>
                              {characteristic.description || '-'}
                            </div>
                          </TableCell>
                          <TableCell>
                            {getIconComponent(characteristic.icon)}
                          </TableCell>
                          <TableCell>
                            <Badge variant={characteristic.is_active ? "default" : "secondary"}>
                              {characteristic.is_active ? 'Actif' : 'Inactif'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Switch
                                checked={characteristic.is_active}
                                onCheckedChange={(checked) => toggleActive(characteristic, checked)}
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
                                    <AlertDialogTitle>Supprimer le point fort</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Êtes-vous sûr de vouloir supprimer le point fort "{characteristic.name}" ? 
                                      Cette action est irréversible.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel className="hover:bg-[#32323a] hover:text-white hover:border-[#32323a] active:bg-[#32323a] active:text-white active:border-[#32323a]">Annuler</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDelete(characteristic.id)}
                                      className="bg-[#bc2d2b] hover:bg-[#a82523] text-white"
                                    >
                                      Supprimer
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openEditDialog(characteristic)}
                                className="h-8 w-8 p-0 hover:text-[#385aa2] hover:border-[#385aa2]"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Version mobile - Cards */}
          <div className="lg:hidden space-y-4">
            {filteredCharacteristics.map((characteristic) => (
              <div key={characteristic.id} className="p-4 border rounded-lg bg-card">
                <div className="space-y-3">
                  {/* En-tête avec nom et statut */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 border rounded bg-muted">
                        {getIconComponent(characteristic.icon)}
                      </div>
                      <div>
                        <h3 className="font-medium text-sm">{characteristic.name}</h3>
                        <code className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                          {characteristic.slug}
                        </code>
                      </div>
                    </div>
                    <Badge variant={characteristic.is_active ? "default" : "secondary"}>
                      {characteristic.is_active ? 'Actif' : 'Inactif'}
                    </Badge>
                  </div>

                  {/* Description */}
                  {characteristic.description && (
                    <div className="text-sm text-muted-foreground">
                      <span className="font-medium">Description :</span> {characteristic.description}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={characteristic.is_active}
                        onCheckedChange={(checked) => toggleActive(characteristic, checked)}
                        className="scale-90"
                      />
                      <Label className="text-xs text-muted-foreground">
                        {characteristic.is_active ? 'Actif' : 'Inactif'}
                      </Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm" className="h-8 w-8 p-0 hover:text-red-600 hover:border-red-300">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Supprimer le point fort</AlertDialogTitle>
                            <AlertDialogDescription>
                              Êtes-vous sûr de vouloir supprimer le point fort "{characteristic.name}" ? 
                              Cette action est irréversible.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="hover:bg-[#32323a] hover:text-white hover:border-[#32323a] active:bg-[#32323a] active:text-white active:border-[#32323a]">Annuler</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(characteristic.id)}
                              className="bg-[#bc2d2b] hover:bg-[#a82523] text-white"
                            >
                              Supprimer
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(characteristic)}
                        className="h-8 w-8 p-0 hover:text-[#385aa2] hover:border-[#385aa2]"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default CharacteristicsManagement;
