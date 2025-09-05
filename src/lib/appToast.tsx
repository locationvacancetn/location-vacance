import React from "react";
import { toast as baseToast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";
import type { ToastActionElement } from "@/components/ui/toast";

export type AppToastOptions = {
  title?: string;
  description?: string;
  /**
   * Utilise la variante destructive pour les erreurs.
   */
  destructive?: boolean;
  /**
   * Type sémantique du toast (impacte icône/styling supplémentaire)
   */
  kind?: "success" | "info" | "warning" | "error";
  /** Durée d'affichage en millisecondes (défaut: 3000ms) */
  duration?: number;
  /**
   * Libellé du bouton d'action optionnel.
   */
  actionLabel?: string;
  /**
   * Callback déclenché lors du clic sur l'action.
   */
  onAction?: () => void;
};

function makeAction(actionLabel?: string, onAction?: () => void): ToastActionElement | undefined {
  if (!actionLabel) return undefined;
  return (
    <ToastAction altText={actionLabel} onClick={onAction}>
      {actionLabel}
    </ToastAction>
  );
}

export function showToast(options: AppToastOptions) {
  const { title, description, destructive, kind, duration = 3000, actionLabel, onAction } = options;
  return baseToast({
    title,
    description,
    variant: destructive ? "destructive" : "default",
    // Props additionnelles consommées par notre Toaster custom
    ...(kind ? ({ kind } as unknown as object) : {}),
    duration,
    action: makeAction(actionLabel, onAction),
  });
}

export function showSuccess(options: Omit<AppToastOptions, "destructive">) {
  const { title, description, actionLabel, onAction } = options;
  return showToast({
    title: title ?? "Action réussie",
    description,
    destructive: false,
    kind: "success",
    actionLabel,
    onAction,
  });
}

export function showError(options: Omit<AppToastOptions, "destructive">) {
  const { title, description, actionLabel, onAction } = options;
  return showToast({
    title: title ?? "Erreur",
    description,
    destructive: false,
    kind: "error",
    actionLabel,
    onAction,
  });
}

export function showInfo(options: Omit<AppToastOptions, "destructive">) {
  const { title, description, actionLabel, onAction } = options;
  return showToast({
    title: title ?? "Information",
    description,
    destructive: false,
    kind: "info",
    actionLabel,
    onAction,
  });
}

export function showWarning(options: Omit<AppToastOptions, "destructive">) {
  const { title, description, actionLabel, onAction } = options;
  return showToast({
    title: title ?? "Attention",
    description,
    destructive: false,
    kind: "warning",
    actionLabel,
    onAction,
  });
}


