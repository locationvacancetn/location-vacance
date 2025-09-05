import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useUserRole } from '@/hooks/useUserRole';
import { Button } from '@/components/ui/button';
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
  Wrench,
  FileText,
  Users,
  Settings,
  Shield,
  Activity
} from 'lucide-react';

// Configuration des menus par rôle
const getMenuItems = (role: string) => {
  const commonItems = [
    { label: 'Dashboard', path: '/dashboard', icon: Home },
    { label: 'Messages', path: '/dashboard/messages', icon: Settings },
    { label: 'Paramètres', path: '/dashboard/settings', icon: Settings },
  ];

  switch (role) {
    case 'admin':
      return [
        ...commonItems,
        { label: 'Utilisateurs', path: '/dashboard/users', icon: Users },
        { label: 'Toutes Propriétés', path: '/dashboard/all-properties', icon: Building },
        { label: 'Toutes Réservations', path: '/dashboard/all-bookings', icon: Calendar },
        { label: 'Système', path: '/dashboard/system', icon: Shield },
        { label: 'Logs', path: '/dashboard/logs', icon: Activity },
      ];
    
    case 'owner':
      return [
        ...commonItems,
        { label: 'Mes Propriétés', path: '/dashboard/properties', icon: Building },
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
    
    case 'manager':
      return [
        ...commonItems,
        { label: 'Propriétés Gérées', path: '/dashboard/managed-properties', icon: Building },
        { label: 'Gérer Réservations', path: '/dashboard/manage-bookings', icon: Calendar },
        { label: 'Maintenance', path: '/dashboard/maintenance', icon: Wrench },
        { label: 'Rapports', path: '/dashboard/reports', icon: FileText },
      ];
    
    default:
      return commonItems;
  }
};

export const DashboardSidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { userRole } = useUserRole();
  const location = useLocation();

  const menuItems = getMenuItems(userRole || 'tenant');

  return (
    <div className={cn(
      "bg-card border-r border-border transition-all duration-300",
      isCollapsed ? "w-16" : "w-64"
    )}>
      <div className="p-4">
        {/* Logo et toggle */}
        <div className="flex items-center justify-between mb-6">
          {!isCollapsed && (
            <h2 className="text-xl font-bold text-foreground">
              Location Vacance
            </h2>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="h-8 w-8"
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
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
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
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
    </div>
  );
};
