"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

import { SectionHeading, Stagger, StaggerItem } from "@/components/landing/motion";
import { cn } from "@/lib/utils";

const faqs = [
  {
    question: "Is MeetFlow really free forever?",
    answer:
      "Yes. Every feature — unlimited bookings, booking links, Google Calendar sync, team scheduling, and analytics — is included in the Free Forever plan. There are no trials that expire and no surprise invoices.",
  },
  {
    question: "How does Google Calendar sync work?",
    answer:
      "MeetFlow connects to your Google Calendar and syncs two-way. Your real availability is always accurate, and every booking is written straight back to your calendar so you never double-book.",
  },
  {
    question: "Can I use my own domain?",
    answer:
      "Absolutely. Custom booking pages and short branded links are included, so your guests always see your brand — not ours.",
  },
  {
    question: "Do you support multiple time zones?",
    answer:
      "Yes. MeetFlow automatically detects your guests' time zones and only shows real free time, so nobody has to do mental math before booking.",
  },
  {
    question: "Can my whole team use MeetFlow?",
    answer:
      "Of course. Invite teammates, create team event types, and route meetings with round-robin or collective scheduling — all from a single booking link.",
  },
  {
    question: "How do I get started?",
    answer:
      "Create a free account with Google or GitHub, connect your calendar, and share your booking link. You'll be booked in under two minutes — no credit card required.",
  },
];

function FaqItem({
  faq,
  index,
  open,
  onToggle,
}: {
  faq: (typeof faqs)[number];
  index: number;
  open: boolean;
  onToggle: () => void;
}) {
  const panelId = `faq-panel-${index}`;
  const buttonId = `faq-button-${index}`;

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] transition-colors hover:border-white/15">
      <h3>
        <button
          id={buttonId}
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={onToggle}
          className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
        >
          <span className="text-base font-semibold text-foreground">
            {faq.question}
          </span>
          <span
            className={cn(
              "flex size-8 shrink-0 items-center justify-center rounded-full border border-white/10 text-muted-foreground transition-transform duration-300",
              open && "rotate-180 border-brand/30 text-brand"
            )}
          >
            <ChevronDown className="size-4" />
          </span>
        </button>
      </h3>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={panelId}
            role="region"
            aria-labelledby={buttonId}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <p className="px-6 pb-5 text-sm leading-relaxed text-muted-foreground">
              {faq.answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="relative scroll-mt-24 py-24 sm:py-32">
      <div className="mx-auto w-full max-w-3xl px-6 lg:px-8">
        <SectionHeading
          eyebrow="FAQ"
          title="Questions, answered"
          description="Everything you need to know before you start. Can't find an answer? Reach out any time."
        />

        <Stagger className="mt-14 flex flex-col gap-3">
          {faqs.map((faq, index) => (
            <StaggerItem key={faq.question}>
              <FaqItem
                faq={faq}
                index={index}
                open={openIndex === index}
                onToggle={() => setOpenIndex(openIndex === index ? null : index)}
              />
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
