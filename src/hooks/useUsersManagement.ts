import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { useToast } from './use-toast';
import { useCache } from '@/lib/cache';
import { USER_ROLES } from '@/lib/constants';

type UserProfile = Tables<'profiles'> & {
  last_sign_in_at?: string | null;
};

interface UseUsersManagementReturn {
  users: UserProfile[];
  loading: boolean;
  searchTerm: string;
  roleFilter: string;
  stats: {
    total: number;
    owners: number;
    advertisers: number;
    tenants: number;
    admins: number;
    active: number;
    banned: number;
  };
  setSearchTerm: (term: string) => void;
  setRoleFilter: (role: string) => void;
  toggleUserStatus: (userId: string, isActive: boolean) => Promise<void>;
  refreshUsers: () => Promise<void>;
}

export const useUsersManagement = (): UseUsersManagementReturn => {
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const { toast } = useToast();
  const { set: setCache } = useCache();

  // Fonction de récupération des utilisateurs (une seule fois)
  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      // Transformation des données
      const usersWithInfo = (profiles || []).map(profile => ({
        ...profile,
        last_sign_in_at: profile.last_sign_in_at
      }));

      setAllUsers(usersWithInfo);

    } catch (error) {
      console.error('Erreur lors du chargement des utilisateurs:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les utilisateurs",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Chargement initial
  useEffect(() => {
    fetchUsers();
  }, []);

  // Filtrage côté client optimisé avec useMemo
  const filteredUsers = useMemo(() => {
    let filtered = allUsers;

    // Filtre par rôle
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    // Filtre par recherche
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(user =>
        (user.full_name && user.full_name.toLowerCase().includes(searchLower)) ||
        user.email.toLowerCase().includes(searchLower) ||
        (user.phone && user.phone.toLowerCase().includes(searchLower))
      );
    }

    return filtered;
  }, [allUsers, searchTerm, roleFilter]);

  // Mise à jour des utilisateurs filtrés
  useEffect(() => {
    setUsers(filteredUsers);
  }, [filteredUsers]);

  // Calcul des statistiques
  const stats = useMemo(() => {
    return {
      total: users.length,
      owners: users.filter(u => u.role === USER_ROLES.OWNER).length,
      advertisers: users.filter(u => u.role === USER_ROLES.ADVERTISER).length,
      tenants: users.filter(u => u.role === USER_ROLES.TENANT).length,
      admins: users.filter(u => u.role === USER_ROLES.ADMIN).length,
      active: users.filter(u => u.is_active === true).length,
      banned: users.filter(u => u.is_active === false).length,
    };
  }, [users]);

  // Fonction de désactivation/réactivation des comptes
  const toggleUserStatus = useCallback(async (userId: string, isActive: boolean) => {
    try {
      // Mise à jour de la base de données
      const { error } = await supabase
        .from('profiles')
        .update({ is_active: isActive })
        .eq('user_id', userId);

      if (error) {
        throw error;
      }

      // Mise à jour optimiste de l'UI
      setUsers(prevUsers =>
        prevUsers.map(user =>
          user.user_id === userId
            ? { ...user, is_active: isActive }
            : user
        )
      );

      setAllUsers(prevUsers =>
        prevUsers.map(user =>
          user.user_id === userId
            ? { ...user, is_active: isActive }
            : user
        )
      );

      // Invalider le cache de l'utilisateur concerné
      const cacheKey = `user_profile_${userId}`;
      setCache(cacheKey, null, 0);

      toast({
        title: isActive ? "Compte réactivé" : "Compte désactivé",
        description: `Le compte a été ${isActive ? 'réactivé' : 'désactivé'} avec succès.`,
      });

    } catch (error) {
      console.error('Erreur lors de la modification du statut:', error);
      toast({
        title: "Erreur",
        description: "Impossible de modifier le statut du compte",
        variant: "destructive",
      });
    }
  }, [toast]);

  return {
    users,
    loading,
    searchTerm,
    roleFilter,
    stats,
    setSearchTerm,
    setRoleFilter,
    toggleUserStatus,
    refreshUsers: fetchUsers,
  };
};