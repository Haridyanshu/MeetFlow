"use client";

import { CalendarCheck, CalendarClock, Link2, UserPlus, type LucideIcon } from "lucide-react";

import { SectionHeading, Stagger, StaggerItem } from "@/components/landing/motion";

type Step = {
  number: string;
  icon: LucideIcon;
  title: string;
  description: string;
};

const steps: Step[] = [
  {
    number: "01",
    icon: UserPlus,
    title: "Create your account",
    description:
      "Sign up free with Google or GitHub and land in your dashboard in seconds.",
  },
  {
    number: "02",
    icon: CalendarClock,
    title: "Connect Google Calendar",
    description:
      "One click keeps your real availability in sync — two-way, both ways.",
  },
  {
    number: "03",
    icon: Link2,
    title: "Share your booking link",
    description:
      "Drop it anywhere — email, docs, or social — and guests pick a time that works.",
  },
  {
    number: "04",
    icon: CalendarCheck,
    title: "Get booked",
    description:
      "Bookings land on your calendar with confirmations and reminders handled.",
  },
];

export function Timeline() {
  return (
    <section id="how-it-works" className="relative scroll-mt-24 py-24 sm:py-32">
      <div className="mx-auto w-full max-w-7xl px-6 lg:px-8">
        <SectionHeading
          eyebrow="How it works"
          title="Up and running in minutes, not hours"
          description="From empty calendar to fully booked in four simple steps. No setup fees, no IT tickets."
        />

        <Stagger className="relative mt-16 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div
            aria-hidden
            className="absolute inset-x-0 top-7 hidden h-px bg-gradient-to-r from-transparent via-brand/40 to-transparent lg:block"
          />
          {steps.map((step) => (
            <StaggerItem key={step.number}>
              <div className="relative">
                <div className="relative z-10 flex size-14 items-center justify-center rounded-2xl border border-brand/20 bg-background text-brand shadow-lg shadow-brand/10">
                  <step.icon className="size-6" strokeWidth={1.8} />
                </div>
                <p className="mt-5 text-xs font-semibold uppercase tracking-widest text-brand/80">
                  Step {step.number}
                </p>
                <h3 className="mt-2 text-lg font-semibold text-foreground">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
