import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Settings, User, Bell, Shield, Globe, Save } from 'lucide-react';
import { useNavigation } from '@/hooks/useNavigation';
import { useLogger } from '@/lib/logger';

const SettingsPage = () => {
  const { navigateTo } = useNavigation();
  const logger = useLogger('SettingsPage');

  logger.debug('SettingsPage rendered');

  const handleSave = () => {
    logger.info('Settings saved');
    // TODO: Implement save settings
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Paramètres</h1>
          <p className="text-gray-600">Configuration de votre compte et préférences</p>
        </div>
        <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700 text-white">
          <Save className="mr-2 h-4 w-4" />
          Sauvegarder
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profil */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="mr-2 h-5 w-5" />
              Profil
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="fullName">Nom complet</Label>
              <Input id="fullName" defaultValue="Marie Dubois" />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" defaultValue="marie.dubois@email.com" />
            </div>
            <div>
              <Label htmlFor="phone">Téléphone</Label>
              <Input id="phone" defaultValue="+33 6 12 34 56 78" />
            </div>
            <div>
              <Label htmlFor="bio">Bio</Label>
              <textarea
                id="bio"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                defaultValue="Propriétaire passionnée par l'hospitalité"
              />
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="mr-2 h-5 w-5" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="email-notifications">Notifications email</Label>
                <p className="text-sm text-gray-600">Recevoir des notifications par email</p>
              </div>
              <Switch id="email-notifications" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="booking-notifications">Nouvelles réservations</Label>
                <p className="text-sm text-gray-600">Être notifié des nouvelles réservations</p>
              </div>
              <Switch id="booking-notifications" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="payment-notifications">Paiements</Label>
                <p className="text-sm text-gray-600">Notifications de paiement</p>
              </div>
              <Switch id="payment-notifications" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="maintenance-notifications">Maintenance</Label>
                <p className="text-sm text-gray-600">Alertes de maintenance</p>
              </div>
              <Switch id="maintenance-notifications" />
            </div>
          </CardContent>
        </Card>

        {/* Sécurité */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="mr-2 h-5 w-5" />
              Sécurité
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="current-password">Mot de passe actuel</Label>
              <Input id="current-password" type="password" />
            </div>
            <div>
              <Label htmlFor="new-password">Nouveau mot de passe</Label>
              <Input id="new-password" type="password" />
            </div>
            <div>
              <Label htmlFor="confirm-password">Confirmer le mot de passe</Label>
              <Input id="confirm-password" type="password" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="two-factor">Authentification à deux facteurs</Label>
                <p className="text-sm text-gray-600">Sécuriser votre compte avec 2FA</p>
              </div>
              <Switch id="two-factor" />
            </div>
          </CardContent>
        </Card>

        {/* Préférences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="mr-2 h-5 w-5" />
              Préférences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="language">Langue</Label>
              <Select defaultValue="fr">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fr">Français</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="ar">العربية</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="timezone">Fuseau horaire</Label>
              <Select defaultValue="europe/paris">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="europe/paris">Europe/Paris</SelectItem>
                  <SelectItem value="europe/london">Europe/London</SelectItem>
                  <SelectItem value="america/new_york">America/New_York</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="currency">Devise</Label>
              <Select defaultValue="tnd">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tnd">TND (Dinar tunisien)</SelectItem>
                  <SelectItem value="eur">EUR (Euro)</SelectItem>
                  <SelectItem value="usd">USD (Dollar américain)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Confidentialité */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Globe className="mr-2 h-5 w-5" />
              Confidentialité
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="profile-public">Profil public</Label>
                <p className="text-sm text-gray-600">Rendre votre profil visible publiquement</p>
              </div>
              <Switch id="profile-public" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="analytics">Analytics</Label>
                <p className="text-sm text-gray-600">Partager des données d'utilisation</p>
              </div>
              <Switch id="analytics" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="marketing">Marketing</Label>
                <p className="text-sm text-gray-600">Recevoir des communications marketing</p>
              </div>
              <Switch id="marketing" />
            </div>
          </CardContent>
        </Card>

        {/* Compte */}
        <Card>
          <CardHeader>
            <CardTitle>Compte</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-gray-600">
              <p>Membre depuis: 15 janvier 2024</p>
              <p>Dernière connexion: Aujourd'hui à 14:30</p>
              <p>Type de compte: Propriétaire</p>
            </div>
            <div className="space-y-2">
              <Button variant="outline" className="w-full">
                Télécharger mes données
              </Button>
              <Button variant="outline" className="w-full text-red-600 hover:text-red-700">
                Supprimer mon compte
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SettingsPage;
