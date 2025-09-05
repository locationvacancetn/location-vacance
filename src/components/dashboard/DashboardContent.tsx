import { Routes, Route } from 'react-router-dom';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { withLazyLoading } from '@/components/LazyWrapper';
import { ROUTES } from '@/constants/routes';
import { RoleProtectedRoute } from '@/components/auth/RoleProtectedRoute';
import DashboardHome from '@/pages/dashboard/DashboardHome';
import TestProfile from '@/pages/dashboard/TestProfile';
import SimpleTest from '@/pages/dashboard/SimpleTest';

// Lazy loading des pages
const PropertiesPage = withLazyLoading(
  () => import('@/pages/dashboard/PropertiesPage'),
  { context: 'PropertiesPage' }
);

const BookingsPage = withLazyLoading(
  () => import('@/pages/dashboard/BookingsPage'),
  { context: 'BookingsPage' }
);

const MyBookingsPage = withLazyLoading(
  () => import('@/pages/dashboard/MyBookingsPage'),
  { context: 'MyBookingsPage' }
);

const SearchPage = withLazyLoading(
  () => import('@/pages/dashboard/SearchPage'),
  { context: 'SearchPage' }
);

const FavoritesPage = withLazyLoading(
  () => import('@/pages/dashboard/FavoritesPage'),
  { context: 'FavoritesPage' }
);

const MessagesPage = withLazyLoading(
  () => import('@/pages/dashboard/MessagesPage'),
  { context: 'MessagesPage' }
);

const FinancesPage = withLazyLoading(
  () => import('@/pages/dashboard/FinancesPage'),
  { context: 'FinancesPage' }
);

const AnalyticsPage = withLazyLoading(
  () => import('@/pages/dashboard/AnalyticsPage'),
  { context: 'AnalyticsPage' }
);

const ManagedPropertiesPage = withLazyLoading(
  () => import('@/pages/dashboard/ManagedPropertiesPage'),
  { context: 'ManagedPropertiesPage' }
);

const ManageBookingsPage = withLazyLoading(
  () => import('@/pages/dashboard/ManageBookingsPage'),
  { context: 'ManageBookingsPage' }
);

const MaintenancePage = withLazyLoading(
  () => import('@/pages/dashboard/MaintenancePage'),
  { context: 'MaintenancePage' }
);

const ReportsPage = withLazyLoading(
  () => import('@/pages/dashboard/ReportsPage'),
  { context: 'ReportsPage' }
);

const UsersPage = withLazyLoading(
  () => import('@/pages/dashboard/UsersPage'),
  { context: 'UsersPage' }
);

const AllPropertiesPage = withLazyLoading(
  () => import('@/pages/dashboard/AllPropertiesPage'),
  { context: 'AllPropertiesPage' }
);

const AllBookingsPage = withLazyLoading(
  () => import('@/pages/dashboard/AllBookingsPage'),
  { context: 'AllBookingsPage' }
);

const SystemPage = withLazyLoading(
  () => import('@/pages/dashboard/SystemPage'),
  { context: 'SystemPage' }
);

const LogsPage = withLazyLoading(
  () => import('@/pages/dashboard/LogsPage'),
  { context: 'LogsPage' }
);

const SettingsPage = withLazyLoading(
  () => import('@/pages/dashboard/SettingsPage'),
  { context: 'SettingsPage' }
);

const HelpPage = withLazyLoading(
  () => import('@/pages/dashboard/HelpPage'),
  { context: 'HelpPage' }
);

export const DashboardContent = () => {
  return (
    <ErrorBoundary context="DashboardContent">
      <Routes>
        {/* Route par défaut - Dashboard home */}
        <Route index element={<DashboardHome />} />
        
        {/* Routes communes à tous les rôles */}
        <Route path="profile" element={<SimpleTest />} />
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
