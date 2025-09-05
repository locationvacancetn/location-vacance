import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
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
import { AUTH_MESSAGES } from "@/constants/authMessages";

const loginSchema = z.object({
  email: z.string().email("Adresse email invalide").min(1, "L'email est requis"),
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
  rememberMe: z.boolean().optional(),
});

interface LoginFormProps {
  onSuccess?: () => void;
  showTitle?: boolean;
  showForgotPassword?: boolean;
}

const LoginForm = ({ onSuccess, showTitle = true, showForgotPassword = true }: LoginFormProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const { signIn, isLoggingIn } = useAuth();
  const { showSuccess, handleAuthError, handleNetworkError } = useAuthError();

  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });
  const { handleSubmit, control } = form;

  const onSubmit = async (values: any) => {
    try {
      const { error } = await signIn(values.email, values.password);
      if (error) {
        handleAuthError(error, 'login');
      } else {
        showSuccess(AUTH_MESSAGES.LOGIN_SUCCESS);
        if (onSuccess) onSuccess();
      }
    } catch (error) {
      handleNetworkError();
    }
  };

  return (
    <div className="space-y-6">
      {showTitle && (
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground">
            Connexion
          </h1>
          <p className="text-muted-foreground">
            Bienvenue ! Connectez-vous à votre compte
          </p>
        </div>
      )}
      
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
                    type="text"
                    placeholder="votre@email.com"
                    autoComplete="email"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Password */}
          <FormField
            control={control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mot de passe</FormLabel>
                <FormControl>
                  <div className="relative mt-1">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Entrez votre mot de passe"
                      autoComplete="current-password"
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
          
          {/* Remember Me and Forgot Password */}
          <FormField
            control={control}
            name="rememberMe"
            render={({ field }) => (
              <FormItem className="flex items-center space-x-2">
                <FormControl>
                  <Checkbox
                    id="remember"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <label htmlFor="remember" className="text-sm text-muted-foreground">
                  Se souvenir de moi
                </label>
                {showForgotPassword && (
                  <div className="flex-1 text-right">
                    <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                      Mot de passe oublié ?
                    </Link>
                  </div>
                )}
              </FormItem>
            )}
          />
          
          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-primary to-primary-glow text-primary-foreground hover:shadow-elegant transition-all duration-300"
            size="lg"
            disabled={isLoggingIn}
          >
            {isLoggingIn ? (
              <>
                <Spinner className="mr-2" size="sm" />
                {AUTH_MESSAGES.LOGGING_IN}
              </>
            ) : (
              "Se connecter"
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default LoginForm;
