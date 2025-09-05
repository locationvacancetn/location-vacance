import { 
  Home, 
  Building, 
  Calendar, 
  DollarSign, 
  BarChart, 
  Settings, 
  User, 
  Search, 
  Heart, 
  MessageCircle, 
  Wrench,
  FileText, 
  Shield, 
  Users, 
  Activity,
  Plus,
  Bell,
  LogOut
} from "lucide-react";
import { DashboardConfig, UserRole } from "@/types/dashboard";
import { ROUTES } from "@/constants/routes";

export const getDashboardConfig = (userRole: UserRole): DashboardConfig => {
  const configs: Record<UserRole, DashboardConfig> = {
    // PROPRIÉTAIRE - Propriétaire de biens immobiliers
    'owner': {
      sidebarContent: [
        { label: 'Dashboard', path: ROUTES.DASHBOARD, icon: Home },
        { label: 'Mes Propriétés', path: ROUTES.DASHBOARD_PROPERTIES, icon: Building },
        { label: 'Réservations', path: ROUTES.DASHBOARD_BOOKINGS, icon: Calendar, badge: 3 },
        { label: 'Finances', path: ROUTES.DASHBOARD_FINANCES, icon: DollarSign },
        { label: 'Statistiques', path: ROUTES.DASHBOARD_ANALYTICS, icon: BarChart },
        { label: 'Messages', path: ROUTES.DASHBOARD_MESSAGES, icon: MessageCircle, badge: 2 },
        { label: 'Paramètres', path: ROUTES.DASHBOARD_SETTINGS, icon: Settings },
      ],
      permissions: ['create', 'read', 'update', 'delete', 'analytics'],
      headerConfig: {
        showNotifications: true,
        showUserMenu: true,
        showQuickActions: true,
        quickActions: [
          {
            label: 'Ajouter Propriété',
            icon: Plus,
            action: () => {
              // Navigation sera gérée par le composant qui utilise cette config
              console.log('Navigate to add property');
            },
            variant: 'primary'
          },
          {
            label: 'Voir Réservations',
            icon: Calendar,
            action: () => {
              console.log('Navigate to bookings');
            }
          }
        ]
      }
    },
    
    // LOCATAIRE - Utilisateur qui réserve des propriétés
    'tenant': {
      sidebarContent: [
        { label: 'Dashboard', path: ROUTES.DASHBOARD, icon: Home },
        { label: 'Mon Profil', path: ROUTES.DASHBOARD_PROFILE, icon: User },
        { label: 'Mes Réservations', path: ROUTES.DASHBOARD_MY_BOOKINGS, icon: Calendar, badge: 1 },
        { label: 'Rechercher', path: ROUTES.DASHBOARD_SEARCH, icon: Search },
        { label: 'Favoris', path: ROUTES.DASHBOARD_FAVORITES, icon: Heart },
        { label: 'Messages', path: ROUTES.DASHBOARD_MESSAGES, icon: MessageCircle },
      ],
      permissions: ['read', 'book', 'message'],
      headerConfig: {
        showNotifications: true,
        showUserMenu: true,
        showQuickActions: true,
        quickActions: [
          {
            label: 'Rechercher',
            icon: Search,
            action: () => {
              console.log('Navigate to search');
            },
            variant: 'primary'
          },
          {
            label: 'Mes Favoris',
            icon: Heart,
            action: () => {
              console.log('Navigate to favorites');
            }
          }
        ]
      }
    },
    
    // GESTIONNAIRE - Gère plusieurs propriétés pour des propriétaires
    'manager': {
      sidebarContent: [
        { label: 'Dashboard', path: ROUTES.DASHBOARD, icon: Home },
        { label: 'Propriétés Gérées', path: ROUTES.DASHBOARD_MANAGED_PROPERTIES, icon: Building, badge: 5 },
        { label: 'Réservations', path: ROUTES.DASHBOARD_MANAGE_BOOKINGS, icon: Calendar },
        { label: 'Maintenance', path: ROUTES.DASHBOARD_MAINTENANCE, icon: Wrench, badge: 2 },
        { label: 'Rapports', path: ROUTES.DASHBOARD_REPORTS, icon: FileText },
        { label: 'Messages', path: ROUTES.DASHBOARD_MESSAGES, icon: MessageCircle },
      ],
      permissions: ['read', 'update', 'manage'],
      headerConfig: {
        showNotifications: true,
        showUserMenu: true,
        showQuickActions: true,
        quickActions: [
          {
            label: 'Nouvelle Maintenance',
            icon: Wrench,
            action: () => {
              console.log('Navigate to new maintenance');
            },
            variant: 'primary'
          },
          {
            label: 'Rapport',
            icon: FileText,
            action: () => {
              console.log('Navigate to reports');
            }
          }
        ]
      }
    },
    
    // ADMIN - Administration complète de la plateforme
    'admin': {
      sidebarContent: [
        { label: 'Dashboard Admin', path: ROUTES.DASHBOARD, icon: Shield },
        { label: 'Utilisateurs', path: ROUTES.DASHBOARD_USERS, icon: Users },
        { label: 'Toutes Propriétés', path: ROUTES.DASHBOARD_ALL_PROPERTIES, icon: Building },
        { label: 'Réservations', path: ROUTES.DASHBOARD_ALL_BOOKINGS, icon: Calendar },
        { label: 'Système', path: ROUTES.DASHBOARD_SYSTEM, icon: Settings },
        { label: 'Logs & Analytics', path: ROUTES.DASHBOARD_LOGS, icon: Activity },
      ],
      permissions: ['create', 'read', 'update', 'delete', 'admin', 'system'],
      headerConfig: {
        showNotifications: true,
        showUserMenu: true,
        showQuickActions: true,
        quickActions: [
          {
            label: 'Gérer Utilisateurs',
            icon: Users,
            action: () => {
              console.log('Navigate to users');
            },
            variant: 'primary'
          },
          {
            label: 'Système',
            icon: Settings,
            action: () => {
              console.log('Navigate to system');
            }
          }
        ]
      }
    }
  };
  
  return configs[userRole] || configs['tenant']; // fallback vers tenant
};

// Helper function pour vérifier les permissions
export const hasPermission = (userRole: UserRole, requiredPermission: string): boolean => {
  const config = getDashboardConfig(userRole);
  return config.permissions.includes(requiredPermission as any);
};

// Helper function pour obtenir les routes autorisées
export const getAuthorizedRoutes = (userRole: UserRole): string[] => {
  const config = getDashboardConfig(userRole);
  return config.sidebarContent.map(item => item.path);
};
