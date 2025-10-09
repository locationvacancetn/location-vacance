import { useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { usePageTitle } from "@/hooks/usePageTitle";
import ResetPasswordForm from "@/components/auth/ResetPasswordForm";
import { showError } from "@/lib/appToast";
import { Button } from "@/components/ui/button";

const ResetPasswordPage = () => {
  usePageTitle();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Vérifier si l'URL contient des erreurs (lien expiré, etc.)
    const hashParams = new URLSearchParams(location.hash.substring(1));
    const error = hashParams.get('error');
    const errorCode = hashParams.get('error_code');
    const errorDescription = hashParams.get('error_description');

    if (error || errorCode) {
      if (errorCode === 'otp_expired' || errorDescription?.includes('expired')) {
        showError({
          title: "Lien expiré",
          description: "Le lien de réinitialisation a expiré. Les liens sont valides pendant 1 heure."
        });
      } else if (error === 'access_denied') {
        showError({
          title: "Lien invalide",
          description: "Le lien de réinitialisation est invalide ou a déjà été utilisé."
        });
      }
    }
  }, [location]);

  // Vérifier si l'URL contient une erreur pour afficher un message alternatif
  const hashParams = new URLSearchParams(location.hash.substring(1));
  const hasError = hashParams.get('error') || hashParams.get('error_code');

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
              {hasError ? (
                <div className="space-y-6">
                  <div className="text-center">
                    <h1 className="text-2xl font-bold text-foreground">
                      Lien expiré ou invalide
                    </h1>
                    <p className="text-muted-foreground mt-2">
                      Le lien de réinitialisation a expiré ou a déjà été utilisé.
                    </p>
                  </div>
                  <Button
                    onClick={() => navigate('/forgot-password')}
                    className="w-full bg-gradient-to-r from-primary to-primary-glow text-primary-foreground hover:shadow-elegant transition-all duration-300"
                    size="lg"
                  >
                    Demander un nouveau lien
                  </Button>
                  <Link 
                    to="/login" 
                    className="w-full inline-flex items-center justify-center h-11 px-8 rounded-md bg-secondary hover:bg-secondary/80 text-muted-foreground text-sm font-medium transition-colors"
                  >
                    Retour à la connexion
                  </Link>
                </div>
              ) : (
                <ResetPasswordForm />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;

