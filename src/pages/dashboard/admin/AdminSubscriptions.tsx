import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Plus, Edit, Eye, Trash2, Search, Filter } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { getAllSubscriptionPlans } from "@/lib/subscriptionService";
import { supabase } from "@/integrations/supabase/client";

interface SubscriptionPlan {
  id: string;
  name: string;
  slug: string;
  price: number;
  price_promo: number | null;
  duration_days: number;
  grace_period_months: number;
  badge: string | null;
  is_active: boolean;
  sort_order: number;
  product_id: string;
  created_at?: string;
  updated_at?: string;
  product: {
    id: string;
    name: string;
    slug: string;
    target_role: string;
    created_at?: string;
    updated_at?: string;
  };
  limitations: Array<{
    id: string;
    plan_id: string;
    limitation_key: string;
    limitation_value: string;
    created_at?: string;
  }>;
  features: Array<{
    id: string;
    plan_id: string;
    feature_type: string;
    feature_text: string;
    sort_order: number;
    created_at?: string;
  }>;
}

const AdminSubscriptions = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [plans, setPlans] = useState<any[]>([]);
  const [filteredPlans, setFilteredPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [typeFilter, setTypeFilter] = useState<"all" | "annonce-listing" | "featured-listing" | "advertisement">("all");

  useEffect(() => {
    loadPlans();
  }, []);

  // Filtrer les plans
  useEffect(() => {
    let filtered = plans;

    // Filtre par recherche
    if (searchTerm) {
      filtered = filtered.filter(
        (plan) =>
          plan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          plan.product.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtre par type
    if (typeFilter !== "all") {
      filtered = filtered.filter((plan) => plan.product.slug === typeFilter);
    }

    // Filtre par statut
    if (statusFilter !== "all") {
      filtered = filtered.filter((plan) =>
        statusFilter === "active" ? plan.is_active : !plan.is_active
      );
    }

    setFilteredPlans(filtered);
  }, [plans, searchTerm, statusFilter, typeFilter]);

  const loadPlans = async () => {
    setLoading(true);
    try {
      const result = await getAllSubscriptionPlans();
      if (result.success) {
        setPlans((result.plans as any) || []);
        setFilteredPlans((result.plans as any) || []);
      } else {
        toast({
          title: "Erreur",
          description: result.error || "Erreur lors du chargement des plans",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors du chargement des plans",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubscription = () => {
    navigate("/dashboard/admin/subscriptions/add");
  };

  const handleDeletePlan = async (planId: string, planName: string) => {
    try {
      console.log("🗑️ Suppression du plan:", planName, "ID:", planId);

      // 1. Supprimer les fonctionnalités liées
      const { error: featuresError } = await (supabase as any)
        .from("subscription_plan_features")
        .delete()
        .eq("plan_id", planId);

      if (featuresError) {
        console.error("❌ Erreur lors de la suppression des fonctionnalités:", featuresError);
        throw new Error("Erreur lors de la suppression des fonctionnalités");
      }

      // 2. Supprimer les limitations liées
      const { error: limitationsError } = await (supabase as any)
        .from("subscription_plan_limitations")
        .delete()
        .eq("plan_id", planId);

      if (limitationsError) {
        console.error("❌ Erreur lors de la suppression des limitations:", limitationsError);
        throw new Error("Erreur lors de la suppression des limitations");
      }

      // 3. Supprimer le plan principal
      const { error: planError } = await (supabase as any)
        .from("subscription_plans")
        .delete()
        .eq("id", planId);

      if (planError) {
        console.error("❌ Erreur lors de la suppression du plan:", planError);
        throw new Error("Erreur lors de la suppression du plan");
      }

      console.log("✅ Plan supprimé avec succès");

      toast({
        title: "Succès",
        description: `Le plan "${planName}" a été supprimé avec succès`,
      });

      // Recharger la liste
      await loadPlans();
    } catch (error: any) {
      console.error("❌ Erreur lors de la suppression:", error);
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors de la suppression du plan",
        variant: "destructive",
      });
    }
  };

  const togglePlanStatus = async (planId: string, currentStatus: boolean) => {
    try {
      const { error } = await (supabase as any)
        .from("subscription_plans")
        .update({ is_active: !currentStatus })
        .eq("id", planId);

      if (error) throw error;

      toast({
        title: "Succès",
        description: `Le plan a été ${!currentStatus ? "activé" : "désactivé"} avec succès`,
      });

      loadPlans();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors de la modification du statut",
        variant: "destructive",
      });
    }
  };


  const getBadgeColor = (badge: string | null) => {
    if (!badge) return "";
    switch (badge.toLowerCase()) {
      case "promo":
        return "bg-red-500 text-white";
      case "populaire":
        return "bg-green-500 text-white";
      case "reduction":
        return "bg-orange-500 text-white";
      case "special":
        return "bg-blue-500 text-white";
      case "nouveau":
        return "bg-purple-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const getProductTypeLabel = (slug: string) => {
    switch (slug) {
      case "annonce-listing":
        return "Mise en ligne d'annonce";
      case "featured-listing":
        return "Mise en vedette";
      case "advertisement":
        return "Publicité";
      default:
        return slug;
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-end">
        <Button onClick={handleAddSubscription} className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Ajouter un abonnement
        </Button>
      </div>
          {/* Barre de recherche et filtres */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            {/* Recherche */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Rechercher par nom d'abonnement"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full"
              />
            </div>

            {/* Filtre par type */}
            <Select value={typeFilter} onValueChange={(value: any) => setTypeFilter(value)}>
              <SelectTrigger className="w-full">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filtrer par type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                <SelectItem value="annonce-listing">Mise en ligne d'annonce</SelectItem>
                <SelectItem value="featured-listing">Mise en vedette</SelectItem>
                <SelectItem value="advertisement">Publicité</SelectItem>
              </SelectContent>
            </Select>

            {/* Filtre par statut */}
            <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
              <SelectTrigger className="w-full">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filtrer par statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les abonnements</SelectItem>
                <SelectItem value="active">Actifs uniquement</SelectItem>
                <SelectItem value="inactive">Inactifs uniquement</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Compteur */}
          <div className="mb-4">
            <p className="text-sm text-muted-foreground">
              {filteredPlans.length} abonnement{filteredPlans.length > 1 ? "s" : ""}
            </p>
          </div>

          {/* Version Desktop - Tableau */}
          <div className="hidden lg:block">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Chargement des abonnements...</p>
                </div>
              </div>
            ) : filteredPlans.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Plus className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  {searchTerm || statusFilter !== "all" || typeFilter !== "all"
                    ? "Aucun abonnement trouvé"
                    : "Aucun abonnement"}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm || statusFilter !== "all" || typeFilter !== "all"
                    ? "Essayez de modifier vos critères de recherche ou de filtrage"
                    : "Commencez par créer votre premier plan d'abonnement"}
                </p>
                {!searchTerm && statusFilter === "all" && typeFilter === "all" && (
                  <Button onClick={handleAddSubscription} variant="outline">
                    <Plus className="w-4 h-4 mr-2" />
                    Créer le premier abonnement
                  </Button>
                )}
              </div>
            ) : (
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nom</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Badge</TableHead>
                      <TableHead>Durée</TableHead>
                      <TableHead className="text-right">Prix (TND)</TableHead>
                      <TableHead className="text-center">Statut</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPlans.map((plan) => (
                      <TableRow key={plan.id}>
                        {/* Nom */}
                        <TableCell className="font-medium">{plan.name}</TableCell>

                        {/* Type */}
                        <TableCell>
                          <span className="text-sm text-muted-foreground">
                            {getProductTypeLabel(plan.product.slug)}
                          </span>
                        </TableCell>

                        {/* Badge */}
                        <TableCell>
                          {plan.badge ? (
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getBadgeColor(plan.badge)}`}>
                              {plan.badge}
                            </span>
                          ) : (
                            <span className="text-sm text-muted-foreground">-</span>
                          )}
                        </TableCell>

                        {/* Durée */}
                        <TableCell>
                          <span className="text-sm">
                            {plan.duration_days} jour{plan.duration_days > 1 ? "s" : ""}
                          </span>
                        </TableCell>

                        {/* Prix */}
                        <TableCell className="text-right">
                          <div className="flex flex-col items-end">
                            {plan.price_promo && (
                              <span className="text-xs text-muted-foreground line-through">
                                {plan.price_promo} TND
                              </span>
                            )}
                            <span className="font-semibold">{plan.price} TND</span>
                          </div>
                        </TableCell>

                        {/* Statut */}
                        <TableCell className="text-center">
                          <Badge variant={plan.is_active ? "default" : "secondary"} className="text-xs">
                            {plan.is_active ? "Actif" : "Inactif"}
                          </Badge>
                        </TableCell>

                        {/* Actions */}
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end space-x-2">
                            {/* Toggle Switch */}
                            <Switch
                              checked={plan.is_active}
                              onCheckedChange={() => togglePlanStatus(plan.id, plan.is_active)}
                              className="scale-90"
                            />

                            {/* Bouton Voir */}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                toast({
                                  title: "En développement",
                                  description: "La page de détails sera bientôt disponible",
                                });
                              }}
                              title="Voir les détails"
                              className="h-8 w-8 p-0"
                            >
                              <Eye className="h-4 w-4" />
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
                                  <AlertDialogTitle>Supprimer le plan d'abonnement</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Êtes-vous sûr de vouloir supprimer le plan <strong>"{plan.name}"</strong> ?
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
                                    onClick={async () => {
                                      await handleDeletePlan(plan.id, plan.name);
                                    }}
                                    className="bg-[#bc2d2b] hover:bg-[#a82523] text-white"
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Supprimer
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>

                            {/* Bouton Modifier */}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate(`/dashboard/admin/subscriptions/edit/${plan.id}`)}
                              title="Modifier"
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
            )}
          </div>

          {/* Version Mobile - Cards */}
          <div className="lg:hidden">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Chargement des abonnements...</p>
                </div>
              </div>
            ) : filteredPlans.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Plus className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  {searchTerm || statusFilter !== "all" || typeFilter !== "all"
                    ? "Aucun abonnement trouvé"
                    : "Aucun abonnement"}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm || statusFilter !== "all" || typeFilter !== "all"
                    ? "Essayez de modifier vos critères de recherche ou de filtrage"
                    : "Commencez par créer votre premier plan d'abonnement"}
                </p>
                {!searchTerm && statusFilter === "all" && typeFilter === "all" && (
                  <Button onClick={handleAddSubscription} variant="outline">
                    <Plus className="w-4 h-4 mr-2" />
                    Créer le premier abonnement
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredPlans.map((plan) => (
                  <div key={plan.id} className="p-4 border rounded-lg bg-card">
                    <div className="space-y-3">
                      {/* En-tête avec nom et statut */}
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-medium text-sm">{plan.name}</h3>
                        </div>
                        <Badge variant={plan.is_active ? "default" : "secondary"}>
                          {plan.is_active ? 'Actif' : 'Inactif'}
                        </Badge>
                      </div>

                      {/* Type et Badge sur la même ligne */}
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          {getProductTypeLabel(plan.product.slug)}
                        </span>
                        {plan.badge && (
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getBadgeColor(plan.badge)}`}>
                            {plan.badge}
                          </span>
                        )}
                      </div>

                      {/* Durée et Prix */}
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          Durée: {plan.duration_days} jour{plan.duration_days > 1 ? "s" : ""}
                        </span>
                        <div className="text-right">
                          {plan.price_promo && (
                            <div className="text-xs text-muted-foreground line-through">
                              {plan.price_promo} TND
                            </div>
                          )}
                          <div className="font-semibold text-sm">{plan.price} TND</div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-between pt-2 border-t">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">Statut:</span>
                          <Switch
                            checked={plan.is_active}
                            onCheckedChange={() => togglePlanStatus(plan.id, plan.is_active)}
                            className="scale-90"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          {/* Bouton Voir */}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              toast({
                                title: "En développement",
                                description: "La page de détails sera bientôt disponible",
                              });
                            }}
                            title="Voir les détails"
                            className="h-8 w-8 p-0"
                          >
                            <Eye className="h-4 w-4" />
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
                                <AlertDialogTitle>Supprimer le plan d'abonnement</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Êtes-vous sûr de vouloir supprimer le plan <strong>"{plan.name}"</strong> ?
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
                                  onClick={async () => {
                                    await handleDeletePlan(plan.id, plan.name);
                                  }}
                                  className="bg-[#bc2d2b] hover:bg-[#a82523] text-white"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Supprimer
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>

                          {/* Bouton Modifier */}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/dashboard/admin/subscriptions/edit/${plan.id}`)}
                            title="Modifier"
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
            )}
          </div>
    </div>
  );
};

export default AdminSubscriptions;
