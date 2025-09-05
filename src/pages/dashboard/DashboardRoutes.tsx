import { Routes, Route } from 'react-router-dom';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { RoleProtectedRoute } from '@/components/auth/RoleProtectedRoute';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { withLazyLoading } from '@/components/LazyWrapper';
import { ROUTES } from '@/constants/routes';
import DashboardHome from './DashboardHome';
import ProfilePage from './Profile';
import TestProfile from './TestProfile';

// Lazy loading des pages
const PropertiesPage = withLazyLoading(
  () => import('./PropertiesPage'),
  { context: 'PropertiesPage' }
);

const BookingsPage = withLazyLoading(
  () => import('./BookingsPage'),
  { context: 'BookingsPage' }
);

const MyBookingsPage = withLazyLoading(
  () => import('./MyBookingsPage'),
  { context: 'MyBookingsPage' }
);

const SearchPage = withLazyLoading(
  () => import('./SearchPage'),
  { context: 'SearchPage' }
);

const FavoritesPage = withLazyLoading(
  () => import('./FavoritesPage'),
  { context: 'FavoritesPage' }
);

const MessagesPage = withLazyLoading(
  () => import('./MessagesPage'),
  { context: 'MessagesPage' }
);

const FinancesPage = withLazyLoading(
  () => import('./FinancesPage'),
  { context: 'FinancesPage' }
);

const AnalyticsPage = withLazyLoading(
  () => import('./AnalyticsPage'),
  { context: 'AnalyticsPage' }
);

const ManagedPropertiesPage = withLazyLoading(
  () => import('./ManagedPropertiesPage'),
  { context: 'ManagedPropertiesPage' }
);

const ManageBookingsPage = withLazyLoading(
  () => import('./ManageBookingsPage'),
  { context: 'ManageBookingsPage' }
);

const MaintenancePage = withLazyLoading(
  () => import('./MaintenancePage'),
  { context: 'MaintenancePage' }
);

const ReportsPage = withLazyLoading(
  () => import('./ReportsPage'),
  { context: 'ReportsPage' }
);

const UsersPage = withLazyLoading(
  () => import('./UsersPage'),
  { context: 'UsersPage' }
);

const AllPropertiesPage = withLazyLoading(
  () => import('./AllPropertiesPage'),
  { context: 'AllPropertiesPage' }
);

const AllBookingsPage = withLazyLoading(
  () => import('./AllBookingsPage'),
  { context: 'AllBookingsPage' }
);

const SystemPage = withLazyLoading(
  () => import('./SystemPage'),
  { context: 'SystemPage' }
);

const LogsPage = withLazyLoading(
  () => import('./LogsPage'),
  { context: 'LogsPage' }
);

const SettingsPage = withLazyLoading(
  () => import('./SettingsPage'),
  { context: 'SettingsPage' }
);

const HelpPage = withLazyLoading(
  () => import('./HelpPage'),
  { context: 'HelpPage' }
);

// Les composants sont maintenant chargés de manière paresseuse

export const DashboardRoutes = () => {
  return (
    <ErrorBoundary context="DashboardRoutes">
      <Routes>
        {/* Route par défaut - Dashboard home */}
        <Route index element={<DashboardHome />} />
        
        {/* Routes communes à tous les rôles */}
        <Route path="profile" element={<TestProfile />} />
        <Route path="messages" element={<MessagesPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="help" element={<HelpPage />} />

        {/* Routes PROPRIÉTAIRE */}
        <Route 
          path="properties" 
          element={
            <RoleProtectedRoute allowedRoles={['owner', 'admin']}>
              <PropertiesPage />
            </RoleProtectedRoute>
          } 
        />
        <Route 
          path="bookings" 
          element={
            <RoleProtectedRoute allowedRoles={['owner', 'admin']}>
              <BookingsPage />
            </RoleProtectedRoute>
          } 
        />
        <Route 
          path="finances" 
          element={
            <RoleProtectedRoute allowedRoles={['owner', 'admin']}>
              <FinancesPage />
            </RoleProtectedRoute>
          } 
        />
        <Route 
          path="analytics" 
          element={
            <RoleProtectedRoute allowedRoles={['owner', 'admin']}>
              <AnalyticsPage />
            </RoleProtectedRoute>
          } 
        />

        {/* Routes LOCATAIRE */}
        <Route 
          path="my-bookings" 
          element={
            <RoleProtectedRoute allowedRoles={['tenant']}>
              <MyBookingsPage />
            </RoleProtectedRoute>
          } 
        />
        <Route 
          path="search" 
          element={
            <RoleProtectedRoute allowedRoles={['tenant']}>
              <SearchPage />
            </RoleProtectedRoute>
          } 
        />
        <Route 
          path="favorites" 
          element={
            <RoleProtectedRoute allowedRoles={['tenant']}>
              <FavoritesPage />
            </RoleProtectedRoute>
          } 
        />

        {/* Routes GESTIONNAIRE */}
        <Route 
          path="managed-properties" 
          element={
            <RoleProtectedRoute allowedRoles={['manager', 'admin']}>
              <ManagedPropertiesPage />
            </RoleProtectedRoute>
          } 
        />
        <Route 
          path="manage-bookings" 
          element={
            <RoleProtectedRoute allowedRoles={['manager', 'admin']}>
              <ManageBookingsPage />
            </RoleProtectedRoute>
          } 
        />
        <Route 
          path="maintenance" 
          element={
            <RoleProtectedRoute allowedRoles={['manager', 'admin']}>
              <MaintenancePage />
            </RoleProtectedRoute>
          } 
        />
        <Route 
          path="reports" 
          element={
            <RoleProtectedRoute allowedRoles={['manager', 'admin']}>
              <ReportsPage />
            </RoleProtectedRoute>
          } 
        />

        {/* Routes ADMINISTRATEUR */}
        <Route 
          path="users" 
          element={
            <RoleProtectedRoute allowedRoles={['admin']}>
              <UsersPage />
            </RoleProtectedRoute>
          } 
        />
        <Route 
          path="all-properties" 
          element={
            <RoleProtectedRoute allowedRoles={['admin']}>
              <AllPropertiesPage />
            </RoleProtectedRoute>
          } 
        />
        <Route 
          path="all-bookings" 
          element={
            <RoleProtectedRoute allowedRoles={['admin']}>
              <AllBookingsPage />
            </RoleProtectedRoute>
          } 
        />
        <Route 
          path="system" 
          element={
            <RoleProtectedRoute allowedRoles={['admin']}>
              <SystemPage />
            </RoleProtectedRoute>
          } 
        />
        <Route 
          path="logs" 
          element={
            <RoleProtectedRoute allowedRoles={['admin']}>
              <LogsPage />
            </RoleProtectedRoute>
          } 
        />

        {/* Route fallback pour les pages non trouvées dans le dashboard */}
        <Route 
          path="*" 
          element={
            <div className="p-6">
              <h1 className="text-2xl font-bold">Page non trouvée</h1>
              <p className="text-muted-foreground">La page demandée n'existe pas.</p>
            </div>
          } 
        />
      </Routes>
    </ErrorBoundary>
  );
};
