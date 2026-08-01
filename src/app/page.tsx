import type { Metadata } from "next";
import { MotionConfig } from "framer-motion";

import { Comparison } from "@/components/landing/comparison";
import { Cta } from "@/components/landing/cta";
import { Faq } from "@/components/landing/faq";
import { Features } from "@/components/landing/features";
import { Footer } from "@/components/landing/footer";
import { Hero } from "@/components/landing/hero";
import { Pricing } from "@/components/landing/pricing";
import { Showcase } from "@/components/landing/showcase";
import { SiteHeader } from "@/components/landing/site-header";
import { Testimonials } from "@/components/landing/testimonials";
import { Timeline } from "@/components/landing/timeline";
import { TrustedBy } from "@/components/landing/trusted-by";
import { siteConfig } from "@/components/landing/site";

export const metadata: Metadata = {
  title: "MeetFlow — Scheduling that feels effortless",
  description:
    "MeetFlow keeps your availability, time zones, and Google Calendar in sync. Share one link, let anyone book the perfect time. Free forever.",
  openGraph: {
    title: "MeetFlow — Scheduling that feels effortless",
    description:
      "Effortless scheduling for modern teams. Booking links, Google Calendar sync, team scheduling, and analytics — free forever.",
    url: siteConfig.url,
    siteName: siteConfig.name,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MeetFlow — Scheduling that feels effortless",
    description:
      "Effortless scheduling for modern teams. Free forever.",
  },
};

export default function Home() {
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-background focus:px-4 focus:py-2 focus:text-sm focus:ring-2 focus:ring-brand"
      >
        Skip to content
      </a>
      <MotionConfig reducedMotion="user">
        <SiteHeader />
        <main id="main">
          <Hero />
          <TrustedBy />
          <Features />
          <Showcase />
          <Timeline />
          <Comparison />
          <Testimonials />
          <Pricing />
          <Faq />
          <Cta />
        </main>
        <Footer />
      </MotionConfig>
    </>
  );
}
