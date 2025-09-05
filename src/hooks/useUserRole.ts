import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useLogger } from '@/lib/logger';
import { useCache } from '@/lib/cache';

// Types simplifiés pour les rôles utilisateur
export type UserRole = 'owner' | 'tenant' | 'advertiser' | 'admin';

export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  avatar_url?: string;
  bio?: string;
  phone?: string;
}

export const useUserRole = () => {
  const { user, loading: authLoading } = useAuth();
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const logger = useLogger('useUserRole');
  const { get: getCache, set: setCache } = useCache();

  const fetchUserProfile = useCallback(async (userId: string) => {
    // Vérifier le cache d'abord
    const cacheKey = `user_profile_${userId}`;
    const cachedProfile = getCache<UserProfile>(cacheKey);
    if (cachedProfile) {
      logger.debug('Profile loaded from cache', { userId });
      return cachedProfile;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        throw error;
      }

      // Mettre en cache pour 10 minutes
      setCache(cacheKey, data, 10 * 60 * 1000);
      logger.debug('Profile cached', { userId });
      
      return data;
    } catch (err) {
      logger.error('Error fetching user profile', { error: err, userId });
      throw err;
    }
  }, [getCache, setCache, logger]);

  const loadUserData = useCallback(async () => {
    // Éviter les appels multiples
    if (isLoadingData) {
      logger.debug('Already loading, skipping');
      return;
    }
    
    logger.debug('loadUserData called', { userId: user?.id });
    
    if (!user) {
      logger.debug('No user, setting loading false');
      setUserRole(null);
      setUserProfile(null);
      setLoading(false);
      return;
    }

    setIsLoadingData(true);

    try {
      logger.debug('Starting to fetch profile for user', { userId: user.id });
      setLoading(true);
      setError(null);

      // 1. Essayer d'abord de récupérer le rôle depuis le profil
      const profile = await fetchUserProfile(user.id);
      logger.debug('Profile fetched', { profileId: profile?.id, role: profile?.role });
      
      if (profile) {
        setUserProfile({
          id: profile.id,
          full_name: profile.full_name || user.email || '',
          email: profile.email || user.email || '',
          role: profile.role as UserRole,
          avatar_url: profile.avatar_url,
          bio: profile.bio,
          phone: profile.phone,
        });
        setUserRole(profile.role as UserRole);
      } else {
        // 2. Fallback vers les métadonnées du user auth
        const roleFromAuth = user.user_metadata?.role as UserRole || 'tenant';
        logger.debug('Using auth metadata role', { role: roleFromAuth });
        setUserRole(roleFromAuth);
        
        // Créer un profil minimal depuis les données auth
        setUserProfile({
          id: user.id,
          full_name: user.user_metadata?.full_name || user.email || '',
          email: user.email || '',
          role: roleFromAuth,
          avatar_url: user.user_metadata?.avatar_url,
        });
      }
    } catch (err) {
      logger.error('Error loading user data', { error: err });
      setError('Erreur lors du chargement des données utilisateur');
      
      // Fallback en cas d'erreur
      const fallbackRole: UserRole = 'tenant';
      setUserRole(fallbackRole);
      setUserProfile({
        id: user.id,
        full_name: user.email || '',
        email: user.email || '',
        role: fallbackRole,
      });
    } finally {
      setLoading(false);
      setIsLoadingData(false);
    }
  }, [user, isLoadingData, logger, fetchUserProfile]);

  useEffect(() => {
    if (!authLoading && user?.id && !isLoadingData) {
      loadUserData();
    } else if (!authLoading && !user?.id) {
      // Si pas d'utilisateur et pas de chargement auth, réinitialiser
      setUserRole(null);
      setUserProfile(null);
      setLoading(false);
      setError(null);
    }
  }, [user?.id, authLoading]); // Retirer isLoadingData des dépendances pour éviter les boucles

  // Fonction pour mettre à jour le rôle
  const updateUserRole = async (newRole: UserRole) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('user_id', user.id);

      if (error) throw error;

      setUserRole(newRole);
      if (userProfile) {
        setUserProfile({ ...userProfile, role: newRole });
      }
    } catch (err) {
      console.error('Error updating user role:', err);
      throw err;
    }
  };

  // Fonction pour rafraîchir les données
  const refreshUserData = () => {
    if (user) {
      setLoading(true);
      // Re-trigger l'effet
      loadUserData();
    }
  };

  return useMemo(() => ({
    userRole,
    userProfile,
    loading: loading || authLoading,
    error,
    updateUserRole,
    refreshUserData,
    isOwner: userRole === 'owner',
    isTenant: userRole === 'tenant',
    isAdvertiser: userRole === 'advertiser',
    isAdmin: userRole === 'admin',
  }), [
    userRole,
    userProfile,
    loading,
    authLoading,
    error,
    updateUserRole,
    refreshUserData
  ]);
};

