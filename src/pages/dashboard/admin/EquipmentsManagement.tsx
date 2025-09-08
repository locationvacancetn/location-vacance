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
  Wifi,
  Car,
  Snowflake,
  Thermometer,
  ChefHat,
  Tv,
  ShieldCheck,
  Dog,
  X,
  Waves,
  TreePine,
  ArrowUpDown
} from "lucide-react";

type Equipment = Tables<'equipments'>;

// Mapping des icônes
const iconMap: { [key: string]: any } = {
  'wifi': Wifi,
  'swimming-pool': Waves,
  'car': Car,
  'snowflake': Snowflake,
  'thermometer': Thermometer,
  'chef-hat': ChefHat,
  'washing-machine': Car, // Icône de remplacement
  'dishwasher': Car, // Icône de remplacement
  'tv': Tv,
  'balcony': TreePine, // Icône de remplacement
  'tree-pine': TreePine,
  'elevator': ArrowUpDown,
  'shield-check': ShieldCheck,
  'dog': Dog,
  'no-smoking': X,
};

const EquipmentsManagement = () => {
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [filteredEquipments, setFilteredEquipments] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showActiveOnly, setShowActiveOnly] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    icon: "",
    is_active: true
  });
  const { toast } = useToast();

  // Charger les équipements
  const fetchEquipments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('equipments')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEquipments(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des équipements:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les équipements",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Filtrer les équipements
  useEffect(() => {
    let filtered = equipments;

    if (searchTerm) {
      filtered = filtered.filter(equipment =>
        equipment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        equipment.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (equipment.description && equipment.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (showActiveOnly) {
      filtered = filtered.filter(equipment => equipment.is_active);
    }

    setFilteredEquipments(filtered);
  }, [equipments, searchTerm, showActiveOnly]);

  useEffect(() => {
    fetchEquipments();
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

  // Gérer les changements de formulaire
  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
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

  // Ouvrir le dialogue d'ajout/modification
  const openDialog = (equipment?: Equipment) => {
    if (equipment) {
      setEditingEquipment(equipment);
      setFormData({
        name: equipment.name,
        slug: equipment.slug,
        description: equipment.description || "",
        icon: equipment.icon || "",
        is_active: equipment.is_active
      });
    } else {
      setEditingEquipment(null);
      setFormData({
        name: "",
        slug: "",
        description: "",
        icon: "",
        is_active: true
      });
    }
    setIsDialogOpen(true);
  };

  // Sauvegarder l'équipement
  const handleSave = async () => {
    try {
      if (!formData.name.trim() || !formData.slug.trim()) {
        toast({
          title: "Erreur",
          description: "Le nom et le slug sont obligatoires",
          variant: "destructive",
        });
        return;
      }

      const equipmentData = {
        name: formData.name.trim(),
        slug: formData.slug.trim(),
        description: formData.description.trim() || null,
        icon: formData.icon.trim() || null,
        is_active: formData.is_active,
        updated_at: new Date().toISOString()
      };

      if (editingEquipment) {
        // Modification
        const { error } = await supabase
          .from('equipments')
          .update(equipmentData)
          .eq('id', editingEquipment.id);

        if (error) throw error;

        toast({
          title: "Succès",
          description: "Équipement modifié avec succès",
        });
      } else {
        // Ajout
        const { error } = await supabase
          .from('equipments')
          .insert(equipmentData);

        if (error) throw error;

        toast({
          title: "Succès",
          description: "Équipement ajouté avec succès",
        });
      }

      setIsDialogOpen(false);
      fetchEquipments();
    } catch (error: any) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de sauvegarder l'équipement",
        variant: "destructive",
      });
    }
  };

  // Supprimer un équipement
  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('equipments')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Équipement supprimé avec succès",
      });

      fetchEquipments();
    } catch (error: any) {
      console.error('Erreur lors de la suppression:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de supprimer l'équipement",
        variant: "destructive",
      });
    }
  };

  // Basculer l'état actif/inactif
  const toggleActive = async (equipment: Equipment, checked?: boolean) => {
    try {
      const newStatus = checked !== undefined ? checked : !equipment.is_active;
      
      const { error } = await supabase
        .from('equipments')
        .update({ 
          is_active: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', equipment.id);

      if (error) throw error;

      toast({
        title: "Succès",
        description: `Équipement ${newStatus ? 'activé' : 'désactivé'} avec succès`,
      });

      fetchEquipments();
    } catch (error: any) {
      console.error('Erreur lors du changement d\'état:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de modifier l'état de l'équipement",
        variant: "destructive",
      });
    }
  };

  const getIconComponent = (iconName: string | null) => {
    if (!iconName) return null;
    
    // Si c'est une icône Lucide
    if (iconMap[iconName]) {
      const IconComponent = iconMap[iconName];
      return <IconComponent className="h-4 w-4" />;
    }
    
    // Si c'est un SVG (commence par <svg ou contient <svg)
    if (iconName.includes('<svg')) {
      // Nettoyer le SVG des échappements
      const cleanSvg = iconName
        .replace(/\\"/g, '"')
        .replace(/\\n/g, '')
        .replace(/\\t/g, '')
        .trim();
      
      return (
        <div 
          className="h-4 w-4 flex items-center justify-center [&>svg]:h-4 [&>svg]:w-4 [&>svg]:fill-current"
          dangerouslySetInnerHTML={{ __html: cleanSvg }}
        />
      );
    }
    
    // Si c'est une URL d'image
    if (iconName.startsWith('http') || iconName.startsWith('/')) {
      return <img src={iconName} alt="icon" className="h-4 w-4" />;
    }
    
    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Chargement des équipements...</p>
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
            <Button onClick={() => openDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              Ajouter un équipement
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {editingEquipment ? 'Modifier l\'équipement' : 'Ajouter un équipement'}
              </DialogTitle>
              <DialogDescription>
                {editingEquipment 
                  ? 'Modifiez les informations de l\'équipement.' 
                  : 'Ajoutez un nouvel équipement à la liste.'
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
                  placeholder="Ex: WiFi, Piscine, Parking..."
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="slug">Slug *</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => handleInputChange('slug', e.target.value)}
                  placeholder="Ex: wifi, piscine, parking..."
                />
                <p className="text-xs text-muted-foreground">
                  Le slug sera utilisé dans l'URL (ex: /equipments/wifi)
                </p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Description de l'équipement..."
                  rows={3}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="icon">Icône</Label>
                <Input
                  id="icon"
                  value={formData.icon}
                  onChange={(e) => handleInputChange('icon', e.target.value)}
                  placeholder="Ex: wifi, car, swimming-pool..."
                />
                <p className="text-xs text-muted-foreground">
                  Icône : nom Lucide (wifi, car), SVG complet, ou URL d'image
                </p>
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
              <Button onClick={handleSave}>
                {editingEquipment ? 'Modifier' : 'Ajouter'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filtres */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Filter className="h-5 w-5" />
            Filtres
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Rechercher un équipement..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="show-active-only"
                checked={showActiveOnly}
                onCheckedChange={setShowActiveOnly}
              />
              <Label htmlFor="show-active-only">Afficher uniquement les actifs</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Liste des équipements */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Équipements ({filteredEquipments.length})</CardTitle>
          <CardDescription>
            Liste de tous les équipements disponibles
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredEquipments.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {searchTerm || showActiveOnly 
                  ? 'Aucun équipement ne correspond aux critères de recherche.' 
                  : 'Aucun équipement trouvé.'
                }
              </p>
            </div>
          ) : (
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
                {filteredEquipments.map((equipment) => (
                  <TableRow key={equipment.id}>
                    <TableCell className="font-medium">
                      {equipment.name}
                    </TableCell>
                    <TableCell>
                      <code className="text-xs bg-muted px-2 py-1 rounded">
                        {equipment.slug}
                      </code>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {equipment.description || '-'}
                    </TableCell>
                    <TableCell>
                      {getIconComponent(equipment.icon)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={equipment.is_active ? "default" : "secondary"}>
                        {equipment.is_active ? 'Actif' : 'Inactif'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Switch
                          checked={equipment.is_active}
                          onCheckedChange={(checked) => toggleActive(equipment, checked)}
                          className="scale-90"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openDialog(equipment)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Supprimer l'équipement</AlertDialogTitle>
                              <AlertDialogDescription>
                                Êtes-vous sûr de vouloir supprimer l'équipement "{equipment.name}" ? 
                                Cette action est irréversible.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Annuler</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(equipment.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Supprimer
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EquipmentsManagement;
