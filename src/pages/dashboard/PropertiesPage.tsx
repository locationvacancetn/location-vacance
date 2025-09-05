import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Building, MapPin, DollarSign } from 'lucide-react';
import { useNavigation } from '@/hooks/useNavigation';
import { useLogger } from '@/lib/logger';

const PropertiesPage = () => {
  const { navigateTo } = useNavigation();
  const logger = useLogger('PropertiesPage');

  logger.debug('PropertiesPage rendered');

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mes Propriétés</h1>
          <p className="text-gray-600">Gérez vos propriétés immobilières</p>
        </div>
        <Button 
          onClick={() => {
            logger.info('Add property clicked');
            // TODO: Navigate to add property form
          }}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          <Plus className="mr-2 h-4 w-4" />
          Ajouter une propriété
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                <Building className="h-12 w-12 text-gray-400" />
              </div>
            </CardHeader>
            <CardContent>
              <CardTitle className="text-lg">Villa {i}</CardTitle>
              <div className="flex items-center text-gray-600 mt-2">
                <MapPin className="h-4 w-4 mr-1" />
                <span className="text-sm">Sousse, Tunisie</span>
              </div>
              <div className="flex items-center text-green-600 mt-2">
                <DollarSign className="h-4 w-4 mr-1" />
                <span className="font-semibold">TND 950/nuit</span>
              </div>
              <div className="mt-4 flex space-x-2">
                <Button size="sm" variant="outline" className="flex-1">
                  Modifier
                </Button>
                <Button size="sm" variant="outline" className="flex-1">
                  Voir
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PropertiesPage;
