import { ChevronRight, Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useBreadcrumbs, BreadcrumbItem } from '@/hooks/useBreadcrumbs';

interface BreadcrumbsProps {
  className?: string;
  items?: BreadcrumbItem[];
}

export const Breadcrumbs = ({ className, items }: BreadcrumbsProps) => {
  const defaultItems = useBreadcrumbs();
  const breadcrumbs = items || defaultItems;

  if (breadcrumbs.length <= 1) {
    return null;
  }

  return (
    <nav className={cn('flex items-center space-x-1 text-sm text-muted-foreground', className)}>
      <Link
        to="/"
        className="flex items-center hover:text-foreground transition-colors"
        title="Accueil"
      >
        <Home className="h-4 w-4" />
      </Link>
      
      {breadcrumbs.map((item, index) => (
        <div key={index} className="flex items-center space-x-1">
          <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
          
          {item.isActive ? (
            <span className="font-medium text-foreground">
              {item.label}
            </span>
          ) : item.path ? (
            <Link
              to={item.path}
              className="hover:text-foreground transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-muted-foreground">
              {item.label}
            </span>
          )}
        </div>
      ))}
    </nav>
  );
};
