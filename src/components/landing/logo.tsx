import { CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";

export function Logo({
  className,
  showWordmark = true,
}: {
  className?: string;
  showWordmark?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span className="flex size-8 items-center justify-center rounded-xl bg-gradient-to-br from-brand to-emerald-400 text-background shadow-lg shadow-brand/25">
        <CalendarDays className="size-[18px]" strokeWidth={2.2} />
      </span>
      {showWordmark && (
        <span className="text-lg font-semibold tracking-tight text-foreground">
          MeetFlow
        </span>
      )}
    </span>
  );
}
