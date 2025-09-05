import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import HomePage from "./pages/Home";
import SignupPage from "./pages/Signup";
import LoginPage from "./pages/Login";
import PropertyDetail from "./pages/PropertyDetail";
import TestAuth from "./pages/TestAuth";
import NotFound from "./pages/NotFound";
import { DashboardContent } from "./components/dashboard/DashboardContent";
import { DashboardLayout } from "./components/dashboard/DashboardLayout";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { ROUTES } from "./constants/routes";

const queryClient = new QueryClient();

const App = () => (
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
              
              {/* Routes dashboard protégées */}
              <Route 
                path="/dashboard/*" 
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <DashboardContent />
                    </DashboardLayout>
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

export default App;