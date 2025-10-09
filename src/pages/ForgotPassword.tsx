import { useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { usePageTitle } from "@/hooks/usePageTitle";
import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";

const ForgotPasswordPage = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  usePageTitle(); // Utilise le hook pour mettre à jour le titre de la page

  useEffect(() => {
    // Si l'utilisateur est déjà connecté, rediriger vers la page d'accueil
    if (user && !loading) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  return (
    <div className="min-h-screen bg-white">
      <div className="pt-16 pb-12 px-4">
        <div className="max-w-md mx-auto">
          <Card className="border-0 shadow-none bg-transparent">
            <CardHeader className="text-center px-0">
              <Link to="/">
                <img src="/icons/logo.svg" alt="Logo" className="h-10 w-auto md:h-14 mx-auto mb-4" />
              </Link>
            </CardHeader>
            <CardContent className="space-y-4 px-0">
              <ForgotPasswordForm />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;

