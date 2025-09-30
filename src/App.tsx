import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useUpdateLastSignIn } from "@/hooks/useUpdateLastSignIn";
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

  return (
    <ErrorBoundary context="App">
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <BrowserRouter>
            <ErrorBoundary context="Router">
              <Routes>
                {/* Routes publiques */}
                <Route path={ROUTES.HOME} element={<HomePage />} />
                <Route path={ROUTES.SIGNUP} element={<SignupPage />} />
                <Route path={ROUTES.LOGIN} element={<LoginPage />} />
                <Route path={ROUTES.PROPERTY_DETAIL} element={<PropertyDetail />} />
                <Route path={ROUTES.TEST_AUTH} element={<TestAuth />} />
                <Route path="/test-slug-system" element={<TestSlugSystem />} />
                
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