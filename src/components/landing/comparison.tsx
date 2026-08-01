"use client";

import { Check, Minus, X } from "lucide-react";

import { FadeIn, SectionHeading, Stagger, StaggerItem } from "@/components/landing/motion";
import { Logo } from "@/components/landing/logo";

type Cell = "check" | "cross" | "neutral";

type ComparisonRow = {
  label: string;
  meetflow: Cell | string;
  calendly: Cell | string;
};

const rows: ComparisonRow[] = [
  { label: "Free forever", meetflow: "check", calendly: "cross" },
  { label: "Google Calendar two-way sync", meetflow: "check", calendly: "cross" },
  { label: "Unlimited active booking links", meetflow: "check", calendly: "cross" },
  { label: "Team scheduling & round-robin", meetflow: "check", calendly: "cross" },
  { label: "Automated availability", meetflow: "check", calendly: "cross" },
  { label: "Built-in analytics", meetflow: "check", calendly: "cross" },
  { label: "Email notifications & reminders", meetflow: "check", calendly: "cross" },
  { label: "One-click scheduling", meetflow: "check", calendly: "check" },
  { label: "Custom booking pages", meetflow: "check", calendly: "check" },
];

function CellValue({ value }: { value: Cell | string }) {
  if (value === "check") {
    return (
      <span className="inline-flex size-6 items-center justify-center rounded-full bg-brand/15 text-brand">
        <Check className="size-3.5" strokeWidth={2.5} />
      </span>
    );
  }
  if (value === "cross") {
    return (
      <span className="inline-flex size-6 items-center justify-center rounded-full bg-white/5 text-muted-foreground/60">
        <X className="size-3.5" strokeWidth={2.5} />
      </span>
    );
  }
  return (
    <span className="inline-flex size-6 items-center justify-center rounded-full bg-white/5 text-muted-foreground/60">
      <Minus className="size-3.5" strokeWidth={2.5} />
    </span>
  );
}

export function Comparison() {
  return (
    <section id="comparison" className="relative scroll-mt-24 py-24 sm:py-32">
      <div className="mx-auto w-full max-w-4xl px-6 lg:px-8">
        <SectionHeading
          eyebrow="Why MeetFlow"
          title={
            <>
              The modern choice for{" "}
              <span className="text-brand">serious schedulers</span>
            </>
          }
          description="Most scheduling tools charge for the basics. MeetFlow gives you the full platform — free, forever."
        />

        <Stagger className="mt-16 overflow-hidden rounded-3xl border border-white/10">
          <div className="grid grid-cols-[1.5fr_1fr_1fr] items-center gap-2 border-b border-white/10 bg-white/[0.03] px-5 py-5 sm:px-8">
            <span className="text-sm font-medium text-muted-foreground">
              Compare
            </span>
            <span className="flex items-center justify-center gap-2">
              <Logo showWordmark={false} className="sm:hidden" />
              <Logo />
            </span>
            <span className="flex items-center justify-center gap-2 text-muted-foreground">
              <svg aria-hidden className="size-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2a5 5 0 0 1 5 5v6a5 5 0 0 1-10 0V7a5 5 0 0 1 5-5Zm-7 11a7 7 0 0 0 14 0h-2a5 5 0 0 1-10 0H5Zm7 6.5c2.2 0 4.1 1.2 4.6 3h-9.2c.5-1.8 2.4-3 4.6-3Z" />
              </svg>
              Calendly
            </span>
          </div>

          {rows.map((row) => (
            <StaggerItem
              key={row.label}
              className="grid grid-cols-[1.5fr_1fr_1fr] items-center border-b border-white/5 px-5 py-4 transition-colors last:border-0 hover:bg-white/[0.02] sm:px-8"
            >
              <span className="pr-4 text-sm text-muted-foreground">
                {row.label}
              </span>
              <span className="flex justify-center">
                <CellValue value={row.meetflow} />
              </span>
              <span className="flex justify-center">
                <CellValue value={row.calendly} />
              </span>
            </StaggerItem>
          ))}
        </Stagger>

        <FadeIn className="mt-8 flex justify-center">
          <p className="text-center text-sm text-muted-foreground">
            Feature parity noted as of 2026. No gimmicks — just a better way to
            meet.
          </p>
        </FadeIn>
      </div>
    </section>
  );
}
