import { Suspense, lazy, ComponentType } from 'react';
import { Spinner } from '@/components/ui/spinner';
import { ErrorBoundary } from '@/components/ErrorBoundary';

interface LazyWrapperProps {
  fallback?: React.ReactNode;
  errorFallback?: React.ReactNode;
  context?: string;
}

// Composant de fallback par défaut
const DefaultFallback = () => (
  <div className="flex items-center justify-center min-h-[200px]">
    <div className="flex flex-col items-center space-y-4">
      <Spinner className="h-8 w-8" />
      <p className="text-muted-foreground">Chargement...</p>
    </div>
  </div>
);

// HOC pour wrapper les composants lazy
export const withLazyLoading = <P extends object>(
  importFunc: () => Promise<{ default: ComponentType<P> }>,
  options: LazyWrapperProps = {}
) => {
  const LazyComponent = lazy(importFunc);
  const { fallback = <DefaultFallback />, errorFallback, context } = options;

  return (props: P) => (
    <ErrorBoundary context={context} fallback={errorFallback}>
      <Suspense fallback={fallback}>
        <LazyComponent {...props} />
      </Suspense>
    </ErrorBoundary>
  );
};

// Hook pour précharger les composants
export const usePreloadComponent = () => {
  const preload = (importFunc: () => Promise<any>) => {
    // Précharger le composant en arrière-plan
    importFunc().catch((error) => {
      console.warn('Failed to preload component:', error);
    });
  };

  return { preload };
};
