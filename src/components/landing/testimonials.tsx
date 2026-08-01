"use client";

import { Star } from "lucide-react";

import { SectionHeading, Stagger, StaggerItem } from "@/components/landing/motion";
import { cn } from "@/lib/utils";

type Testimonial = {
  quote: string;
  name: string;
  role: string;
  initials: string;
  color: string;
};

const testimonials: Testimonial[] = [
  {
    quote:
      "MeetFlow replaced three tools for our team. We stopped juggling calendars overnight.",
    name: "Sarah Chen",
    role: "Head of Operations · Northwind",
    initials: "SC",
    color: "from-brand to-emerald-400",
  },
  {
    quote:
      "The booking links look like they belong to our brand. Guests always mention them.",
    name: "Marcus Webb",
    role: "Founder · Quantica",
    initials: "MW",
    color: "from-sky-400 to-indigo-500",
  },
  {
    quote:
      "I get a full day back every week. Availability just works with my Google Calendar.",
    name: "Priya Sharma",
    role: "Independent Consultant",
    initials: "PS",
    color: "from-amber-400 to-orange-500",
  },
  {
    quote:
      "Round-robin scheduling for our sales team took five minutes to set up.",
    name: "Diego Martinez",
    role: "Sales Lead · Acme Corp",
    initials: "DM",
    color: "from-violet-400 to-fuchsia-500",
  },
  {
    quote:
      "The cleanest scheduling experience our customers have used. Zero friction.",
    name: "Aisha Rahman",
    role: "Product Lead · Hexlab",
    initials: "AR",
    color: "from-rose-400 to-pink-500",
  },
  {
    quote:
      "The analytics helped us find our busiest hours and optimize everything. And it's free.",
    name: "Tom Okafor",
    role: "Growth · Globex",
    initials: "TO",
    color: "from-teal-400 to-cyan-500",
  },
];

function Stars() {
  return (
    <div className="flex items-center gap-1" aria-label="5 out of 5 stars">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className="size-4 fill-amber-400 text-amber-400" />
      ))}
    </div>
  );
}

export function Testimonials() {
  return (
    <section id="testimonials" className="relative scroll-mt-24 py-24 sm:py-32">
      <div className="mx-auto w-full max-w-7xl px-6 lg:px-8">
        <SectionHeading
          eyebrow="Testimonials"
          title="Loved by teams who value their time"
          description="Thousands of founders, consultants, and sales teams schedule better with MeetFlow."
        />

        <Stagger className="mt-16 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial) => (
            <StaggerItem key={testimonial.name}>
              <figure className="flex h-full flex-col justify-between rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition-colors duration-300 hover:border-brand/25 hover:bg-white/[0.05]">
                <div>
                  <Stars />
                  <blockquote className="mt-4 text-sm leading-relaxed text-muted-foreground">
                    &ldquo;{testimonial.quote}&rdquo;
                  </blockquote>
                </div>
                <figcaption className="mt-6 flex items-center gap-3">
                  <span
                    className={cn(
                      "flex size-10 items-center justify-center rounded-full bg-gradient-to-br text-xs font-bold text-background",
                      testimonial.color
                    )}
                  >
                    {testimonial.initials}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {testimonial.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {testimonial.role}
                    </p>
                  </div>
                </figcaption>
              </figure>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
