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
import { Tables } from "@/integrations/supabase/types";
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
  AlertTriangle
} from "lucide-react";
import { Link } from "react-router-dom";

type Advertisement = Tables<'advertisements'>;

const AdvertisementsManagement = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

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

  // Filtrer les publicités
  const filteredAdvertisements = advertisements.filter(ad => {
    const matchesSearch = 
      ad.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ad.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || ad.status === statusFilter;
    const matchesType = typeFilter === "all" || ad.ad_type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

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

  // Supprimer une publicité
  const handleDelete = async (adId: string) => {
    try {
      const { error } = await supabase
        .from('advertisements')
        .delete()
        .eq('id', adId);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Publicité supprimée avec succès"
      });
      loadAdvertisements();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de supprimer la publicité",
        variant: "destructive"
      });
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
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Mes Publicités</h1>
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
          <h1 className="text-3xl font-bold">Mes Publicités</h1>
          <p className="text-muted-foreground">
            Gérez vos campagnes publicitaires
          </p>
        </div>
        <Link to="/dashboard/advertiser/add-advertisement">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Créer une publicité
          </Button>
        </Link>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Play className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{stats.active}</p>
                <p className="text-sm text-muted-foreground">Actives</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold">{stats.pending}</p>
                <p className="text-sm text-muted-foreground">En attente</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Pause className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-2xl font-bold">{stats.paused}</p>
                <p className="text-sm text-muted-foreground">En pause</p>
              </div>
            </div>
          </CardContent>
        </Card>
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Rechercher</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Titre ou description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Statut</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Tous les statuts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="active">Actif</SelectItem>
                  <SelectItem value="pending">En attente</SelectItem>
                  <SelectItem value="paused">En pause</SelectItem>
                  <SelectItem value="rejected">Rejeté</SelectItem>
                  <SelectItem value="completed">Terminé</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Tous les types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les types</SelectItem>
                  <SelectItem value="banner">Bannière</SelectItem>
                  <SelectItem value="sponsored">Sponsorisé</SelectItem>
                  <SelectItem value="featured">Vedette</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Liste des publicités */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Megaphone className="w-5 h-5" />
            Publicités ({filteredAdvertisements.length})
          </CardTitle>
          <CardDescription>
            Liste de vos campagnes publicitaires
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredAdvertisements.length === 0 ? (
            <div className="text-center py-8">
              <Megaphone className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Aucune publicité trouvée</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || statusFilter !== "all" || typeFilter !== "all"
                  ? "Aucune publicité ne correspond à vos critères de recherche."
                  : "Commencez par créer votre première publicité."
                }
              </p>
              {!searchTerm && statusFilter === "all" && typeFilter === "all" && (
                <Link to="/dashboard/advertiser/add-advertisement">
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Créer une publicité
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Publicité</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Lien</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Performances</TableHead>
                    <TableHead>Date création</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAdvertisements.map((ad) => (
                    <TableRow key={ad.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                            <Megaphone className="w-6 h-6 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="font-medium">{ad.title}</p>
                            <p className="text-sm text-muted-foreground truncate max-w-xs">
                              {ad.description}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getTypeBadge(ad.ad_type)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <a 
                            href={ad.link_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 underline truncate max-w-xs"
                          >
                            {ad.link_url}
                          </a>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(ad.status)}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm space-y-1">
                          <div className="flex items-center gap-1">
                            <Eye className="w-3 h-3 text-muted-foreground" />
                            <span>0 vues</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Target className="w-3 h-3 text-muted-foreground" />
                            <span>0 clics</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-muted-foreground" />
                          <span className="text-sm">
                            {ad.created_at ? new Date(ad.created_at).toLocaleDateString('fr-FR') : 'N/A'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm">
                            <BarChart3 className="w-4 h-4" />
                          </Button>
                          {ad.status === 'active' ? (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleStatusChange(ad.id, 'paused')}
                            >
                              <Pause className="w-4 h-4" />
                            </Button>
                          ) : ad.status === 'paused' ? (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleStatusChange(ad.id, 'active')}
                            >
                              <Play className="w-4 h-4" />
                            </Button>
                          ) : null}
                          <Link to={`/dashboard/advertiser/edit-advertisement/${ad.id}`}>
                            <Button variant="outline" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                          </Link>
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
                                  Êtes-vous sûr de vouloir supprimer la publicité "{ad.title}" ? 
                                  Cette action est irréversible et supprimera toutes les données associées.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="hover:bg-[#32323a] hover:text-white hover:border-[#32323a] active:bg-[#32323a] active:text-white active:border-[#32323a]">Annuler</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(ad.id)}
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
    </div>
  );
};

export default AdvertisementsManagement;
