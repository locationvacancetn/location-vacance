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

type Characteristic = Tables<'property_characteristics'>;

const CharacteristicsManagement = () => {
  const { toast } = useToast();
  const [characteristics, setCharacteristics] = useState<Characteristic[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterActive, setFilterActive] = useState<boolean | null>(null);
  
  // États pour la modal d'ajout/modification
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCharacteristic, setEditingCharacteristic] = useState<Characteristic | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
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

  // Filtrer les caractéristiques
  const filteredCharacteristics = characteristics.filter(characteristic => {
    const matchesSearch = characteristic.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         characteristic.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterActive === null || characteristic.is_active === filterActive;
    return matchesSearch && matchesFilter;
  });

  // Gérer l'ajout/modification
  const handleSubmit = async () => {
    try {
      if (!formData.name.trim()) {
        toast({
          title: "Erreur",
          description: "Le nom est requis",
          variant: "destructive"
        });
        return;
      }

      // Créer le slug à partir du nom
      const slug = formData.name.trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Supprimer les accents
        .replace(/[^a-z0-9\s-]/g, '') // Garder seulement lettres, chiffres, espaces et tirets
        .trim()
        .replace(/\s+/g, '-'); // Remplacer espaces par tirets

      if (editingCharacteristic) {
        // Modification
        const { error } = await supabase
          .from('property_characteristics')
          .update({
            name: formData.name.trim(),
            slug: slug,
            description: formData.description.trim() || null,
            is_active: formData.is_active,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingCharacteristic.id);

        if (error) throw error;

        toast({
          title: "Succès",
          description: "Caractéristique modifiée avec succès"
        });
      } else {
        // Ajout
        const { error } = await supabase
          .from('property_characteristics')
          .insert({
            name: formData.name.trim(),
            slug: slug,
            description: formData.description.trim() || null,
            is_active: formData.is_active
          });

        if (error) throw error;

        toast({
          title: "Succès",
          description: "Caractéristique ajoutée avec succès"
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
      description: "",
      is_active: true
    });
    setEditingCharacteristic(null);
  };

  // Ouvrir la modal pour modification
  const openEditDialog = (characteristic: Characteristic) => {
    setEditingCharacteristic(characteristic);
    setFormData({
      name: characteristic.name,
      description: characteristic.description || "",
      is_active: characteristic.is_active
    });
    setIsDialogOpen(true);
  };

  // Ouvrir la modal pour ajout
  const openAddDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Gestion des Caractéristiques</h1>
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
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gestion des Caractéristiques</h1>
          <p className="text-muted-foreground">
            Gérez les caractéristiques disponibles pour les propriétés
          </p>
        </div>
        <Button onClick={openAddDialog}>
          <Plus className="w-4 h-4 mr-2" />
          Ajouter une caractéristique
        </Button>
      </div>

      {/* Filtres */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtres
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Rechercher</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Nom ou description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Statut</Label>
              <div className="flex gap-2">
                <Button
                  variant={filterActive === null ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterActive(null)}
                >
                  Tous
                </Button>
                <Button
                  variant={filterActive === true ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterActive(true)}
                >
                  Actifs
                </Button>
                <Button
                  variant={filterActive === false ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterActive(false)}
                >
                  Inactifs
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Liste des caractéristiques */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Caractéristiques ({filteredCharacteristics.length})
          </CardTitle>
          <CardDescription>
            Liste des caractéristiques disponibles pour les propriétés
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredCharacteristics.length === 0 ? (
            <div className="text-center py-8">
              <Settings className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Aucune caractéristique trouvée</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || filterActive !== null 
                  ? "Aucune caractéristique ne correspond à vos critères de recherche."
                  : "Commencez par ajouter votre première caractéristique."
                }
              </p>
              {!searchTerm && filterActive === null && (
                <Button onClick={openAddDialog}>
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter une caractéristique
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Date de création</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCharacteristics.map((characteristic) => (
                    <TableRow key={characteristic.id}>
                      <TableCell className="font-medium">
                        {characteristic.name}
                      </TableCell>
                      <TableCell className="max-w-md">
                        <p className="text-sm text-muted-foreground truncate">
                          {characteristic.description || "Aucune description"}
                        </p>
                      </TableCell>
                      <TableCell>
                        <Badge variant={characteristic.is_active ? "default" : "secondary"}>
                          {characteristic.is_active ? (
                            <><Check className="w-3 h-3 mr-1" /> Actif</>
                          ) : (
                            <><X className="w-3 h-3 mr-1" /> Inactif</>
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(characteristic.created_at).toLocaleDateString('fr-FR')}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditDialog(characteristic)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Trash2 className="w-4 h-4 text-destructive" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Êtes-vous sûr de vouloir supprimer la caractéristique "{characteristic.name}" ? 
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
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog d'ajout/modification */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingCharacteristic ? "Modifier la caractéristique" : "Ajouter une caractéristique"}
            </DialogTitle>
            <DialogDescription>
              {editingCharacteristic 
                ? "Modifiez les informations de cette caractéristique."
                : "Ajoutez une nouvelle caractéristique pour les propriétés."
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom *</Label>
              <Input
                id="name"
                placeholder="ex: WiFi, Piscine, Parking..."
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Description détaillée de la caractéristique..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label htmlFor="is_active">Caractéristique active</Label>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleSubmit}>
              {editingCharacteristic ? "Modifier" : "Ajouter"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CharacteristicsManagement;
