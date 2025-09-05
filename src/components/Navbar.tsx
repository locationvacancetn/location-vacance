import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, Users, Home, Megaphone } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage
} from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import AcceptTermsCheckbox from "@/components/AcceptTermsCheckbox";
import { supabase } from "@/integrations/supabase/client";
import SignupForm from "@/components/auth/SignupForm";
import LoginForm from "@/components/auth/LoginForm";
import { Spinner } from "@/components/ui/spinner";
import { useAuthError } from "@/hooks/useAuthError";
import { AUTH_MESSAGES } from "@/constants/authMessages";

const loginSchema = z.object({
  email: z.string().email("Adresse email invalide").min(1, "L'email est requis"),
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
  rememberMe: z.boolean().optional(),
});

const signupSchema = z.object({
  fullName: z.string()
    .min(1, "Le nom complet est requis")
    .min(2, "Le nom complet doit contenir au moins 2 caractères")
    .max(100, "Le nom complet ne peut pas dépasser 100 caractères")
    .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, "Le nom complet ne peut contenir que des lettres, espaces, apostrophes et tirets"),
  email: z.string().email("Adresse email invalide"),
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
  confirmPassword: z.string().min(8, "Confirmez votre mot de passe"),
  role: z.string().min(1, "Veuillez sélectionner un rôle"), // Rôle obligatoire avec Zod
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});


