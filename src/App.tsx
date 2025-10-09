import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useUpdateLastSignIn } from "@/hooks/useUpdateLastSignIn";
import { useModalSystem } from "@/hooks/useModalSystem";
import { ModalDisplay } from "@/components/ModalDisplay";
import { useUserRole } from "@/hooks/useUserRole";
import { GoogleAnalyticsTracker } from "@/components/GoogleAnalyticsTracker";
import ScrollToTop from "./components/ScrollToTop";
import HomePage from "./pages/Home";
import SignupPage from "./pages/Signup";
import LoginPage from "./pages/Login";
import ForgotPasswordPage from "./pages/ForgotPassword";
import ResetPasswordPage from "./pages/ResetPassword";
import PropertyDetail from "./pages/PropertyDetail";
import BlogPage from "./pages/Blog";
import BlogDetailsPage from "./pages/BlogDetails";
import TestSlugSystem from "./pages/TestSlugSystem";
import TermsOfService from "./pages/TermsOfService";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Contact from "./pages/Contact";
import FAQ from "./pages/FAQ";
import BecomeHost from "./pages/BecomeHost";
import BecomePartner from "./pages/BecomePartner";
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
          <HelmetProvider>
            <Toaster />
            <BrowserRouter>
              <ScrollToTop />
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
                <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPasswordPage />} />
                <Route path={ROUTES.RESET_PASSWORD} element={<ResetPasswordPage />} />
                <Route path={ROUTES.PROPERTY_DETAIL} element={<PropertyDetail />} />
                <Route path={ROUTES.BLOG} element={<BlogPage />} />
                <Route path={ROUTES.BLOG_DETAIL} element={<BlogDetailsPage />} />
                <Route path={ROUTES.TEST_SLUG_SYSTEM} element={<TestSlugSystem />} />
                <Route path={ROUTES.CONTACT} element={<Contact />} />
                <Route path={ROUTES.FAQ} element={<FAQ />} />
                <Route path={ROUTES.BECOME_HOST} element={<BecomeHost />} />
                <Route path={ROUTES.BECOME_PARTNER} element={<BecomePartner />} />
                
                {/* Pages légales */}
                <Route path={ROUTES.TERMS} element={<TermsOfService />} />
                <Route path={ROUTES.PRIVACY} element={<PrivacyPolicy />} />
                
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
          </HelmetProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

const App = () => <AppContent />;

export default App;
