import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useLogger } from '@/lib/logger';
import { useCache } from '@/lib/cache';

// Types simplifiés pour les rôles utilisateur
export type UserRole = 'owner' | 'tenant' | 'manager' | 'admin';

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

  const fetchUserProfile = async (userId: string) => {
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
  };

  const loadUserData = async () => {
    // Éviter les appels multiples
    if (isLoadingData) {
      console.log('useUserRole - Already loading, skipping');
      return;
    }
    
    console.log('useUserRole - loadUserData called', { userId: user?.id });
    logger.debug('loadUserData called', { userId: user?.id });
    
    if (!user) {
      console.log('useUserRole - No user, setting loading false');
      logger.debug('No user, setting loading false');
      setUserRole(null);
      setUserProfile(null);
      setLoading(false);
      return;
    }

    setIsLoadingData(true);

    try {
      console.log('useUserRole - Starting to fetch profile for user', { userId: user.id });
      logger.debug('Starting to fetch profile for user', { userId: user.id });
      setLoading(true);
      setError(null);

      // 1. Essayer d'abord de récupérer le rôle depuis le profil
      const profile = await fetchUserProfile(user.id);
      console.log('useUserRole - Profile fetched', { profileId: profile?.id, role: profile?.role });
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
        console.log('useUserRole - Using auth metadata role', { role: roleFromAuth });
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
      console.log('useUserRole - Error loading user data', { error: err });
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
      console.log('useUserRole - Setting loading to false');
      setLoading(false);
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user?.id && !isLoadingData) {
      loadUserData();
    }
  }, [user?.id, authLoading, isLoadingData]); // Ajouter isLoadingData pour éviter les appels multiples

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

  return {
    userRole,
    userProfile,
    loading: loading || authLoading,
    error,
    updateUserRole,
    refreshUserData,
    isOwner: userRole === 'owner',
    isTenant: userRole === 'tenant',
    isManager: userRole === 'manager',
    isAdmin: userRole === 'admin',
  };
};

