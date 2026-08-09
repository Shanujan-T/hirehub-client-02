import { cn } from "@/lib/utils";

export function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "gradient" | "gradientCommunity" | "outline" | "destructive" | "ghost";
  size?: "default" | "sm" | "lg";
}) {
  const variants = {
    default: "bg-brand-gradient font-bold text-white shadow-md shadow-secondary/20 hover:scale-[1.02] hover:shadow-lg hover:shadow-secondary/25 active:scale-[0.98]",
    gradient: "bg-brand-gradient font-bold text-white shadow-md shadow-secondary/20 hover:scale-[1.02] hover:shadow-lg hover:shadow-secondary/25 active:scale-[0.98]",
    gradientCommunity:
      "bg-community-gradient font-bold text-white shadow-md shadow-info/25 hover:scale-[1.02] hover:shadow-lg hover:shadow-info/30 active:scale-[0.98]",
    outline: "border-[1.5px] border-accent/80 bg-transparent text-secondary shadow-sm hover:border-accent hover:bg-accent/5 dark:border-accent/60 dark:shadow-none",
    destructive: "bg-destructive text-white hover:opacity-90",
    ghost: "text-muted hover:bg-border/50 hover:text-foreground",
  };
  const sizes = {
    default: "h-10 rounded-xl px-4 text-sm",
    sm: "h-8 rounded-xl px-3 text-xs",
    lg: "h-12 rounded-xl px-6 text-base",
  };
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center font-medium transition disabled:opacity-50",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  );
}

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "flex h-10 w-full items-center rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-info focus:ring-2 focus:ring-info/20",
        className
      )}
      {...props}
    />
  );
}

export function Textarea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "flex min-h-[80px] w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-info focus:ring-2 focus:ring-info/20",
        className
      )}
      {...props}
    />
  );
}

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn("rounded-2xl border border-border/80 bg-card/90 p-6 shadow-sm backdrop-blur-sm dark:border-border dark:shadow-md dark:shadow-black/25", className)}>
      {children}
    </div>
  );
}

export function Badge({
  className,
  children,
  variant = "default",
}: {
  className?: string;
  children: React.ReactNode;
  variant?: "default" | "pending" | "open" | "active" | "completed" | "rejected" | "info";
}) {
  const variants = {
    default: "bg-border/60 text-foreground",
    pending: "bg-gray-500/10 font-bold text-gray-600 dark:text-gray-400",
    open: "bg-info/10 font-bold text-info",
    active: "bg-secondary/10 font-bold text-secondary",
    completed: "bg-success/10 font-bold text-success",
    rejected: "bg-destructive/10 font-bold text-destructive",
    info: "bg-info/10 font-bold text-info",
  };
  return (
    <span className={cn("inline-flex rounded-full px-2.5 py-0.5 text-xs capitalize", variants[variant], className)}>
      {children}
    </span>
  );
}

export function Label({ className, children, htmlFor }: { className?: string; children: React.ReactNode; htmlFor?: string }) {
  return (
    <label htmlFor={htmlFor} className={cn("text-sm font-semibold", className)}>
      {children}
    </label>
  );
}

export function Select({ className, children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "flex h-10 w-full appearance-none rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-info focus:ring-2 focus:ring-info/20",
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
}

export { SelectMenu, type SelectMenuOption } from "./select-menu";
export { SearchableSelectMenu } from "./searchable-select-menu";
export { PasswordInput } from "./password-input";
export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./tooltip";
