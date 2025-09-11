import { ReactNode, useState } from 'react';
import { DashboardSidebar } from './DashboardSidebar';
import { DashboardHeader } from './DashboardHeader';
import { usePageTitle } from '@/hooks/usePageTitle';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
  children: ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const { title, description } = usePageTitle();

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  const closeMobileSidebar = () => {
    setIsMobileSidebarOpen(false);
  };

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

        {/* Sidebar */}
        <div className={cn(
          "fixed md:relative z-50 md:z-auto transition-transform duration-300 ease-in-out",
          isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}>
          <DashboardSidebar onMobileClose={closeMobileSidebar} />
        </div>
        
        {/* Main content */}
        <div className="flex-1 flex flex-col w-full md:w-auto">
          <DashboardHeader onMobileMenuToggle={toggleMobileSidebar} />
          <main className="flex-1 px-6 pb-6 pt-0 overflow-auto">
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
