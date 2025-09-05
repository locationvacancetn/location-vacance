// Messages d'authentification centralisés
export const AUTH_MESSAGES = {
  // Messages de succès
  LOGIN_SUCCESS: {
    title: "Connexion réussie !",
    description: "Bienvenue sur NestStayHub"
  },
  SIGNUP_SUCCESS: {
    title: "Inscription réussie !",
    description: "Bienvenue sur NestStayHub"
  },
  SIGNUP_EMAIL_VERIFICATION: {
    title: "Inscription réussie !",
    description: "Vérifiez votre email pour confirmer votre compte"
  },
  LOGOUT_SUCCESS: {
    title: "Déconnexion réussie",
    description: "Vous avez été déconnecté avec succès"
  },

  // Messages d'erreur
  LOGIN_ERROR: {
    title: "Erreur de connexion",
    description: "Vérifiez vos identifiants et réessayez"
  },
  SIGNUP_ERROR: {
    title: "Erreur d'inscription",
    description: "Impossible de créer votre compte"
  },
  LOGOUT_ERROR: {
    title: "Erreur de déconnexion",
    description: "Impossible de se déconnecter. Veuillez réessayer."
  },
  NETWORK_ERROR: {
    title: "Erreur de connexion",
    description: "Problème de connexion. Veuillez réessayer."
  },
  UNEXPECTED_ERROR: {
    title: "Erreur",
    description: "Une erreur inattendue s'est produite"
  },
  SESSION_EXPIRED: {
    title: "Session expirée",
    description: "Votre session a expiré. Veuillez vous reconnecter."
  },

  // Messages de validation
  ROLE_REQUIRED: "Veuillez sélectionner un type de compte",
  PASSWORDS_MISMATCH: "Les mots de passe ne correspondent pas",
  EMAIL_INVALID: "Adresse email invalide",
  PASSWORD_TOO_SHORT: "Le mot de passe doit contenir au moins 8 caractères",
  FULL_NAME_REQUIRED: "Le nom complet est requis",

  // Messages de loading
  LOGGING_IN: "Connexion en cours...",
  SIGNING_UP: "Création en cours...",
  LOGGING_OUT: "Déconnexion en cours...",
} as const;

// Types pour TypeScript
export type AuthMessageKey = keyof typeof AUTH_MESSAGES;
export type AuthSuccessMessage = typeof AUTH_MESSAGES.LOGIN_SUCCESS | typeof AUTH_MESSAGES.SIGNUP_SUCCESS | typeof AUTH_MESSAGES.SIGNUP_EMAIL_VERIFICATION | typeof AUTH_MESSAGES.LOGOUT_SUCCESS;
export type AuthErrorMessage = typeof AUTH_MESSAGES.LOGIN_ERROR | typeof AUTH_MESSAGES.SIGNUP_ERROR | typeof AUTH_MESSAGES.LOGOUT_ERROR | typeof AUTH_MESSAGES.NETWORK_ERROR | typeof AUTH_MESSAGES.UNEXPECTED_ERROR | typeof AUTH_MESSAGES.SESSION_EXPIRED;
