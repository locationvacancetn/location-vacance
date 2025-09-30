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

  console.log('🧪 Test de génération de slugs...\n');

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
        console.log(`✅ Test ${index + 1}: ${testCase.name}`);
        console.log(`   Généré: ${generatedSlug}`);
      } else {
        failed++;
        console.log(`❌ Test ${index + 1}: ${testCase.name}`);
        console.log(`   Généré: ${generatedSlug}`);
        console.log(`   Attendu: ${testCase.expectedSlug || 'N/A'}`);
        if (!isValid.isValid) {
          console.log(`   Erreurs: ${isValid.errors.join(', ')}`);
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
      console.log(`❌ Test ${index + 1}: ${testCase.name} - ERREUR: ${result.error}`);
    }
  });

  console.log(`\n📊 Résultats: ${passed} réussis, ${failed} échoués\n`);
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

  console.log('🧪 Test de validation de slugs...\n');

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
      console.log(`✅ Test ${index + 1}: ${test.description}`);
    } else {
      failed++;
      console.log(`❌ Test ${index + 1}: ${test.description}`);
      console.log(`   Slug: "${test.slug}"`);
      console.log(`   Attendu: ${test.shouldPass ? 'valide' : 'invalide'}`);
      console.log(`   Obtenu: ${validation.isValid ? 'valide' : 'invalide'}`);
      if (validation.errors.length > 0) {
        console.log(`   Erreurs: ${validation.errors.join(', ')}`);
      }
    }
  });

  console.log(`\n📊 Résultats: ${passed} réussis, ${failed} échoués\n`);
  return { passed, failed, results };
};

/**
 * Teste la génération de suggestions
 */
export const testSlugSuggestions = (): void => {
  console.log('🧪 Test de génération de suggestions...\n');

  const testCase = SLUG_TEST_CASES[0];
  const suggestions = SlugService.generateSlugSuggestions(
    testCase.propertyType,
    testCase.city,
    testCase.title,
    testCase.region,
    3
  );

  console.log(`Suggestions pour "${testCase.propertyType} - ${testCase.city} - ${testCase.title}":`);
  suggestions.forEach((suggestion, index) => {
    console.log(`  ${index + 1}. ${suggestion}`);
  });
  console.log('');
};

/**
 * Lance tous les tests
 */
export const runAllSlugTests = (): void => {
  console.log('🚀 Lancement de tous les tests du système de slugs\n');
  console.log('=' .repeat(60));

  const generationResults = testSlugGeneration();
  const validationResults = testSlugValidation();
  testSlugSuggestions();

  const totalPassed = generationResults.passed + validationResults.passed;
  const totalFailed = generationResults.failed + validationResults.failed;

  console.log('=' .repeat(60));
  console.log(`🎯 RÉSULTATS FINAUX:`);
  console.log(`   ✅ Tests réussis: ${totalPassed}`);
  console.log(`   ❌ Tests échoués: ${totalFailed}`);
  console.log(`   📊 Taux de réussite: ${((totalPassed / (totalPassed + totalFailed)) * 100).toFixed(1)}%`);
  console.log('=' .repeat(60));

  if (totalFailed === 0) {
    console.log('🎉 Tous les tests sont passés avec succès !');
  } else {
    console.log('⚠️  Certains tests ont échoué. Vérifiez les détails ci-dessus.');
  }
};

/**
 * Teste l'intégration avec la base de données (nécessite une connexion)
 */
export const testDatabaseIntegration = async (): Promise<void> => {
  console.log('🧪 Test d\'intégration avec la base de données...\n');

  try {
    // Test de vérification d'unicité
    const testSlug = 'test-slug-unique-' + Date.now();
    const isAvailable = await PropertyService.checkSlugAvailability(testSlug);
    
    if (isAvailable) {
      console.log('✅ Vérification d\'unicité: OK');
    } else {
      console.log('❌ Vérification d\'unicité: ÉCHEC');
    }

    // Test de génération de slug unique
    const uniqueSlug = await PropertyService.generateUniquePropertySlug(
      'Villa',
      'Test City',
      'Test Property',
      'Test Region'
    );
    
    console.log(`✅ Génération de slug unique: ${uniqueSlug}`);

  } catch (error) {
    console.log(`❌ Erreur lors du test d'intégration: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
  }
};
