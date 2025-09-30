import { ReactNode, useState, useEffect } from 'react';
import { DashboardSidebar } from './DashboardSidebar';
import { DashboardHeader } from './DashboardHeader';
import { usePageTitle } from '@/hooks/usePageTitle';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
  children: ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const { title, description } = usePageTitle();

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  const closeMobileSidebar = () => {
    setIsMobileSidebarOpen(false);
  };

  // Écouter les changements de l'état collapsed de la sidebar
  useEffect(() => {
    const handleSidebarToggle = (event: CustomEvent) => {
      setIsSidebarCollapsed(event.detail.isCollapsed);
    };

    window.addEventListener('sidebar-toggle', handleSidebarToggle as EventListener);
    return () => {
      window.removeEventListener('sidebar-toggle', handleSidebarToggle as EventListener);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="flex h-screen">
        {/* Mobile Overlay */}
        {isMobileSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={closeMobileSidebar}
          />
        )}

        {/* Sidebar - Fixe sur desktop */}
        <div className={cn(
          "fixed md:fixed z-50 md:z-20 transition-transform duration-300 ease-in-out",
          "md:top-0 md:left-0 md:h-screen",
          isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}>
          <DashboardSidebar onMobileClose={closeMobileSidebar} />
        </div>
        
        {/* Main content - Avec marge pour la sidebar sur desktop */}
        <div className={cn(
          "flex-1 w-full transition-all duration-300",
          "md:ml-56", // Marge par défaut pour sidebar étendue
          isSidebarCollapsed && "md:ml-16" // Marge réduite quand sidebar est collapsed
        )}>
          <DashboardHeader onMobileMenuToggle={toggleMobileSidebar} />
          <main className="px-6 pb-6 pt-0">
            {/* Titre de la page sur mobile */}
            <div className="md:hidden mb-6">
              <h1 className="text-2xl font-bold text-foreground">
                {title}
              </h1>
              {description && (
                <p className="text-sm text-muted-foreground mt-1">
                  {description}
                </p>
              )}
            </div>
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};
