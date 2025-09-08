import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export const useUpdateLastSignIn = () => {
  const { user } = useAuth();
  const hasUpdatedRef = useRef(false);

  useEffect(() => {
    const updateLastSignIn = async () => {
      if (user && !hasUpdatedRef.current) {
        try {
          await supabase
            .from('profiles')
            .update({ 
              last_sign_in_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .eq('user_id', user.id);
          
          hasUpdatedRef.current = true;
        } catch (error) {
          console.error('Erreur lors de la mise à jour de la dernière connexion:', error);
        }
      }
    };

    updateLastSignIn();
  }, [user]);

  // Reset le flag quand l'utilisateur se déconnecte
  useEffect(() => {
    if (!user) {
      hasUpdatedRef.current = false;
    }
  }, [user]);
};
