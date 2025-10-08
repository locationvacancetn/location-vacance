/**
 * ai-generate-button.tsx
 * 
 * Composant bouton pour la génération de contenu avec IA.
 * Affiche un bouton avec icône IA et gère les états de chargement.
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AIGenerateButtonProps {
  onGenerate: () => Promise<void>;
  disabled?: boolean;
  loading?: boolean;
  size?: 'sm' | 'default' | 'lg';
  variant?: 'default' | 'outline' | 'secondary' | 'ghost';
  className?: string;
  children?: React.ReactNode;
}

export const AIGenerateButton: React.FC<AIGenerateButtonProps> = ({
  onGenerate,
  disabled = false,
  loading = false,
  size = 'sm',
  variant = 'outline',
  className,
  children
}) => {
  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      onClick={onGenerate}
      disabled={disabled || loading}
      className={cn(
        "gap-2 transition-all duration-200",
        "hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50",
        "border-purple-200 hover:border-purple-300",
        "text-purple-700 hover:text-purple-800",
        className
      )}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Sparkles className="h-4 w-4" />
      )}
      {children || (loading ? 'Génération...' : 'Générer avec IA')}
    </Button>
  );
};

export default AIGenerateButton;
