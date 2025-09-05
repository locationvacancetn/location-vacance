import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronDown, ChevronRight, HelpCircle, LogOut, Settings, Crown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SidebarItem, UserRole } from '@/types/dashboard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigation } from '@/hooks/useNavigation';
import { useLogger } from '@/lib/logger';
import { ROUTES } from '@/constants/routes';

interface DashboardSidebarProps {
  userRole: UserRole;
  sidebarContent: SidebarItem[];
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

const SidebarItemComponent = ({ 
  item, 
  isActive, 
  isCollapsed 
}: { 
  item: SidebarItem; 
  isActive: boolean; 
  isCollapsed: boolean; 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasChildren = item.children && item.children.length > 0;

  const handleToggle = () => {
    if (hasChildren) {
      setIsExpanded(!isExpanded);
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center">
        <Link
          to={item.path}
          className={cn(
            "flex items-center w-full px-3 py-3 text-sm font-medium rounded-lg transition-colors duration-200 group relative",
            isActive
              ? "bg-gray-900 text-white"
              : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
            isCollapsed ? "justify-center px-2" : "justify-start"
          )}
          onClick={hasChildren ? handleToggle : undefined}
          title={isCollapsed ? item.label : undefined}
        >
          <div className={cn("h-5 w-5", isCollapsed ? "" : "mr-3")}>
            <item.icon />
          </div>
          {!isCollapsed && (
            <>
              <span className="flex-1">{item.label}</span>
              {item.badge && (
                <span className="ml-2 px-2 py-0.5 text-xs bg-gray-900 text-white rounded-full">
                  {item.badge}
                </span>
              )}
              {hasChildren && (
                <div className="ml-2">
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </div>
              )}
            </>
          )}
          {/* Badge pour mode collapsed */}
          {isCollapsed && item.badge && (
            <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              {item.badge}
            </span>
          )}
        </Link>
      </div>
      
      {/* Sous-menu */}
      {hasChildren && isExpanded && !isCollapsed && (
        <div className="ml-6 mt-1 space-y-1">
          {item.children?.map((child, index) => (
            <Link
              key={index}
              to={child.path}
              className="flex items-center px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground rounded-md transition-colors"
            >
              <div className="h-4 w-4 mr-2">
                <child.icon />
              </div>
              <span>{child.label}</span>
              {child.badge && (
                <span className="ml-auto px-2 py-0.5 text-xs bg-primary text-primary-foreground rounded-full">
                  {child.badge}
                </span>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export const DashboardSidebar = ({ 
  userRole, 
  sidebarContent, 
  isCollapsed = false,
  onToggleCollapse 
}: DashboardSidebarProps) => {
  const location = useLocation();
  const { navigateTo } = useNavigation();
  const logger = useLogger('DashboardSidebar');

  const getRoleBadgeColor = (role: UserRole) => {
    const colors = {
      owner: "bg-blue-500 text-white",
      tenant: "bg-green-500 text-white", 
      manager: "bg-orange-500 text-white",
      admin: "bg-red-500 text-white"
    };
    return colors[role];
  };

  const getRoleLabel = (role: UserRole) => {
    const labels = {
      owner: "Propriétaire",
      tenant: "Locataire",
      manager: "Gestionnaire", 
      admin: "Administrateur"
    };
    return labels[role];
  };

  return (
    <aside className={cn(
      "bg-white transition-all duration-300 ease-in-out pt-2",
      isCollapsed ? "w-20" : "w-64"
    )}>
      <div className="flex flex-col h-full">
        {/* Header de la sidebar - Logo OripioFin */}
        <div className="p-3">
          <div className="flex items-center justify-center">
            <div className="relative">
              <Link to="/" className="flex items-center justify-center">
                <img 
                  src={isCollapsed ? "/icons/Dash-logo.svg" : "/icons/logo.svg"}
                  alt="OripioFin" 
                  className={cn(
                    "transition-all duration-300",
                    isCollapsed ? "h-10 w-10 object-contain" : "h-12 w-full object-contain"
                  )}
                />
              </Link>
              {onToggleCollapse && (
                <button
                  onClick={onToggleCollapse}
                  className="absolute -top-1 -right-8 h-5 w-5 bg-gray-800 hover:bg-gray-700 text-white rounded-full flex items-center justify-center transition-colors"
                  title={isCollapsed ? "Développer" : "Réduire"}
                >
                  <ChevronRight className={cn(
                    "h-3 w-3 transition-transform",
                    isCollapsed ? "rotate-0" : "rotate-180"
                  )} />
                </button>
              )}
            </div>
          </div>
        </div>


        {/* Navigation */}
        <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
          {sidebarContent.map((item, index) => {
            const isActive = location.pathname === item.path || 
                           location.pathname.startsWith(item.path + '/');
            
            return (
              <SidebarItemComponent
                key={index}
                item={item}
                isActive={isActive}
                isCollapsed={isCollapsed}
              />
            );
          })}
        </nav>

        {/* Upgrade Pro Card */}
        {!isCollapsed && (
          <div className="p-4">
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4">
                <div className="flex items-center mb-2">
                  <Crown className="h-4 w-4 text-green-600 mr-2" />
                  <span className="text-sm font-semibold text-green-800">Upgrade Pro! 🏆</span>
                </div>
                <p className="text-xs text-green-700 mb-3">
                  Higher productivity with better organization
                </p>
                <div className="space-y-2">
                  <Button size="sm" className="w-full bg-green-600 hover:bg-green-700 text-white text-xs">
                    Upgrade
                  </Button>
                  <button className="w-full text-xs text-green-600 hover:text-green-700 text-center">
                    Learn more
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Section Settings/Help/Logout - Uniformisé avec le style principal */}
        <div className="px-4 py-4 space-y-1">
          <button
            onClick={() => navigateTo(ROUTES.DASHBOARD_SETTINGS)}
            className={cn(
              "flex items-center w-full px-3 py-3 text-sm font-medium rounded-lg transition-colors duration-200 group relative",
              location.pathname === ROUTES.DASHBOARD_SETTINGS
                ? "bg-gray-900 text-white"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
              isCollapsed ? "justify-center px-2" : "justify-start"
            )}
            title={isCollapsed ? "Settings" : undefined}
          >
            <div className={cn("h-5 w-5", isCollapsed ? "" : "mr-3")}>
              <Settings className="h-5 w-5" />
            </div>
            {!isCollapsed && <span className="flex-1">Settings</span>}
          </button>
          <button
            onClick={() => navigateTo(ROUTES.DASHBOARD_HELP)}
            className={cn(
              "flex items-center w-full px-3 py-3 text-sm font-medium rounded-lg transition-colors duration-200 group relative",
              location.pathname === ROUTES.DASHBOARD_HELP
                ? "bg-gray-900 text-white"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
              isCollapsed ? "justify-center px-2" : "justify-start"
            )}
            title={isCollapsed ? "Help Desk" : undefined}
          >
            <div className={cn("h-5 w-5", isCollapsed ? "" : "mr-3")}>
              <HelpCircle className="h-5 w-5" />
            </div>
            {!isCollapsed && <span className="flex-1">Help Desk</span>}
          </button>
          <button
            onClick={() => {
              logger.info('User logout initiated');
              navigateTo(ROUTES.LOGIN);
            }}
            className={cn(
              "flex items-center w-full px-3 py-3 text-sm font-medium rounded-lg transition-colors duration-200 group relative",
              "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
              isCollapsed ? "justify-center px-2" : "justify-start"
            )}
            title={isCollapsed ? "Log out" : undefined}
          >
            <div className={cn("h-5 w-5", isCollapsed ? "" : "mr-3")}>
              <LogOut className="h-5 w-5" />
            </div>
            {!isCollapsed && <span className="flex-1">Log out</span>}
          </button>
        </div>
      </div>
    </aside>
  );
};
