import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useUserRole } from '@/hooks/useUserRole';
import { Camera, Save, Mail, Phone, MapPin, Calendar, Bug } from 'lucide-react';
import { DatabaseTest } from '@/components/DatabaseTest';

const ProfilePage = () => {
  console.log('ProfilePage - Component rendered');
  const { userProfile, userRole, loading, error } = useUserRole();
  console.log('ProfilePage - userProfile:', userProfile);
  console.log('ProfilePage - userRole:', userRole);
  console.log('ProfilePage - loading:', loading);
  console.log('ProfilePage - error:', error);
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: userProfile?.full_name || '',
    email: userProfile?.email || '',
    phone: userProfile?.phone || '',
    bio: userProfile?.bio || '',
  });

  // Mettre à jour formData quand userProfile change
  useEffect(() => {
    console.log('ProfilePage - useEffect userProfile changed:', userProfile);
    if (userProfile) {
      setFormData({
        full_name: userProfile.full_name || '',
        email: userProfile.email || '',
        phone: userProfile.phone || '',
        bio: userProfile.bio || '',
      });
    }
  }, [userProfile]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    // TODO: Implémenter la sauvegarde
    console.log('Sauvegarde des données:', formData);
    setIsEditing(false);
  };

  const getRoleLabel = (role: string) => {
    const labels = {
      owner: "Propriétaire",
      tenant: "Locataire",
      manager: "Gestionnaire", 
      admin: "Administrateur"
    };
    return labels[role as keyof typeof labels] || role;
  };

  const getRoleBadgeColor = (role: string) => {
    const colors = {
      owner: "bg-blue-500 text-white",
      tenant: "bg-green-500 text-white", 
      manager: "bg-orange-500 text-white",
      admin: "bg-red-500 text-white"
    };
    return colors[role as keyof typeof colors] || "bg-gray-500 text-white";
  };

  // Test simple pour vérifier le rendu
  console.log('ProfilePage - About to render, loading:', loading, 'userProfile:', userProfile);
  console.log('ProfilePage - userRole:', userRole);
  console.log('ProfilePage - error:', error);

  // Affichage de chargement
  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Mon Profil</h1>
          <p className="text-muted-foreground">
            Chargement de vos informations...
          </p>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-center space-y-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground">Chargement...</p>
          </div>
        </div>
      </div>
    );
  }

  // Affichage d'erreur
  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Mon Profil</h1>
          <p className="text-muted-foreground">
            Erreur lors du chargement de vos informations
          </p>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="text-destructive">
                <p className="font-medium">Erreur de chargement</p>
                <p className="text-sm text-muted-foreground">{error}</p>
              </div>
              <Button onClick={() => window.location.reload()}>
                Réessayer
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Test simple - afficher toujours quelque chose
  if (!userProfile && !loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Mon Profil</h1>
          <p className="text-muted-foreground">
            Aucun profil trouvé
          </p>
        </div>
        <Card>
          <CardContent className="pt-6">
            <p>Données de debug :</p>
            <pre className="text-xs bg-muted p-2 rounded mt-2">
              {JSON.stringify({ loading, userProfile, userRole, error }, null, 2)}
            </pre>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Mon Profil</h1>
        <p className="text-muted-foreground">
          Gérez vos informations personnelles et préférences
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Colonne gauche - Photo et infos de base */}
        <div className="space-y-6">
          {/* Photo de profil */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={userProfile?.avatar_url} />
                    <AvatarFallback className="text-2xl">
                      {userProfile?.full_name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="text-center space-y-2">
                  <h3 className="font-semibold">{userProfile?.full_name}</h3>
                  <Badge className={getRoleBadgeColor(userRole || '')}>
                    {getRoleLabel(userRole || '')}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Statistiques rapides */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Statistiques</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {userRole === 'owner' && (
                <>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Propriétés</span>
                    <span className="font-medium">4</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Réservations</span>
                    <span className="font-medium">23</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Note moyenne</span>
                    <span className="font-medium">4.8/5</span>
                  </div>
                </>
              )}
              
              {userRole === 'tenant' && (
                <>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Séjours</span>
                    <span className="font-medium">12</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Avis donnés</span>
                    <span className="font-medium">15</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Membre depuis</span>
                    <span className="font-medium">2023</span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Colonne droite - Formulaire */}
        <div className="md:col-span-2 space-y-6">
          {/* Informations personnelles */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Informations Personnelles</CardTitle>
              <Button
                variant={isEditing ? "outline" : "default"}
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? 'Annuler' : 'Modifier'}
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Nom complet</Label>
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) => handleInputChange('full_name', e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      className="pl-10"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Téléphone</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="tel"
                    className="pl-10"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    disabled={!isEditing}
                    placeholder="+33 6 12 34 56 78"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  disabled={!isEditing}
                  placeholder="Parlez-nous de vous..."
                  rows={4}
                />
              </div>

              {isEditing && (
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    Annuler
                  </Button>
                  <Button onClick={handleSave}>
                    <Save className="h-4 w-4 mr-2" />
                    Sauvegarder
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Informations sur le compte */}
          <Card>
            <CardHeader>
              <CardTitle>Informations du Compte</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-center space-x-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Membre depuis</p>
                    <p className="text-sm text-muted-foreground">Janvier 2023</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Rôle</p>
                    <p className="text-sm text-muted-foreground">{getRoleLabel(userRole || '')}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Préférences de notification */}
          <Card>
            <CardHeader>
              <CardTitle>Préférences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Notifications par email</p>
                    <p className="text-xs text-muted-foreground">Recevoir les notifications importantes</p>
                  </div>
                  <input type="checkbox" className="toggle" defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Notifications push</p>
                    <p className="text-xs text-muted-foreground">Notifications en temps réel</p>
                  </div>
                  <input type="checkbox" className="toggle" />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Newsletter</p>
                    <p className="text-xs text-muted-foreground">Actualités et conseils</p>
                  </div>
                  <input type="checkbox" className="toggle" defaultChecked />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Debug info en développement */}
      {process.env.NODE_ENV === 'development' && (
        <>
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Bug className="w-4 h-4" />
                Debug Info
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-xs">
                <div><strong>Loading:</strong> {loading ? 'true' : 'false'}</div>
                <div><strong>Error:</strong> {error || 'none'}</div>
                <div><strong>User Role:</strong> {userRole || 'none'}</div>
                <div><strong>User Profile:</strong> {userProfile ? 'loaded' : 'null'}</div>
                {userProfile && (
                  <div className="mt-2">
                    <strong>Profile Data:</strong>
                    <pre className="mt-1 p-2 bg-muted rounded text-xs overflow-auto">
                      {JSON.stringify(userProfile, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          <DatabaseTest />
        </>
      )}
    </div>
  );
};

export default ProfilePage;

