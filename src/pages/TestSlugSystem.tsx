import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SlugService } from '@/lib/slugService';
import { PropertyService } from '@/lib/propertyService';
import { useSlugValidation, useSlugGeneration } from '@/hooks/useSlugValidation';
import { runAllSlugTests } from '@/utils/slugTestUtils';

const TestSlugSystem = () => {
  const [propertyType, setPropertyType] = useState('Villa');
  const [city, setCity] = useState('Hammamet');
  const [title, setTitle] = useState('Villa de luxe avec piscine');
  const [generatedSlug, setGeneratedSlug] = useState('');
  const [testResults, setTestResults] = useState<any>(null);

  // Validation du slug en temps réel
  const slugValidation = useSlugValidation(generatedSlug);
  
  // Génération de suggestions
  const { suggestions, isGenerating } = useSlugGeneration(propertyType, city, title);

  const generateSlug = () => {
    try {
      const slug = SlugService.generatePropertySlug(propertyType, city, title);
      setGeneratedSlug(slug);
    } catch (error) {
      console.error('Erreur lors de la génération du slug:', error);
    }
  };

  const runTests = () => {
    try {
      runAllSlugTests();
      setTestResults('Tests exécutés - voir la console pour les résultats');
    } catch (error) {
      console.error('Erreur lors des tests:', error);
      setTestResults('Erreur lors des tests - voir la console');
    }
  };

  const testDatabaseIntegration = async () => {
    try {
      const isAvailable = await PropertyService.checkSlugAvailability(generatedSlug);
      console.log(`Slug "${generatedSlug}" disponible:`, isAvailable);
      
      if (isAvailable) {
        const uniqueSlug = await PropertyService.generateUniquePropertySlug(
          propertyType,
          city,
          title,
          'Test Region'
        );
        console.log('Slug unique généré:', uniqueSlug);
      }
    } catch (error) {
      console.error('Erreur lors du test d\'intégration:', error);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>🧪 Test du système de slugs</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="propertyType">Type de propriété</Label>
              <Input
                id="propertyType"
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value)}
                placeholder="Villa"
              />
            </div>
            <div>
              <Label htmlFor="city">Ville</Label>
              <Input
                id="city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Hammamet"
              />
            </div>
            <div>
              <Label htmlFor="title">Titre</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Villa de luxe avec piscine"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={generateSlug}>
              Générer le slug
            </Button>
            <Button onClick={runTests} variant="outline">
              Lancer les tests
            </Button>
            <Button onClick={testDatabaseIntegration} variant="secondary">
              Test DB
            </Button>
          </div>

          {generatedSlug && (
            <div className="space-y-2">
              <Label>Slug généré:</Label>
              <div className="flex items-center gap-2">
                <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                  {generatedSlug}
                </code>
                <Badge 
                  variant={slugValidation.isValid ? "default" : "destructive"}
                >
                  {slugValidation.status}
                </Badge>
              </div>
              {slugValidation.message && (
                <p className={`text-sm ${
                  slugValidation.isValid ? 'text-green-600' : 'text-red-600'
                }`}>
                  {slugValidation.message}
                </p>
              )}
            </div>
          )}

          {suggestions.length > 0 && (
            <div className="space-y-2">
              <Label>Suggestions de slugs:</Label>
              <div className="space-y-1">
                {suggestions.map((suggestion, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                      {suggestion}
                    </code>
                  </div>
                ))}
              </div>
            </div>
          )}

          {testResults && (
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-blue-800">{testResults}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>📊 Exemples de slugs générés</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[
              { type: 'Villa', city: 'Hammamet', title: 'Villa de luxe avec piscine' },
              { type: 'Appartement', city: 'Tunis', title: 'Appartement centre ville' },
              { type: 'Chalet', city: 'Tabarka', title: 'Chalet & Maison de montagne' },
              { type: 'Maison d\'hôte', city: 'Djerba', title: 'Maison "Les Palmiers" - Vue mer' }
            ].map((example, index) => {
              const slug = SlugService.generatePropertySlug(example.type, example.city, example.title);
              return (
                <div key={index} className="flex items-center gap-4 p-2 bg-gray-50 rounded">
                  <div className="flex-1">
                    <span className="font-medium">{example.type}</span> - 
                    <span className="text-gray-600">{example.city}</span> - 
                    <span className="text-gray-500">{example.title}</span>
                  </div>
                  <code className="bg-white px-2 py-1 rounded text-sm border">
                    {slug}
                  </code>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TestSlugSystem;
