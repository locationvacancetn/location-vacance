import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { useToast } from './use-toast';
import { useCache } from '@/lib/cache';
import { USER_ROLES } from '@/lib/constants';

type UserProfile = Tables<'profiles'> & {
  last_sign_in_at?: string | null;
  properties_count?: number;
  advertisements_count?: number;
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
  deleteUser: (userId: string) => Promise<void>;
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

      // Récupérer le nombre de propriétés pour chaque propriétaire
      const usersWithCounts = await Promise.all(
        (profiles || []).map(async (profile) => {
          let properties_count = 0;
          let advertisements_count = 0;

          if (profile.role === USER_ROLES.OWNER) {
            // Compter les propriétés du propriétaire
            const { count: propertiesCount } = await supabase
              .from('properties')
              .select('*', { count: 'exact', head: true })
              .eq('owner_id', profile.user_id);
            
            properties_count = propertiesCount || 0;
          }

          // TODO: Ajouter le comptage des publicités pour les publicitaires
          // if (profile.role === USER_ROLES.ADVERTISER) {
          //   const { count: adsCount } = await supabase
          //     .from('advertisements')
          //     .select('*', { count: 'exact', head: true })
          //     .eq('advertiser_id', profile.user_id);
          //   
          //   advertisements_count = adsCount || 0;
          // }

          return {
            ...profile,
            last_sign_in_at: profile.last_sign_in_at,
            properties_count,
            advertisements_count
          };
        })
      );

      setAllUsers(usersWithCounts);

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
  }, [toast, setCache]);

  // Fonction de suppression définitive d'un utilisateur
  const deleteUser = useCallback(async (userId: string) => {
    try {
      // Vérifier que l'utilisateur n'est pas un admin (sécurité)
      const userToDelete = allUsers.find(user => user.user_id === userId);
      if (userToDelete?.role === USER_ROLES.ADMIN) {
        toast({
          title: "Action interdite",
          description: "Impossible de supprimer un compte administrateur",
          variant: "destructive",
        });
        return;
      }

      // Vérifier que l'utilisateur existe
      if (!userToDelete) {
        toast({
          title: "Erreur",
          description: "Utilisateur introuvable",
          variant: "destructive",
        });
        return;
      }

      // Vérifier que l'utilisateur n'est pas le dernier admin
      const adminCount = allUsers.filter(user => 
        user.role === USER_ROLES.ADMIN && 
        user.is_active && 
        user.user_id !== userId
      ).length;
      if (adminCount < 1) {
        toast({
          title: "Action interdite",
          description: "Impossible de supprimer le dernier administrateur actif",
          variant: "destructive",
        });
        return;
      }

      // Obtenir l'ID de l'utilisateur actuel
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) {
        toast({
          title: "Erreur",
          description: "Utilisateur non authentifié",
          variant: "destructive",
        });
        return;
      }

      // Appeler l'Edge Function pour supprimer l'utilisateur
      const { data, error } = await supabase.functions.invoke('delete-user', {
        body: {
          userId,
          adminUserId: currentUser.id
        }
      });

      if (error) {
        throw error;
      }

      if (data.error) {
        toast({
          title: "Erreur",
          description: data.error,
          variant: "destructive",
        });
        return;
      }

      // Mise à jour optimiste de l'UI
      setUsers(prevUsers => prevUsers.filter(user => user.user_id !== userId));
      setAllUsers(prevUsers => prevUsers.filter(user => user.user_id !== userId));

      // Invalider le cache de l'utilisateur concerné
      const cacheKey = `user_profile_${userId}`;
      setCache(cacheKey, null, 0);

      // Message de succès
      toast({
        title: "Utilisateur supprimé",
        description: data.authDeleted 
          ? "L'utilisateur a été supprimé définitivement de la plateforme."
          : "Le profil a été supprimé. L'utilisateur ne pourra plus se connecter.",
      });

    } catch (error) {
      console.error('Erreur lors de la suppression de l\'utilisateur:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'utilisateur. Veuillez réessayer.",
        variant: "destructive",
      });
    }
  }, [allUsers, toast, setCache, supabase]);

  return {
    users,
    loading,
    searchTerm,
    roleFilter,
    stats,
    setSearchTerm,
    setRoleFilter,
    toggleUserStatus,
    deleteUser,
    refreshUsers: fetchUsers,
  };
};