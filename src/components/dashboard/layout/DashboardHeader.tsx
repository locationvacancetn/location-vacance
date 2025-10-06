import { useUserRole } from '@/hooks/useUserRole';
import { useAuth } from '@/hooks/useAuth';
import { usePageTitle } from '@/hooks/usePageTitle';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  User, 
  Settings, 
  LogOut,
  Shield,
  Building,
  Calendar,
  Megaphone,
  Menu,
  Home,
  DollarSign,
  BarChart3,
  Search,
  Heart,
  FileText,
  Users,
  Activity,
  HomeIcon,
  MapPin,
  Wrench,
  CreditCard,
  Package,
  Mail,
  PictureInPicture2,
  Monitor
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';

// Configuration des menus par rôle pour la navigation mobile
const getMobileMenuItems = (role: string) => {
  const commonItems = [
    { label: 'Dashboard', path: '/dashboard', icon: Home },
    { label: 'Paramètres', path: '/dashboard/settings', icon: Settings },
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
        { label: 'Analytics', path: '/dashboard/admin/analytics', icon: Monitor },
        { label: 'Profil', path: '/dashboard/admin/profile', icon: User },
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
        { label: 'Rechercher', path: '/dashboard/search', icon: Search },
        { label: 'Favoris', path: '/dashboard/favorites', icon: Heart },
        { label: 'Profil', path: '/dashboard/profile', icon: Users },
      ];
    
    case 'advertiser':
      return [
        ...commonItems,
        { label: 'Mes Publicités', path: '/dashboard/ads', icon: Megaphone },
        { label: 'Analytics', path: '/dashboard/analytics', icon: BarChart3 },
        { label: 'Campagnes', path: '/dashboard/campaigns', icon: Calendar },
        { label: 'Rapports', path: '/dashboard/reports', icon: FileText },
        { label: 'Profil', path: '/dashboard/profile', icon: Users },
      ];
    
    default:
      return commonItems;
  }
};

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

interface DashboardHeaderProps {
  onMobileMenuToggle?: () => void;
}

export const DashboardHeader = ({ onMobileMenuToggle }: DashboardHeaderProps) => {
  const { userProfile, userRole } = useUserRole();
  const { signOut } = useAuth();
  const { title, description } = usePageTitle();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const roleInfo = getRoleInfo(userRole || 'tenant');
  const menuItems = getMobileMenuItems(userRole || 'tenant');

  const handleSignOut = async () => {
    await signOut();
  };

  const displayName = userProfile?.full_name || 'Utilisateur';
  const initials = displayName
    .split(" ")
    .map((w: string) => w.charAt(0).toUpperCase())
    .slice(0, 2)
    .join("") || "U";

  return (
    <header className="bg-background px-6 py-4 md:border md:border-border md:rounded-lg md:shadow-sm md:mx-4 md:mt-4 md:mb-4 md:ml-8">
      <div className="flex items-center justify-between">
        {/* Logo à gauche sur mobile, titre sur desktop */}
        <div className="flex items-center gap-4 flex-1">
          {/* Logo sur mobile */}
          <div className="md:hidden">
            <Link to="/">
              <img src="/icons/logo.svg" alt="Logo" className="h-10 w-auto" />
            </Link>
          </div>
          
          {/* Titre sur desktop */}
          <div className="hidden md:block flex-1">
            <h1 className="text-2xl font-bold text-foreground">
              {title}
            </h1>
            {description && (
              <p className="text-sm text-muted-foreground mt-1">
                {description}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Bouton kebab sur mobile */}
          <div className="md:hidden">
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10 rounded-md text-green-600 hover:text-green-700 border-green-600 hover:border-green-700 active:bg-green-600 active:text-white active:border-green-600"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </Button>
          </div>

          {/* Profil sur desktop */}
          <div className="hidden md:block">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-3 p-2 hover:bg-muted/50">
                  <div className="text-right flex flex-col justify-center">
                    <p className="text-xs text-muted-foreground">Bonjour,</p>
                    <p className="text-base font-medium text-foreground">
                      {userProfile?.full_name || 'Utilisateur'}
                    </p>
                  </div>
                  <div className="relative flex-shrink-0">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={userProfile?.avatar_url} className="object-cover" />
                      <AvatarFallback className="bg-gray-200 text-gray-600">
                        {userProfile?.full_name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {userProfile?.full_name || 'Utilisateur'}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {userProfile?.email || 'email@example.com'}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profil</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Paramètres</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Se déconnecter</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Modal plein écran mobile */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-white z-[9999] md:hidden flex flex-col">
          <div className="flex-1 overflow-y-auto bg-white">
            <div className="w-full bg-white min-h-full">
              <Card className="border-0 shadow-none bg-transparent">
                <CardHeader className="px-6 py-4">
                  {/* Header avec logo et bouton fermer */}
                  <div className="flex items-center justify-between">
                    <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center">
                      <img src="/icons/logo.svg" alt="Logo" className="h-10 w-auto" />
                    </Link>
                     <Button
                       variant="outline"
                       size="icon"
                       className="h-10 w-10 rounded-md text-green-600 hover:text-green-700 border-green-600 hover:border-green-700 active:bg-green-600 active:text-white active:border-green-600"
                       onClick={() => setIsMobileMenuOpen(false)}
                     >
                       <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                       </svg>
                     </Button>
                   </div>
                  {/* Section utilisateur */}
                  <div className="py-6 mb-8">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="relative">
                        <Avatar className="h-16 w-16 rounded-full">
                          <AvatarImage
                            src={userProfile?.avatar_url || "/placeholder.svg"}
                            alt={displayName}
                            className="object-cover"
                          />
                          <AvatarFallback className="text-lg rounded-full">{initials}</AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg font-bold text-foreground mb-1">
                          {displayName}
                        </CardTitle>
                        <p className="text-muted-foreground text-sm mb-1">
                          {userProfile?.email || 'email@example.com'}
                        </p>
                        <Badge variant="secondary" className="text-xs">
                          {roleInfo.label}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="px-6 pb-6">
                  <div className="space-y-3">
                    
                    {/* Navigation basée sur le rôle */}
                    <div className="grid grid-cols-1 gap-3">
                      {menuItems.map((item) => {
                        const isActive = window.location.pathname === item.path;
                        return (
                          <Link 
                            key={item.path} 
                            to={item.path} 
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            <Button 
                              variant={isActive ? "default" : "outline"} 
                              className={`w-full justify-start text-base py-3 h-auto ${isActive ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
                            >
                              <item.icon className="w-5 h-5 mr-3" />
                              {item.label}
                            </Button>
                          </Link>
                        );
                      })}
                    </div>
                    
                    {/* Bouton de déconnexion en bas du contenu */}
                    <div className="mt-8 pt-4 border-t border-border">
                      <Button 
                        variant="outline" 
                        className="w-full py-3"
                        onClick={() => {
                          handleSignOut();
                          setIsMobileMenuOpen(false);
                        }}
                      >
                        <LogOut className="w-5 h-5 mr-3" />
                        Se déconnecter
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
