"use client";

import { motion } from "framer-motion";
import {
  BarChart3,
  BellRing,
  CalendarCheck,
  CalendarClock,
  Link2,
  MousePointerClick,
  Sparkles,
  Users,
  type LucideIcon,
} from "lucide-react";

import { SectionHeading, Stagger, StaggerItem } from "@/components/landing/motion";

type Feature = {
  icon: LucideIcon;
  title: string;
  description: string;
};

const features: Feature[] = [
  {
    icon: MousePointerClick,
    title: "One-click scheduling",
    description:
      "Share a link, let guests pick a slot, and confirm instantly — no more back-and-forth email ping-pong.",
  },
  {
    icon: CalendarClock,
    title: "Google Calendar Sync",
    description:
      "Two-way sync keeps every booking on your calendar and your availability accurate, always.",
  },
  {
    icon: Users,
    title: "Team Scheduling",
    description:
      "Route round-robin, collective, and group meetings across your entire team with a single link.",
  },
  {
    icon: Sparkles,
    title: "Automated Availability",
    description:
      "MeetFlow computes your free time from your calendar and respects your working hours automatically.",
  },
  {
    icon: Link2,
    title: "Smart Booking Links",
    description:
      "One link for every meeting type — 15-minute syncs, hour-long reviews, or group sessions.",
  },
  {
    icon: CalendarCheck,
    title: "Meeting Management",
    description:
      "Reschedule, cancel, buffer, and manage every meeting from one calm, organized dashboard.",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description:
      "See booking volume, busiest days, and top event types at a glance to plan with confidence.",
  },
  {
    icon: BellRing,
    title: "Email Notifications",
    description:
      "Automatic confirmations and reminders keep everyone on the same page — no one forgets a meeting.",
  },
];

export function Features() {
  return (
    <section id="features" className="relative scroll-mt-24 py-24 sm:py-32">
      <div className="mx-auto w-full max-w-7xl px-6 lg:px-8">
        <SectionHeading
          eyebrow="Features"
          title={
            <>
              Everything you need to{" "}
              <span className="text-brand">schedule smarter</span>
            </>
          }
          description="A complete scheduling toolkit that replaces a handful of tools — designed to feel effortless from the first click."
        />

        <Stagger className="mt-16 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <StaggerItem key={feature.title}>
              <motion.article
                whileHover={{ y: -6 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="group relative h-full overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition-colors duration-300 hover:border-brand/30 hover:bg-white/[0.05]"
              >
                <div
                  aria-hidden
                  className="absolute inset-x-0 -top-20 h-40 bg-gradient-to-b from-brand/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                />
                <div className="relative">
                  <span className="inline-flex size-11 items-center justify-center rounded-xl border border-brand/20 bg-brand-tint text-brand transition-transform duration-300 group-hover:scale-105">
                    <feature.icon className="size-5" strokeWidth={1.8} />
                  </span>
                  <h3 className="mt-5 text-base font-semibold text-foreground">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </motion.article>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
