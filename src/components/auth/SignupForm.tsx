import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users, Home, Megaphone, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import AcceptTermsCheckbox from "@/components/AcceptTermsCheckbox";
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
import { Spinner } from "@/components/ui/spinner";
import { useAuthError } from "@/hooks/useAuthError";
import { AUTH_MESSAGES } from "@/constants/authMessages";

// Schéma de validation Zod
const signupSchema = z.object({
  fullName: z.string()
    .min(1, "Le nom complet est requis")
    .min(2, "Le nom complet doit contenir au moins 2 caractères")
    .max(100, "Le nom complet ne peut pas dépasser 100 caractères")
    .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, "Le nom complet ne peut contenir que des lettres, espaces, apostrophes et tirets"),
  email: z.string().email("Adresse email invalide"),
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
  confirmPassword: z.string().min(8, "Confirmez votre mot de passe"),
  role: z.string().min(1, "Veuillez sélectionner un rôle"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

interface SignupFormProps {
  onSuccess?: () => void;
  showTitle?: boolean;
}

const SignupForm = ({ onSuccess, showTitle = true }: SignupFormProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSigningUp, setIsSigningUp] = useState(false);
  const { showSuccess, handleAuthError, handleNetworkError } = useAuthError();

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

  const form = useForm({
    resolver: zodResolver(signupSchema),
    mode: "onSubmit", // Validation seulement à la soumission
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "",
    },
  });
  const { handleSubmit, setError, formState, control, setValue } = form;
  const { errors } = formState;
  const [selectedRole, setSelectedRole] = useState("");

  // Synchroniser le rôle sélectionné avec le formulaire
  useEffect(() => {
    setValue("role", selectedRole);
  }, [selectedRole, setValue]);

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

  // Nouvelle fonction de soumission
  const onSubmit = async (values: any) => {
    setIsSigningUp(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            full_name: values.fullName,
            role: values.role,
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
        if (onSuccess) onSuccess();
      } else if (data.session) {
        const { error: profileError } = await supabase
          .from("profiles")
          .update({ role: values.role, full_name: values.fullName })
          .eq("user_id", data.user?.id);
        if (profileError) {
          console.error("Profile update error:", profileError);
        }
        showSuccess(AUTH_MESSAGES.SIGNUP_SUCCESS);
        if (onSuccess) onSuccess();
      }
    } catch (error: any) {
      handleNetworkError();
    } finally {
      setIsSigningUp(false);
    }
  };

  return (
    <div className="space-y-6">
      {showTitle && (
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground">
            Créer votre compte
          </h1>
          <p className="text-muted-foreground">
            Rejoignez location-vacance.tn et commencez votre parcours
          </p>
        </div>
      )}
      
      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
          {/* Sélection du type de compte */}
          <div>
            <Label className="text-base font-medium text-foreground">
              Je suis *
            </Label>
            <div className="mt-3 space-y-3">
              {roles.map((role) => (
                <div
                  key={role.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-all duration-200 ${
                    selectedRole === role.id
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-border hover:border-primary/50"
                  }`}
                  onClick={() => setSelectedRole(role.id)}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-md ${
                      selectedRole === role.id ? "text-primary" : "text-muted-foreground"
                    }`}>
                      {role.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className={`font-medium ${
                        selectedRole === role.id ? "text-primary" : "text-foreground"
                      }`}>
                        {role.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {role.subtitle}
                      </p>
                    </div>
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      selectedRole === role.id 
                        ? "border-primary bg-primary" 
                        : "border-muted-foreground"
                    }`}>
                      {selectedRole === role.id && (
                        <div className="w-2 h-2 bg-primary-foreground rounded-full"></div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {/* Message d'erreur pour le rôle */}
            {errors.role && (
              <div className="mt-2">
                <FormMessage>{errors.role.message}</FormMessage>
              </div>
            )}
          </div>
          
          {/* Nom complet */}
          <FormField
            control={control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nom complet *</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    placeholder="Votre nom complet"
                    value={field.value}
                    onChange={(e) => field.onChange(formatFullName(e.target.value))}
                    autoComplete="name"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Email */}
          <FormField
            control={control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Adresse email *</FormLabel>
                <FormControl>
                  <Input type="email" inputMode="email" className="lowercase" placeholder="votre@email.com" value={field.value}
                    onChange={(e) => field.onChange(e.target.value.toLowerCase())} autoComplete="email" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Mot de passe */}
          <FormField
            control={control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mot de passe *</FormLabel>
                <FormControl>
                  <div className="relative mt-1">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      {...field}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Confirmation mot de passe */}
          <FormField
            control={control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirmer le mot de passe *</FormLabel>
                <FormControl>
                  <div className="relative mt-1">
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      {...field}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* CGU */}
          <div className="space-y-3">
            <AcceptTermsCheckbox />
          </div>
          
          {/* Bouton submit */}
          <Button
            type="submit"
            disabled={isSigningUp}
            className="w-full bg-gradient-to-r from-primary to-primary-glow text-primary-foreground hover:shadow-elegant transition-all duration-300"
            size="lg"
          >
            {isSigningUp ? (
              <>
                <Spinner className="mr-2" size="sm" />
                {AUTH_MESSAGES.SIGNING_UP}
              </>
            ) : (
              "Créer mon compte"
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default SignupForm;
