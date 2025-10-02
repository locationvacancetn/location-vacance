import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { usePageTitle } from "@/hooks/usePageTitle";
import { modalService, type Modal } from "@/lib/modalService";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  EyeOff,
  Calendar,
  Users,
  Monitor,
  LogIn,
  Home,
  Image,
  ImageOff,
  Type,
  FileText,
  MousePointer,
  Search,
  Filter,
  X
} from "lucide-react";

// Les types sont maintenant importés du service

const ModalsManagement = () => {
  const { toast } = useToast();
  const { title, description } = usePageTitle();
  const navigate = useNavigate();
  const [modals, setModals] = useState<Modal[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTrigger, setFilterTrigger] = useState<string>("all");
  const [filterTarget, setFilterTarget] = useState<string>("all");
  const [previewModal, setPreviewModal] = useState<Modal | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Options pour les rôles (pour l'affichage)
  const roleOptions = [
    { value: "tenant", label: "Locataire" },
    { value: "owner", label: "Propriétaire" },
    { value: "advertiser", label: "Annonceur" }
  ];

  // Options pour les triggers
  const triggerOptions = [
    { value: "site_entry", label: "Ouverture du site", icon: Home },
    { value: "dashboard_entry", label: "Ouverture dashboard", icon: Monitor }
  ];

  // Charger les modals
  const loadModals = async () => {
    try {
      setLoading(true);
      const { data, error } = await modalService.getAllModals();
      
      if (error) {
        toast({
          title: "Erreur",
          description: error,
          variant: "destructive"
        });
        return;
      }
      
      setModals(data || []);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Erreur inattendue lors du chargement",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadModals();
  }, []);

  // Naviguer vers la page de création
  const handleCreateModal = () => {
    navigate('/dashboard/admin/modals/add');
  };

  // Naviguer vers la page d'édition
  const handleViewModal = (modal: Modal) => {
    setPreviewModal(modal);
    setIsPreviewOpen(true);
  };

  const handleEditModal = (modal: Modal) => {
    navigate(`/dashboard/admin/modals/edit/${modal.id}`);
  };

  // Supprimer un modal
  const handleDeleteModal = async (modalId: string) => {
    try {
      const { success, error } = await modalService.deleteModal(modalId);

      if (!success) {
        toast({
          title: "Erreur",
          description: error || "Impossible de supprimer le modal",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Succès",
        description: "Modal supprimé avec succès"
      });

      loadModals();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Erreur inattendue lors de la suppression",
        variant: "destructive"
      });
    }
  };

  // Basculer le statut actif/inactif
  const handleToggleActive = async (modal: Modal) => {
    try {
      const { success, error } = await modalService.toggleModalStatus(modal.id);

      if (!success) {
        toast({
          title: "Erreur",
          description: error || "Impossible de modifier le statut du modal",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Succès",
        description: `Modal ${!modal.is_active ? 'activé' : 'désactivé'} avec succès`
      });

      loadModals();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Erreur inattendue lors de la modification du statut",
        variant: "destructive"
      });
    }
  };


  // Filtrer les modals
  const filteredModals = modals.filter(modal => {
    const matchesSearch = modal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         modal.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTrigger = filterTrigger === "all" || modal.trigger_type === filterTrigger;
    const matchesTarget = filterTarget === "all" || modal.target_type === filterTarget;
    
    return matchesSearch && matchesTrigger && matchesTarget;
  });

  // Formater la date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Obtenir le badge du trigger
  const getTriggerBadge = (trigger: string) => {
    const option = triggerOptions.find(opt => opt.value === trigger);
    if (!option) return null;
    
    const Icon = option.icon;
    return (
      <Badge variant="outline" className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {option.label}
      </Badge>
    );
  };

  // Obtenir le badge du type de cible
  const getTargetBadge = (targetType: string, targetRoles: string[] | null) => {
    if (targetType === 'anonymous') {
      return <Badge variant="secondary">Anonyme</Badge>;
    }
    
    if (!targetRoles || targetRoles.length === 0) {
      return <Badge variant="default">Tous connectés</Badge>;
    }
    
    return (
      <div className="flex gap-1 flex-wrap">
        {targetRoles.map(role => (
          <Badge key={role} variant="default" className="text-xs">
            {roleOptions.find(opt => opt.value === role)?.label || role}
          </Badge>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-end">
        <Button onClick={handleCreateModal} className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Nouveau Modal
        </Button>
      </div>

      {/* Barre de recherche et filtres */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {/* Recherche */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Rechercher par titre ou contenu"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full"
          />
        </div>

        {/* Filtre par déclencheur */}
        <Select value={filterTrigger} onValueChange={setFilterTrigger}>
          <SelectTrigger className="w-full">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Filtrer par déclencheur" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les déclencheurs</SelectItem>
            {triggerOptions.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Filtre par cible */}
        <Select value={filterTarget} onValueChange={setFilterTarget}>
          <SelectTrigger className="w-full">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Filtrer par cible" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les cibles</SelectItem>
            <SelectItem value="anonymous">Utilisateurs anonymes</SelectItem>
            <SelectItem value="authenticated">Utilisateurs connectés</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Compteur */}
      <div className="mb-4">
        <p className="text-sm text-muted-foreground">
          {filteredModals.length} modal{filteredModals.length > 1 ? "s" : ""}
        </p>
      </div>

      {/* Version Desktop - Tableau */}
      <div className="hidden lg:block">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Chargement des modals...</p>
            </div>
          </div>
        ) : filteredModals.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">
              {searchTerm || filterTrigger !== "all" || filterTarget !== "all"
                ? "Aucun modal trouvé"
                : "Aucun modal"}
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || filterTrigger !== "all" || filterTarget !== "all"
                ? "Essayez de modifier vos critères de recherche ou de filtrage"
                : "Commencez par créer votre premier modal personnalisé"}
            </p>
            {!searchTerm && filterTrigger === "all" && filterTarget === "all" && (
              <Button onClick={handleCreateModal} variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Créer le premier modal
              </Button>
            )}
          </div>
        ) : (
          <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Titre</TableHead>
                    <TableHead>Déclencheur</TableHead>
                    <TableHead>Cible</TableHead>
                    <TableHead>Expiration</TableHead>
                    <TableHead>Créé le</TableHead>
                    <TableHead className="text-right">Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredModals.map((modal) => (
                    <TableRow key={modal.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {/* Image ou icône */}
                        <div className="flex-shrink-0">
                          {modal.has_image && modal.image_url ? (
                            <img 
                              src={modal.image_url} 
                              alt={modal.title}
                              className="w-12 h-12 object-cover rounded-lg"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                              <ImageOff className="h-6 w-6 text-gray-400" />
                            </div>
                          )}
                        </div>
                        
                        {/* Contenu */}
                        <div className="flex-1 min-w-0">
                          <div className="font-medium mb-1">{modal.title}</div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {modal.content}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                      <TableCell>
                        {getTriggerBadge(modal.trigger_type)}
                      </TableCell>
                      <TableCell>
                        {getTargetBadge(modal.target_type, modal.target_roles)}
                      </TableCell>
                      <TableCell>
                        {modal.expires_at ? (
                          <div className="text-sm">
                            <Calendar className="h-4 w-4 inline mr-1" />
                            {formatDate(modal.expires_at)}
                          </div>
                        ) : (
                          <Badge variant="outline">Permanent</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-500">
                          {formatDate(modal.created_at)}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant={modal.is_active ? "default" : "secondary"}>
                          {modal.is_active ? "Actif" : "Inactif"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Switch
                            checked={modal.is_active}
                            onCheckedChange={() => handleToggleActive(modal)}
                            className="scale-90"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewModal(modal)}
                            title="Voir les détails"
                            className="h-8 w-8 p-0 hover:bg-white/10 hover:text-primary hover:border-[hsl(145deg_70.59%_40%)]"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditModal(modal)}
                            className="h-8 w-8 p-0 hover:text-[#385aa2] hover:border-[#385aa2]"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-8 w-8 p-0 hover:text-red-600 hover:border-red-300"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Supprimer le modal</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Êtes-vous sûr de vouloir supprimer le modal "{modal.title}" ? 
                                  Cette action est irréversible.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="hover:bg-[#32323a] hover:text-white hover:border-[#32323a] active:bg-[#32323a] active:text-white active:border-[#32323a]">
                                  Annuler
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteModal(modal.id)}
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
      </div>

      {/* Version Mobile - Cards */}
      <div className="lg:hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Chargement des modals...</p>
            </div>
          </div>
        ) : filteredModals.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">
              {searchTerm || filterTrigger !== "all" || filterTarget !== "all"
                ? "Aucun modal trouvé"
                : "Aucun modal"}
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || filterTrigger !== "all" || filterTarget !== "all"
                ? "Essayez de modifier vos critères de recherche ou de filtrage"
                : "Commencez par créer votre premier modal personnalisé"}
            </p>
            {!searchTerm && filterTrigger === "all" && filterTarget === "all" && (
              <Button onClick={handleCreateModal} variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Créer le premier modal
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredModals.map((modal) => (
              <div key={modal.id} className="p-4 border rounded-lg bg-card">
                <div>
                  {/* Image ou icône */}
                  <div className="mb-4">
                    {modal.has_image && modal.image_url ? (
                      <img 
                        src={modal.image_url} 
                        alt={modal.title}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Monitor className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* En-tête avec titre et statut */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-medium text-sm">{modal.title}</h3>
                    </div>
                    <Badge variant={modal.is_active ? "default" : "secondary"}>
                      {modal.is_active ? 'Actif' : 'Inactif'}
                    </Badge>
                  </div>

                  {/* Contenu */}
                  <div className="text-sm text-muted-foreground mb-8">
                    <p className="line-clamp-2">{modal.content}</p>
                  </div>

                  {/* Déclencheur et Cible */}
                  <div className="flex items-center justify-between mb-8">
                    <div className="text-sm">
                      {getTriggerBadge(modal.trigger_type)}
                    </div>
                    <div className="text-sm">
                      {getTargetBadge(modal.target_type, modal.target_roles)}
                    </div>
                  </div>

                  {/* Expiration et Date de création */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                    <div>
                      {modal.expires_at ? (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Expire: {formatDate(modal.expires_at)}
                        </div>
                      ) : (
                        <span>Permanent</span>
                      )}
                    </div>
                    <div>
                      Créé: {formatDate(modal.created_at)}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">Statut:</span>
                      <Switch
                        checked={modal.is_active}
                        onCheckedChange={() => handleToggleActive(modal)}
                        className="scale-90"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      {/* Bouton Voir */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewModal(modal)}
                        title="Voir les détails"
                        className="h-8 w-8 p-0 hover:bg-white/10 hover:text-primary hover:border-[hsl(145deg_70.59%_40%)]"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>

                      {/* Bouton Modifier */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditModal(modal)}
                        title="Modifier"
                        className="h-8 w-8 p-0 hover:text-[#385aa2] hover:border-[#385aa2]"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>

                      {/* Bouton Supprimer */}
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
                            <AlertDialogTitle>Supprimer le modal</AlertDialogTitle>
                            <AlertDialogDescription>
                              Êtes-vous sûr de vouloir supprimer le modal <strong>"{modal.title}"</strong> ?
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
                              onClick={() => handleDeleteModal(modal.id)}
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

      {/* Modal d'aperçu */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-md p-0 gap-0">
          {previewModal && (
            <div className="relative">
              {/* Image si présente */}
              {previewModal.has_image && previewModal.image_url && (
                <div className="w-full">
                  <img 
                    src={previewModal.image_url} 
                    alt={previewModal.title}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                </div>
              )}
              
              {/* Contenu du modal */}
              <div className="p-6 text-center space-y-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  {previewModal.title}
                </h2>
                
                <p className="text-gray-600 leading-relaxed">
                  {previewModal.content}
                </p>
                
                {/* Boutons */}
                <div className="flex flex-col gap-3 pt-4">
                  {previewModal.has_button && previewModal.button_text ? (
                    // Si il y a un bouton personnalisé, on l'affiche uniquement
                    <Button 
                      variant={previewModal.button_style === 'secondary' ? 'outline' : 'default'}
                      className="w-full"
                      onClick={() => {
                        if (previewModal.button_action) {
                          // Si c'est une URL, l'ouvrir dans un nouvel onglet
                          if (previewModal.button_action.startsWith('http://') || previewModal.button_action.startsWith('https://')) {
                            window.open(previewModal.button_action, '_blank');
                          } 
                          // Si c'est un chemin interne, naviguer
                          else if (previewModal.button_action.startsWith('/')) {
                            navigate(previewModal.button_action);
                            setIsPreviewOpen(false);
                          }
                          // Sinon, afficher un toast avec l'action
                          else {
                            toast({
                              title: "Action du bouton",
                              description: `Action configurée: ${previewModal.button_action}`,
                            });
                          }
                        } else {
                          toast({
                            title: "Aucune action",
                            description: "Ce bouton n'a pas d'action configurée",
                          });
                        }
                      }}
                    >
                      {previewModal.button_text}
                    </Button>
                  ) : (
                    // Si il n'y a pas de bouton personnalisé, on affiche le bouton "Fermer"
                    <Button 
                      variant="outline" 
                      onClick={() => setIsPreviewOpen(false)}
                      className="w-full hover:bg-[#32323a] hover:text-white hover:border-[#32323a] active:bg-[#32323a] active:text-white active:border-[#32323a]"
                    >
                      Fermer
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ModalsManagement;
