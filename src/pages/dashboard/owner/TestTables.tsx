import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

const TestTables = () => {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const testTable = async (tableName: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(5);

      if (error) {
        setResults(prev => [...prev, {
          table: tableName,
          success: false,
          error: error.message,
          data: null
        }]);
      } else {
        setResults(prev => [...prev, {
          table: tableName,
          success: true,
          error: null,
          data: data,
          count: data?.length || 0
        }]);
      }
    } catch (err) {
      setResults(prev => [...prev, {
        table: tableName,
        success: false,
        error: String(err),
        data: null
      }]);
    } finally {
      setLoading(false);
    }
  };

  const testAllTables = async () => {
    setResults([]);
    const tables = ['cities', 'regions', 'property_types', 'equipments'];
    
    for (const table of tables) {
      await testTable(table);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Test des tables de la base de données</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button onClick={testAllTables} disabled={loading}>
              Tester toutes les tables
            </Button>
            <Button onClick={() => setResults([])} variant="outline">
              Effacer les résultats
            </Button>
          </div>

          {loading && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-800">Test en cours...</p>
            </div>
          )}

          <div className="space-y-4">
            {results.map((result, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border ${
                  result.success
                    ? 'bg-green-50 border-green-200'
                    : 'bg-red-50 border-red-200'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">
                    Table: {result.table}
                  </h3>
                  <span className={`px-2 py-1 rounded text-xs ${
                    result.success
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {result.success ? 'SUCCESS' : 'ERROR'}
                  </span>
                </div>
                
                {result.success ? (
                  <div>
                    <p className="text-sm text-green-700">
                      {result.count} enregistrement(s) trouvé(s)
                    </p>
                    {result.data && result.data.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs font-medium text-green-800">Exemple de données:</p>
                        <pre className="text-xs text-green-700 mt-1 bg-green-100 p-2 rounded overflow-x-auto">
                          {JSON.stringify(result.data[0], null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-red-700">
                    Erreur: {result.error}
                  </p>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TestTables;
