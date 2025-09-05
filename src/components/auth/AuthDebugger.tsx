import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trash2, RefreshCw, AlertTriangle, Bug, Zap } from 'lucide-react';
import { 
  simulateRefreshTokenError, 
  simulateExpiredSession, 
  clearAllAuthData, 
  checkLocalStorageState 
} from '@/utils/authTestUtils';

/**
 * Composant de débogage pour l'authentification
 * Affiche l'état de la session et permet de tester la gestion d'erreur
 */
export const AuthDebugger = () => {
  const { user, session, loading, clearInvalidSession, checkSessionValidity } = useAuth();
  const [debugInfo, setDebugInfo] = useState<any>(null);

  const refreshDebugInfo = () => {
    const info = {
      user: user ? {
        id: user.id,
        email: user.email,
        created_at: user.created_at,
        last_sign_in_at: user.last_sign_in_at,
        role: user.user_metadata?.role || 'N/A'
      } : null,
      session: session ? {
        access_token: session.access_token ? 'Present' : 'Missing',
        refresh_token: session.refresh_token ? 'Present' : 'Missing',
        expires_at: new Date(session.expires_at! * 1000).toLocaleString(),
        expires_in: session.expires_in,
        token_type: session.token_type
      } : null,
      localStorage: {
        supabase_auth_token: localStorage.getItem('sb-snrlnfldhbopiyjwnjlu-auth-token') ? 'Present' : 'Missing',
        supabase_auth_token_alt: localStorage.getItem('supabase.auth.token') ? 'Present' : 'Missing'
      },
      timestamp: new Date().toLocaleString()
    };
    setDebugInfo(info);
  };

  useEffect(() => {
    refreshDebugInfo();
  }, [user, session]);

  const handleClearSession = async () => {
    await clearInvalidSession();
    refreshDebugInfo();
  };

  const handleValidateSession = async () => {
    const isValid = await checkSessionValidity();
    console.log('Session validity check result:', isValid);
    refreshDebugInfo();
  };

  const handleClearLocalStorage = () => {
    localStorage.removeItem('sb-snrlnfldhbopiyjwnjlu-auth-token');
    localStorage.removeItem('supabase.auth.token');
    refreshDebugInfo();
  };

  if (process.env.NODE_ENV === 'production') {
    return null; // Ne pas afficher en production
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          Debug Authentification
        </CardTitle>
        <CardDescription>
          Outil de débogage pour diagnostiquer les problèmes d'authentification
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* État de chargement */}
        <div className="flex items-center gap-2">
          <span className="font-medium">État de chargement:</span>
          <Badge variant={loading ? "destructive" : "default"}>
            {loading ? "Chargement..." : "Terminé"}
          </Badge>
        </div>

        {/* État de l'utilisateur */}
        <div className="flex items-center gap-2">
          <span className="font-medium">Utilisateur connecté:</span>
          <Badge variant={user ? "default" : "secondary"}>
            {user ? "Oui" : "Non"}
          </Badge>
        </div>

        {/* État de la session */}
        <div className="flex items-center gap-2">
          <span className="font-medium">Session active:</span>
          <Badge variant={session ? "default" : "secondary"}>
            {session ? "Oui" : "Non"}
          </Badge>
        </div>

        {/* Actions de débogage */}
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <Button onClick={refreshDebugInfo} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Actualiser
            </Button>
            <Button onClick={handleValidateSession} variant="outline" size="sm">
              Valider Session
            </Button>
            <Button onClick={handleClearSession} variant="destructive" size="sm">
              <Trash2 className="w-4 h-4 mr-2" />
              Nettoyer Session
            </Button>
            <Button onClick={handleClearLocalStorage} variant="destructive" size="sm">
              <Trash2 className="w-4 h-4 mr-2" />
              Vider localStorage
            </Button>
          </div>
          
          {/* Actions de test */}
          <div className="border-t pt-3">
            <h4 className="font-medium mb-2 text-sm text-muted-foreground">Tests de simulation d'erreurs:</h4>
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => { simulateRefreshTokenError(); refreshDebugInfo(); }} variant="outline" size="sm">
                <Bug className="w-4 h-4 mr-2" />
                Simuler Erreur Token
              </Button>
              <Button onClick={() => { simulateExpiredSession(); refreshDebugInfo(); }} variant="outline" size="sm">
                <Zap className="w-4 h-4 mr-2" />
                Simuler Session Expirée
              </Button>
              <Button onClick={() => { clearAllAuthData(); refreshDebugInfo(); }} variant="outline" size="sm">
                <Trash2 className="w-4 h-4 mr-2" />
                Nettoyer Tout
              </Button>
            </div>
          </div>
        </div>

        {/* Informations détaillées */}
        {debugInfo && (
          <div className="mt-4">
            <h4 className="font-medium mb-2">Informations détaillées:</h4>
            <pre className="bg-muted p-3 rounded-md text-xs overflow-auto max-h-96">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
