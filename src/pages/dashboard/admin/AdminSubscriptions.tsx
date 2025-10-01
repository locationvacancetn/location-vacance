import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

const AdminSubscriptions = () => {
  const navigate = useNavigate();

  const handleAddSubscription = () => {
    navigate("/dashboard/admin/subscriptions/add");
  };

  return (
    <div className="space-y-6">
      {/* Bouton d'ajout */}
      <div className="flex justify-end">
        <Button onClick={handleAddSubscription} className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Ajouter un abonnement
        </Button>
      </div>

      {/* Contenu vide pour le moment */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des abonnements</CardTitle>
          <CardDescription>
            Gérez les plans d'abonnement pour les propriétaires et annonceurs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Plus className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Aucun abonnement</h3>
            <p className="text-muted-foreground mb-4 max-w-md">
              Commencez par créer votre premier plan d'abonnement en cliquant sur le bouton "Ajouter un abonnement" ci-dessus.
            </p>
            <Button onClick={handleAddSubscription} variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Créer le premier abonnement
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSubscriptions;

