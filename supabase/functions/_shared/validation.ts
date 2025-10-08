/**
 * ✅ CODE-003 : Utilitaires de validation pour Edge Functions
 * 
 * Ce module centralise les fonctions de validation réutilisables
 * pour éviter la duplication dans les Edge Functions.
 */

/**
 * Regex pour valider le format d'un email
 * Format: nom@domaine.extension
 */
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Valide le format d'une adresse email
 * 
 * @param email - L'adresse email à valider
 * @returns true si l'email est valide, false sinon
 */
export function validateEmail(email: string): boolean {
  if (!email || typeof email !== 'string') {
    return false;
  }
  
  return EMAIL_REGEX.test(email.trim());
}

/**
 * Valide une liste d'adresses email
 * 
 * @param emails - Tableau d'adresses email à valider
 * @returns Objet contenant les emails valides et invalides
 */
export function validateEmailList(emails: string[]): {
  valid: string[];
  invalid: string[];
} {
  const valid: string[] = [];
  const invalid: string[] = [];
  
  emails.forEach(email => {
    if (validateEmail(email)) {
      valid.push(email.trim());
    } else {
      invalid.push(email);
    }
  });
  
  return { valid, invalid };
}

