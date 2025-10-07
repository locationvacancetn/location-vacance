/**
 * Types pour le composant Footer
 */

export interface NavigationLink {
  to: string;
  label: string;
}

export interface SocialLink {
  icon: React.ComponentType<{ className?: string }>;
  url: string;
  label: string;
}

export type Language = 'français' | 'anglais';

export type Currency = 'TND' | 'USD' | 'EUR';

export interface FooterProps {
  className?: string;
}
