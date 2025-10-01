import { useUserRole } from '@/hooks/useUserRole';
import { DashboardLayout } from '@/components/dashboard/layout/DashboardLayout';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { AdminRouteGuard } from '@/components/dashboard/admin/AdminRouteGuard';
import { OwnerRouteGuard } from '@/components/dashboard/owner/OwnerRouteGuard';
import { TenantRouteGuard } from '@/components/dashboard/tenant/TenantRouteGuard';
import { AdvertiserRouteGuard } from '@/components/dashboard/advertiser/AdvertiserRouteGuard';
import { Routes, Route } from 'react-router-dom';

// Import des dashboards par rôle
import AdminDashboard from './admin/AdminDashboard';
import OwnerDashboard from './owner/OwnerDashboard';
import TenantDashboard from './tenant/TenantDashboard';
import AdvertiserDashboard from './advertiser/AdvertiserDashboard';

// Import des pages de gestion admin
import CitiesManagement from './admin/CitiesManagement';
import EquipmentsManagement from './admin/EquipmentsManagement';
import CharacteristicsManagement from './admin/CharacteristicsManagement';
import PropertyTypesManagement from './admin/PropertyTypesManagement';
import UsersManagement from './admin/UsersManagement';
import AddUser from './admin/AddUser';
import KonnectConfigPage from './admin/KonnectConfigPage';
import EmailSettings from './admin/EmailSettings';
import AdminPropertiesManagement from './admin/AdminPropertiesManagement';
import SEOManagement from './admin/SEOManagement';
import AdminSubscriptions from './admin/AdminSubscriptions';
import AddSubscriptionPlan from './admin/AddSubscriptionPlan';


// Import des pages Profil par rôle
import AdminProfile from './admin/AdminProfile';
import OwnerProfile from './owner/OwnerProfile';
import TenantProfile from './tenant/TenantProfile';
import AdvertiserProfile from './advertiser/AdvertiserProfile';

// Import des pages Owner
import AddPropertyWizard from './owner/AddPropertyWizard';
import PropertiesManagement from './owner/PropertiesManagement';
import CalendarManagement from './owner/CalendarManagement';
import Analytics from './owner/Analytics';

