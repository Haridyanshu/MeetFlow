"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { GithubIcon } from "@/components/landing/icons";
import { FadeIn } from "@/components/landing/motion";
import { siteConfig } from "@/components/landing/site";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Cta() {
  return (
    <section className="relative py-24 sm:py-32">
      <div className="mx-auto w-full max-w-7xl px-6 lg:px-8">
        <FadeIn>
          <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-brand/20 via-background to-indigo-500/10 px-8 py-20 text-center sm:px-16 sm:py-24">
            <motion.div
              aria-hidden
              animate={{ opacity: [0.5, 0.9, 0.5], scale: [1, 1.08, 1] }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
              className="pointer-events-none absolute -top-32 left-1/2 h-80 w-[36rem] -translate-x-1/2 rounded-full bg-brand/25 blur-[120px]"
            />
            <div
              aria-hidden
              className="bg-landing-grid absolute inset-0 [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,black_30%,transparent_75%)]"
            />

            <div className="relative">
              <h2 className="mx-auto max-w-2xl text-balance text-3xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl">
                Stop losing time to scheduling
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
                Join thousands of teams that book meetings in seconds. Set up
                your first booking link today — it takes two minutes.
              </p>
              <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link
                  href={siteConfig.signInUrl}
                  className={cn(
                    buttonVariants({ variant: "brand" }),
                    "group h-12 w-full px-7 text-base shadow-lg shadow-brand/25 hover:shadow-brand/40 sm:w-auto"
                  )}
                >
                  Start free
                  <ArrowRight className="transition-transform group-hover:translate-x-0.5" />
                </Link>
                <Link
                  href={siteConfig.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    buttonVariants({ variant: "outline" }),
                    "h-12 w-full border-white/15 px-7 text-base hover:bg-white/5 sm:w-auto"
                  )}
                >
                  <GithubIcon className="size-5" />
                  GitHub
                </Link>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
