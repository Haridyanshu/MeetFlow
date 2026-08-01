"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Check, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRef } from "react";

import { CalendarMockup } from "@/components/landing/mockups";
import { EASE } from "@/components/landing/motion";
import { siteConfig } from "@/components/landing/site";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const trustPoints = ["Free forever", "No credit card", "2-minute setup"];

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const prefersReducedMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const mockupY = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const glowY = useTransform(scrollYProgress, [0, 1], [0, 140]);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden pb-20 pt-36 sm:pb-28 sm:pt-44"
    >
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="bg-landing-grid absolute inset-0 [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,black_35%,transparent_75%)]" />
        <motion.div
          style={{ y: glowY }}
          className="absolute left-1/2 top-[-18rem] h-[36rem] w-[52rem] -translate-x-1/2 rounded-full bg-brand/20 blur-[140px]"
        />
        <div className="absolute bottom-[-10rem] left-[-8rem] h-[26rem] w-[26rem] rounded-full bg-indigo-500/10 blur-[120px]" />
        <div className="absolute right-[-6rem] top-40 h-[22rem] w-[22rem] rounded-full bg-emerald-500/10 blur-[120px]" />
      </div>

      <div className="relative mx-auto grid w-full max-w-7xl items-center gap-16 px-6 lg:grid-cols-2 lg:gap-12 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: EASE }}
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 py-1 pl-1.5 pr-3.5 text-xs font-medium text-muted-foreground">
            <span className="inline-flex items-center gap-1 rounded-full bg-brand/15 px-2 py-0.5 text-brand">
              <Sparkles className="size-3" />
              New
            </span>
            Google Calendar two-way sync
          </span>

          <h1 className="mt-6 text-balance text-4xl font-semibold leading-[1.05] tracking-tight text-foreground sm:text-6xl lg:text-[4.25rem]">
            Scheduling that feels{" "}
            <span className="bg-gradient-to-r from-brand via-emerald-300 to-sky-400 bg-clip-text text-transparent">
              effortless
            </span>
          </h1>

          <p className="mt-6 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
            MeetFlow keeps your availability, time zones, and Google Calendar in
            sync — so you can share one link and let anyone book the perfect
            time. Free forever.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href={siteConfig.signInUrl}
              className={cn(
                buttonVariants({ variant: "brand" }),
                "group h-12 px-6 text-base shadow-lg shadow-brand/25 hover:shadow-brand/40"
              )}
            >
              Start for free
              <ArrowRight className="transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href={siteConfig.demoUrl}
              className={cn(
                buttonVariants({ variant: "outline" }),
                "h-12 border-white/15 px-6 text-base hover:bg-white/5"
              )}
            >
              Book a demo
            </Link>
          </div>

          <ul className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2">
            {trustPoints.map((point) => (
              <li
                key={point}
                className="flex items-center gap-1.5 text-sm text-muted-foreground"
              >
                <Check className="size-4 text-brand" />
                {point}
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.div
          style={{ y: prefersReducedMotion ? 0 : mockupY }}
          className="relative"
        >
          <motion.div
            initial={{ opacity: 0, y: 48, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 1, ease: EASE, delay: 0.15 }}
          >
            <motion.div
              animate={prefersReducedMotion ? undefined : { y: [0, -10, 0] }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <CalendarMockup className="mx-auto w-full max-w-[26rem] sm:max-w-[30rem]" />
            </motion.div>

            <motion.div
              animate={prefersReducedMotion ? undefined : { y: [0, -8, 0] }}
              transition={{
                duration: 5.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.6,
              }}
              className="absolute -right-2 top-8 hidden rounded-2xl border border-white/10 bg-background/80 p-3.5 shadow-2xl shadow-black/40 backdrop-blur-xl sm:block"
            >
              <div className="flex items-center gap-2.5">
                <span className="flex size-8 items-center justify-center rounded-full bg-brand/15 text-brand">
                  <Check className="size-4" />
                </span>
                <div>
                  <p className="text-xs font-semibold text-foreground">
                    Booking confirmed
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    Wed · 10:00 AM
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              animate={prefersReducedMotion ? undefined : { y: [0, 8, 0] }}
              transition={{
                duration: 6.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1.1,
              }}
              className="absolute -left-4 bottom-12 hidden items-center gap-2.5 rounded-2xl border border-white/10 bg-background/80 p-3.5 shadow-2xl shadow-black/40 backdrop-blur-xl sm:flex"
            >
              <span className="relative flex size-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand opacity-60" />
                <span className="relative inline-flex size-2 rounded-full bg-brand" />
              </span>
              <div>
                <p className="text-xs font-semibold text-foreground">
                  Google Calendar synced
                </p>
                <p className="text-[10px] text-muted-foreground">Just now</p>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
