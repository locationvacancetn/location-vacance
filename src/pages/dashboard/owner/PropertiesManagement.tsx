import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { PropertyService, Property } from "@/lib/propertyService";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  MapPin, 
  Users, 
  Bed, 
  Bath, 
  Home,
  Calendar,
  Eye,
  Edit,
  Trash2,
  Plus,
  Star,
  Search,
  X,
  TrendingUp,
  Clock,
  EyeOff,
  CheckCircle,
  SquareCheckBig
} from "lucide-react";
import { useNavigate } from "react-router-dom";

// Fonction pour nettoyer le localStorage
const clearPropertyWizardData = () => {
  try {
    localStorage.removeItem('property-wizard-data');
  } catch (error) {
    console.error('Erreur lors du nettoyage du localStorage:', error);
  }
};

const PropertiesManagement = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [propertyTypes, setPropertyTypes] = useState<Record<string, string>>({});
  const [showDeactivateDialog, setShowDeactivateDialog] = useState(false);
  const [propertyToDeactivate, setPropertyToDeactivate] = useState<Property | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState<Property | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Charger les propriétés et types
  useEffect(() => {
    loadProperties();
    loadPropertyTypes();
  }, []);

  const loadProperties = async () => {
    try {
      setIsLoading(true);
      const data = await PropertyService.getOwnerProperties();
      setProperties(data);
    } catch (error) {
      console.error("Erreur lors du chargement des propriétés:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger vos propriétés",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadPropertyTypes = async () => {
    try {
      const { data, error } = await supabase
        .from('property_types')
        .select('id, name')
        .eq('is_active', true);
      
      if (error) {
        console.error("Erreur lors du chargement des types:", error);
        return;
      }
      
      const typesMap: Record<string, string> = {};
      data?.forEach(type => {
        typesMap[type.id] = type.name;
      });
      
      setPropertyTypes(typesMap);
    } catch (error) {
      console.error("Erreur lors du chargement des types:", error);
    }
  };

  const handleStatusChange = async (propertyId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('properties')
        .update({ status: newStatus })
        .eq('id', propertyId);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Statut de la propriété mis à jour",
      });

      loadProperties();
    } catch (error) {
      console.error("Erreur lors de la mise à jour du statut:", error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le statut",
        variant: "destructive",
      });
    }
  };

  const handleDeactivateClick = (property: Property) => {
    setPropertyToDeactivate(property);
    setShowDeactivateDialog(true);
  };

  const handleDeleteClick = (property: Property) => {
    setPropertyToDelete(property);
    setShowDeleteDialog(true);
  };

  const handleDeactivateConfirm = async () => {
    if (!propertyToDeactivate) return;

    try {
      await handleStatusChange(propertyToDeactivate.id, "inactive");
      setShowDeactivateDialog(false);
      setPropertyToDeactivate(null);
    } catch (error) {
      console.error("Erreur lors de la désactivation:", error);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!propertyToDelete) return;

    try {
      setIsDeleting(true);
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', propertyToDelete.id);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Propriété supprimée avec succès",
      });

      loadProperties();
      setShowDeleteDialog(false);
      setPropertyToDelete(null);
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la propriété",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtrer les propriétés
  const filteredProperties = properties.filter(property => {
    const matchesSearch = !searchTerm || 
      property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      propertyTypes[property.property_type_id]?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  const getStatusButton = (property: Property) => {
    const statusConfig = {
      pending_payment: {
        text: "Publier",
        icon: SquareCheckBig,
        variant: "default" as const,
        action: () => handleStatusChange(property.id, "pending_approval")
      },
      pending_approval: {
        text: "En Attente",
        icon: Clock,
        variant: "secondary" as const,
        action: () => {}
      },
      active: {
        text: "Désactiver",
        icon: EyeOff,
        variant: "destructive" as const,
        action: () => handleDeactivateClick(property)
      },
      inactive: {
        text: "Activer",
        icon: CheckCircle,
        variant: "default" as const,
        action: () => handleStatusChange(property.id, "active")
      }
    };

    const config = statusConfig[property.status as keyof typeof statusConfig];
    const IconComponent = config.icon;
    
    return (
      <Button
        onClick={(e) => {
          e.stopPropagation();
          config.action();
        }}
        variant={config.variant}
        size="sm"
        disabled={property.status === "pending_approval"}
        className={`w-full md:w-32 px-3 py-2 rounded-md font-medium ${
          property.status === "pending_payment" 
            ? "bg-transparent hover:bg-green-600 text-green-600 hover:text-white border border-green-600 hover:border-green-600 transition-colors duration-200" 
            : property.status === "pending_approval"
            ? "bg-transparent text-[#e2c044] border border-[#e2c044] cursor-not-allowed !opacity-100"
            : property.status === "active"
            ? "bg-transparent hover:bg-[#bc2d2b] text-[#bc2d2b] hover:text-white border border-[#bc2d2b] hover:border-[#bc2d2b] transition-colors duration-200"
            : "bg-transparent hover:bg-green-600 text-green-600 hover:text-white border border-green-600 hover:border-green-600 transition-colors duration-200"
        }`}
      >
        <IconComponent className="h-4 w-4 mr-2" />
        {config.text}
      </Button>
    );
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending_payment: { text: "En attente de paiement", variant: "secondary" as const },
      pending_approval: { text: "En attente d'approbation", variant: "secondary" as const },
      active: { text: "Active", variant: "default" as const },
      inactive: { text: "Inactive", variant: "outline" as const }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending_payment;
    
    return (
      <Badge variant={config.variant} className="text-xs">
        {config.text}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* En-tête avec bouton d'ajout */}
      <div className="flex items-center justify-end">
         <Button 
           onClick={() => {
             clearPropertyWizardData();
             navigate('/dashboard/owner/add-property');
           }}
          className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white border border-green-600 hover:border-green-700 px-4 py-2 rounded-md font-medium transition-colors"
         >
           <Plus className="h-4 w-4 mr-2" />
           Ajouter une propriété
         </Button>
       </div>

      {/* Barre de recherche */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          placeholder="Rechercher par nom ou type..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-80 pl-10 pr-4 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring text-sm placeholder:text-gray-400"
        />
      </div>

      {/* Compteur */}
      <div className="mb-4">
        <p className="text-sm text-muted-foreground">
          {filteredProperties.length} propriété{filteredProperties.length > 1 ? "s" : ""}
        </p>
      </div>

      {/* Version Desktop - Tableau */}
      <div className="hidden lg:block">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Chargement des propriétés...</p>
            </div>
          </div>
        ) : filteredProperties.length === 0 ? (
          <Card className="w-full">
            <CardContent className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Home className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                {searchTerm ? "Aucune propriété trouvée" : "Aucune propriété"}
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm 
                  ? "Essayez de modifier vos critères de recherche"
                  : "Commencez par ajouter votre première propriété"}
              </p>
              {!searchTerm && (
              <Button 
                onClick={() => {
                  clearPropertyWizardData();
                  navigate('/dashboard/owner/add-property');
                }}
                  variant="outline"
              >
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter la première propriété
              </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-24 min-w-[100px]">Image</TableHead>
                  <TableHead className="min-w-[200px]">Nom</TableHead>
                  <TableHead className="min-w-[120px]">Statut</TableHead>
                  <TableHead className="min-w-[80px]">Capacité</TableHead>
                  <TableHead className="min-w-[80px]">Chambres</TableHead>
                  <TableHead className="min-w-[100px]">Salles de bain</TableHead>
                  <TableHead className="min-w-[120px]">Prix</TableHead>
                  <TableHead className="w-48 min-w-[200px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProperties.map((property) => (
                  <TableRow key={property.id}>
                     {/* Image */}
                     <TableCell>
                       <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted">
                         {property.images && property.images.length > 0 ? (
                           <img
                             src={property.images[0]}
                             alt={property.title}
                             className={`w-full h-full object-cover ${
                               property.status === 'inactive' ? 'grayscale' : ''
                             }`}
                           />
                         ) : (
                           <div className="w-full h-full flex items-center justify-center">
                             <Home className={`h-8 w-8 text-muted-foreground ${
                               property.status === 'inactive' ? 'grayscale' : ''
                             }`} />
                           </div>
                         )}
                       </div>
                     </TableCell>

                    {/* Nom et Type */}
                    <TableCell>
                      <div className="font-medium truncate max-w-[150px]" title={property.title}>
                        {property.title}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {property.property_type_id 
                          ? propertyTypes[property.property_type_id] || "Type inconnu"
                          : "Non spécifié"
                        }
                      </div>
                    </TableCell>

                    {/* Statut */}
                    <TableCell>
                      {getStatusBadge(property.status)}
                    </TableCell>

                    {/* Capacité */}
                    <TableCell>
                      <div className="text-sm">
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-1 text-muted-foreground" />
                          <span>{property.max_guests}</span>
                        </div>
                      </div>
                    </TableCell>

                    {/* Chambres */}
                    <TableCell>
                      <div className="text-sm">
                        <div className="flex items-center">
                          <Bed className="h-4 w-4 mr-1 text-muted-foreground" />
                          <span>{property.bedrooms}</span>
                        </div>
                      </div>
                    </TableCell>

                    {/* Salles de bain */}
                    <TableCell>
                      <div className="text-sm">
                        <div className="flex items-center">
                          <Bath className="h-4 w-4 mr-1 text-muted-foreground" />
                          <span>{property.bathrooms}</span>
                        </div>
                      </div>
                    </TableCell>

                     {/* Prix */}
                     <TableCell>
                       <div className="flex items-baseline gap-1">
                         <span className="text-[10px] text-muted-foreground self-start">A partir</span>
                         <span className="text-xl font-bold text-[#32323a]">
                           {property.price_per_night}<sup className="text-sm font-medium text-[#32323a]">TND</sup>
                         </span>
                         <span className="text-xs text-muted-foreground">/Nuitée</span>
                       </div>
                     </TableCell>

                    {/* Actions */}
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0 border border-[#e2c044] hover:border-[#e2c044] bg-transparent hover:bg-[#e2c044] text-[#e2c044] hover:text-white transition-colors"
                          title="Mise en vedette"
                        >
                          <Star className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0 border border-[#385aa2] hover:border-[#385aa2] bg-transparent hover:bg-[#385aa2] text-[#385aa2] hover:text-white transition-colors"
                          onClick={() => {
                            navigate(`/dashboard/owner/edit-property/${property.id}`);
                          }}
                          title="Modifier"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0 border border-[#d54745] hover:border-[#d54745] bg-transparent hover:bg-[#d54745] text-[#d54745] hover:text-white transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClick(property);
                          }}
                          title="Supprimer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0 border border-[#387e64] hover:border-[#387e64] bg-transparent hover:bg-[#387e64] text-[#387e64] hover:text-white transition-colors"
                          onClick={() => window.open(`/property/${property.slug}`, '_blank')}
                          title="Voir"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <div className="ml-1">
                          {getStatusButton(property)}
                        </div>
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
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Chargement des propriétés...</p>
               </div>
             </div>
        ) : filteredProperties.length === 0 ? (
          <Card className="w-full">
            <CardContent className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Home className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                {searchTerm ? "Aucune propriété trouvée" : "Aucune propriété"}
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm 
                  ? "Essayez de modifier vos critères de recherche"
                  : "Commencez par ajouter votre première propriété"}
              </p>
              {!searchTerm && (
                <Button 
                  onClick={() => {
                    clearPropertyWizardData();
                    navigate('/dashboard/owner/add-property');
                  }}
                  variant="outline"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter la première propriété
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
           <div className="space-y-4">
            {filteredProperties.map((property) => (
              <div key={property.id} className="p-4 border rounded-lg bg-card">
           <div className="space-y-3">
                  {/* En-tête avec image et statut */}
                  <div className="flex items-start gap-3">
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                     {property.images && property.images.length > 0 ? (
                       <img
                         src={property.images[0]}
                         alt={property.title}
                         className={`w-full h-full object-cover ${
                           property.status === 'inactive' ? 'grayscale' : ''
                         }`}
                       />
                     ) : (
                       <div className="w-full h-full flex items-center justify-center">
                          <Home className={`h-6 w-6 text-muted-foreground ${
                           property.status === 'inactive' ? 'grayscale' : ''
                         }`} />
                       </div>
                     )}
                     </div>
                    <div className="flex-1 min-w-0">
                      <div className="space-y-1">
                        <h3 className="font-medium text-sm truncate max-w-full" title={property.title}>
                          {property.title}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          {property.property_type_id 
                            ? propertyTypes[property.property_type_id] || "Type inconnu"
                            : "Non spécifié"
                          }
                        </p>
                        <div className="flex items-center">
                          {getStatusBadge(property.status)}
                        </div>
                      </div>
                    </div>
                     </div>

                  {/* Détails de la propriété */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-xs mt-4">
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3 text-muted-foreground" />
                        <span>{property.max_guests} invités</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Bed className="h-3 w-3 text-muted-foreground" />
                        <span>{property.bedrooms} chambres</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Bath className="h-3 w-3 text-muted-foreground" />
                        <span>{property.bathrooms} salles de bain</span>
                      </div>
                    </div>
                    <div className="flex items-baseline justify-end gap-1">
                      <span className="text-[10px] text-muted-foreground self-start">A partir</span>
                      <span className="text-lg font-bold text-[#32323a]">
                        {property.price_per_night} TND
                      </span>
                      <span className="text-sm text-muted-foreground">/nuit</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center pt-2 border-t">
                    <div className="flex items-center flex-1 gap-1">
                      {/* Bouton Supprimer */}
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0 border border-[#d54745] hover:border-[#d54745] bg-transparent hover:bg-[#d54745] text-[#d54745] hover:text-white transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClick(property);
                        }}
                        title="Supprimer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      
                      {/* Bouton Modifier */}
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0 border border-[#385aa2] hover:border-[#385aa2] bg-transparent hover:bg-[#385aa2] text-[#385aa2] hover:text-white transition-colors"
                        onClick={() => {
                          navigate(`/dashboard/owner/edit-property/${property.id}`);
                        }}
                        title="Modifier"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      
                      {/* Bouton Voir */}
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0 border border-[#387e64] hover:border-[#387e64] bg-transparent hover:bg-[#387e64] text-[#387e64] hover:text-white transition-colors"
                        onClick={() => window.open(`/property/${property.slug}`, '_blank')}
                        title="Voir"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      
                      {/* Bouton Mise en vedette */}
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0 border border-[#e2c044] hover:border-[#e2c044] bg-transparent hover:bg-[#e2c044] text-[#e2c044] hover:text-white transition-colors"
                        title="Mise en vedette"
                      >
                        <Star className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    {/* Bouton de statut à droite avec largeur fixe */}
                    <div className="ml-2 w-32">
                      {getStatusButton(property)}
                    </div>
                  </div>
                   </div>
                 </div>
               ))}
           </div>
        )}
         </div>

      {/* Section publicitaire - Services pour propriétaires */}
      <div className="mt-8 mb-6">
        <h2 className="text-lg font-semibold mb-2 text-gray-700">Besoin d'aide ?</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Confiez vos besoins à des professionnels qualifiés
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Assurance Propriétaire */}
          <div 
            className="flex gap-3 cursor-pointer items-center"
            onClick={() => window.open('https://example.com/assurance-proprietaire', '_blank')}
          >
            <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
              <img
                src="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=200&h=200&fit=crop"
                alt="Assurance Propriétaire"
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-primaryText mb-1 text-sm">Assurance Propriétaire</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Protégez votre investissement avec une assurance adaptée aux locations saisonnières.
              </p>
            </div>
          </div>

          {/* Comptabilité Locative */}
          <div 
            className="flex gap-3 cursor-pointer items-center"
            onClick={() => window.open('https://example.com/comptabilite-locative', '_blank')}
          >
            <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
              <img
                src="https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=200&h=200&fit=crop"
                alt="Comptabilité Locative"
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-primaryText mb-1 text-sm">Comptabilité Locative</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Simplifiez votre gestion fiscale avec nos experts-comptables spécialisés.
              </p>
            </div>
          </div>

          {/* Conciergerie Premium */}
          <div 
            className="flex gap-3 cursor-pointer items-center"
            onClick={() => window.open('https://example.com/conciergerie-premium', '_blank')}
          >
            <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
              <img
                src="https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=200&h=200&fit=crop"
                alt="Conciergerie Premium"
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-primaryText mb-1 text-sm">Conciergerie Premium</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Service complet d'accueil et de gestion pour vos voyageurs.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Modales de confirmation */}
      <AlertDialog open={showDeactivateDialog} onOpenChange={setShowDeactivateDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Désactiver la propriété</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir désactiver la propriété <strong>"{propertyToDeactivate?.title}"</strong> ?
              <br />
              <br />
              Cette action masquera votre annonce des résultats de recherche.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeactivateConfirm}
              className="bg-[#bc2d2b] hover:bg-[#a82523] text-white"
            >
              Désactiver
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer la propriété</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer définitivement la propriété <strong>"{propertyToDelete?.title}"</strong> ?
              <br />
              <br />
              <strong>Cette action est irréversible.</strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-[#bc2d2b] hover:bg-[#a82523] text-white"
            >
              {isDeleting ? "Suppression..." : "Supprimer"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PropertiesManagement;