"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { Check, type LucideIcon } from "lucide-react";
import type { ComponentType } from "react";
import { useRef } from "react";

import {
  AnalyticsMockup,
  AvailabilityMockup,
  BookingPageMockup,
  DashboardMockup,
  TeamsMockup,
} from "@/components/landing/mockups";
import { EASE, FadeIn } from "@/components/landing/motion";
import { cn } from "@/lib/utils";

type ShowcaseFeature = {
  eyebrow: string;
  title: string;
  description: string;
  points: string[];
  icon: LucideIcon;
  mockup: ComponentType<{ className?: string }>;
};

const showcases: ShowcaseFeature[] = [
  {
    eyebrow: "Dashboard",
    title: "A command center for your whole day",
    description:
      "Every booking, event type, and reminder in one place. See what's happening today and act in a single click.",
    points: [
      "Today's bookings at a glance",
      "Create and edit event types instantly",
      "A live activity stream of everything",
    ],
    icon: Check,
    mockup: DashboardMockup,
  },
  {
    eyebrow: "Booking page",
    title: "A booking page your guests will love",
    description:
      "Beautiful, branded pages that work in every time zone. Guests pick a time that fits without thinking twice.",
    points: [
      "Custom branding and short links",
      "Timezone-aware slot suggestions",
      "Calendar and video meeting options",
    ],
    icon: Check,
    mockup: BookingPageMockup,
  },
  {
    eyebrow: "Availability",
    title: "Set your hours, meet when it works",
    description:
      "Define your perfect schedule once. MeetFlow respects your boundaries and only ever shows real free time.",
    points: [
      "Weekly schedules and one-off overrides",
      "Buffers, limits, and advanced rules",
      "Automatic timezone handling",
    ],
    icon: Check,
    mockup: AvailabilityMockup,
  },
  {
    eyebrow: "Teams",
    title: "Schedule as one, or as many",
    description:
      "Route meetings across your team with round-robin and collective scheduling. Everyone stays in sync.",
    points: [
      "Round-robin and collective routing",
      "Shared team event types",
      "One booking link for the whole team",
    ],
    icon: Check,
    mockup: TeamsMockup,
  },
  {
    eyebrow: "Analytics",
    title: "Know exactly what's working",
    description:
      "Understand your booking volume, busiest days, and top event types — then double down on what wins.",
    points: [
      "Booking trends over time",
      "Event-type performance comparison",
      "No-show and activity insights",
    ],
    icon: Check,
    mockup: AnalyticsMockup,
  },
];

function ShowcaseRow({ feature, index }: { feature: ShowcaseFeature; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const reversed = index % 2 === 1;

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const parallaxY = useTransform(scrollYProgress, [0, 1], [48, -48]);

  return (
    <div
      ref={ref}
      className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20"
    >
      <div className={cn(reversed && "lg:order-2")}>
        <FadeIn>
          <span className="inline-flex items-center gap-2 rounded-full border border-brand/20 bg-brand-tint px-3 py-1 text-xs font-medium uppercase tracking-widest text-brand">
            {feature.eyebrow}
          </span>
          <h3 className="mt-5 text-balance text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            {feature.title}
          </h3>
          <p className="mt-4 max-w-lg text-pretty leading-relaxed text-muted-foreground">
            {feature.description}
          </p>
          <ul className="mt-7 space-y-3">
            {feature.points.map((point) => (
              <li key={point} className="flex items-start gap-3">
                <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-brand/15 text-brand">
                  <feature.icon className="size-3" strokeWidth={2.5} />
                </span>
                <span className="text-sm text-muted-foreground">{point}</span>
              </li>
            ))}
          </ul>
        </FadeIn>
      </div>

      <motion.div
        style={{ y: parallaxY }}
        className={cn("relative", reversed && "lg:order-1")}
      >
        <motion.div
          initial={{ opacity: 0, x: reversed ? -48 : 48 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease: EASE }}
        >
          <feature.mockup className="mx-auto w-full max-w-xl" />
        </motion.div>
        <div
          aria-hidden
          className="absolute -inset-4 -z-10 rounded-3xl bg-gradient-to-br from-brand/10 via-transparent to-indigo-500/10 blur-2xl"
        />
      </motion.div>
    </div>
  );
}

export function Showcase() {
  return (
    <section id="product" className="relative scroll-mt-24 py-24 sm:py-32">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-24 px-6 sm:gap-32 lg:px-8">
        {showcases.map((feature, index) => (
          <ShowcaseRow key={feature.eyebrow} feature={feature} index={index} />
        ))}
      </div>
    </section>
  );
}
