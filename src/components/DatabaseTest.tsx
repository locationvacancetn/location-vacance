import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export const DatabaseTest = () => {
  const { user } = useAuth();
  const [testResults, setTestResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const runTests = async () => {
    if (!user) return;
    
    setLoading(true);
    const results: any = {};

    try {
      // Test 1: Vérifier la table profiles
      console.log('Testing profiles table...');
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .limit(5);
      
      results.profiles = {
        success: !profilesError,
        error: profilesError?.message,
        data: profiles,
        count: profiles?.length || 0
      };

      // Test 2: Vérifier le profil de l'utilisateur actuel
      console.log('Testing current user profile...');
      const { data: userProfile, error: userProfileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      results.userProfile = {
        success: !userProfileError,
        error: userProfileError?.message,
        data: userProfile
      };

      // Test 3: Vérifier les métadonnées de l'utilisateur
      console.log('Testing user metadata...');
      results.userMetadata = {
        user_id: user.id,
        email: user.email,
        user_metadata: user.user_metadata,
        created_at: user.created_at
      };

    } catch (error) {
      results.error = error;
    }

    setTestResults(results);
    setLoading(false);
  };

  useEffect(() => {
    if (user) {
      runTests();
    }
  }, [user]);

  if (!user) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p>Veuillez vous connecter pour tester la base de données</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Test de Base de Données</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={runTests} disabled={loading}>
          {loading ? 'Test en cours...' : 'Relancer les tests'}
        </Button>
        
        {testResults && (
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Résultats des tests :</h3>
              <pre className="bg-muted p-3 rounded text-xs overflow-auto max-h-96">
                {JSON.stringify(testResults, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
