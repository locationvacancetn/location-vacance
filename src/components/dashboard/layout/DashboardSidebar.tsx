import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useUserRole } from '@/hooks/useUserRole';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { 
  ChevronLeft, 
  ChevronRight,
  Home,
  Building,
  Calendar,
  DollarSign,
  BarChart3,
  Search,
  Heart,
  Megaphone,
  FileText,
  Users,
  Settings,
  Shield,
  Activity,
  LogOut,
  User,
  MapPin,
  Wrench,
  X,
  HomeIcon,
  CreditCard,
  Mail
} from 'lucide-react';

// Configuration des menus par rôle
const getMenuItems = (role: string) => {
  const commonItems = [
    { label: 'Dashboard', path: '/dashboard', icon: Home },
    { label: 'Profil', path: '/dashboard/profile', icon: User },
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
        { label: 'Types', path: '/dashboard/admin/property-types', icon: HomeIcon },
        { label: 'Konnect', path: '/dashboard/admin/konnect', icon: CreditCard },
        { label: 'Email', path: '/dashboard/admin/email', icon: Mail },
        { label: 'Système', path: '/dashboard/system', icon: Shield },
        { label: 'Logs', path: '/dashboard/logs', icon: Activity },
      ];
    
    case 'owner':
      return [
        ...commonItems,
        { label: 'Mes Propriétés', path: '/dashboard/properties', icon: Building },
        { label: 'Calendrier', path: '/dashboard/calendar', icon: Calendar },
        { label: 'Réservations', path: '/dashboard/bookings', icon: Calendar },
        { label: 'Finances', path: '/dashboard/finances', icon: DollarSign },
        { label: 'Analytics', path: '/dashboard/analytics', icon: BarChart3 },
      ];
    
    case 'tenant':
      return [
        ...commonItems,
        { label: 'Mes Réservations', path: '/dashboard/my-bookings', icon: Calendar },
        { label: 'Rechercher', path: '/dashboard/search', icon: Search },
        { label: 'Favoris', path: '/dashboard/favorites', icon: Heart },
      ];
    
    case 'advertiser':
      return [
        ...commonItems,
        { label: 'Mes Publicités', path: '/dashboard/ads', icon: Megaphone },
        { label: 'Analytics', path: '/dashboard/analytics', icon: BarChart3 },
        { label: 'Campagnes', path: '/dashboard/campaigns', icon: Calendar },
        { label: 'Rapports', path: '/dashboard/reports', icon: FileText },
      ];
    
    default:
      return commonItems;
  }
};

interface DashboardSidebarProps {
  onMobileClose?: () => void;
}

export const DashboardSidebar = ({ onMobileClose }: DashboardSidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { userRole } = useUserRole();
  const { signOut } = useAuth();
  const location = useLocation();

  const menuItems = getMenuItems(userRole || 'tenant');

  const handleLinkClick = () => {
    // Fermer la sidebar sur mobile quand on clique sur un lien
    if (onMobileClose) {
      onMobileClose();
    }
  };

  return (
    <div 
      className={cn(
        "bg-card transition-all duration-300 flex flex-col h-full group",
        isCollapsed ? "w-16" : "w-56"
      )}
      data-collapsed={isCollapsed}
    >
      <div className="p-4 flex-1">
        {/* Header avec logo et bouton fermer mobile */}
        <div className="flex items-center justify-between mb-6">
          <Link to="/" className="block" onClick={handleLinkClick}>
            {isCollapsed ? (
              <img 
                src="/icons/Dash-logo.svg" 
                alt="Logo" 
                className="h-8 w-8 hover:opacity-80 transition-opacity"
              />
            ) : (
              <img 
                src="/icons/logo.svg" 
                alt="Location Vacance" 
                className="h-12 w-auto max-w-full hover:opacity-80 transition-opacity"
              />
            )}
          </Link>
          
          {/* Bouton fermer pour mobile */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onMobileClose}
            className="md:hidden p-2 h-8 w-8"
            aria-label="Fermer le menu"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Menu items */}
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={handleLinkClick}
                className={cn(
                  "flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  isCollapsed 
                    ? "justify-center" 
                    : "gap-3",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <item.icon className="h-4 w-4 flex-shrink-0" />
                {!isCollapsed && (
                  <span className="truncate">{item.label}</span>
                )}
              </Link>
            );
          })}
        </nav>

      </div>
      
      {/* Boutons en bas */}
      <div className="px-4 pb-4 pt-2">
        <div className="flex flex-col gap-3">
          {/* Bouton de déconnexion */}
          <div className={cn(
            "flex",
            isCollapsed ? "justify-center" : "w-full"
          )}>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  className={cn(
                    isCollapsed 
                      ? "h-8 w-8 p-0" 
                      : "w-full justify-start gap-3"
                  )}
                  title="Se déconnecter"
                >
                  <LogOut className="h-4 w-4 flex-shrink-0" />
                  {!isCollapsed && (
                    <span className="truncate">Se déconnecter</span>
                  )}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirmer la déconnexion</AlertDialogTitle>
                  <AlertDialogDescription>
                    Êtes-vous sûr de vouloir vous déconnecter ? Vous devrez vous reconnecter pour accéder à votre compte.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                  <AlertDialogAction onClick={signOut}>
                    Se déconnecter
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
          
          {/* Bouton toggle */}
          <div className={cn(
            "flex",
            isCollapsed ? "justify-center" : "w-full"
          )}>
            <Button
              variant="ghost"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className={cn(
                isCollapsed 
                  ? "h-8 w-8 p-0" 
                  : "w-full justify-start gap-3"
              )}
              title={isCollapsed ? "Étendre la sidebar" : "Réduire la sidebar"}
            >
              {isCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <>
                  <ChevronLeft className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">Réduire</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
