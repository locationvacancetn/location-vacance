import { useMemo } from 'react';
import { useUserRole } from './useUserRole';
import { 
  Home, 
  Users, 
  Building, 
  Calendar, 
  MapPin, 
  Wrench, 
  HomeIcon, 
  CreditCard, 
  Shield, 
  Activity, 
  User, 
  Settings, 
  DollarSign, 
  BarChart3, 
  Megaphone,
  Heart,
  MessageSquare,
  Bell,
  Search
} from 'lucide-react';

/**
 * Configuration des menus par rôle pour la navigation mobile
 */
const getMobileMenuItems = (role: string) => {
  const commonItems = [
    { label: 'Dashboard', path: '/dashboard', icon: Home },
    { label: 'Paramètres', path: '/dashboard/settings', icon: Settings },
  ];

  switch (role) {
    case 'admin':
      return [
        ...commonItems,
        { label: 'Utilisateurs', path: '/dashboard/users', icon: Users },
        { label: 'Propriétés', path: '/dashboard/all-properties', icon: Building },
        { label: 'Réservations', path: '/dashboard/all-bookings', icon: Calendar },
        { label: 'Villes & Régions', path: '/dashboard/admin/cities', icon: MapPin },
        { label: 'Équipements', path: '/dashboard/admin/equipments', icon: Wrench },
        { label: 'Caractéristiques', path: '/dashboard/admin/characteristics', icon: Settings },
        { label: 'Types', path: '/dashboard/admin/property-types', icon: HomeIcon },
        { label: 'Configuration Konnect', path: '/dashboard/admin/konnect', icon: CreditCard },
        { label: 'SEO', path: '/dashboard/admin/seo', icon: Search },
        { label: 'Système', path: '/dashboard/system', icon: Shield },
        { label: 'Logs', path: '/dashboard/logs', icon: Activity },
        { label: 'Profil', path: '/dashboard/profile', icon: User },
      ];
    
    case 'owner':
      return [
        ...commonItems,
        { label: 'Mes Propriétés', path: '/dashboard/owner/properties', icon: Building },
        { label: 'Réservations', path: '/dashboard/bookings', icon: Calendar },
        { label: 'Finances', path: '/dashboard/finances', icon: DollarSign },
        { label: 'Analytics', path: '/dashboard/analytics', icon: BarChart3 },
        { label: 'Profil', path: '/dashboard/profile', icon: Users },
      ];
    
    case 'tenant':
      return [
        ...commonItems,
        { label: 'Mes Réservations', path: '/dashboard/my-bookings', icon: Calendar },
        { label: 'Favoris', path: '/dashboard/favorites', icon: Heart },
        { label: 'Messages', path: '/dashboard/messages', icon: MessageSquare },
        { label: 'Notifications', path: '/dashboard/notifications', icon: Bell },
        { label: 'Profil', path: '/dashboard/profile', icon: User },
      ];
    
    case 'advertiser':
      return [
        ...commonItems,
        { label: 'Mes Annonces', path: '/dashboard/ads', icon: Megaphone },
        { label: 'Analytics', path: '/dashboard/analytics', icon: BarChart3 },
        { label: 'Finances', path: '/dashboard/finances', icon: DollarSign },
        { label: 'Profil', path: '/dashboard/profile', icon: User },
      ];
    
    default:
      return commonItems;
  }
};

/**
 * Obtient les informations de rôle (label, couleur, icône)
 */
const getRoleInfo = (role: string) => {
  switch (role) {
    case 'admin':
      return {
        label: 'Administrateur',
        color: 'destructive',
        icon: Shield
      };
    case 'owner':
      return {
        label: 'Propriétaire',
        color: 'default',
        icon: Building
      };
    case 'tenant':
      return {
        label: 'Locataire',
        color: 'secondary',
        icon: User
      };
    case 'advertiser':
      return {
        label: 'Annonceur',
        color: 'outline',
        icon: Megaphone
      };
    default:
      return {
        label: 'Utilisateur',
        color: 'secondary',
        icon: User
      };
  }
};

/**
 * Hook pour la navigation basée sur le rôle utilisateur
 */
export const useNavigation = () => {
  const { userRole } = useUserRole();
  
  const mobileMenuItems = useMemo(() => {
    return getMobileMenuItems(userRole || 'tenant');
  }, [userRole]);
  
  const roleInfo = useMemo(() => {
    return getRoleInfo(userRole || 'tenant');
  }, [userRole]);
  
  return {
    mobileMenuItems,
    roleInfo
  };
};
