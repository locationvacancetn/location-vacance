import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useUpdateLastSignIn } from "@/hooks/useUpdateLastSignIn";
import { useModalSystem } from "@/hooks/useModalSystem";
import { ModalDisplay } from "@/components/ModalDisplay";
import { useUserRole } from "@/hooks/useUserRole";
import { GoogleAnalyticsTracker } from "@/components/GoogleAnalyticsTracker";
import HomePage from "./pages/Home";
import SignupPage from "./pages/Signup";
import LoginPage from "./pages/Login";
import PropertyDetail from "./pages/PropertyDetail";
import TestAuth from "./pages/TestAuth";
import TestSlugSystem from "./pages/TestSlugSystem";
import NotFound from "./pages/NotFound";
import { DashboardRouter } from "./pages/dashboard/DashboardRouter";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { ROUTES } from "./constants/routes";

const queryClient = new QueryClient();

const AppContent = () => {
  // Mettre à jour la dernière connexion à chaque fois qu'un utilisateur se connecte
  useUpdateLastSignIn();
  
  // Récupérer le rôle de l'utilisateur pour les modals
  const { userRole, loading: userRoleLoading } = useUserRole();
  
  // Système de modals pour l'entrée sur le site
  const { modal, markAsViewed } = useModalSystem({
    trigger: 'site_entry',
    userRole: userRoleLoading ? undefined : userRole
  });


  return (
    <ErrorBoundary context="App">
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <BrowserRouter>
            <ErrorBoundary context="Router">
              {/* Tracker Google Analytics pour toutes les pages */}
              <GoogleAnalyticsTracker />
              
              {/* Modal global pour l'entrée sur le site */}
              <ModalDisplay 
                modal={modal}
                isOpen={!!modal}
                onClose={markAsViewed}
              />
              <Routes>
                {/* Routes publiques */}
                <Route path={ROUTES.HOME} element={<HomePage />} />
                <Route path={ROUTES.SIGNUP} element={<SignupPage />} />
                <Route path={ROUTES.LOGIN} element={<LoginPage />} />
                <Route path={ROUTES.PROPERTY_DETAIL} element={<PropertyDetail />} />
                <Route path={ROUTES.TEST_AUTH} element={<TestAuth />} />
                <Route path={ROUTES.TEST_SLUG_SYSTEM} element={<TestSlugSystem />} />
                
                {/* Route dashboard protégée */}
                <Route 
                  path={`${ROUTES.DASHBOARD}/*`} 
                  element={
                    <ProtectedRoute>
                      <DashboardRouter />
                    </ProtectedRoute>
                  } 
                />
                
                {/* Route 404 - doit être en dernier */}
                <Route path={ROUTES.NOT_FOUND} element={<NotFound />} />
              </Routes>
            </ErrorBoundary>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

const App = () => <AppContent />;

export default App;