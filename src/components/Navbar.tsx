import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, Users, Home, Megaphone, User, Settings, LogOut, UserCircle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { useUserRole } from "@/hooks/useUserRole";
import { useNavigation } from "@/hooks/useNavigation";
import { Z_INDEX, ROLE_COLORS } from "@/lib/breakpoints";

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


// La logique getMobileMenuItems est maintenant centralisée dans useNavigation

const Navbar = () => {
  const { user, signOut, signIn, /* signInWithGoogle, */ loading, forceSignOut, isLoggingIn, isLoggingOut } = useAuth();
  const { userRole, userProfile } = useUserRole();
  const { mobileMenuItems, roleInfo } = useNavigation();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSignupMode, setIsSignupMode] = useState(false);
  const [selectedRole, setSelectedRole] = useState("");
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(true);
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

  // Gérer le chargement de l'image
  useEffect(() => {
    if (userProfile?.avatar_url) {
      setIsImageLoading(true);
    } else {
      setIsImageLoading(false);
    }
  }, [userProfile?.avatar_url]);

  // ✅ IMP-001 : Utiliser UNIQUEMENT userProfile (source unique de vérité)
  const displayName = loading ? "Chargement..." : 
    userProfile?.full_name || user?.email || "Utilisateur";

  const initials = loading ? "..." : displayName
    .split(" ")
    .filter((w: string) => w.length > 0)
    .map((w: string) => w.charAt(0).toUpperCase())
    .slice(0, 2)
    .join("") || "U";

  // Déterminer si on doit afficher les initiales ou une icône
  const hasValidInitials = !loading && initials !== "U" && initials.length > 0;

  // Générer une couleur de fond basée sur les initiales (comme Gmail)
  const getAvatarColor = (name: string) => {
    const colors = [
      'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 
      'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500',
      'bg-orange-500', 'bg-cyan-500', 'bg-lime-500', 'bg-amber-500'
    ];
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  // Utiliser une couleur stable basée sur l'ID utilisateur ou email pour éviter les changements
  const stableIdentifier = user?.id || user?.email || displayName;
  const avatarColor = loading ? 'bg-gray-300' : getAvatarColor(stableIdentifier);

  // roleInfo est maintenant fourni par useNavigation

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
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center py-4">
          <Link to="/" className="flex items-center">
            <img src="/icons/logo.svg" alt="Logo" className="h-10 w-auto md:h-12" />
          </Link>
          
          <div className="flex items-center space-x-3">
            {/* Version desktop */}
            <div className="hidden md:flex items-center space-x-3">
              {loading ? (
                <div className="flex items-center space-x-3">
                  <div className="flex flex-col leading-tight">
                    <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-4 w-20 bg-gray-200 rounded animate-pulse mt-1"></div>
                  </div>
                  <div className="h-9 w-9 bg-gray-200 rounded-full animate-pulse"></div>
                </div>
              ) : user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center gap-3 p-2 hover:bg-transparent">
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Bonjour,</p>
                        <p className="text-base font-medium text-foreground">
                          {displayName}
                        </p>
                      </div>
                      <div className="relative">
                        <Avatar className="h-9 w-9">
                          <AvatarImage
                            src={userProfile?.avatar_url || "/placeholder.svg"}
                            alt={displayName}
                            className="object-cover"
                            onLoad={() => setIsImageLoading(false)}
                            onError={() => setIsImageLoading(false)}
                          />
                          <AvatarFallback 
                            className={`${avatarColor} text-white font-semibold flex items-center justify-center transition-opacity duration-200 ${
                              isImageLoading ? 'opacity-100' : 'opacity-0'
                            }`}
                          >
                            {hasValidInitials ? (
                              initials
                            ) : (
                              <UserCircle className="h-6 w-6" />
                            )}
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white"></div>
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {displayName}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {userProfile?.email || user.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <User className="mr-2 h-4 w-4" />
                      <span>Profil</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/dashboard" className="flex items-center">
                        <Home className="mr-2 h-4 w-4" />
                        <span>Dashboard</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} disabled={isLoggingOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>
                        {isLoggingOut ? (
                          <>
                            <Spinner className="mr-1" size="sm" />
                            {AUTH_MESSAGES.LOGGING_OUT}
                          </>
                        ) : (
                          "Se déconnecter"
                        )}
                      </span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
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
            <div className="md:hidden">
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
        <div 
          className="fixed inset-0 bg-white md:hidden flex flex-col"
          style={{ zIndex: Z_INDEX.mobileMenu }}
        >
          <div className="flex-1 overflow-y-auto bg-white">
            <div className="w-full bg-white min-h-full">
              <Card className="border-0 shadow-none bg-transparent">
                <CardHeader className="px-6 py-4">
                  {/* Header avec logo et bouton fermer */}
                  <div className="flex justify-between items-center">
                    <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center">
                      <img src="/icons/logo.svg" alt="Logo" className="h-10 w-auto" />
                    </Link>
                     <Button
                       variant="outline"
                       size="icon"
                       className="h-9 w-9 rounded-md text-gray-500 border-gray-300 hover:border-gray-400"
                       onClick={() => setIsMobileMenuOpen(false)}
                     >
                       <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                       </svg>
                     </Button>
                   </div>
                  {/* Section utilisateur ou connexion */}
                  {loading ? (
                    <div className="py-4 sm:py-[45px] mb-8 sm:mb-12">
                      <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
                        <div className="h-16 w-16 sm:h-20 sm:w-20 bg-gray-200 rounded-full animate-pulse"></div>
                        <div className="flex-1">
                          <div className="h-5 w-32 bg-gray-200 rounded animate-pulse mb-2"></div>
                          <div className="h-4 w-40 bg-gray-200 rounded animate-pulse mb-1"></div>
                          <div className="h-3 w-20 bg-gray-200 rounded animate-pulse"></div>
                        </div>
                      </div>
                    </div>
                  ) : user ? (
                    <div className="py-4 sm:py-[45px] mb-8 sm:mb-12">
                      <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
                        <div className="relative">
                          <Avatar className="h-16 w-16 sm:h-20 sm:w-20 rounded-full">
                            <AvatarImage
                              src={userProfile?.avatar_url || "/placeholder.svg"}
                              alt={displayName}
                              className="object-cover"
                              onLoad={() => setIsImageLoading(false)}
                              onError={() => setIsImageLoading(false)}
                            />
                            <AvatarFallback 
                              className={`text-lg sm:text-xl rounded-full ${avatarColor} text-white font-semibold flex items-center justify-center transition-opacity duration-200 ${
                                isImageLoading ? 'opacity-100' : 'opacity-0'
                              }`}
                            >
                              {hasValidInitials ? (
                                initials
                              ) : (
                                <UserCircle className="h-8 w-8 sm:h-10 sm:w-10" />
                              )}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-base sm:text-lg font-bold text-foreground mb-1">
                            {displayName}
                          </CardTitle>
                          <p className="text-muted-foreground text-xs sm:text-sm mb-1">
                            {userProfile?.email || user.email}
                          </p>
                        <p className={`text-xs font-medium ${ROLE_COLORS[roleInfo.color as keyof typeof ROLE_COLORS] || ROLE_COLORS.secondary}`}>
                          {roleInfo.label}
                        </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center mb-6">
                      <CardTitle className="text-2xl font-bold text-foreground mb-2">
                        {isSignupMode ? "Créer votre compte" : "Connexion"}
                      </CardTitle>
                      <p className="text-muted-foreground text-sm">
                        {isSignupMode ? "Rejoignez location-vacance.tn et commencez votre parcours" : "Bienvenue ! Connectez-vous à votre compte"}
                      </p>
                    </div>
                  )}
                </CardHeader>
                <CardContent className="px-4 pb-4">
                  {user ? (
                    <div className="space-y-2 md:space-y-4">
                      {/* Navigation basée sur le rôle */}
                      <div className="grid grid-cols-1 gap-2 md:gap-3">
                        {mobileMenuItems.map((item) => {
                          const isActive = location.pathname === item.path;
                          return (
                            <Link 
                              key={item.path} 
                              to={item.path} 
                              onClick={() => setIsMobileMenuOpen(false)}
                            >
                              <Button 
                                variant={isActive ? "default" : "outline"} 
                              className={`w-full justify-start text-sm md:text-base py-2 md:py-3 ${isActive ? "bg-primary text-primary-foreground" : ""}`}
                            >
                              <item.icon className="w-4 h-4 md:w-5 md:h-5 mr-2 md:mr-3" />
                                {item.label}
                              </Button>
                            </Link>
                          );
                        })}
                      </div>
                      
                      {/* Bouton de déconnexion en bas du contenu */}
                      <div className="mt-6 pt-4 border-t border-gray-200">
                        <Button 
                          variant="outline" 
                          className="w-full"
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
                      showForgotPassword={true}
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
