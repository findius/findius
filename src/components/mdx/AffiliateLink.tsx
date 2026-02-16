import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface AffiliateLinkProps {
  href: string;
  children?: React.ReactNode;
  className?: string;
}

export function AffiliateLink({
  href,
  children,
  className,
}: AffiliateLinkProps) {
  if (!href || href === '#') return null;

  return (
    <a
      href={href}
      target="_blank"
      rel="nofollow sponsored noopener noreferrer"
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90",
        className
      )}
    >
      {children || "Weiter"}
      <ArrowRight className="h-4 w-4" />
    </a>
  );
}