const Navbar = () => {
  const { user, signOut, signIn, /* signInWithGoogle, */ loading, forceSignOut, isLoggingIn, isLoggingOut } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSignupMode, setIsSignupMode] = useState(false);
  const [selectedRole, setSelectedRole] = useState("");
  const [isSigningUp, setIsSigningUp] = useState(false);
  const { showSuccess, handleAuthError, handleNetworkError } = useAuthError();

  const loginForm = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const signupForm = useForm({
    resolver: zodResolver(signupSchema),
    mode: "onSubmit",
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "",
    },
  });

  const { handleSubmit: handleLoginSubmit, control: loginControl, setError: setLoginError, formState: loginFormState, reset: resetLoginForm } = loginForm;
  const { handleSubmit, control, setError, formState, reset: resetSignupForm } = signupForm;
  const { errors: loginErrors } = loginFormState;
  const { errors } = formState;

  // Réinitialiser les formulaires quand le modal s'ouvre
  useEffect(() => {
    if (isMobileMenuOpen) {
      resetLoginForm();
      resetSignupForm();
      setSelectedRole("");
      setShowPassword(false);
      setShowConfirmPassword(false);
    }
  }, [isMobileMenuOpen, resetLoginForm, resetSignupForm]);

  // Synchroniser selectedRole avec le champ role du formulaire
  useEffect(() => {
    // Mettre à jour le champ role dans le formulaire quand selectedRole change
    if (signupForm) {
      signupForm.setValue("role", selectedRole);
      // Forcer la revalidation du champ role pour faire disparaître l'erreur
      signupForm.trigger("role");
    }
  }, [selectedRole, signupForm]);

  const displayName =
    (user?.user_metadata as any)?.full_name || user?.email || "Utilisateur";

  const initials = displayName
    .split(" ")
    .map((w: string) => w.charAt(0).toUpperCase())
    .slice(0, 2)
    .join("") || "U";

  const roles = [
    {
      id: "tenant",
      title: "Locataire",
      subtitle: "Looking for rental properties",
      icon: <Users className="w-6 h-6" />
    },
    {
      id: "owner",
      title: "Propriétaire",
      subtitle: "List and manage rental properties",
      icon: <Home className="w-6 h-6" />
    },
    {
      id: "advertiser",
      title: "Annonceur",
      subtitle: "Promote businesses and services",
      icon: <Megaphone className="w-6 h-6" />
    }
  ];

  // Formatteur live: conserve un espace final pour permettre de continuer à taper
  const formatFullName = (raw: string): string => {
    // Si la chaîne est vide, retourner vide
    if (!raw) return "";
    
    const hasTrailingSpace = /\s$/.test(raw);
    const collapsed = raw.replace(/\s{2,}/g, " ");
    const trimForWords = collapsed.replace(/^\s+|\s+$/g, "");
    
    // Si après nettoyage il n'y a rien, retourner l'espace final si présent
    if (!trimForWords) return hasTrailingSpace ? " " : "";
    
    const capitalize = (s: string) => (s ? s.charAt(0).toLocaleUpperCase() + s.slice(1).toLocaleLowerCase() : s);
    const words = trimForWords.split(" ").map((part) =>
      part
        .split("-")
        .map((seg) => seg.split("'").map(capitalize).join("'"))
        .join("-")
    );
    let result = words.join(" ");
    if (hasTrailingSpace) result += " ";
    return result;
  };


  const onLoginSubmit = async (values: any) => {
    try {
      const { error } = await signIn(values.email, values.password);
      if (error) {
        handleAuthError(error, 'login');
      } else {
        showSuccess(AUTH_MESSAGES.LOGIN_SUCCESS);
        setIsMobileMenuOpen(false);
      }
    } catch (error) {
      handleNetworkError();
    }
  };

  const onSignupSubmit = async (values: any) => {
    // Toute la validation est maintenant gérée par Zod
    // Plus besoin de validation manuelle
    setIsSigningUp(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            full_name: values.fullName,
            role: selectedRole,
          },
          emailRedirectTo: `${window.location.origin}/`,
        },
      });
      if (error) {
        handleAuthError(error, 'signup');
        return;
      }
      if (data.user && !data.session) {
        showSuccess(AUTH_MESSAGES.SIGNUP_EMAIL_VERIFICATION);
        setIsMobileMenuOpen(false);
      } else if (data.session) {
        const { error: profileError } = await supabase
          .from("profiles")
          .update({ role: selectedRole, full_name: values.fullName })
          .eq("user_id", data.user?.id);
        if (profileError) {
          console.error("Profile update error:", profileError);
        }
        showSuccess(AUTH_MESSAGES.SIGNUP_SUCCESS);
        setIsMobileMenuOpen(false);
      }
    } catch (error: any) {
      handleNetworkError();
    } finally {
      setIsSigningUp(false);
    }
  };


  const handleLogout = async () => {
    try {
      const { error } = await signOut();
      
      if (error) {
        // Seulement pour les erreurs de session manquante (déjà déconnecté)
        if (error.message.includes('session') && error.message.includes('missing')) {
          // Session déjà expirée, c'est normal - déconnexion locale
          forceSignOut();
          setIsMobileMenuOpen(false);
          showSuccess(AUTH_MESSAGES.LOGOUT_SUCCESS);
        } else {
          // Autres erreurs = problème réel, ne pas forcer la déconnexion
          handleAuthError(error, 'logout');
          return;
        }
      } else {
        // Déconnexion réussie côté Supabase
        forceSignOut();
        setIsMobileMenuOpen(false);
        showSuccess(AUTH_MESSAGES.LOGOUT_SUCCESS);
      }
    } catch (error) {
      // Erreur réseau ou autre - ne pas forcer la déconnexion
      handleNetworkError();
    }
  };

  const toggleMode = () => {
    setIsSignupMode(!isSignupMode);
    // Réinitialiser les formulaires
    resetLoginForm();
    resetSignupForm();
    setSelectedRole("");
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  // Fonction Google Login - commentée pour désactivation temporaire
  // const handleGoogleLogin = async () => {
  //   try {
  //     const { error } = await signInWithGoogle();
  //     if (error) {
  //       toast({
  //         title: "Erreur de connexion Google",
  //         description: error.message,
  //         variant: "destructive"
  //       });
  //     } else {
  //       setIsMobileMenuOpen(false);
  //     }
  //   } catch (error) {
  //     toast({
  //       title: "Erreur",
  //       description: "Une erreur inattendue s'est produite",
  //       variant: "destructive"
  //     });
  //   }
  // };


  return (
    <nav className="relative z-50 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center">
            <img src="/icons/logo.svg" alt="Logo" className="h-12 w-auto" />
          </Link>
          
          <div className="flex items-center space-x-3">
            {/* Version desktop */}
            <div className="hidden sm:flex items-center space-x-3">
              {user ? (
                <div className="flex items-center space-x-3">
                  <div className="flex flex-col leading-tight">
                    <span className="text-sm text-muted-foreground">Bonjour</span>
                    <span className="font-semibold text-foreground">{displayName}</span>
                  </div>
                  <Avatar className="h-9 w-9">
                    <AvatarImage
                      src={(user?.user_metadata as any)?.avatar_url || "/placeholder.svg"}
                      alt={displayName}
                    />
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="h-8 px-3 text-xs"
                  >
                    {isLoggingOut ? (
                      <>
                        <Spinner className="mr-1" size="sm" />
                        {AUTH_MESSAGES.LOGGING_OUT}
                      </>
                    ) : (
                      "Déconnexion"
                    )}
                  </Button>
                </div>
              ) : (
                <>
                  {location.pathname !== '/signup' && (
                    <Link to="/signup">
                      <Button className="h-9 rounded-md px-4 bg-primary text-primary-foreground">
                        Inscription
                      </Button>
                    </Link>
                  )}
                  {location.pathname !== '/login' && (
                    <Link to="/login">
                      <Button variant="ghost" className="h-9 rounded-md px-4 bg-[#32323A] text-white hover:bg-[#3a3a42]">
                        Connexion
                      </Button>
                    </Link>
                  )}
                </>
              )}
            </div>

            {/* Version mobile - Bouton menu carré */}
            <div className="sm:hidden">
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 rounded-md text-green-600 hover:text-green-700 border-green-600 hover:border-green-700 active:bg-green-600 active:text-white active:border-green-600"
                onClick={() => setIsMobileMenuOpen(true)}
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal plein écran mobile */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-white z-[9999] sm:hidden">
          <div className="pt-4 pb-12 px-4 h-full overflow-y-auto">
            <div className="max-w-md mx-auto">
              <Card className="border-0 shadow-none bg-transparent">
                <CardHeader className="text-center px-0 relative">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-0 right-0 h-8 w-8 text-gray-500"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </Button>
                  <Link to="/" onClick={() => setIsMobileMenuOpen(false)}>
                    <img src="/icons/logo.svg" alt="Logo" className="h-14 w-auto mx-auto mb-4" />
                  </Link>
                  {user ? (
                    <div className="text-center">
                      <Avatar className="h-16 w-16 mx-auto mb-2">
                        <AvatarImage
                          src={(user?.user_metadata as any)?.avatar_url || "/placeholder.svg"}
                          alt={displayName}
                        />
                        <AvatarFallback className="text-lg">{initials}</AvatarFallback>
                      </Avatar>
                      <CardTitle className="text-xl font-bold text-foreground">
                        {displayName}
                      </CardTitle>
                      <p className="text-muted-foreground">
                        {user.email}
                      </p>
                      <Button 
                        variant="outline" 
                        className="mt-4 w-full"
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                      >
                        {isLoggingOut ? (
                          <>
                            <Spinner className="mr-2" size="sm" />
                            {AUTH_MESSAGES.LOGGING_OUT}
                          </>
                        ) : (
                          "Se déconnecter"
                        )}
                      </Button>
                    </div>
                  ) : (
                    <>
                      <CardTitle className="text-2xl font-bold text-foreground">
                        {isSignupMode ? "Créer votre compte" : "Connexion"}
                      </CardTitle>
                      <p className="text-muted-foreground">
                        {isSignupMode ? "Rejoignez location-vacance.tn et commencez votre parcours" : "Bienvenue ! Connectez-vous à votre compte"}
                      </p>
                    </>
                  )}
                </CardHeader>
                <CardContent className="space-y-6 px-0">
                  {user ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 gap-4">
                        <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)}>
                          <Button variant="outline" className="w-full justify-start">
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            Mon profil
                          </Button>
                        </Link>
                        <Link to="/reservations" onClick={() => setIsMobileMenuOpen(false)}>
                          <Button variant="outline" className="w-full justify-start">
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            Mes réservations
                          </Button>
                        </Link>
                        <Link to="/favorites" onClick={() => setIsMobileMenuOpen(false)}>
                          <Button variant="outline" className="w-full justify-start">
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                            Mes favoris
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ) : isSignupMode ? (
                    // Formulaire d'inscription
                    <SignupForm 
                      onSuccess={() => setIsMobileMenuOpen(false)} 
                      showTitle={false}
                    />
                  ) : (
                    // Formulaire de connexion
                    <LoginForm 
                      onSuccess={() => setIsMobileMenuOpen(false)} 
                      showTitle={false}
                      showForgotPassword={false}
                    />
                  )}

                  {!user && (
                    <>
                      {/* Separator et Google Login - commentés pour désactivation temporaire */}
                      {/* <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-border"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                          <span className="px-4 bg-white text-muted-foreground">ou</span>
                        </div>
                      </div> */}

                      {/* Google Login Button - commenté pour désactivation temporaire */}
                      {/* <Button
                        onClick={handleGoogleLogin}
                        variant="outline"
                        className="w-full border-border hover:bg-accent text-[#1EAE5A]"
                        size="lg"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 0 24 24" width="20" className="mr-2" aria-hidden="true">
                          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#1EAE5A"/>
                          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#1EAE5A"/>
                          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#1EAE5A"/>
                          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#1EAE5A"/>
                          <path d="M1 1h22v22H1z" fill="none"/>
                        </svg>
                        Continuer avec Google
                      </Button> */}

                      {/* Lien de basculement */}
                      <div className="text-center">
                        <span className="text-muted-foreground">
                          {isSignupMode ? "Déjà un compte ? " : "Pas encore de compte ? "}
                        </span>
                        <button
                          onClick={toggleMode}
                          className="text-primary hover:underline font-medium"
                        >
                          {isSignupMode ? "Se connecter" : "S'inscrire"}
                        </button>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;