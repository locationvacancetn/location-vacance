import { useUserRole } from '@/hooks/useUserRole';
import { DashboardLayout } from '@/components/dashboard/layout/DashboardLayout';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Routes, Route } from 'react-router-dom';

// Import des dashboards par rôle
import AdminDashboard from './admin/AdminDashboard';
import OwnerDashboard from './owner/OwnerDashboard';
import TenantDashboard from './tenant/TenantDashboard';
import AdvertiserDashboard from './advertiser/AdvertiserDashboard';

// Import des pages de gestion admin
import CitiesManagement from './admin/CitiesManagement';
import EquipmentsManagement from './admin/EquipmentsManagement';
import PropertyTypesManagement from './admin/PropertyTypesManagement';
import UsersManagement from './admin/UsersManagement';


// Import des pages Profil par rôle
import AdminProfile from './admin/AdminProfile';
import OwnerProfile from './owner/OwnerProfile';
import TenantProfile from './tenant/TenantProfile';
import AdvertiserProfile from './advertiser/AdvertiserProfile';

// Import des pages Owner
import AddPropertyWizard from './owner/AddPropertyWizard';
import TestLocationData from './owner/TestLocationData';
import TestTables from './owner/TestTables';

export const DashboardRouter = () => {
  const { userRole, loading } = useUserRole();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner size="lg" text="Chargement..." />
      </div>
    );
  }

  // Redirection basée sur le rôle - SIMPLE
  const renderDashboard = () => {
    switch (userRole) {
      case 'admin':
        return <AdminDashboard />;
      case 'owner':
        return <OwnerDashboard />;
      case 'tenant':
        return <TenantDashboard />;
      case 'advertiser':
        return <AdvertiserDashboard />;
      default:
        return (
          <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-foreground mb-4">
                Rôle non reconnu
              </h1>
              <p className="text-muted-foreground">
                Veuillez contacter l'administrateur.
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <DashboardLayout>
      <Routes>
        {/* Route principale du dashboard */}
        <Route path="/" element={renderDashboard()} />
        
        {/* Routes Profil par rôle */}
        <Route 
          path="/profile" 
          element={
            userRole === 'admin' ? <AdminProfile /> :
            userRole === 'owner' ? <OwnerProfile /> :
            userRole === 'tenant' ? <TenantProfile /> :
            userRole === 'advertiser' ? <AdvertiserProfile /> :
            <div>Profil non disponible</div>
          } 
        />

        {/* Routes de gestion admin */}
        <Route path="/admin/cities" element={<CitiesManagement />} />
        <Route path="/admin/equipments" element={<EquipmentsManagement />} />
        <Route path="/admin/property-types" element={<PropertyTypesManagement />} />
        <Route path="/users" element={<UsersManagement />} />

        {/* Routes Owner */}
        <Route path="/owner/add-property" element={<AddPropertyWizard />} />
        <Route path="/owner/test-location" element={<TestLocationData />} />
        <Route path="/owner/test-tables" element={<TestTables />} />
      </Routes>
    </DashboardLayout>
  );
};
