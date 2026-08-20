"use client";

export type ToastVariant = "default" | "success" | "destructive";

export type ToastData = {
  id: string;
  title: string;
  description?: string;
  variant?: ToastVariant;
};

let count = 0;

export function toast({
  title,
  description,
  variant = "default",
  duration = 4000,
}: {
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
}) {
  const id = String(++count);
  const detail: ToastData & { duration: number } = { id, title, description, variant, duration };

  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("app-toast", { detail }));
  }

  return id;
}
