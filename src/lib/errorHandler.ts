// Gestionnaire d'erreurs centralisé
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public isOperational: boolean = true
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const handleApiError = (error: any): AppError => {
  if (error instanceof AppError) {
    return error;
  }

  // Erreurs Supabase
  if (error.code) {
    switch (error.code) {
      case 'PGRST116':
        return new AppError('Aucune donnée trouvée', 'NOT_FOUND', 404);
      case 'PGRST301':
        return new AppError('Accès non autorisé', 'UNAUTHORIZED', 401);
      case 'PGRST302':
        return new AppError('Forbidden', 'FORBIDDEN', 403);
      default:
        return new AppError(
          error.message || 'Erreur de base de données',
          'DATABASE_ERROR',
          500
        );
    }
  }

  // Erreurs réseau
  if (error.name === 'TypeError' && error.message.includes('fetch')) {
    return new AppError('Erreur de connexion', 'NETWORK_ERROR', 503);
  }

  // Erreur par défaut
  return new AppError(
    error.message || 'Une erreur inattendue s\'est produite',
    'UNKNOWN_ERROR',
    500
  );
};

export const logError = (error: AppError, context?: string) => {
  console.error(`[${context || 'App'}] ${error.code}: ${error.message}`, {
    code: error.code,
    statusCode: error.statusCode,
    isOperational: error.isOperational,
    stack: error.stack
  });
};
