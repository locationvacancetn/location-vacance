import { useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import LoginForm from "@/components/auth/LoginForm";

const LoginPage = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && !loading) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  const handleLoginSuccess = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="pt-16 pb-12 px-4">
        <div className="max-w-md mx-auto">
          <Card className="border-0 shadow-none bg-transparent">
            <CardHeader className="text-center px-0">
              <Link to="/">
                <img src="/icons/logo.svg" alt="Logo" className="h-14 w-auto mx-auto mb-4" />
              </Link>
            </CardHeader>
            <CardContent className="space-y-6 px-0">
              <LoginForm onSuccess={handleLoginSuccess} />
              {/* Lien vers inscription */}
              <div className="text-center">
                <span className="text-muted-foreground">Pas encore de compte ? </span>
                <Link to="/signup" className="text-primary hover:underline font-medium">
                  S'inscrire
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;