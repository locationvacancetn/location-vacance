/**
 * ✅ CODE-003 : Utilitaires de validation centralisés
 * 
 * Ce fichier centralise toutes les fonctions de validation réutilisables
 * pour éviter la duplication de code.
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
 * 
 * @example
 * validateEmail('user@example.com') // true
 * validateEmail('invalid-email') // false
 * validateEmail('') // false
 */
export function validateEmail(email: string): boolean {
  if (!email || typeof email !== 'string') {
    return false;
  }
  
  return EMAIL_REGEX.test(email.trim());
}

/**
 * Valide une liste d'adresses email et les sépare en valides/invalides
 * 
 * @param emails - Tableau d'adresses email à valider
 * @returns Objet contenant les emails valides et invalides
 * 
 * @example
 * validateEmailList(['user@example.com', 'invalid', 'test@test.fr'])
 * // { valid: ['user@example.com', 'test@test.fr'], invalid: ['invalid'] }
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

/**
 * Valide et normalise une adresse email (trim + lowercase)
 * 
 * @param email - L'adresse email à normaliser
 * @returns L'email normalisé ou null si invalide
 * 
 * @example
 * normalizeEmail('  User@Example.COM  ') // 'user@example.com'
 * normalizeEmail('invalid') // null
 */
export function normalizeEmail(email: string): string | null {
  if (!validateEmail(email)) {
    return null;
  }
  
  return email.trim().toLowerCase();
}

