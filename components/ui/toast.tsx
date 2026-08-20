"use client";

import { useEffect, useState } from "react";
import { X, CheckCircle2, XCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ToastData } from "@/lib/hooks/use-toast";

export function Toaster() {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  useEffect(() => {
    const handler = (e: Event) => {
      const { detail } = e as CustomEvent<ToastData & { duration: number }>;
      setToasts((prev) => [...prev, detail]);

      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== detail.id));
      }, detail.duration || 4000);
    };

    window.addEventListener("app-toast", handler);
    return () => window.removeEventListener("app-toast", handler);
  }, []);

  const dismiss = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-100 flex w-full max-w-sm flex-col gap-2">
      {toasts.map((t) => (
        <ToastItem key={t.id} data={t} onDismiss={() => dismiss(t.id)} />
      ))}
    </div>
  );
}

function ToastItem({ data, onDismiss }: { data: ToastData; onDismiss: () => void }) {
  const icon = {
    success: <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />,
    destructive: <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />,
    default: <Info className="h-4 w-4 text-primary" />,
  }[data.variant || "default"];

  return (
    <div
      className={cn(
        "pointer-events-auto flex items-start gap-3 rounded-lg border bg-card p-4 shadow-lg transition-all",
        data.variant === "destructive" && "border-red-200 dark:border-red-800",
        data.variant === "success" && "border-green-200 dark:border-green-800",
        (!data.variant || data.variant === "default") && "border-border"
      )}
    >
      <div className="shrink-0 pt-0.5">{icon}</div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-card-foreground">{data.title}</p>
        {data.description && (
          <p className="mt-0.5 text-xs text-muted-foreground">{data.description}</p>
        )}
      </div>
      <button
        onClick={onDismiss}
        className="shrink-0 rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground"
        aria-label="Dismiss"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
