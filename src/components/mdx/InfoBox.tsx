import { Info, AlertTriangle, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";

interface InfoBoxProps {
  variant?: "info" | "warning" | "tip";
  title?: string;
  children: React.ReactNode;
}

const variantStyles = {
  info: {
    container:
      "border-blue-200 bg-blue-50/50 dark:border-blue-900 dark:bg-blue-950/30",
    icon: "text-blue-600 dark:text-blue-400",
    title: "text-blue-800 dark:text-blue-300",
  },
  warning: {
    container:
      "border-amber-200 bg-amber-50/50 dark:border-amber-900 dark:bg-amber-950/30",
    icon: "text-amber-600 dark:text-amber-400",
    title: "text-amber-800 dark:text-amber-300",
  },
  tip: {
    container:
      "border-emerald-200 bg-emerald-50/50 dark:border-emerald-900 dark:bg-emerald-950/30",
    icon: "text-emerald-600 dark:text-emerald-400",
    title: "text-emerald-800 dark:text-emerald-300",
  },
};

const variantIcons = {
  info: Info,
  warning: AlertTriangle,
  tip: Lightbulb,
};

const defaultTitles = {
  info: "Hinweis",
  warning: "Achtung",
  tip: "Tipp",
};

export function InfoBox({ variant = "info", title, children }: InfoBoxProps) {
  const styles = variantStyles[variant];
  const Icon = variantIcons[variant];
  const displayTitle = title ?? defaultTitles[variant];

  return (
    <div className={cn("my-6 rounded-lg border p-4", styles.container)}>
      <div className={cn("mb-2 flex items-center gap-2 font-medium", styles.title)}>
        <Icon className={cn("h-5 w-5", styles.icon)} />
        {displayTitle}
      </div>
      <div className="text-sm leading-relaxed">{children}</div>
    </div>
  );
}
