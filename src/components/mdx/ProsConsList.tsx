import { Check, X } from "lucide-react";

interface ProsConsListProps {
  pros: string[];
  cons: string[];
  title?: string;
}

export function ProsConsList({ pros = [], cons = [], title }: ProsConsListProps) {
  return (
    <div className="my-6">
      {title && (
        <h4 className="mb-3 text-lg font-semibold">{title}</h4>
      )}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-green-200 bg-green-50/50 p-4 dark:border-green-900 dark:bg-green-950/30">
          <h5 className="mb-3 flex items-center gap-2 font-medium text-green-700 dark:text-green-400">
            <Check className="h-5 w-5" />
            Vorteile
          </h5>
          <ul className="space-y-2">
            {pros.map((pro) => (
              <li key={pro} className="flex items-start gap-2 text-sm text-green-900 dark:text-green-100">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-600 dark:text-green-400" />
                <span>{pro}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-lg border border-red-200 bg-red-50/50 p-4 dark:border-red-900 dark:bg-red-950/30">
          <h5 className="mb-3 flex items-center gap-2 font-medium text-red-700 dark:text-red-400">
            <X className="h-5 w-5" />
            Nachteile
          </h5>
          <ul className="space-y-2">
            {cons.map((con) => (
              <li key={con} className="flex items-start gap-2 text-sm text-red-900 dark:text-red-100">
                <X className="mt-0.5 h-4 w-4 shrink-0 text-red-600 dark:text-red-400" />
                <span>{con}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
