/**
 * Système de logging professionnel
 * Remplace tous les console.log par un système structuré
 */

export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  context?: string;
  timestamp: Date;
  data?: any;
  userId?: string;
  route?: string;
}

class Logger {
  private static instance: Logger;
  private currentLevel: LogLevel;
  private logs: LogEntry[] = [];
  private maxLogs = 1000; // Limite pour éviter les fuites mémoire
  private ignoredContexts: string[] = ['useUserRole']; // Contextes à ignorer

  private constructor() {
    this.currentLevel = process.env.NODE_ENV === 'production' ? LogLevel.WARN : LogLevel.DEBUG;
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private log(level: LogLevel, message: string, context?: string, data?: any): void {
    if (level > this.currentLevel) return;

    // Ignorer les contextes dans la liste noire
    if (context && this.ignoredContexts.includes(context)) {
      return;
    }

    const entry: LogEntry = {
      level,
      message,
      context,
      timestamp: new Date(),
      data,
      userId: this.getCurrentUserId(),
      route: window.location.pathname,
    };

    this.logs.push(entry);
    
    // Maintenir la limite de logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Affichage conditionnel selon l'environnement
    if (process.env.NODE_ENV !== 'production') {
      this.displayLog(entry);
    }

    // En production, envoyer vers un service de logging
    if (process.env.NODE_ENV === 'production' && level <= LogLevel.ERROR) {
      this.sendToLoggingService(entry);
    }
  }

  private getCurrentUserId(): string | undefined {
    // Récupérer l'ID utilisateur depuis le contexte d'auth
    try {
      const authData = localStorage.getItem('supabase.auth.token');
      if (authData) {
        const parsed = JSON.parse(authData);
        return parsed?.user?.id;
      }
    } catch {
      // Ignorer les erreurs de parsing
    }
    return undefined;
  }

  private displayLog(entry: LogEntry): void {
    const { level, message, context, timestamp, data } = entry;
    const timeStr = timestamp.toISOString();
    const contextStr = context ? `[${context}]` : '';
    
    const logMessage = `${timeStr} ${contextStr} ${message}`;
    
    switch (level) {
      case LogLevel.ERROR:
        console.error(logMessage, data);
        break;
      case LogLevel.WARN:
        console.warn(logMessage, data);
        break;
      case LogLevel.INFO:
        console.info(logMessage, data);
        break;
      case LogLevel.DEBUG:
        console.debug(logMessage, data);
        break;
    }
  }

  private async sendToLoggingService(entry: LogEntry): Promise<void> {
    try {
      // En production, envoyer vers un service comme Sentry, LogRocket, etc.
      // Pour l'instant, on stocke localement
      const errorLogs = JSON.parse(localStorage.getItem('app_error_logs') || '[]');
      errorLogs.push(entry);
      localStorage.setItem('app_error_logs', JSON.stringify(errorLogs.slice(-100))); // Garder seulement les 100 derniers
    } catch (error) {
      console.error('Failed to send log to service:', error);
    }
  }

  public error(message: string, context?: string, data?: any): void {
    this.log(LogLevel.ERROR, message, context, data);
  }

  public warn(message: string, context?: string, data?: any): void {
    this.log(LogLevel.WARN, message, context, data);
  }

  public info(message: string, context?: string, data?: any): void {
    this.log(LogLevel.INFO, message, context, data);
  }

  public debug(message: string, context?: string, data?: any): void {
    this.log(LogLevel.DEBUG, message, context, data);
  }

  public getLogs(): LogEntry[] {
    return [...this.logs];
  }

  public clearLogs(): void {
    this.logs = [];
  }

  public setLevel(level: LogLevel): void {
    this.currentLevel = level;
  }

  public addIgnoredContext(context: string): void {
    if (!this.ignoredContexts.includes(context)) {
      this.ignoredContexts.push(context);
    }
  }

  public removeIgnoredContext(context: string): void {
    this.ignoredContexts = this.ignoredContexts.filter(ctx => ctx !== context);
  }

  public getIgnoredContexts(): string[] {
    return [...this.ignoredContexts];
  }
}

// Export de l'instance singleton
export const logger = Logger.getInstance();

// Hook React pour utiliser le logger
export const useLogger = (context?: string) => {
  return {
    error: (message: string, data?: any) => logger.error(message, context, data),
    warn: (message: string, data?: any) => logger.warn(message, context, data),
    info: (message: string, data?: any) => logger.info(message, context, data),
    debug: (message: string, data?: any) => logger.debug(message, context, data),
  };
};
