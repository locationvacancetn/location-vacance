/**
 * Utilitaires de test pour le système de slugs
 * Permet de tester et valider le fonctionnement du système
 */

import { SlugService } from '@/lib/slugService';
import { PropertyService } from '@/lib/propertyService';

export interface SlugTestCase {
  name: string;
  propertyType: string;
  city: string;
  title: string;
  region?: string | null;
  expectedSlug?: string;
  description: string;
}

export const SLUG_TEST_CASES: SlugTestCase[] = [
  {
    name: 'Villa avec région',
    propertyType: 'Villa',
    city: 'Hammamet',
    title: 'Villa de luxe avec piscine',
    region: 'Yasmine Hammamet',
    expectedSlug: 'villa-yasmine-hammamet-hammamet-villa-de-luxe-avec-piscine',
    description: 'Test avec région (Yasmine Hammamet)'
  },
  {
    name: 'Appartement avec région "autre"',
    propertyType: 'Appartement',
    city: 'Tunis',
    title: 'Appartement centre ville',
    region: 'Autre',
    expectedSlug: 'appartement-tunis-appartement-centre-ville',
    description: 'Test avec région "autre" (doit être exclue)'
  },
  {
    name: 'Chalet avec région',
    propertyType: 'Chalet',
    city: 'Tabarka',
    title: 'Chalet & Maison de montagne',
    region: 'Centre',
    expectedSlug: 'chalet-centre-tabarka-chalet-maison-de-montagne',
    description: 'Test avec région (Centre)'
  },
  {
    name: 'Villa sans région',
    propertyType: 'Villa',
    city: 'Sousse',
    title: 'Villa exceptionnelle avec piscine privée, jardin paysager et vue sur mer',
    region: null,
    expectedSlug: 'villa-sousse-villa-exceptionnelle-avec-piscine-privee-jardin-paysager-et-vue-sur-mer',
    description: 'Test sans région (null)'
  },
  {
    name: 'Maison avec région "autre"',
    propertyType: 'Maison d\'hôte',
    city: 'Djerba',
    title: 'Maison d\'hôte "Les Palmiers" - Vue mer',
    region: 'Autre',
    expectedSlug: 'maison-dhote-djerba-maison-dhote-les-palmiers-vue-mer',
    description: 'Test avec région "autre" (doit être exclue)'
  }
];

/**
 * Teste la génération de slugs
 */
export const testSlugGeneration = (): { passed: number; failed: number; results: any[] } => {
  const results: any[] = [];
  let passed = 0;
  let failed = 0;



  SLUG_TEST_CASES.forEach((testCase, index) => {
    try {
      const generatedSlug = SlugService.generatePropertySlug(
        testCase.propertyType,
        testCase.city,
        testCase.title,
        testCase.region
      );

      const isValid = SlugService.validateSlug(generatedSlug);
      const matchesExpected = testCase.expectedSlug ? generatedSlug === testCase.expectedSlug : true;

      const result = {
        test: testCase.name,
        input: `${testCase.propertyType} - ${testCase.city} - ${testCase.title} - ${testCase.region || 'null'}`,
        generated: generatedSlug,
        expected: testCase.expectedSlug,
        isValid: isValid.isValid,
        matchesExpected,
        validationErrors: isValid.errors,
        validationWarnings: isValid.warnings,
        passed: isValid.isValid && matchesExpected
      };

      results.push(result);

      if (result.passed) {
        passed++;


      } else {
        failed++;



        if (!isValid.isValid) {

        }
      }
    } catch (error) {
      failed++;
      const result = {
        test: testCase.name,
        input: `${testCase.propertyType} - ${testCase.city} - ${testCase.title} - ${testCase.region || 'null'}`,
        error: error instanceof Error ? error.message : 'Erreur inconnue',
        passed: false
      };
      results.push(result);

    }
  });


  return { passed, failed, results };
};

/**
 * Teste la validation de slugs
 */
export const testSlugValidation = (): { passed: number; failed: number; results: any[] } => {
  const testSlugs = [
    { slug: 'villa-hammamet-luxe', shouldPass: true, description: 'Slug valide' },
    { slug: 'villa-hammamet-luxe-', shouldPass: false, description: 'Slug avec tiret final' },
    { slug: '-villa-hammamet-luxe', shouldPass: false, description: 'Slug avec tiret initial' },
    { slug: 'villa--hammamet--luxe', shouldPass: false, description: 'Slug avec tirets multiples' },
    { slug: 'Villa-Hammamet-Luxe', shouldPass: false, description: 'Slug avec majuscules' },
    { slug: 'villa_hammamet_luxe', shouldPass: false, description: 'Slug avec underscores' },
    { slug: 'villa hammamet luxe', shouldPass: false, description: 'Slug avec espaces' },
    { slug: 'vi', shouldPass: false, description: 'Slug trop court' },
    { slug: 'a'.repeat(101), shouldPass: false, description: 'Slug trop long' },
    { slug: 'villa-hammamet-luxe-123', shouldPass: true, description: 'Slug avec chiffres' }
  ];

  const results: any[] = [];
  let passed = 0;
  let failed = 0;



  testSlugs.forEach((test, index) => {
    const validation = SlugService.validateSlug(test.slug);
    const testPassed = validation.isValid === test.shouldPass;

    const result = {
      test: test.description,
      slug: test.slug,
      expectedValid: test.shouldPass,
      actualValid: validation.isValid,
      errors: validation.errors,
      warnings: validation.warnings,
      passed: testPassed
    };

    results.push(result);

    if (testPassed) {
      passed++;

    } else {
      failed++;




      if (validation.errors.length > 0) {

      }
    }
  });


  return { passed, failed, results };
};

/**
 * Teste la génération de suggestions
 */
export const testSlugSuggestions = (): void => {


  const testCase = SLUG_TEST_CASES[0];
  const suggestions = SlugService.generateSlugSuggestions(
    testCase.propertyType,
    testCase.city,
    testCase.title,
    testCase.region,
    3
  );


  suggestions.forEach((suggestion, index) => {

  });

};

/**
 * Lance tous les tests
 */
export const runAllSlugTests = (): void => {



  const generationResults = testSlugGeneration();
  const validationResults = testSlugValidation();
  testSlugSuggestions();

  const totalPassed = generationResults.passed + validationResults.passed;
  const totalFailed = generationResults.failed + validationResults.failed;








  if (totalFailed === 0) {

  } else {

  }
};

/**
 * Teste l'intégration avec la base de données (nécessite une connexion)
 */
export const testDatabaseIntegration = async (): Promise<void> => {


  try {
    // Test de vérification d'unicité
    const testSlug = 'test-slug-unique-' + Date.now();
    const isAvailable = await PropertyService.checkSlugAvailability(testSlug);
    
    if (isAvailable) {

    } else {

    }

    // Test de génération de slug unique
    const uniqueSlug = await PropertyService.generateUniquePropertySlug(
      'Villa',
      'Test City',
      'Test Property',
      'Test Region'
    );
    


  } catch (error) {

  }
};
