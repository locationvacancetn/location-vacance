import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
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
import { showSuccess as showSuccessToast } from "@/lib/appToast";

const forgotPasswordSchema = z.object({
  email: z.string().email("Adresse email invalide").min(1, "L'email est requis"),
});

interface ForgotPasswordFormProps {
  onSuccess?: () => void;
}

const ForgotPasswordForm = ({ onSuccess }: ForgotPasswordFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resendCount, setResendCount] = useState(0);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const [lastEmail, setLastEmail] = useState("");
  const { resetPassword } = useAuth();
  const { handleNetworkError } = useAuthError();

  const form = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });
  const { handleSubmit, control } = form;

  const startCooldown = () => {
    setCooldownSeconds(60);
    const interval = setInterval(() => {
      setCooldownSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const onSubmit = async (values: any) => {
    // Vérifier la limite de renvoi
    if (resendCount >= 3) {
      showSuccessToast({
        title: "Limite atteinte",
        description: "Veuillez réessayer plus tard."
      });
      return;
    }

    // Vérifier le cooldown
    if (cooldownSeconds > 0) {
      showSuccessToast({
        title: "Veuillez patienter",
        description: `Veuillez attendre ${cooldownSeconds} secondes avant de renvoyer.`
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await resetPassword(values.email);
      
      // Message générique pour la sécurité (ne pas révéler si l'email existe)
      if (!error) {
        showSuccessToast({
          title: "Mail envoyé",
          description: "Si votre adresse email existe dans notre système, vous recevrez un lien de réinitialisation."
        });
        
        // Incrémenter le compteur et démarrer le cooldown
        if (lastEmail === values.email) {
          setResendCount(prev => prev + 1);
        } else {
          setResendCount(1);
          setLastEmail(values.email);
        }
        
        startCooldown();
        
        if (onSuccess) onSuccess();
      } else {
        // Message générique même en cas d'erreur
        showSuccessToast({
          title: "Mail envoyé",
          description: "Si votre adresse email existe dans notre système, vous recevrez un lien de réinitialisation."
        });
      }
    } catch (error) {
      handleNetworkError();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-foreground">
          Mot de passe oublié ?
        </h1>
        <p className="text-muted-foreground mt-2">
          Entrez votre adresse email pour recevoir un lien de réinitialisation
        </p>
      </div>
      
      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Email */}
          <FormField
            control={control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Adresse email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="votre adresse email"
                    autoComplete="email"
                    className="text-sm"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Info renvoi - Masqué pour la sécurité */}
          {resendCount >= 3 && (
            <div className="text-sm text-destructive">
              <p>Limite de demandes atteinte</p>
            </div>
          )}
          
          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-primary to-primary-glow text-primary-foreground hover:shadow-elegant transition-all duration-300"
            size="lg"
            disabled={isSubmitting || cooldownSeconds > 0 || resendCount >= 3}
          >
            {isSubmitting ? (
              <>
                <Spinner className="mr-2" size="sm" />
                Envoi en cours...
              </>
            ) : cooldownSeconds > 0 ? (
              `Réessayer dans ${cooldownSeconds}s`
            ) : (
              "Envoyer le lien de réinitialisation"
            )}
          </Button>
        </form>
      </Form>

      {/* Retour à la connexion */}
      <Link 
        to="/login" 
        className="w-full inline-flex items-center justify-center h-11 px-8 rounded-md bg-secondary hover:bg-secondary/80 text-muted-foreground text-sm font-medium transition-colors"
      >
        Retour à la connexion
      </Link>
    </div>
  );
};

export default ForgotPasswordForm;

