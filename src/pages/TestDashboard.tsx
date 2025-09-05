import { useUserRole } from '@/hooks/useUserRole';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';

const TestDashboard = () => {
  const { userRole, userProfile, loading, error } = useUserRole();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Chargement...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Erreur</h1>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-4">Test Dashboard</h1>
        <div className="space-y-4">
          <div className="p-4 bg-card rounded-lg border">
            <h2 className="text-xl font-semibold mb-2">Informations utilisateur</h2>
            <p><strong>Rôle:</strong> {userRole || 'Non défini'}</p>
            <p><strong>Nom:</strong> {userProfile?.full_name || 'Non défini'}</p>
            <p><strong>Email:</strong> {userProfile?.email || 'Non défini'}</p>
          </div>
          
          <div className="p-4 bg-card rounded-lg border">
            <h2 className="text-xl font-semibold mb-2">Test de navigation</h2>
            <p>Si vous voyez cette page, le dashboard fonctionne !</p>
            <p>Rôle détecté: <span className="font-mono bg-primary/10 px-2 py-1 rounded">{userRole || 'null'}</span></p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TestDashboard;

