import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
  product: {
    name: string;
    slug: string;
    target_role: string;
  };
  limitations: Array<{
    limitation_key: string;
    limitation_value: string;
  }>;
  features: Array<{
    feature_type: string;
    feature_text: string;
    sort_order: number;
  }>;
}

const AdminSubscriptions = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [filteredPlans, setFilteredPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");

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

    // Filtre par statut
    if (statusFilter !== "all") {
      filtered = filtered.filter((plan) =>
        statusFilter === "active" ? plan.is_active : !plan.is_active
      );
    }

    setFilteredPlans(filtered);
  }, [plans, searchTerm, statusFilter]);

  const loadPlans = async () => {
    setLoading(true);
    try {
      const result = await getAllSubscriptionPlans();
      if (result.success) {
        setPlans(result.plans || []);
        setFilteredPlans(result.plans || []);
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

  const togglePlanStatus = async (planId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
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

  const handleDeletePlan = async (planId: string, planName: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer le plan "${planName}" ?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from("subscription_plans")
        .delete()
        .eq("id", planId);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Le plan a été supprimé avec succès",
      });

      loadPlans();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors de la suppression du plan",
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
      <Card>
        <CardHeader>
          <div className="flex items-center justify-end">
            <Button onClick={handleAddSubscription}>
              <Plus className="w-4 h-4 mr-2" />
              Ajouter un abonnement
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {/* Barre de recherche et filtres */}
          <div className="flex items-center gap-4 mb-6">
            {/* Recherche */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Rechercher par nom d'abonnement"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filtre par statut */}
            <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
              <SelectTrigger className="w-[200px]">
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

          {/* Tableau */}
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
                {searchTerm || statusFilter !== "all"
                  ? "Aucun abonnement trouvé"
                  : "Aucun abonnement"}
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || statusFilter !== "all"
                  ? "Essayez de modifier vos critères de recherche"
                  : "Commencez par créer votre premier plan d'abonnement"}
              </p>
              {!searchTerm && statusFilter === "all" && (
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

                          {/* Bouton Supprimer */}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeletePlan(plan.id, plan.name)}
                            title="Supprimer"
                            className="h-8 w-8 p-0 hover:text-red-600 hover:border-red-300"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>

                          {/* Bouton Modifier */}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              toast({
                                title: "En développement",
                                description: "La page de modification sera bientôt disponible",
                              });
                            }}
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
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSubscriptions;
