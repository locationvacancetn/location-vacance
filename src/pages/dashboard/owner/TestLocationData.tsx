import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

const TestLocationData = () => {
  const [cities, setCities] = useState<any[]>([]);
  const [regions, setRegions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testCities = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('cities')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) {
        console.error('Erreur cities:', error);
        setError(`Erreur cities: ${error.message}`);
        return;
      }

      console.log('Cities data:', data);
      setCities(data || []);
    } catch (err) {
      console.error('Erreur catch cities:', err);
      setError(`Erreur catch cities: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  const testRegions = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('regions')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) {
        console.error('Erreur regions:', error);
        setError(`Erreur regions: ${error.message}`);
        return;
      }

      console.log('Regions data:', data);
      setRegions(data || []);
    } catch (err) {
      console.error('Erreur catch regions:', err);
      setError(`Erreur catch regions: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  const testCitiesWithRegions = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('cities')
        .select(`
          *,
          regions (*)
        `)
        .eq('is_active', true)
        .order('name');

      if (error) {
        console.error('Erreur cities with regions:', error);
        setError(`Erreur cities with regions: ${error.message}`);
        return;
      }

      console.log('Cities with regions data:', data);
      setCities(data || []);
    } catch (err) {
      console.error('Erreur catch cities with regions:', err);
      setError(`Erreur catch cities with regions: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Test des données de localisation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button onClick={testCities} disabled={loading}>
              Tester Cities
            </Button>
            <Button onClick={testRegions} disabled={loading}>
              Tester Regions
            </Button>
            <Button onClick={testCitiesWithRegions} disabled={loading}>
              Tester Cities + Regions
            </Button>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 font-medium">Erreur:</p>
              <p className="text-red-700 text-sm mt-1">{error}</p>
            </div>
          )}

          {loading && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-800">Chargement...</p>
            </div>
          )}

          {cities.length > 0 && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 font-medium">Villes trouvées: {cities.length}</p>
              <div className="mt-2 space-y-1">
                {cities.slice(0, 5).map((city, index) => (
                  <div key={index} className="text-sm text-green-700">
                    • {city.name} (ID: {city.id})
                    {city.regions && (
                      <span className="ml-2 text-xs">
                        - {city.regions.length} région(s)
                      </span>
                    )}
                  </div>
                ))}
                {cities.length > 5 && (
                  <div className="text-xs text-green-600">
                    ... et {cities.length - 5} autres
                  </div>
                )}
              </div>
            </div>
          )}

          {regions.length > 0 && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 font-medium">Régions trouvées: {regions.length}</p>
              <div className="mt-2 space-y-1">
                {regions.slice(0, 5).map((region, index) => (
                  <div key={index} className="text-sm text-green-700">
                    • {region.name} (ID: {region.id})
                    {region.city_id && (
                      <span className="ml-2 text-xs">
                        - City ID: {region.city_id}
                      </span>
                    )}
                  </div>
                ))}
                {regions.length > 5 && (
                  <div className="text-xs text-green-600">
                    ... et {regions.length - 5} autres
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TestLocationData;
