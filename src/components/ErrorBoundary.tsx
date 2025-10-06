import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { logger } from '@/lib/logger';
import { googleAnalyticsService } from '@/lib/googleAnalyticsService';
import { ROUTES } from '@/constants/routes';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  context?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  retryCount: number;
}

export class ErrorBoundary extends Component<Props, State> {
  private maxRetries = 3;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { context, onError } = this.props;
    
    // Logging de l'erreur
    logger.error(
      `Error Boundary caught an error${context ? ` in ${context}` : ''}`,
      context || 'ErrorBoundary',
      {
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        retryCount: this.state.retryCount,
      }
    );

    // Tracking Google Analytics pour les erreurs critiques
    try {
      // Note: Le service Google Analytics sera implémenté plus tard
      console.log('Error Boundary tracked for analytics:', `${context || 'unknown'}:${error.message}`);
    } catch (analyticsError) {
      console.warn('Analytics tracking failed:', analyticsError);
    }

    // Callback personnalisé
    if (onError) {
      onError(error, errorInfo);
    }

    this.setState({
      error,
      errorInfo,
    });
  }

  private handleRetry = () => {
    const { retryCount } = this.state;
    
    if (retryCount < this.maxRetries) {
      logger.info(
        `Retrying after error (attempt ${retryCount + 1}/${this.maxRetries})`,
        this.props.context || 'ErrorBoundary'
      );
      
      this.setState(prevState => ({
        hasError: false,
        error: null,
        errorInfo: null,
        retryCount: prevState.retryCount + 1,
      }));
    } else {
      logger.error(
        'Max retry attempts reached, redirecting to home',
        this.props.context || 'ErrorBoundary'
      );
      window.location.href = ROUTES.HOME;
    }
  };

  private handleGoHome = () => {
    window.location.href = ROUTES.HOME;
  };

  private handleReload = () => {
    window.location.reload();
  };

  render() {
    const { hasError, error, retryCount } = this.state;
    const { children, fallback } = this.props;

    if (hasError) {
      // Fallback personnalisé
      if (fallback) {
        return fallback;
      }

      // Fallback par défaut
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <CardTitle className="text-xl font-semibold text-gray-900">
                Oups ! Quelque chose s'est mal passé
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Erreur détectée</AlertTitle>
                <AlertDescription>
                  {process.env.NODE_ENV === 'development' && error ? (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-sm font-medium">
                        Détails techniques
                      </summary>
                      <pre className="mt-2 text-xs text-gray-600 whitespace-pre-wrap">
                        {error.message}
                        {error.stack && `\n\nStack trace:\n${error.stack}`}
                      </pre>
                    </details>
                  ) : (
                    'Une erreur inattendue s\'est produite. Veuillez réessayer.'
                  )}
                </AlertDescription>
              </Alert>

              <div className="flex flex-col space-y-2">
                {retryCount < this.maxRetries && (
                  <Button 
                    onClick={this.handleRetry}
                    className="w-full"
                    variant="default"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Réessayer ({retryCount + 1}/{this.maxRetries})
                  </Button>
                )}
                
                <Button 
                  onClick={this.handleGoHome}
                  variant="outline"
                  className="w-full"
                >
                  <Home className="mr-2 h-4 w-4" />
                  Retour à l'accueil
                </Button>
                
                <Button 
                  onClick={this.handleReload}
                  variant="ghost"
                  className="w-full"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Recharger la page
                </Button>
              </div>

              {process.env.NODE_ENV === 'development' && (
                <div className="text-xs text-gray-500 text-center">
                  Mode développement - Détails de l'erreur visibles
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    return children;
  }
}

// Hook pour utiliser l'Error Boundary
export const useErrorHandler = () => {
  const throwError = (error: Error, context?: string) => {
    logger.error('Manual error thrown', context, { error: error.message });
    throw error;
  };

  return { throwError };
};
