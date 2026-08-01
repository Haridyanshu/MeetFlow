"use client";

import { ArrowRight, Check, Sparkles } from "lucide-react";
import Link from "next/link";

import { FadeIn } from "@/components/landing/motion";
import { siteConfig } from "@/components/landing/site";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const included = [
  "Unlimited bookings",
  "Unlimited booking links",
  "Google Calendar two-way sync",
  "Team scheduling & round-robin",
  "Automated availability",
  "Analytics dashboard",
  "Email notifications & reminders",
  "Priority support",
];

export function Pricing() {
  return (
    <section id="pricing" className="relative scroll-mt-24 py-24 sm:py-32">
      <div className="mx-auto w-full max-w-7xl px-6 lg:px-8">
        <FadeIn className="flex flex-col items-center gap-4 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-brand/20 bg-brand-tint px-3.5 py-1 text-xs font-medium uppercase tracking-widest text-brand">
            <span className="size-1 rounded-full bg-brand" />
            Pricing
          </span>
          <h2 className="max-w-2xl text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl lg:text-[2.75rem] lg:leading-[1.1]">
            Simple, honest pricing —{" "}
            <span className="text-brand">free forever</span>
          </h2>
          <p className="max-w-xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
            No trials, no hidden tiers, no surprise invoices. Every feature, for
            everyone, always.
          </p>
        </FadeIn>

        <FadeIn
          delay={0.1}
          className="mx-auto mt-16 max-w-lg overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.02] shadow-[0_30px_80px_-24px_rgba(16,185,129,0.2)]"
        >
          <div className="relative overflow-hidden px-8 pt-10">
            <div
              aria-hidden
              className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand/60 to-transparent"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -top-16 left-1/2 h-40 w-72 -translate-x-1/2 rounded-full bg-brand/15 blur-3xl"
            />
            <div className="relative flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  Free Forever
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Everything. Included. No credit card required.
                </p>
              </div>
              <span className="inline-flex size-10 items-center justify-center rounded-xl border border-brand/25 bg-brand-tint text-brand">
                <Sparkles className="size-5" />
              </span>
            </div>
            <div className="relative mt-6 flex items-baseline gap-1.5">
              <span className="text-6xl font-semibold tracking-tight text-foreground">
                $0
              </span>
              <span className="text-sm text-muted-foreground">
                / forever
              </span>
            </div>
          </div>

          <div className="px-8 pb-10 pt-8">
            <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {included.map((item) => (
                <li key={item} className="flex items-center gap-2.5 text-sm text-foreground">
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-brand/15 text-brand">
                    <Check className="size-3" strokeWidth={2.5} />
                  </span>
                  {item}
                </li>
              ))}
            </ul>

            <Link
              href={siteConfig.signInUrl}
              className={cn(
                buttonVariants({ variant: "brand" }),
                "group mt-9 h-12 w-full text-base shadow-lg shadow-brand/25 hover:shadow-brand/40"
              )}
            >
              Start for free
              <ArrowRight className="transition-transform group-hover:translate-x-0.5" />
            </Link>
            <p className="mt-4 text-center text-xs text-muted-foreground">
              Join today and schedule your first meeting in under two minutes.
            </p>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
