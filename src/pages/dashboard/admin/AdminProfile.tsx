import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useUserRole } from "@/hooks/useUserRole";
import { 
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Edit,
  Save,
  X,
  Shield
} from "lucide-react";

const AdminProfile = () => {
  const { userProfile } = useUserRole();

  return (
    <div className="space-y-6">
      {/* Bouton d'édition */}
      <div className="flex justify-end">
        <Button variant="outline" className="flex items-center gap-2">
          <Edit className="w-4 h-4" />
          Modifier
        </Button>
      </div>

      {/* Informations personnelles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Informations Personnelles
          </CardTitle>
          <CardDescription>
            Vos informations de base et de contact
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Nom complet</label>
              <p className="text-foreground">{userProfile?.full_name || 'Non renseigné'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Email</label>
              <p className="text-foreground">{userProfile?.email || 'Non renseigné'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Téléphone</label>
              <p className="text-foreground">{userProfile?.phone || 'Non renseigné'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Rôle</label>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-red-500" />
                <p className="text-foreground">Administrateur</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Informations système */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Accès Administrateur
          </CardTitle>
          <CardDescription>
            Vos privilèges et permissions système
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Niveau d'accès</label>
              <p className="text-foreground">Super Administrateur</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Permissions</label>
              <p className="text-foreground">Accès complet à toutes les fonctionnalités</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-4">
        <Button variant="outline">
          <X className="w-4 h-4 mr-2" />
          Annuler
        </Button>
        <Button>
          <Save className="w-4 h-4 mr-2" />
          Sauvegarder
        </Button>
      </div>
    </div>
  );
};

export default AdminProfile;
