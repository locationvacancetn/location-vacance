import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Link } from "react-router-dom";
import SignupForm from "@/components/auth/SignupForm";

const SignupPage = () => {

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
              <SignupForm />
              {/* Lien vers connexion */}
              <div className="text-center">
                <span className="text-muted-foreground">Déjà un compte ? </span>
                <Link to="/login" className="text-primary hover:underline font-medium">
                  Se connecter
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;