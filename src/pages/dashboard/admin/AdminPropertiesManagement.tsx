import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { usePageTitle } from "@/hooks/usePageTitle";
import { 
  Building, 
  Edit, 
  Trash2, 
  Search, 
  Filter,
  Eye,
  MapPin,
  User,
  Calendar,
  DollarSign,
  Home,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Plus
} from "lucide-react";
import { Link } from "react-router-dom";

type Property = Tables<'properties'> & {
  owner: Tables<'profiles'>;
  city: Tables<'cities'>;
  property_type: Tables<'property_types'>;
};

const AdminPropertiesManagement = () => {
  const { toast } = useToast();
  const { title, description } = usePageTitle();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [cityFilter, setCityFilter] = useState<string>("all");
  
  // Options pour les filtres
  const [propertyTypes, setPropertyTypes] = useState<Tables<'property_types'>[]>([]);
  const [cities, setCities] = useState<Tables<'cities'>[]>([]);

  // Charger les propriétés avec les relations
  const loadProperties = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('properties')
        .select(`
          *,
          owner:profiles!properties_owner_id_fkey(*),
          city:cities(*),
          property_type:property_types(*)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setProperties(data || []);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les propriétés",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Charger les options pour les filtres
  const loadFilterOptions = async () => {
    try {
      const [typesResponse, citiesResponse] = await Promise.all([
        supabase.from('property_types').select('*').eq('is_active', true).order('name'),
        supabase.from('cities').select('*').eq('is_active', true).order('name')
      ]);

      if (typesResponse.data) setPropertyTypes(typesResponse.data);
      if (citiesResponse.data) setCities(citiesResponse.data);
    } catch (error: any) {
      console.error('Erreur lors du chargement des options de filtre:', error);
    }
  };

  useEffect(() => {
    loadProperties();
    loadFilterOptions();
  }, []);

  // Filtrer les propriétés
  const filteredProperties = properties.filter(property => {
    const matchesSearch = !searchTerm || 
      property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.owner?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.city?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || property.status === statusFilter;
    const matchesType = typeFilter === "all" || property.property_type_id === typeFilter;
    const matchesCity = cityFilter === "all" || property.city_id === cityFilter;
    
    return matchesSearch && matchesStatus && matchesType && matchesCity;
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      published: { label: "Publié", variant: "default" as const, icon: CheckCircle, color: "text-green-600" },
      draft: { label: "Brouillon", variant: "secondary" as const, icon: AlertTriangle, color: "text-yellow-600" },
      pending: { label: "En attente", variant: "secondary" as const, icon: Clock, color: "text-yellow-600" },
      inactive: { label: "Inactif", variant: "destructive" as const, icon: XCircle, color: "text-red-600" },
      rejected: { label: "Rejeté", variant: "destructive" as const, icon: XCircle, color: "text-red-600" }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    const IconComponent = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <IconComponent className={`w-3 h-3 ${config.color}`} />
        {config.label}
      </Badge>
    );
  };

  const handleDeleteProperty = async (propertyId: string) => {
    try {
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', propertyId);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Propriété supprimée avec succès",
      });

      loadProperties();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la propriété",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête avec bouton d'ajout */}
      <div className="flex items-center justify-end">
        <Button asChild className="w-full sm:w-auto">
          <Link to="/dashboard/admin/add-property">
            <Plus className="w-4 h-4 mr-2" />
            Ajouter une propriété
          </Link>
        </Button>
      </div>

      {/* Cartes de statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Building className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{properties.length}</p>
                <p className="text-sm text-muted-foreground">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold">
                  {properties.filter(p => p.status === 'published').length}
                </p>
                <p className="text-sm text-muted-foreground">Publiées</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold">
                  {properties.filter(p => p.status === 'pending').length}
                </p>
                <p className="text-sm text-muted-foreground">En attente</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-500" />
              <div>
                <p className="text-2xl font-bold">
                  {properties.filter(p => p.status === 'draft' || p.status === 'rejected' || p.status === 'inactive').length}
                </p>
                <p className="text-sm text-muted-foreground">Inactives</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Barre de recherche et filtres */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Recherche */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Titre, propriétaire, ville..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full"
          />
        </div>
        
        {/* Filtre par statut */}
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Tous les statuts" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="published">Publié</SelectItem>
            <SelectItem value="draft">Brouillon</SelectItem>
            <SelectItem value="pending">En attente</SelectItem>
            <SelectItem value="inactive">Inactif</SelectItem>
            <SelectItem value="rejected">Rejeté</SelectItem>
          </SelectContent>
        </Select>
        
        {/* Filtre par type */}
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Tous les types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les types</SelectItem>
            {propertyTypes.map((type) => (
              <SelectItem key={type.id} value={type.id}>
                {type.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        {/* Filtre par ville */}
        <Select value={cityFilter} onValueChange={setCityFilter}>
          <SelectTrigger className="w-full">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Toutes les villes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les villes</SelectItem>
            {cities.map((city) => (
              <SelectItem key={city.id} value={city.id}>
                {city.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Compteur */}
      <div className="mb-4">
        <p className="text-sm text-muted-foreground">
          {filteredProperties.length} propriété{filteredProperties.length > 1 ? "s" : ""}
        </p>
      </div>

      {/* Version Desktop - Tableau */}
      <div className="hidden lg:block">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Chargement des propriétés...</p>
            </div>
          </div>
        ) : filteredProperties.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Building className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">
              {searchTerm || statusFilter !== "all" || typeFilter !== "all" || cityFilter !== "all"
                ? "Aucune propriété trouvée"
                : "Aucune propriété"}
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || statusFilter !== "all" || typeFilter !== "all" || cityFilter !== "all"
                ? "Essayez de modifier vos critères de recherche ou de filtrage"
                : "Commencez par ajouter votre première propriété"}
            </p>
            {!searchTerm && statusFilter === "all" && typeFilter === "all" && cityFilter === "all" && (
              <Button asChild variant="outline">
                <Link to="/dashboard/admin/add-property">
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter la première propriété
                </Link>
              </Button>
            )}
          </div>
        ) : (
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Propriété</TableHead>
                  <TableHead>Propriétaire</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Localisation</TableHead>
                  <TableHead>Prix/nuit</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Date création</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProperties.map((property) => (
                  <TableRow key={property.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                          <Home className="w-6 h-6 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-medium">{property.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {property.max_guests} personnes
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={property.owner?.avatar_url} />
                          <AvatarFallback>
                            <User className="w-4 h-4" />
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{property.owner?.full_name}</p>
                          <p className="text-xs text-muted-foreground">{property.owner?.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {property.property_type?.name}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-muted-foreground" />
                        <span className="text-sm">
                          {property.city?.name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-3 h-3 text-muted-foreground" />
                        <span className="font-medium">{property.price_per_night} DT</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(property.status)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-muted-foreground" />
                        <span className="text-sm">
                          {new Date(property.created_at).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                          title="Voir les détails"
                          className="h-8 w-8 p-0"
                        >
                          <Link to={`/property/${property.slug}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                          title="Modifier"
                          className="h-8 w-8 p-0 hover:text-[#385aa2] hover:border-[#385aa2]"
                        >
                          <Link to={`/dashboard/admin/edit-property/${property.id}`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              title="Supprimer"
                              className="h-8 w-8 p-0 hover:text-red-600 hover:border-red-300"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Supprimer la propriété</AlertDialogTitle>
                              <AlertDialogDescription>
                                Êtes-vous sûr de vouloir supprimer la propriété <strong>"{property.title}"</strong> ?
                                <br />
                                <br />
                                <strong>Cette action est irréversible.</strong>
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="hover:bg-[#32323a] hover:text-white hover:border-[#32323a] active:bg-[#32323a] active:text-white active:border-[#32323a]">
                                Annuler
                              </AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteProperty(property.id)}
                                className="bg-[#bc2d2b] hover:bg-[#a82523] text-white"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
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
      </div>

      {/* Version Mobile/Tablette - Cards */}
      <div className="lg:hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Chargement des propriétés...</p>
            </div>
          </div>
        ) : filteredProperties.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Building className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">
              {searchTerm || statusFilter !== "all" || typeFilter !== "all" || cityFilter !== "all"
                ? "Aucune propriété trouvée"
                : "Aucune propriété"}
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || statusFilter !== "all" || typeFilter !== "all" || cityFilter !== "all"
                ? "Essayez de modifier vos critères de recherche ou de filtrage"
                : "Commencez par ajouter votre première propriété"}
            </p>
            {!searchTerm && statusFilter === "all" && typeFilter === "all" && cityFilter === "all" && (
              <Button asChild variant="outline">
                <Link to="/dashboard/admin/add-property">
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter la première propriété
                </Link>
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredProperties.map((property) => (
              <div key={property.id} className="p-4 border rounded-lg bg-card">
                <div className="space-y-3">
                  {/* En-tête avec nom et statut */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                        <Home className="w-6 h-6 text-muted-foreground" />
                      </div>
                      <div>
                        <h3 className="font-medium text-sm">{property.title}</h3>
                        <p className="text-xs text-muted-foreground">
                          {property.max_guests} personnes
                        </p>
                      </div>
                    </div>
                    {getStatusBadge(property.status)}
                  </div>

                  {/* Propriétaire */}
                  <div className="flex items-center gap-2">
                    <Avatar className="w-6 h-6">
                      <AvatarImage src={property.owner?.avatar_url} />
                      <AvatarFallback>
                        <User className="w-3 h-3" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{property.owner?.full_name}</p>
                      <p className="text-xs text-muted-foreground truncate">{property.owner?.email}</p>
                    </div>
                  </div>

                  {/* Type et Localisation */}
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-xs">
                      {property.property_type?.name}
                    </Badge>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="w-3 h-3" />
                      <span className="truncate">
                        {property.city?.name}
                      </span>
                    </div>
                  </div>

                  {/* Prix et Date */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-3 h-3 text-muted-foreground" />
                      <span className="font-medium text-sm">{property.price_per_night} DT</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(property.created_at).toLocaleDateString('fr-FR')}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">Actions:</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {/* Bouton Voir */}
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        title="Voir les détails"
                        className="h-8 w-8 p-0"
                      >
                        <Link to={`/property/${property.slug}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      
                      {/* Bouton Modifier */}
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        title="Modifier"
                        className="h-8 w-8 p-0 hover:text-[#385aa2] hover:border-[#385aa2]"
                      >
                        <Link to={`/dashboard/admin/edit-property/${property.id}`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                      
                      {/* Bouton Supprimer avec Modal */}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            title="Supprimer"
                            className="h-8 w-8 p-0 hover:text-red-600 hover:border-red-300"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Supprimer la propriété</AlertDialogTitle>
                            <AlertDialogDescription>
                              Êtes-vous sûr de vouloir supprimer la propriété <strong>"{property.title}"</strong> ?
                              <br />
                              <br />
                              <strong>Cette action est irréversible.</strong>
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="hover:bg-[#32323a] hover:text-white hover:border-[#32323a] active:bg-[#32323a] active:text-white active:border-[#32323a]">
                              Annuler
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteProperty(property.id)}
                              className="bg-[#bc2d2b] hover:bg-[#a82523] text-white"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Supprimer
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPropertiesManagement;
