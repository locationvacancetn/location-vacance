import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
  X
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

  const getStatusButton = (property: Property) => {
    const statusConfig = {
      pending_payment: {
        text: "Publier",
        variant: "default" as const,
        action: () => handleStatusChange(property.id, "pending_approval")
      },
      pending_approval: {
        text: "En Attente",
        variant: "secondary" as const,
        action: () => {}
      },
      active: {
        text: "Désactiver",
        variant: "destructive" as const,
        action: () => handleStatusChange(property.id, "inactive")
      },
      inactive: {
        text: "Activer",
        variant: "default" as const,
        action: () => handleStatusChange(property.id, "active")
      }
    };

    const config = statusConfig[property.status as keyof typeof statusConfig];
    
    return (
      <Button
        onClick={config.action}
        variant={config.variant}
        size="sm"
        disabled={property.status === "pending_approval"}
        className={`w-24 px-3 py-1.5 rounded-md font-medium transition-colors ${
          property.status === "pending_payment" 
            ? "bg-green-600 hover:bg-green-700 text-white border border-green-600 hover:border-green-700" 
            : property.status === "pending_approval"
            ? "bg-gradient-to-r from-[#e2c044] to-[#f4d03f] text-white border border-[#e2c044] cursor-not-allowed shadow-lg shadow-[#e2c044]/30 hover:shadow-xl hover:shadow-[#e2c044]/40 transform hover:scale-105"
            : property.status === "active"
            ? "bg-[#bc2d2b] hover:bg-[#a82523] text-white border border-[#bc2d2b] hover:border-[#a82523]"
            : "bg-green-600 hover:bg-green-700 text-white border border-green-600 hover:border-green-700"
        }`}
      >
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
                  <TableHead className="w-16">Image</TableHead>
                  <TableHead>Nom</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Capacité</TableHead>
                  <TableHead>Chambres</TableHead>
                  <TableHead>Salles de bain</TableHead>
                  <TableHead>Prix</TableHead>
                  <TableHead className="w-40">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[1, 2, 3].map((i) => (
                  <TableRow key={i}>
                     <TableCell>
                       <div className="w-12 h-12 bg-muted animate-pulse rounded-lg" />
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
       {/* Bouton Ajouter une propriété */}
       <div className="flex justify-end">
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
         <Card className="border border-gray-200 shadow-sm">
           <CardHeader className="pb-4">
             <div className="flex justify-between items-center mb-4">
               <div>
                 <CardTitle className="text-lg font-medium">Liste des Propriétés</CardTitle>
                 <CardDescription className="text-sm text-muted-foreground">
                   {filteredProperties.length} propriété{filteredProperties.length !== 1 ? 's' : ''} trouvée{filteredProperties.length !== 1 ? 's' : ''}
                 </CardDescription>
               </div>
             </div>
             
             {/* Barre de recherche */}
             <div className="flex items-center justify-between mb-4">
               <div className="relative">
                 <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                 <input
                   type="text"
                   placeholder="Rechercher..."
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                   className="pl-10 pr-4 py-2 border border-input rounded-md w-64 focus:outline-none focus:ring-2 focus:ring-ring"
                 />
               </div>
               
             </div>
           </CardHeader>
          <CardContent>
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Image</TableHead>
                  <TableHead>Nom</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Capacité</TableHead>
                  <TableHead>Chambres</TableHead>
                  <TableHead>Salles de bain</TableHead>
                  <TableHead>Prix</TableHead>
                  <TableHead className="w-40">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProperties.map((property) => (
                  <TableRow key={property.id}>
                     {/* Image */}
                     <TableCell>
                       <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted">
                         {property.images && property.images.length > 0 ? (
                           <img
                             src={property.images[0]}
                             alt={property.title}
                             className="w-full h-full object-cover"
                           />
                         ) : (
                           <div className="w-full h-full flex items-center justify-center">
                             <Home className="h-6 w-6 text-muted-foreground" />
                           </div>
                         )}
                       </div>
                     </TableCell>

                    {/* Nom */}
                    <TableCell>
                      <div className="font-medium">{property.title}</div>
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
           </CardContent>
           
           {/* Légende des statuts */}
           <div className="px-6 py-4 border-t border-gray-200">
             <div className="space-y-3">
               {/* Première ligne */}
               <div className="flex items-center justify-center space-x-8 text-sm">
                 <div className="flex items-center space-x-2">
                   <div className="w-3 h-3 rounded-full bg-green-600"></div>
                   <span className="text-muted-foreground">Publier - Mettre en ligne après paiement</span>
                 </div>
                 <div className="flex items-center space-x-2">
                   <div className="w-3 h-3 rounded-full bg-gradient-to-r from-[#e2c044] to-[#f4d03f]"></div>
                   <span className="text-muted-foreground">En attente - Validation administrateur</span>
                 </div>
               </div>
               
               {/* Deuxième ligne */}
               <div className="flex items-center justify-center space-x-8 text-sm">
                 <div className="flex items-center space-x-2">
                   <div className="w-3 h-3 rounded-full bg-[#bc2d2b]"></div>
                   <span className="text-muted-foreground">Désactiver - Masquer l'annonce</span>
                 </div>
                 <div className="flex items-center space-x-2">
                   <div className="w-3 h-3 rounded-full bg-green-600"></div>
                   <span className="text-muted-foreground">Activer - Afficher l'annonce</span>
                 </div>
               </div>
             </div>
           </div>
         </Card>
      )}
    </div>
  );
};

export default PropertiesManagement;
