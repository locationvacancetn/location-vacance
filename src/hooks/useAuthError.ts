import { useToast } from "@/hooks/use-toast";
import { AUTH_MESSAGES } from "@/constants/authMessages";
import { showSuccess as showSuccessToast, showError as showErrorToast } from "@/lib/appToast";

export const useAuthError = () => {
  const { toast } = useToast();

  const showSuccess = (message: typeof AUTH_MESSAGES.LOGIN_SUCCESS | typeof AUTH_MESSAGES.SIGNUP_SUCCESS | typeof AUTH_MESSAGES.SIGNUP_EMAIL_VERIFICATION | typeof AUTH_MESSAGES.LOGOUT_SUCCESS) => {
    showSuccessToast({
      title: message.title,
      description: message.description
    });
  };

  const showError = (message: typeof AUTH_MESSAGES.LOGIN_ERROR | typeof AUTH_MESSAGES.SIGNUP_ERROR | typeof AUTH_MESSAGES.LOGOUT_ERROR | typeof AUTH_MESSAGES.NETWORK_ERROR | typeof AUTH_MESSAGES.UNEXPECTED_ERROR | typeof AUTH_MESSAGES.SESSION_EXPIRED) => {
    showErrorToast({
      title: message.title,
      description: message.description
    });
  };

  const handleAuthError = (error: any, context: 'login' | 'signup' | 'logout' | 'session' | 'password-reset') => {
    console.error(`Auth error in ${context}:`, error);

    // Gestion spécifique par contexte
    switch (context) {
      case 'login':
        if (error?.message?.includes('Invalid login credentials')) {
          showError(AUTH_MESSAGES.LOGIN_ERROR);
        } else if (error?.message?.includes('refresh_token') || error?.message?.includes('Invalid Refresh Token')) {
          showError(AUTH_MESSAGES.SESSION_EXPIRED);
        } else {
          showError(AUTH_MESSAGES.UNEXPECTED_ERROR);
        }
        break;
      
      case 'signup':
        if (error?.message?.includes('User already registered')) {
          showErrorToast({
            title: "Erreur d'inscription",
            description: "Un compte avec cet email existe déjà"
          });
        } else {
          showError(AUTH_MESSAGES.SIGNUP_ERROR);
        }
        break;
      
      case 'logout':
        if (error?.message?.includes('session') && error?.message?.includes('missing')) {
          // Session déjà expirée, c'est normal
          showSuccess(AUTH_MESSAGES.LOGOUT_SUCCESS);
        } else {
          showError(AUTH_MESSAGES.LOGOUT_ERROR);
        }
        break;
      
      case 'session':
        if (error?.message?.includes('refresh_token') || error?.message?.includes('Invalid Refresh Token')) {
          showError(AUTH_MESSAGES.SESSION_EXPIRED);
        } else {
          showError(AUTH_MESSAGES.UNEXPECTED_ERROR);
        }
        break;
      
      case 'password-reset':
        if (error?.message?.includes('session') && error?.message?.includes('missing')) {
          showErrorToast({
            title: "Lien expiré",
            description: "Le lien de réinitialisation a expiré. Veuillez faire une nouvelle demande."
          });
        } else {
          showErrorToast({
            title: "Erreur de réinitialisation",
            description: "Une erreur est survenue lors de la réinitialisation du mot de passe."
          });
        }
        break;
      
      default:
        showError(AUTH_MESSAGES.UNEXPECTED_ERROR);
    }
  };

  const handleNetworkError = () => {
    showErrorToast(AUTH_MESSAGES.NETWORK_ERROR);
  };

  return {
    showSuccess,
    showError,
    handleAuthError,
    handleNetworkError
  };
};
