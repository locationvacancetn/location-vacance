/**
 * 🔒 CONFIGURATION CORS SÉCURISÉE
 * 
 * Restreint l'accès aux Edge Functions uniquement aux domaines autorisés.
 * Bloque toutes les requêtes provenant de domaines non autorisés.
 * 
 * SEC-006: Correction du CORS ouvert à tous (*)
 */

// Domaines autorisés pour accéder aux Edge Functions
const ALLOWED_ORIGINS = [
  'https://location-vacance.tn',           // Production
  'https://www.location-vacance.tn',       // Production (www)
  // Les domaines localhost sont gérés par regex ci-dessous
];

/**
 * Vérifie si une origine est autorisée
 */
function isOriginAllowed(origin: string | null): boolean {
  if (!origin) return false;
  
  // Vérifier les domaines explicitement autorisés
  if (ALLOWED_ORIGINS.includes(origin)) {
    return true;
  }
  
  // Autoriser localhost avec n'importe quel port (développement uniquement)
  // Regex: http://localhost:PORT ou http://127.0.0.1:PORT
  const localhostPattern = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;
  if (localhostPattern.test(origin)) {
    return true;
  }
  
  return false;
}

/**
 * Génère les headers CORS appropriés en fonction de l'origine
 * 
 * @param origin - L'origine de la requête (depuis req.headers.get('origin'))
 * @returns Headers CORS sécurisés
 */
export function getCorsHeaders(origin: string | null): Record<string, string> {
  // Vérifier si l'origine est autorisée
  const allowedOrigin = isOriginAllowed(origin) 
    ? origin 
    : ALLOWED_ORIGINS[0]; // Fallback vers production
  
  return {
    'Access-Control-Allow-Origin': allowedOrigin || ALLOWED_ORIGINS[0],
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
    'Access-Control-Allow-Credentials': 'true',
  };
}

/**
 * Headers CORS pour requêtes OPTIONS (preflight)
 * Utilise l'origine de la requête si elle est autorisée
 */
export function getPreflightHeaders(origin: string | null): Record<string, string> {
  return {
    ...getCorsHeaders(origin),
    'Access-Control-Max-Age': '86400', // Cache preflight pendant 24h
  };
}

/**
 * Vérifie si la requête provient d'un domaine autorisé
 * Retourne une erreur 403 si le domaine n'est pas autorisé
 */
export function validateOrigin(origin: string | null): Response | null {
  if (!origin) {
    // Pas d'origine = requête directe (curl, postman, etc.)
    // On peut choisir de l'accepter ou de la bloquer
    // Pour plus de sécurité, on pourrait retourner une erreur ici
    return null;
  }
  
  if (!isOriginAllowed(origin)) {
    return new Response(
      JSON.stringify({ 
        error: 'Origine non autorisée',
        message: 'Cette origine n\'est pas autorisée à accéder à cette ressource.'
      }),
      { 
        status: 403,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': origin, // Nécessaire pour que le navigateur lise l'erreur
        }
      }
    );
  }
  
  return null;
}

/**
 * Liste des origines autorisées (pour logs ou debug)
 */
export function getAllowedOrigins(): string[] {
  return [
    ...ALLOWED_ORIGINS,
    'http://localhost:* (tous les ports)',
    'http://127.0.0.1:* (tous les ports)'
  ];
}

