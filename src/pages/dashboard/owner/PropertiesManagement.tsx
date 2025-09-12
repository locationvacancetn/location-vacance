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
// import { usePageTitle } from "@/hooks/usePageTitle";
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
  Upload,
  Clock,
  EyeOff,
  CheckCircle
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
      await PropertyService.updatePropertyStatus(propertyId, newStatus);
      toast({
        title: "Succès",
        description: "Statut de la propriété mis à jour",
      });
      loadProperties(); // Recharger la liste
    } catch (error) {
      console.error("Erreur lors du changement de statut:", error);
      toast({
        title: "Erreur",
        description: "Impossible de modifier le statut",
        variant: "destructive",
      });
    }
  };

  const handleDeactivateClick = (property: Property) => {
    setPropertyToDeactivate(property);
    setShowDeactivateDialog(true);
  };

  const confirmDeactivation = async () => {
    if (propertyToDeactivate) {
      await handleStatusChange(propertyToDeactivate.id, "inactive");
      setShowDeactivateDialog(false);
      setPropertyToDeactivate(null);
    }
  };

  const handleDeleteClick = (property: Property) => {
    setPropertyToDelete(property);
    setShowDeleteDialog(true);
  };

  const confirmDeletion = async () => {
    if (!propertyToDelete) return;

    try {
      setIsDeleting(true);

      // 1. Supprimer les photos du storage Supabase
      if (propertyToDelete.images && propertyToDelete.images.length > 0) {
        const photoPaths = propertyToDelete.images.map(imageUrl => {
          // Extraire le nom du fichier de l'URL
          const urlParts = imageUrl.split('/');
          return `properties/${propertyToDelete.id}/${urlParts[urlParts.length - 1]}`;
        });

        const { error: storageError } = await supabase.storage
          .from('property-images')
          .remove(photoPaths);

        if (storageError) {
          console.error('Erreur lors de la suppression des photos:', storageError);
          // On continue même si la suppression des photos échoue
        }
      }

      // 2. Supprimer la propriété de la base de données
      const { error: deleteError } = await supabase
        .from('properties')
        .delete()
        .eq('id', propertyToDelete.id);

      if (deleteError) {
        throw new Error(deleteError.message);
      }

      // 3. Mettre à jour l'état local
      setProperties(prev => prev.filter(p => p.id !== propertyToDelete.id));

      toast({
        title: "Succès",
        description: "Propriété supprimée avec succès",
      });

    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la propriété",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
      setPropertyToDelete(null);
    }
  };

  const getStatusButton = (property: Property) => {
    const statusConfig = {
      pending_payment: {
        text: "Publier",
        icon: Upload,
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Header avec recherche et filtres */}
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <div className="pl-10 pr-4 py-2 border border-input rounded-md w-64 h-10 bg-muted animate-pulse" />
            </div>
            <div className="h-10 w-32 bg-muted animate-pulse rounded-md" />
          </div>
          <Button 
            onClick={() => navigate('/dashboard/add-property')}
            className="bg-green-600 hover:bg-green-700 text-white border border-green-600 hover:border-green-700 px-4 py-2 rounded-md font-medium transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Ajouter une propriété
          </Button>
        </div>

        {/* Tableau de chargement */}
        <Card>
          <CardHeader>
            <div className="h-6 bg-muted animate-pulse rounded w-48" />
            <div className="h-4 bg-muted animate-pulse rounded w-32" />
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-24 min-w-[100px]">Image</TableHead>
                  <TableHead className="min-w-[150px]">Nom</TableHead>
                  <TableHead className="min-w-[120px]">Type</TableHead>
                  <TableHead className="min-w-[80px]">Capacité</TableHead>
                  <TableHead className="min-w-[80px]">Chambres</TableHead>
                  <TableHead className="min-w-[100px]">Salles de bain</TableHead>
                  <TableHead className="min-w-[120px]">Prix</TableHead>
                  <TableHead className="w-48 min-w-[200px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[1, 2, 3].map((i) => (
                  <TableRow key={i}>
                     <TableCell>
                       <div className="w-20 h-20 bg-muted animate-pulse rounded-lg" />
                     </TableCell>
                    <TableCell>
                      <div className="h-4 bg-muted animate-pulse rounded w-32" />
                    </TableCell>
                    <TableCell>
                      <div className="h-4 bg-muted animate-pulse rounded w-20" />
                    </TableCell>
                    <TableCell>
                      <div className="h-4 bg-muted animate-pulse rounded w-16" />
                    </TableCell>
                    <TableCell>
                      <div className="h-4 bg-muted animate-pulse rounded w-12" />
                    </TableCell>
                    <TableCell>
                      <div className="h-4 bg-muted animate-pulse rounded w-12" />
                    </TableCell>
                    <TableCell>
                      <div className="h-4 bg-muted animate-pulse rounded w-20" />
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        {[1, 2, 3, 4, 5].map((j) => (
                          <div key={j} className="h-8 w-8 bg-muted animate-pulse rounded" />
                        ))}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Filtrer les propriétés selon le terme de recherche
  const filteredProperties = properties.filter(property =>
    property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    property.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
       {/* Bouton Ajouter une propriété - Pleine largeur sur mobile, en haut à droite sur desktop */}
       <div className="w-full md:w-auto md:flex md:justify-end">
         <Button 
           onClick={() => {
             clearPropertyWizardData();
             navigate('/dashboard/add-property');
           }}
           className="w-full md:w-auto bg-green-600 hover:bg-green-700 text-white border border-green-600 hover:border-green-700 px-4 py-2 rounded-md font-medium transition-colors"
         >
           <Plus className="h-4 w-4 mr-2" />
           Ajouter une propriété
         </Button>
       </div>

      {/* Tableau des propriétés */}
      {filteredProperties.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Home className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {searchTerm ? "Aucune propriété trouvée" : "Aucune propriété"}
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm 
                ? "Aucune propriété ne correspond à votre recherche"
                : "Commencez par ajouter votre première propriété"
              }
            </p>
            <Button 
              onClick={() => {
                clearPropertyWizardData();
                navigate('/dashboard/add-property');
              }}
              className="bg-green-600 hover:bg-green-700 text-white border border-green-600 hover:border-green-700 px-4 py-2 rounded-md font-medium transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Ajouter une propriété
            </Button>
          </CardContent>
        </Card>
      ) : (
         <>
         {/* Version Desktop - Card avec encadrement */}
         <Card className="hidden md:block border border-gray-200 shadow-sm">
           <CardHeader className="pb-4">
             <div className="flex justify-between items-center mb-4">
               <div>
                 <CardTitle className="text-lg font-medium">Liste des Propriétés</CardTitle>
                 <CardDescription className="text-sm text-muted-foreground">
                   {filteredProperties.length} propriété{filteredProperties.length !== 1 ? 's' : ''} trouvée{filteredProperties.length !== 1 ? 's' : ''}
                 </CardDescription>
               </div>
             </div>
             
             {/* Barre de recherche - Pleine largeur sur mobile */}
             <div className="flex items-center justify-between mb-4">
               <div className="relative w-full md:w-64">
                 <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                 <input
                   type="text"
                   placeholder="Rechercher..."
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                   className="w-full pl-10 pr-4 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                 />
               </div>
               
             </div>
           </CardHeader>
          <CardContent>
            {/* Version Desktop - Tableau */}
            <div className="hidden md:block border border-gray-200 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <Table className="min-w-[1000px] w-full">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-24 min-w-[100px]">Image</TableHead>
                  <TableHead className="min-w-[150px]">Nom</TableHead>
                  <TableHead className="min-w-[120px]">Type</TableHead>
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

                    {/* Nom */}
                    <TableCell>
                      <div className="font-medium truncate max-w-[150px]" title={property.title}>
                        {property.title}
                      </div>
                    </TableCell>

                    {/* Type */}
                    <TableCell>
                      <div className="text-sm text-muted-foreground">
                        {property.property_type_id 
                          ? propertyTypes[property.property_type_id] || "Type inconnu"
                          : "Non spécifié"
                        }
                      </div>
                    </TableCell>

                    {/* Capacité */}
                    <TableCell>
                      <div className="text-sm">
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-1 text-muted-foreground" />
                          <span>{property.max_guests} invités</span>
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
                          onClick={() => navigate(`/dashboard/edit-property/${property.id}`)}
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
                          onClick={() => navigate(`/property/${property.id}`)}
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
             </div>
           </CardContent>
           
           {/* Légende des statuts - Chaque indication sur une ligne */}
           <div className="px-6 py-4 border-t border-gray-200">
             <div className="space-y-2">
               <div className="flex items-center space-x-2 text-sm">
                 <div className="w-3 h-3 rounded-full bg-green-600"></div>
                 <span className="text-muted-foreground">Publier - Mettre en ligne après paiement</span>
               </div>
               <div className="flex items-center space-x-2 text-sm">
                 <div className="w-3 h-3 rounded-full bg-gradient-to-r from-[#e2c044] to-[#f4d03f]"></div>
                 <span className="text-muted-foreground">En attente - Validation administrateur</span>
               </div>
               <div className="flex items-center space-x-2 text-sm">
                 <div className="w-3 h-3 rounded-full bg-[#bc2d2b]"></div>
                 <span className="text-muted-foreground">Désactiver - Masquer l'annonce</span>
               </div>
               <div className="flex items-center space-x-2 text-sm">
                 <div className="w-3 h-3 rounded-full bg-green-600"></div>
                 <span className="text-muted-foreground">Activer - Afficher l'annonce</span>
               </div>
             </div>
           </div>
         </Card>

         {/* Version Mobile - Sans encadrement */}
         <div className="md:hidden space-y-4">
           {/* En-tête mobile */}
           <div className="space-y-4">
             <div>
               <h2 className="text-lg font-medium">Liste des Propriétés</h2>
               <p className="text-sm text-muted-foreground">
                 {filteredProperties.length} propriété{filteredProperties.length !== 1 ? 's' : ''} trouvée{filteredProperties.length !== 1 ? 's' : ''}
               </p>
             </div>
             
             {/* Barre de recherche - Pleine largeur sur mobile */}
             <div className="relative w-full">
               <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
               <input
                 type="text"
                 placeholder="Rechercher..."
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 className="w-full pl-10 pr-4 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
               />
             </div>
           </div>

           {/* Version Mobile - Cards avec photo en haut */}
           <div className="space-y-3">
               {filteredProperties.map((property) => (
                 <div 
                   key={property.id} 
                   className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                   onClick={() => navigate(`/property/${property.id}`)}
                 >
                   {/* Photo en haut avec boutons superposés */}
                   <div className="relative w-full h-48 bg-muted">
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
                         <Home className={`h-12 w-12 text-muted-foreground ${
                           property.status === 'inactive' ? 'grayscale' : ''
                         }`} />
                       </div>
                     )}
                     
                     {/* Boutons superposés sur l'image */}
                     <div className="absolute top-3 right-3 flex flex-row space-x-2">
                       <button
                         className="h-8 w-8 p-0 border-transparent bg-[#385aa2] text-white rounded-md flex items-center justify-center"
                         title="Modifier"
                         onClick={(e) => {
                           e.stopPropagation();
                           navigate(`/dashboard/edit-property/${property.id}`);
                         }}
                       >
                         <Edit className="h-4 w-4" />
                       </button>
                       <button
                         className="h-8 w-8 p-0 border-transparent bg-[#d54745] text-white rounded-md flex items-center justify-center"
                         title="Supprimer"
                         onClick={(e) => {
                           e.stopPropagation();
                           handleDeleteClick(property);
                         }}
                       >
                         <Trash2 className="h-4 w-4" />
                       </button>
                       <button
                         className="h-8 w-8 p-0 border-transparent bg-[#e2c044] text-white rounded-md flex items-center justify-center"
                         title="Mise en vedette"
                         onClick={(e) => {
                           e.stopPropagation();
                           // Action pour mise en vedette
                         }}
                       >
                         <Star className="h-4 w-4" />
                       </button>
                     </div>

                     {/* Badge de statut - En haut à gauche */}
                     <div className="absolute top-3 left-3">
                       <Badge 
                         variant={property.status === 'active' ? 'default' : 'secondary'}
                         className={`text-xs font-medium ${
                           property.status === 'active' 
                             ? 'bg-green-600 hover:bg-green-600 text-white' 
                             : 'bg-gray-500 hover:bg-gray-500 text-white'
                         }`}
                       >
                         {property.status === 'active' ? 'En ligne' : 'Hors ligne'}
                       </Badge>
                     </div>
                   </div>

                   {/* Contenu de la card */}
                   <div className="p-4 space-y-3">
                     {/* Titre et type */}
                     <div>
                       <h3 className="font-semibold text-lg text-gray-900 truncate" title={property.title}>
                         {property.title}
                       </h3>
                       <p className="text-sm text-gray-600 mt-1">
                         {property.property_type_id 
                           ? propertyTypes[property.property_type_id] || "Type inconnu"
                           : "Non spécifié"
                         }
                       </p>
                     </div>

                     {/* Informations détaillées - 2 aux extrémités, 1 au milieu */}
                     <div className="flex items-center justify-between text-sm text-gray-600">
                       <div className="flex items-center">
                         <Users className="h-4 w-4 mr-1" />
                         <span>{property.max_guests} invités</span>
                       </div>
                       <div className="flex items-center">
                         <Bed className="h-4 w-4 mr-1" />
                         <span>{property.bedrooms} chambres</span>
                       </div>
                       <div className="flex items-center">
                         <Bath className="h-4 w-4 mr-1" />
                         <span>{property.bathrooms} salles de bain</span>
                       </div>
                     </div>

                     {/* Prix */}
                     <div className="flex items-center justify-between">
                       <div className="text-2xl font-bold text-[#32323a]">
                         {property.price_per_night}<sup className="text-sm font-medium">TND</sup><span className="text-sm text-gray-500">/Nuitée</span>
                       </div>
                     </div>

                     {/* Espacement entre prix et bouton */}
                     <div className="h-4"></div>

                     {/* Bouton de statut large */}
                     <div className="w-full" onClick={(e) => e.stopPropagation()}>
                       {getStatusButton(property)}
                     </div>
                   </div>
                 </div>
               ))}
           </div>

           {/* Légende des statuts mobile - Chaque indication sur une ligne */}
           <div className="mt-6 pt-4 border-t border-gray-200">
             <div className="space-y-2">
               <div className="flex items-center space-x-2 text-sm">
                 <div className="w-3 h-3 rounded-full bg-green-600"></div>
                 <span className="text-muted-foreground">Publier - Mettre en ligne après paiement</span>
               </div>
               <div className="flex items-center space-x-2 text-sm">
                 <div className="w-3 h-3 rounded-full bg-gradient-to-r from-[#e2c044] to-[#f4d03f]"></div>
                 <span className="text-muted-foreground">En attente - Validation administrateur</span>
               </div>
               <div className="flex items-center space-x-2 text-sm">
                 <div className="w-3 h-3 rounded-full bg-[#bc2d2b]"></div>
                 <span className="text-muted-foreground">Désactiver - Masquer l'annonce</span>
               </div>
               <div className="flex items-center space-x-2 text-sm">
                 <div className="w-3 h-3 rounded-full bg-green-600"></div>
                 <span className="text-muted-foreground">Activer - Afficher l'annonce</span>
               </div>
             </div>
           </div>
         </div>
         </>
      )}

      {/* Dialog de confirmation pour la désactivation */}
      <AlertDialog open={showDeactivateDialog} onOpenChange={setShowDeactivateDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Désactiver l'annonce</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir désactiver cette annonce ? 
              <br />
              <strong>L'annonce ne sera plus visible par les utilisateurs</strong> et sera masquée de la plateforme.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="hover:bg-transparent hover:text-current hover:border-current">Annuler</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeactivation}
              className="bg-[#bc2d2b] hover:bg-[#a82523] text-white"
            >
              Désactiver
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog de confirmation pour la suppression */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer définitivement</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2">
                <p>Êtes-vous sûr de vouloir supprimer définitivement cette propriété ?</p>
                <br />
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                  <p className="text-sm text-red-800 font-medium">⚠️ Cette action est irréversible</p>
                  <ul className="text-sm text-red-700 mt-2 space-y-1">
                    <li>• La propriété sera supprimée de la base de données</li>
                    <li>• Toutes les photos associées seront supprimées</li>
                  </ul>
                </div>
                {propertyToDelete && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Propriété : <strong>{propertyToDelete.title}</strong>
                  </p>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              className="hover:bg-transparent hover:text-current hover:border-current"
              disabled={isDeleting}
            >
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeletion}
              disabled={isDeleting}
              className="bg-[#bc2d2b] hover:bg-[#a82523] text-white disabled:opacity-50"
            >
              {isDeleting ? "Suppression..." : "Supprimer définitivement"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PropertiesManagement;
