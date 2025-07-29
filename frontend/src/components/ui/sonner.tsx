"use client";

import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group"
      position="bottom-right" // Position: top-left, top-right, bottom-left, bottom-right, top-center, bottom-center
      expand={true} // Expands on hover
      richColors={true} // Enables richer colors
      closeButton={false} // Close button
      duration={4000} // Global default duration (4 seconds)
      visibleToasts={5} // Maximum visible toasts
      toastOptions={{
        classNames: {
          toast: "group toast group-[.toaster]:shadow-lg",
          description:
            "group-[.toast]:text-muted-foreground dark:group-[.toast]:text-white",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          success:
            "group-[.toaster]:bg-emerald-600 group-[.toaster]:border-emerald-600 dark:group-[.toaster]:bg-emerald-600 dark:group-[.toaster]:border-emerald-600 dark:group-[.toaster]:text-white",
          error:
            "group-[.toaster]:bg-rose-600 group-[.toaster]:border-rose-600 dark:group-[.toaster]:bg-rose-600 dark:group-[.toaster]:border-rose-600 dark:group-[.toaster]:text-white",
          warning:
            "group-[.toaster]:bg-amber-600 group-[.toaster]:border-amber-600 dark:group-[.toaster]:bg-amber-600 dark:group-[.toaster]:border-amber-600 dark:group-[.toaster]:text-white",
          info: "group-[.toaster]:bg-slate-600 group-[.toaster]:border-slate-600 dark:group-[.toaster]:bg-slate-600 dark:group-[.toaster]:border-slate-600 dark:group-[.toaster]:text-white",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
