import { ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

interface AffiliateLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

export function AffiliateLink({
  href,
  children,
  className,
}: AffiliateLinkProps) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <a
        href={href}
        target="_blank"
        rel="nofollow sponsored noopener noreferrer"
        className={cn(
          "inline-flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-primary-foreground transition-colors hover:bg-primary/90",
          className
        )}
      >
        {children}
        <ExternalLink className="h-3.5 w-3.5" />
      </a>
      <span className="text-xs text-muted-foreground">Werbung</span>
    </span>
  );
}
