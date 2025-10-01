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
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { usePageTitle } from "@/hooks/usePageTitle";
import { Tables } from "@/integrations/supabase/types";
import { AdvertisementService } from "@/lib/advertisementService";
import { 
  Megaphone, 
  Plus,
  Edit, 
  Trash2, 
  Search, 
  Filter,
  Eye,
  Play,
  Pause,
  BarChart3,
  Calendar,
  DollarSign,
  Target,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  X,
  ExternalLink,
  Upload,
  EyeOff
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

type Advertisement = Tables<'advertisements'>;

const AdvertisementsManagement = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { setPageTitle, setPageDescription } = usePageTitle();
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [selectedAd, setSelectedAd] = useState<Advertisement | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [adToDelete, setAdToDelete] = useState<Advertisement | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Charger les publicités
  const loadAdvertisements = async () => {
    try {
      setLoading(true);
      
      if (!user?.id) return;

      const { data, error } = await supabase
        .from('advertisements')
        .select('*')
        .eq('advertiser_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setAdvertisements(data || []);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les publicités",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdvertisements();
  }, [user?.id]);

  // Définir le titre de la page
  useEffect(() => {
    setPageTitle("Mes Publicités");
    setPageDescription("Gérez vos campagnes publicitaires et leurs performances");
  }, [setPageTitle, setPageDescription]);

  // Filtrer les publicités
  const filteredAdvertisements = advertisements.filter(ad => {
    const matchesSearch = 
      ad.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ad.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || ad.status === statusFilter;
    const matchesType = typeFilter === "all" || ad.ad_type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  // Ouvrir le modal de visualisation
  const openViewModal = (ad: Advertisement) => {
    setSelectedAd(ad);
    setIsViewModalOpen(true);
  };

  // Changer le statut d'une publicité
  const handleStatusChange = async (adId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('advertisements')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', adId);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Statut de la publicité mis à jour"
      });
      loadAdvertisements();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de modifier le statut",
        variant: "destructive"
      });
    }
  };

  // Gérer le clic sur supprimer
  const handleDeleteClick = (ad: Advertisement) => {
    setAdToDelete(ad);
    setShowDeleteDialog(true);
  };

  // Confirmer la suppression
  const confirmDeletion = async () => {
    if (!adToDelete) return;

    try {
      setIsDeleting(true);

      // Utiliser la méthode centralisée du service
      await AdvertisementService.deleteAdvertisement(adToDelete.id);

      // Mettre à jour l'état local
      setAdvertisements(prev => prev.filter(ad => ad.id !== adToDelete.id));

      toast({
        title: "Succès",
        description: "Publicité supprimée avec succès"
      });

    } catch (error: any) {
      console.error("Erreur lors de la suppression:", error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de supprimer la publicité",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
      setAdToDelete(null);
    }
  };

  // Obtenir le badge de statut
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500"><Play className="w-3 h-3 mr-1" />Actif</Badge>;
      case 'paused':
        return <Badge variant="secondary"><Pause className="w-3 h-3 mr-1" />En pause</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500"><Clock className="w-3 h-3 mr-1" />En attente</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Rejeté</Badge>;
      case 'completed':
        return <Badge className="bg-blue-500"><CheckCircle className="w-3 h-3 mr-1" />Terminé</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Obtenir le bouton de statut pour les publicités
  const getStatusButton = (ad: Advertisement) => {
    const statusConfig = {
      pending: {
        text: "Publier",
        icon: Upload,
        action: () => handleStatusChange(ad.id, "active")
      },
      active: {
        text: "Désactiver",
        icon: EyeOff,
        action: () => handleStatusChange(ad.id, "paused")
      },
      paused: {
        text: "Activer",
        icon: CheckCircle,
        action: () => handleStatusChange(ad.id, "active")
      },
      rejected: {
        text: "Rejeté",
        icon: XCircle,
        action: () => {}
      }
    };

    const config = statusConfig[ad.status as keyof typeof statusConfig];
    if (!config) return null;
    
    const IconComponent = config.icon;
    
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={(e) => {
          e.stopPropagation();
          config.action();
        }}
        className={`w-full md:w-32 px-3 py-2 rounded-md font-medium ${
          ad.status === "pending" 
            ? "bg-transparent hover:bg-green-600 text-green-600 hover:text-white border border-green-600 hover:border-green-600 transition-colors duration-200" 
            : ad.status === "active"
            ? "bg-transparent hover:bg-[#bc2d2b] text-[#bc2d2b] hover:text-white border border-[#bc2d2b] hover:border-[#bc2d2b] transition-colors duration-200"
            : ad.status === "paused"
            ? "bg-transparent hover:bg-green-600 text-green-600 hover:text-white border border-green-600 hover:border-green-600 transition-colors duration-200"
            : "bg-transparent text-gray-500 border border-gray-300 cursor-not-allowed"
        }`}
      >
        <IconComponent className="h-4 w-4 mr-2" />
        {config.text}
      </Button>
    );
  };

  // Obtenir le badge de type
  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'B2B':
        return <Badge variant="outline"><Target className="w-3 h-3 mr-1" />B2B</Badge>;
      case 'B2C':
        return <Badge variant="outline"><Megaphone className="w-3 h-3 mr-1" />B2C</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  // Calculer les statistiques
  const stats = {
    total: advertisements.length,
    active: advertisements.filter(ad => ad.status === 'active').length,
    pending: advertisements.filter(ad => ad.status === 'pending').length,
    paused: advertisements.filter(ad => ad.status === 'paused').length
  };

  if (loading) {
    return (
      <div className="space-y-6">
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
       {/* Bouton Ajouter une publicité - Pleine largeur sur mobile, en haut à droite sur desktop */}
       <div className="w-full md:w-auto md:flex md:justify-end">
         <Link to="/dashboard/advertiser/add-advertisement">
           <Button className="w-full md:w-auto bg-green-600 hover:bg-green-700 text-white border border-green-600 hover:border-green-700 px-4 py-2 rounded-md font-medium transition-colors">
             <Plus className="h-4 w-4 mr-2" />
             Ajouter une publicité
           </Button>
         </Link>
       </div>

      {/* Tableau des publicités */}
      {filteredAdvertisements.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Megaphone className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {searchTerm ? "Aucune publicité trouvée" : "Aucune publicité"}
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm 
                ? "Aucune publicité ne correspond à votre recherche"
                : "Commencez par ajouter votre première publicité"
              }
            </p>
            <Link to="/dashboard/advertiser/add-advertisement">
              <Button className="bg-green-600 hover:bg-green-700 text-white border border-green-600 hover:border-green-700 px-4 py-2 rounded-md font-medium transition-colors">
                <Plus className="h-4 w-4 mr-2" />
                Ajouter une publicité
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
         <>
         {/* Version Desktop - Card avec encadrement */}
         <Card className="hidden md:block border border-gray-200 shadow-sm">
           <CardHeader className="pb-4">
             {/* Barre de recherche - Élargie */}
             <div className="flex items-center justify-between mb-4">
               <div className="relative w-full md:w-96">
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
                  <TableHead className="min-w-[200px]">Titre</TableHead>
                  <TableHead className="min-w-[120px]">Type</TableHead>
                  <TableHead className="min-w-[120px]">Statut</TableHead>
                  <TableHead className="min-w-[100px]">Date création</TableHead>
                  <TableHead className="w-48 min-w-[200px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAdvertisements.map((ad) => (
                  <TableRow key={ad.id}>
                     {/* Image */}
                     <TableCell>
                       <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted">
                         {ad.image_url ? (
                           <img
                             src={ad.image_url}
                             alt={ad.title}
                             className="w-full h-full object-cover"
                           />
                         ) : (
                           <div className="w-full h-full flex items-center justify-center">
                             <Megaphone className="h-8 w-8 text-muted-foreground" />
                           </div>
                         )}
                       </div>
                     </TableCell>

                    {/* Titre et Description */}
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium truncate max-w-[200px]" title={ad.title}>
                          {ad.title}
                        </div>
                        <div className="text-sm text-muted-foreground truncate max-w-[200px]" title={ad.description}>
                          {ad.description}
                        </div>
                      </div>
                    </TableCell>

                    {/* Type */}
                    <TableCell>
                      <div className="text-sm text-muted-foreground">
                        {ad.ad_type === 'B2C' ? 'B to C' : 'B to B'}
                      </div>
                    </TableCell>

                    {/* Statut */}
                    <TableCell>
                      {getStatusBadge(ad.status)}
                    </TableCell>

                    {/* Date création */}
                    <TableCell>
                      <div className="text-sm text-muted-foreground">
                        {ad.created_at ? new Date(ad.created_at).toLocaleDateString('fr-FR') : 'N/A'}
                      </div>
                    </TableCell>

                    {/* Actions */}
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0 border border-[#385aa2] hover:border-[#385aa2] bg-transparent hover:bg-[#385aa2] text-[#385aa2] hover:text-white transition-colors"
                          onClick={() => navigate(`/dashboard/advertiser/edit-advertisement/${ad.id}`)}
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
                            handleDeleteClick(ad);
                          }}
                          title="Supprimer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0 border border-[#387e64] hover:border-[#387e64] bg-transparent hover:bg-[#387e64] text-[#387e64] hover:text-white transition-colors"
                          onClick={() => openViewModal(ad)}
                          title="Voir"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <div onClick={(e) => e.stopPropagation()}>
                          {getStatusButton(ad)}
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
              </div>
            </div>

            {/* Légende des statuts desktop */}
            <div className="hidden md:block mt-6 pt-4 border-t border-gray-200">
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
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Version Mobile - Cards empilées */}
        <div className="md:hidden space-y-4">
          {filteredAdvertisements.map((ad) => (
            <Card key={ad.id} className="border border-gray-200 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-start space-x-4">
                  {/* Image */}
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                    {ad.image_url ? (
                      <img
                        src={ad.image_url}
                        alt={ad.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Megaphone className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  {/* Contenu */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm truncate" title={ad.title}>
                          {ad.title}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {ad.description}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs text-muted-foreground">
                            {ad.ad_type === 'B2C' ? 'B to C' : 'B to B'}
                          </span>
                          <span className="text-xs text-muted-foreground">•</span>
                          <span className="text-xs text-muted-foreground">
                            {ad.created_at ? new Date(ad.created_at).toLocaleDateString('fr-FR') : 'N/A'}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1 ml-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 w-7 p-0 border border-[#385aa2] hover:border-[#385aa2] bg-transparent hover:bg-[#385aa2] text-[#385aa2] hover:text-white transition-colors"
                          onClick={() => navigate(`/dashboard/advertiser/edit-advertisement/${ad.id}`)}
                          title="Modifier"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 w-7 p-0 border border-[#d54745] hover:border-[#d54745] bg-transparent hover:bg-[#d54745] text-[#d54745] hover:text-white transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClick(ad);
                          }}
                          title="Supprimer"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 w-7 p-0 border border-[#387e64] hover:border-[#387e64] bg-transparent hover:bg-[#387e64] text-[#387e64] hover:text-white transition-colors"
                          onClick={() => openViewModal(ad)}
                          title="Voir"
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    <div className="h-4"></div>

                    {/* Bouton de statut large */}
                    <div className="w-full" onClick={(e) => e.stopPropagation()}>
                      {getStatusButton(ad)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

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
            </div>
          </div>
        </div>
        </>
      )}

      {/* Modal de visualisation des détails */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Megaphone className="w-5 h-5" />
              Détails de la publicité
            </DialogTitle>
            <DialogDescription>
              Aperçu complet de votre publicité
            </DialogDescription>
          </DialogHeader>
          
          {selectedAd && (
            <div className="space-y-6">
              {/* Image de la publicité */}
              {selectedAd.image_url && (
                <div className="w-full h-48 bg-muted rounded-lg overflow-hidden">
                  <img
                    src={selectedAd.image_url}
                    alt={selectedAd.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent) {
                        parent.innerHTML = '<div class="w-full h-full flex items-center justify-center"><svg class="w-12 h-12 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"></path></svg></div>';
                      }
                    }}
                  />
                </div>
              )}
              
              {/* Informations de la publicité */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold">{selectedAd.title}</h3>
                  <p className="text-muted-foreground mt-1">{selectedAd.description}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Type</Label>
                    <div className="mt-1">
                      {getTypeBadge(selectedAd.ad_type)}
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">Statut</Label>
                    <div className="mt-1">
                      {getStatusBadge(selectedAd.status)}
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">Lien de destination</Label>
                    <div className="mt-1">
                      <a 
                        href={selectedAd.link_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline text-sm break-all"
                      >
                        {selectedAd.link_url}
                      </a>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">Date de création</Label>
                    <div className="mt-1 text-sm text-muted-foreground">
                      {selectedAd.created_at ? new Date(selectedAd.created_at).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      }) : 'N/A'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmation pour la suppression */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer définitivement</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer définitivement cette publicité ?
              {adToDelete && (
                <span className="block mt-2 text-sm text-muted-foreground">
                  Publicité : <strong>{adToDelete.title}</strong>
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              className="hover:bg-[#32323a] hover:text-white hover:border-[#32323a] active:bg-[#32323a] active:text-white active:border-[#32323a]"
              disabled={isDeleting}
            >
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeletion}
              disabled={isDeleting}
              className="bg-[#bc2d2b] hover:bg-[#a82523] text-white disabled:opacity-50"
            >
              {isDeleting ? "Suppression..." : "Supprimer"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdvertisementsManagement;
