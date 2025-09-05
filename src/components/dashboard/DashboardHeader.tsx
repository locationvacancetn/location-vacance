import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Bell, 
  Search, 
  Menu, 
  User, 
  Settings, 
  LogOut,
  ChevronDown,
  HelpCircle,
  MessageCircle,
  ChevronLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { useAuth } from '@/hooks/useAuth';
import { useNavigation } from '@/hooks/useNavigation';
import { useLogger } from '@/lib/logger';
import { UserProfile, HeaderConfig, QuickAction } from '@/types/dashboard';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/constants/routes';

// Fonction pour obtenir la description de la page
const getPageDescription = (pageTitle: string): string => {
  const descriptions: Record<string, string> = {
    'Dashboard': 'Vue d\'ensemble de votre activité et de vos données',
    'Mon Profil': 'Gérez vos informations personnelles',
    'Mes Propriétés': 'Gérez vos propriétés immobilières et leurs annonces',
    'Réservations': 'Suivez et gérez toutes vos réservations',
    'Mes Réservations': 'Vos réservations passées et à venir',
    'Rechercher': 'Trouvez votre prochain logement idéal',
    'Mes Favoris': 'Vos propriétés favorites sauvegardées',
    'Messages': 'Vos conversations avec les utilisateurs',
    'Finances': 'Revenus, paiements et statistiques financières',
    'Statistiques': 'Analyses et performances détaillées',
    'Propriétés Gérées': 'Propriétés sous votre gestion',
    'Gestion Réservations': 'Gérer les réservations des propriétés',
    'Maintenance': 'Suivi et planification des maintenances',
    'Rapports': 'Rapports d\'activité et analyses',
    'Gestion Utilisateurs': 'Administration des utilisateurs de la plateforme',
    'Toutes les Propriétés': 'Vue d\'ensemble de toutes les propriétés',
    'Toutes les Réservations': 'Vue globale des réservations de la plateforme',
    'Système': 'Configuration et paramètres système',
    'Logs & Analytics': 'Journaux système et analyses avancées',
    'Paramètres': 'Configuration de votre compte et préférences',
    'Aide': 'Centre d\'aide et support technique'
  };
  
  return descriptions[pageTitle] || 'Gestion et administration de cette section';
};

interface DashboardHeaderProps {
  userProfile: UserProfile | null;
  headerConfig: HeaderConfig;
  onToggleSidebar?: () => void;
  title?: string;
  breadcrumb?: { label: string; path?: string }[];
}

const QuickActionButton = ({ action }: { action: QuickAction }) => (
  <Button
    onClick={action.action}
    variant={action.variant === 'primary' ? 'default' : 'outline'}
    size="sm"
    className="flex items-center space-x-2"
  >
    <action.icon className="h-4 w-4" />
    <span className="hidden sm:inline">{action.label}</span>
  </Button>
);

const NotificationDropdown = () => {
  const [notifications] = useState([
    { id: 1, title: "Nouvelle réservation", message: "Villa Sunrise - 3 nuits", time: "Il y a 5 min", unread: true },
    { id: 2, title: "Paiement reçu", message: "€450 de Marie Dubois", time: "Il y a 1h", unread: true },
    { id: 3, title: "Avis client", message: "5 étoiles pour votre propriété", time: "Il y a 2h", unread: false },
  ]);

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          Notifications
          {unreadCount > 0 && (
            <Badge variant="secondary">{unreadCount} nouvelles</Badge>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="max-h-64 overflow-y-auto">
          {notifications.map((notification) => (
            <DropdownMenuItem key={notification.id} className="flex flex-col items-start p-3">
              <div className="flex items-center justify-between w-full">
                <span className={cn(
                  "font-medium text-sm",
                  notification.unread ? "text-foreground" : "text-muted-foreground"
                )}>
                  {notification.title}
                </span>
                {notification.unread && (
                  <div className="h-2 w-2 bg-primary rounded-full" />
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
              <span className="text-xs text-muted-foreground mt-1">{notification.time}</span>
            </DropdownMenuItem>
          ))}
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-center cursor-pointer">
          <Link to="/dashboard/notifications" className="w-full">
            Voir toutes les notifications
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const UserMenuDropdown = ({ userProfile }: { userProfile: UserProfile | null }) => {
  const { signOut } = useAuth();
  const { navigateTo } = useNavigation();
  const logger = useLogger('UserMenuDropdown');

  const handleSignOut = async () => {
    try {
      logger.info('User sign out initiated');
      await signOut();
      navigateTo(ROUTES.HOME);
    } catch (error) {
      logger.error('Error during sign out', { error });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center space-x-2 h-auto p-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={userProfile?.avatar_url} />
            <AvatarFallback>
              {userProfile?.full_name?.charAt(0) || userProfile?.email?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="hidden md:flex flex-col items-start">
            <span className="text-sm font-medium">{userProfile?.full_name || 'Utilisateur'}</span>
            <span className="text-xs text-muted-foreground">{userProfile?.email}</span>
          </div>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Mon compte</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigateTo(ROUTES.DASHBOARD_PROFILE)}>
          <User className="h-4 w-4 mr-2" />
          Profil
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigateTo(ROUTES.DASHBOARD_SETTINGS)}>
          <Settings className="h-4 w-4 mr-2" />
          Paramètres
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
          <LogOut className="h-4 w-4 mr-2" />
          Se déconnecter
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export const DashboardHeader = ({ 
  userProfile, 
  headerConfig, 
  onToggleSidebar,
  title,
  breadcrumb 
}: DashboardHeaderProps) => {
  return (
    <header className="bg-white px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Partie gauche - Logo et Breadcrumbs */}
        <div className="flex items-center space-x-4">
          {onToggleSidebar && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleSidebar}
              className="lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}
          
          <div className="flex flex-col">
            <Breadcrumbs className="mb-2" />
            <h1 className="text-2xl font-bold text-gray-900">
              {title || 'Dashboard'}
            </h1>
            <p className="text-sm text-gray-600">
              {getPageDescription(title || 'Dashboard')}
            </p>
          </div>
        </div>

        {/* Partie droite - Icônes exactement comme l'image */}
        <div className="flex items-center space-x-2">
          {/* Help - icône question mark */}
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <HelpCircle className="h-5 w-5 text-gray-600" />
          </button>

          {/* Messages - icône enveloppe */}
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <MessageCircle className="h-5 w-5 text-gray-600" />
          </button>

          {/* Notifications - icône cloche */}
          {headerConfig.showNotifications && (
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors relative">
              <Bell className="h-5 w-5 text-gray-600" />
              <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></span>
            </button>
          )}

          {/* Avatar utilisateur - cercle avec photo */}
          {headerConfig.showUserMenu && (
            <button className="p-1 hover:bg-gray-100 rounded-full transition-colors">
              <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                <User className="h-5 w-5 text-gray-600" />
              </div>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