// Import des pages Advertiser
import AdvertisementsManagement from './advertiser/AdvertisementsManagement';
import AddAdvertisement from './advertiser/AddAdvertisement';
import EditAdvertisement from './advertiser/EditAdvertisement';

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
        {/* Route principale du dashboard - PROTECTION PAR RÔLE */}
        <Route path="/" element={
          userRole === 'admin' ? (
            <AdminRouteGuard>
              <AdminDashboard />
            </AdminRouteGuard>
          ) : userRole === 'owner' ? (
            <OwnerRouteGuard>
              <OwnerDashboard />
            </OwnerRouteGuard>
          ) : userRole === 'tenant' ? (
            <TenantRouteGuard>
              <TenantDashboard />
            </TenantRouteGuard>
          ) : userRole === 'advertiser' ? (
            <AdvertiserRouteGuard>
              <AdvertiserDashboard />
            </AdvertiserRouteGuard>
          ) : (
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
          )
        } />
        
        

        {/* Route de compatibilité pour add-property - PROTECTION RENFORCÉE */}
        <Route 
          path="/add-property" 
          element={
            userRole === 'admin' ? (
              <AdminRouteGuard>
                <AddPropertyWizard />
              </AdminRouteGuard>
            ) : userRole === 'owner' ? (
              <OwnerRouteGuard>
                <AddPropertyWizard />
              </OwnerRouteGuard>
            ) : (
              <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                  <h1 className="text-2xl font-bold text-foreground mb-4">
                    Accès non autorisé
                  </h1>
                  <p className="text-muted-foreground">
                    Seuls les propriétaires et administrateurs peuvent ajouter des propriétés.
                  </p>
                </div>
              </div>
            )
          } 
        />



        {/* Routes de gestion admin - PROTECTION RENFORCÉE */}
        <Route path="/admin/*" element={
          <AdminRouteGuard>
            <Routes>
              <Route path="/profile" element={<AdminProfile />} />
              <Route path="/cities" element={<CitiesManagement />} />
              <Route path="/equipments" element={<EquipmentsManagement />} />
              <Route path="/characteristics" element={<CharacteristicsManagement />} />
              <Route path="/property-types" element={<PropertyTypesManagement />} />
              <Route path="/konnect" element={<KonnectConfigPage />} />
              <Route path="/email" element={<EmailSettings />} />
              <Route path="/properties" element={<AdminPropertiesManagement />} />
              <Route path="/seo" element={<SEOManagement />} />
              <Route path="/subscriptions" element={<AdminSubscriptions />} />
              <Route path="/subscriptions/add" element={<AddSubscriptionPlan />} />
              <Route path="/users" element={<UsersManagement />} />
              <Route path="/add-user" element={<AddUser />} />
              <Route path="/add-property" element={<AddPropertyWizard />} />
              <Route path="/edit-property/:id" element={<AddPropertyWizard />} />
              <Route path="/*" element={
                <div className="min-h-screen bg-background flex items-center justify-center">
                  <div className="text-center">
                    <h1 className="text-2xl font-bold text-foreground mb-4">Page admin non trouvée</h1>
                    <p className="text-muted-foreground">Cette page d'administration n'existe pas.</p>
                  </div>
                </div>
              } />
            </Routes>
          </AdminRouteGuard>
        } />

        {/* Routes Owner - PROTECTION RENFORCÉE */}
        <Route path="/owner/*" element={
          <OwnerRouteGuard>
            <Routes>
              <Route path="/profile" element={<OwnerProfile />} />
              <Route path="/add-property" element={<AddPropertyWizard />} />
              <Route path="/edit-property/:id" element={<AddPropertyWizard />} />
              <Route path="/properties" element={<PropertiesManagement />} />
              <Route path="/calendar" element={<CalendarManagement />} />
              <Route path="/finances" element={
                <div className="min-h-screen bg-background flex items-center justify-center">
                  <div className="text-center">
                    <h1 className="text-2xl font-bold text-foreground mb-4">Finances</h1>
                    <p className="text-muted-foreground">Page en cours de développement</p>
                  </div>
                </div>
              } />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/*" element={
                <div className="min-h-screen bg-background flex items-center justify-center">
                  <div className="text-center">
                    <h1 className="text-2xl font-bold text-foreground mb-4">Page propriétaire non trouvée</h1>
                    <p className="text-muted-foreground">Cette page de gestion n'existe pas.</p>
                  </div>
                </div>
              } />
            </Routes>
          </OwnerRouteGuard>
        } />

        {/* Routes Tenant - PROTECTION RENFORCÉE */}
        <Route path="/tenant/*" element={
          <TenantRouteGuard>
            <Routes>
              <Route path="/profile" element={<TenantProfile />} />
              <Route path="/my-bookings" element={
                <div className="min-h-screen bg-background flex items-center justify-center">
                  <div className="text-center">
                    <h1 className="text-2xl font-bold text-foreground mb-4">Mes Réservations</h1>
                    <p className="text-muted-foreground">Page en cours de développement</p>
                  </div>
                </div>
              } />
              <Route path="/search" element={
                <div className="min-h-screen bg-background flex items-center justify-center">
                  <div className="text-center">
                    <h1 className="text-2xl font-bold text-foreground mb-4">Recherche</h1>
                    <p className="text-muted-foreground">Page en cours de développement</p>
                  </div>
                </div>
              } />
              <Route path="/favorites" element={
                <div className="min-h-screen bg-background flex items-center justify-center">
                  <div className="text-center">
                    <h1 className="text-2xl font-bold text-foreground mb-4">Favoris</h1>
                    <p className="text-muted-foreground">Page en cours de développement</p>
                  </div>
                </div>
              } />
              <Route path="/*" element={
                <div className="min-h-screen bg-background flex items-center justify-center">
                  <div className="text-center">
                    <h1 className="text-2xl font-bold text-foreground mb-4">Page locataire non trouvée</h1>
                    <p className="text-muted-foreground">Cette page n'existe pas.</p>
                  </div>
                </div>
              } />
            </Routes>
          </TenantRouteGuard>
        } />

        {/* Routes Advertiser - PROTECTION RENFORCÉE */}
        <Route path="/advertiser/*" element={
          <AdvertiserRouteGuard>
            <Routes>
              <Route path="/profile" element={<AdvertiserProfile />} />
              <Route path="/ads" element={<AdvertisementsManagement />} />
              <Route path="/add-advertisement" element={<AddAdvertisement />} />
              <Route path="/edit-advertisement/:id" element={<EditAdvertisement />} />
              <Route path="/analytics" element={
                <div className="min-h-screen bg-background flex items-center justify-center">
                  <div className="text-center">
                    <h1 className="text-2xl font-bold text-foreground mb-4">Analytics</h1>
                    <p className="text-muted-foreground">Page en cours de développement</p>
                  </div>
                </div>
              } />
              <Route path="/campaigns" element={
                <div className="min-h-screen bg-background flex items-center justify-center">
                  <div className="text-center">
                    <h1 className="text-2xl font-bold text-foreground mb-4">Campagnes</h1>
                    <p className="text-muted-foreground">Page en cours de développement</p>
                  </div>
                </div>
              } />
              <Route path="/reports" element={
                <div className="min-h-screen bg-background flex items-center justify-center">
                  <div className="text-center">
                    <h1 className="text-2xl font-bold text-foreground mb-4">Rapports</h1>
                    <p className="text-muted-foreground">Page en cours de développement</p>
                  </div>
                </div>
              } />
              <Route path="/*" element={
                <div className="min-h-screen bg-background flex items-center justify-center">
                  <div className="text-center">
                    <h1 className="text-2xl font-bold text-foreground mb-4">Page annonceur non trouvée</h1>
                    <p className="text-muted-foreground">Cette page n'existe pas.</p>
                  </div>
                </div>
              } />
            </Routes>
          </AdvertiserRouteGuard>
        } />


      </Routes>
    </DashboardLayout>
  );
};
