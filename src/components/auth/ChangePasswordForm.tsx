import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Lock, Shield } from "lucide-react";
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
  FormMessage,
  FormDescription
} from "@/components/ui/form";
import { Spinner } from "@/components/ui/spinner";
import { useAuthError } from "@/hooks/useAuthError";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { showSuccess } from "@/lib/appToast";

// Schéma de validation simple pour la modification de mot de passe
const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Le mot de passe actuel est requis"),
  newPassword: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
  confirmPassword: z.string().min(8, "Confirmez votre nouveau mot de passe"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Les nouveaux mots de passe ne correspondent pas",
  path: ["confirmPassword"],
}).refine((data) => data.currentPassword !== data.newPassword, {
  message: "Le nouveau mot de passe doit être différent de l'actuel",
  path: ["newPassword"],
});

interface ChangePasswordFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  showCancelButton?: boolean;
  showButton?: boolean;
}

const ChangePasswordForm = ({ 
  onSuccess, 
  onCancel, 
  showCancelButton = false,
  showButton = true
}: ChangePasswordFormProps) => {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { updatePassword, user } = useAuth();
  const { showSuccess, handleAuthError, handleNetworkError } = useAuthError();
  const { toast } = useToast();

  const form = useForm({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const { handleSubmit, control, reset } = form;

  const onSubmit = async (values: z.infer<typeof changePasswordSchema>) => {
    setIsSubmitting(true);
    
    try {
      // Vérifier que l'utilisateur est authentifié
      if (!user?.email) {
        throw new Error("Utilisateur non authentifié");
      }

      // IMPORTANT: Vérifier d'abord le mot de passe actuel
      // En tentant une reconnexion avec l'email et le mot de passe actuel
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: values.currentPassword
      });

      if (signInError) {
        toast({
          title: "Erreur d'authentification",
          description: "Le mot de passe actuel est incorrect.",
          variant: "destructive",
        });
        return;
      }

      // Si la vérification réussit, mettre à jour le mot de passe
      const { error } = await updatePassword(values.newPassword);
      
      if (error) {
        // Gestion spécifique des erreurs de mot de passe
        if (error.message?.includes('weak') || error.message?.includes('password')) {
          toast({
            title: "Erreur de sécurité",
            description: "Le mot de passe ne respecte pas les critères de sécurité requis.",
            variant: "destructive",
          });
        } else {
          handleAuthError(error, 'password-change');
        }
        return;
      }

      // Succès
      showSuccess({
        title: "Mot de passe modifié",
        description: "Votre mot de passe a été mis à jour avec succès"
      });
      
      // Réinitialiser le formulaire
      reset();
      
      // Appeler le callback de succès si fourni
      if (onSuccess) {
        onSuccess();
      }

    } catch (error) {
      console.error('Erreur lors de la modification du mot de passe:', error);
      handleNetworkError();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 md:space-y-4 space-y-0">
      
      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Mot de passe actuel */}
          <FormField
            control={control}
            name="currentPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mot de passe actuel</FormLabel>
                <FormControl>
                  <div className="relative max-w-md">
                    <Input
                      type={showCurrentPassword ? "text" : "password"}
                      placeholder="••••••••"
                      autoComplete="current-password"
                      className="pr-10"
                      {...field}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      tabIndex={-1}
                    >
                      {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Nouveau mot de passe */}
          <FormField
            control={control}
            name="newPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nouveau mot de passe</FormLabel>
                <FormControl>
                  <div className="relative max-w-md">
                    <Input
                      type={showNewPassword ? "text" : "password"}
                      placeholder="••••••••"
                      autoComplete="new-password"
                      className="pr-10"
                      {...field}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      tabIndex={-1}
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </FormControl>
                <FormDescription>
                  Minimum 8 caractères
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Confirmation du nouveau mot de passe */}
          <FormField
            control={control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirmer le nouveau mot de passe</FormLabel>
                <FormControl>
                  <div className="relative max-w-md">
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      autoComplete="new-password"
                      className="pr-10"
                      {...field}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

           {/* Boutons d'action */}
           {showButton && (
             <div className="flex flex-col sm:flex-row gap-3 pt-4 md:justify-end">
               <Button
                 type="submit"
                 className="w-full sm:w-auto md:w-auto"
                 disabled={isSubmitting}
               >
                 {isSubmitting ? (
                   <>
                     <Spinner className="mr-2" size="sm" />
                     Modification...
                   </>
                 ) : (
                   <>
                     <Lock className="w-4 h-4 mr-2" />
                     Modifier le mot de passe
                   </>
                 )}
               </Button>
               
               {showCancelButton && onCancel && (
                 <Button
                   type="button"
                   variant="outline"
                   className="w-full sm:w-auto md:w-auto"
                   onClick={onCancel}
                   disabled={isSubmitting}
                 >
                   Annuler
                 </Button>
               )}
             </div>
           )}
        </form>
      </Form>
    </div>
  );
};

export default ChangePasswordForm;
