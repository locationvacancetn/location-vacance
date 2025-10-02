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
  Mail,
  Package,
  PictureInPicture2
} from 'lucide-react';

// Configuration des menus par rôle - STRUCTURE UNIFIÉE
const getMenuItems = (role: string) => {
  const commonItems = [
    { label: 'Dashboard', path: '/dashboard', icon: Home },
    { label: 'Profil', path: role === 'admin' ? '/dashboard/admin/profile' : 
                            role === 'owner' ? '/dashboard/owner/profile' : 
                            role === 'tenant' ? '/dashboard/tenant/profile' :
                            role === 'advertiser' ? '/dashboard/advertiser/profile' : '/dashboard/profile', icon: User },
  ];

  switch (role) {
    case 'admin':
      return [
        { label: 'Dashboard', path: '/dashboard', icon: Home },
        { label: 'Propriétés', path: '/dashboard/admin/properties', icon: Building },
        { label: 'Publicités', path: '/dashboard/admin/ads', icon: Megaphone },
        { label: 'Utilisateurs', path: '/dashboard/admin/users', icon: Users },
        { label: 'SEO', path: '/dashboard/admin/seo', icon: Search },
        { label: 'Email', path: '/dashboard/admin/email', icon: Mail },
        { label: 'Modals', path: '/dashboard/admin/modals', icon: PictureInPicture2 },
        { label: 'Villes & Régions', path: '/dashboard/admin/cities', icon: MapPin },
        { label: 'Types', path: '/dashboard/admin/property-types', icon: HomeIcon },
        { label: 'Équipements', path: '/dashboard/admin/equipments', icon: Wrench },
        { label: 'Caractéristiques', path: '/dashboard/admin/characteristics', icon: Settings },
        { label: 'Abonnements', path: '/dashboard/admin/subscriptions', icon: Package },
        { label: 'Konnect', path: '/dashboard/admin/konnect', icon: CreditCard },
        { label: 'Profil', path: '/dashboard/admin/profile', icon: User },
      ];
    
    case 'owner':
      return [
        ...commonItems,
        { label: 'Mes Propriétés', path: '/dashboard/owner/properties', icon: Building },
        { label: 'Calendrier', path: '/dashboard/owner/calendar', icon: Calendar },
        { label: 'Finances', path: '/dashboard/owner/finances', icon: DollarSign },
        { label: 'Analytics', path: '/dashboard/owner/analytics', icon: BarChart3 },
      ];
    
    case 'tenant':
      return [
        ...commonItems,
        { label: 'Mes Réservations', path: '/dashboard/tenant/my-bookings', icon: Calendar },
        { label: 'Rechercher', path: '/dashboard/tenant/search', icon: Search },
        { label: 'Favoris', path: '/dashboard/tenant/favorites', icon: Heart },
      ];
    
    case 'advertiser':
      return [
        ...commonItems,
        { label: 'Mes Publicités', path: '/dashboard/advertiser/ads', icon: Megaphone },
        { label: 'Analytics', path: '/dashboard/advertiser/analytics', icon: BarChart3 },
        { label: 'Campagnes', path: '/dashboard/advertiser/campaigns', icon: Calendar },
        { label: 'Rapports', path: '/dashboard/advertiser/reports', icon: FileText },
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

  const handleToggleCollapse = () => {
    const newCollapsedState = !isCollapsed;
    setIsCollapsed(newCollapsedState);
    
    // Émettre un événement personnalisé pour notifier le layout
    const event = new CustomEvent('sidebar-toggle', {
      detail: { isCollapsed: newCollapsedState }
    });
    window.dispatchEvent(event);
  };

  return (
    <div 
      className={cn(
        "bg-card transition-all duration-300 flex flex-col h-screen group",
        "border-r border-border",
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
          <AlertDialog>
            <AlertDialogTrigger asChild>
               <button
                 className={cn(
                   "flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors w-full",
                   isCollapsed 
                     ? "justify-center" 
                     : "gap-3",
                   "text-muted-foreground hover:text-white hover:bg-[#bc2d2b]"
                 )}
                 title="Se déconnecter"
               >
                <LogOut className="h-4 w-4 flex-shrink-0" />
                {!isCollapsed && (
                  <span className="truncate">Se déconnecter</span>
                )}
              </button>
            </AlertDialogTrigger>
               <AlertDialogContent>
                 <AlertDialogHeader>
                   <AlertDialogTitle>Confirmer la déconnexion</AlertDialogTitle>
                   <AlertDialogDescription>
                     Êtes-vous sûr de vouloir vous déconnecter ? Vous devrez vous reconnecter pour accéder à votre compte.
                   </AlertDialogDescription>
                 </AlertDialogHeader>
                 <AlertDialogFooter>
                   <AlertDialogCancel 
                     className="hover:bg-[#32323a] hover:text-white hover:border-[#32323a] active:bg-[#32323a] active:text-white active:border-[#32323a]"
                   >
                     Annuler
                   </AlertDialogCancel>
                   <AlertDialogAction 
                     onClick={signOut}
                     className="bg-[#bc2d2b] hover:bg-[#a82523] text-white"
                   >
                     Se déconnecter
                   </AlertDialogAction>
                 </AlertDialogFooter>
               </AlertDialogContent>
            </AlertDialog>
          
           {/* Bouton toggle */}
           <button
             onClick={handleToggleCollapse}
             className={cn(
               "flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors w-full",
               isCollapsed 
                 ? "justify-center" 
                 : "gap-3",
               "bg-[#32323a] text-white hover:bg-[#32323a] hover:text-white"
             )}
             title={isCollapsed ? "Étendre la sidebar" : "Réduire la sidebar"}
           >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4 flex-shrink-0" />
            ) : (
              <>
                <ChevronLeft className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">Réduire</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
