import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import { Check, Info, AlertTriangle, XCircle } from "lucide-react"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        // kind est une propriété additionnelle passée par notre API appToast
        const { kind, ...restProps } = props as any
        const renderIcon = () => {
          switch (kind) {
            case "success":
              return (
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-feedback-success">
                  <Check className="h-3 w-3 text-white" />
                </span>
              )
            case "warning":
              return (
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-feedback-warning">
                  <AlertTriangle className="h-3 w-3 text-white" />
                </span>
              )
            case "error":
              return (
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-error">
                  <XCircle className="h-3 w-3 text-white" />
                </span>
              )
            case "info":
            default:
              return (
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-feedback-info">
                  <Info className="h-3 w-3 text-white" />
                </span>
              )
          }
        }
        const borderClass =
          kind === "success"
            ? "border-feedback-success"
            : kind === "warning"
            ? "border-feedback-warning"
            : kind === "error"
            ? "border-error"
            : "border-feedback-info"

        const mergedClassName = [
          (restProps as any)?.className,
          borderClass,
        ]
          .filter(Boolean)
          .join(" ")

        const titleClass =
          kind === "success"
            ? "text-feedback-success"
            : kind === "warning"
            ? "text-feedback-warning"
            : kind === "error"
            ? "text-error"
            : "text-feedback-info"

        return (
          <Toast key={id} {...(restProps as any)} className={mergedClassName}>
            <div className="grid gap-1">
              <div className="flex items-center gap-3">
                <span>{renderIcon()}</span>
                <div className="grid gap-0">
                  {title && <ToastTitle className={titleClass}>{title}</ToastTitle>}
                  {description && (
                    <ToastDescription>{description}</ToastDescription>
                  )}
                </div>
              </div>
            </div>
            {action}
            <ToastClose
              className={
                (kind === "success"
                  ? "text-feedback-success hover:text-feedback-success"
                  : kind === "warning"
                  ? "text-feedback-warning hover:text-feedback-warning"
                  : kind === "error"
                  ? "text-error hover:text-error"
                  : "text-feedback-info hover:text-feedback-info") +
                " opacity-100"
              }
            />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
