/**
 * Utilitaires de test pour l'authentification
 * Permet de simuler des erreurs de token de rafraîchissement
 */

// Générer dynamiquement la clé localStorage
const getAuthTokenKey = () => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const projectRef = supabaseUrl?.split('//')[1]?.split('.')[0];
  return projectRef ? `sb-${projectRef}-auth-token` : 'sb-auth-token';
};

/**
 * Simule une erreur de token de rafraîchissement en corrompant le localStorage
 */
export const simulateRefreshTokenError = () => {
  // Corrompre le token de rafraîchissement dans le localStorage
  const corruptedToken = {
    access_token: 'invalid_token',
    refresh_token: 'invalid_refresh_token',
    expires_at: Math.floor(Date.now() / 1000) - 3600, // Expiré il y a 1 heure
    expires_in: 3600,
    token_type: 'bearer',
    user: {
      id: 'test-user-id',
      email: 'test@example.com',
      created_at: new Date().toISOString(),
      last_sign_in_at: new Date().toISOString(),
      user_metadata: {
        role: 'owner'
      }
    }
  };

  localStorage.setItem(getAuthTokenKey(), JSON.stringify(corruptedToken));
  console.log('Simulated refresh token error - corrupted localStorage');
};

/**
 * Simule une session expirée
 */
export const simulateExpiredSession = () => {
  const expiredToken = {
    access_token: 'valid_token',
    refresh_token: 'expired_refresh_token',
    expires_at: Math.floor(Date.now() / 1000) - 7200, // Expiré il y a 2 heures
    expires_in: 3600,
    token_type: 'bearer',
    user: {
      id: 'test-user-id',
      email: 'test@example.com',
      created_at: new Date().toISOString(),
      last_sign_in_at: new Date().toISOString(),
      user_metadata: {
        role: 'owner'
      }
    }
  };

  localStorage.setItem(getAuthTokenKey(), JSON.stringify(expiredToken));
  console.log('Simulated expired session');
};

/**
 * Nettoie complètement le localStorage
 */
export const clearAllAuthData = () => {
  localStorage.removeItem(getAuthTokenKey());
  localStorage.removeItem('supabase.auth.token');
  console.log('Cleared all auth data from localStorage');
};

/**
 * Vérifie l'état du localStorage
 */
export const checkLocalStorageState = () => {
  const authTokenKey = getAuthTokenKey();
  const supabaseToken = localStorage.getItem(authTokenKey);
  const altToken = localStorage.getItem('supabase.auth.token');
  
  console.log('LocalStorage state:', {
    authTokenKey,
    supabaseToken: supabaseToken ? 'Present' : 'Missing',
    altToken: altToken ? 'Present' : 'Missing',
    supabaseTokenData: supabaseToken ? JSON.parse(supabaseToken) : null
  });
  
  return {
    supabaseToken: !!supabaseToken,
    altToken: !!altToken,
    data: supabaseToken ? JSON.parse(supabaseToken) : null
  };
};
