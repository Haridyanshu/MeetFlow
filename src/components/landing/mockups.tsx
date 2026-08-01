import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

function MockFrame({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      aria-hidden
      className={cn(
        "relative overflow-hidden rounded-2xl border border-white/10 bg-[#0d0d12]/95 shadow-[0_30px_80px_-24px_rgba(16,185,129,0.18)]",
        className
      )}
    >
      <div className="flex items-center gap-1.5 border-b border-white/5 px-4 py-3">
        <span className="size-2.5 rounded-full bg-white/10" />
        <span className="size-2.5 rounded-full bg-white/10" />
        <span className="size-2.5 rounded-full bg-white/10" />
        <span className="ml-3 h-1.5 w-28 rounded-full bg-white/10" />
      </div>
      {children}
    </div>
  );
}

function Bar({
  className,
  delay = 0,
  height,
}: {
  className?: string;
  delay?: number;
  height: string;
}) {
  return (
    <span
      className={cn(
        "block origin-bottom animate-[grow-bar_0.9s_cubic-bezier(0.22,1,0.36,1)_both] rounded-full",
        className
      )}
      style={{ animationDelay: `${delay}ms`, height }}
    />
  );
}

export function CalendarMockup({ className }: { className?: string }) {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri"];
  const slots = [
    { time: "09:00", taken: true },
    { time: "09:30", taken: false },
    { time: "10:00", taken: false },
    { time: "10:30", taken: true },
    { time: "11:00", taken: false },
    { time: "11:30", taken: false },
    { time: "13:00", taken: false },
    { time: "13:30", taken: false },
  ];

  return (
    <MockFrame className={className}>
      <div className="grid grid-cols-[1fr_1.35fr]">
        <div className="border-r border-white/5 p-4">
          <div className="flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-full bg-gradient-to-br from-brand to-emerald-400 text-[10px] font-bold text-background">
              M
            </span>
            <div>
              <p className="text-[11px] font-medium leading-tight text-foreground">
                30 min call
              </p>
              <p className="text-[9px] text-muted-foreground">Google Meet</p>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            {days.map((day) => (
              <div
                key={day}
                className={cn(
                  "rounded-lg px-2.5 py-1.5 text-[9px] font-medium",
                  day === "Wed"
                    ? "bg-brand/15 text-brand ring-1 ring-brand/30"
                    : "text-muted-foreground"
                )}
              >
                {day}
              </div>
            ))}
          </div>
        </div>
        <div className="p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-[10px] font-semibold text-foreground">
              Wednesday, 24 Aug
            </p>
            <span className="rounded-md bg-brand/10 px-1.5 py-0.5 text-[8px] font-medium uppercase tracking-wider text-brand">
              Selected
            </span>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {slots.map((slot) => (
              <div
                key={slot.time}
                className={cn(
                  "rounded-lg border px-2 py-1.5 text-center text-[9px] font-medium",
                  slot.taken
                    ? "border-transparent bg-white/5 text-muted-foreground/50 line-through"
                    : slot.time === "10:00"
                      ? "border-brand/60 bg-brand text-background shadow-lg shadow-brand/30"
                      : "border-white/10 bg-white/[0.03] text-foreground"
                )}
              >
                {slot.time}
              </div>
            ))}
          </div>
          <div className="mt-3 rounded-lg bg-white/[0.04] px-2.5 py-2 text-[9px] leading-relaxed text-muted-foreground">
            <span className="font-semibold text-foreground">Q&A call</span>{" "}
            with Maya · 30 min
          </div>
        </div>
      </div>
    </MockFrame>
  );
}

export function DashboardMockup({ className }: { className?: string }) {
  const nav = ["Overview", "Event Types", "Bookings", "Availability", "Analytics"];
  const stats = [
    { label: "Today's bookings", value: "12", delta: "+20%" },
    { label: "Upcoming week", value: "48", delta: "+8%" },
    { label: "Conversion rate", value: "68%", delta: "+5%" },
  ];

  return (
    <MockFrame className={className}>
      <div className="grid grid-cols-[120px_1fr]">
        <div className="border-r border-white/5 p-3">
          <div className="mb-4 flex items-center gap-1.5 px-1">
            <span className="size-4 rounded bg-gradient-to-br from-brand to-emerald-400" />
            <span className="h-1.5 w-8 rounded-full bg-white/15" />
          </div>
          <div className="space-y-1">
            {nav.map((item) => (
              <div
                key={item}
                className={cn(
                  "rounded-md px-2 py-1.5 text-[8px] font-medium",
                  item === "Overview"
                    ? "bg-brand/15 text-brand"
                    : "text-muted-foreground"
                )}
              >
                {item}
              </div>
            ))}
          </div>
        </div>
        <div className="p-4">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <div className="h-2 w-28 rounded-full bg-white/15" />
              <div className="mt-1.5 h-1.5 w-16 rounded-full bg-white/10" />
            </div>
            <span className="rounded-md bg-brand px-2 py-1 text-[8px] font-semibold text-background">
              + New event
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-lg border border-white/5 bg-white/[0.03] p-2.5"
              >
                <p className="text-[8px] text-muted-foreground">{stat.label}</p>
                <div className="mt-1 flex items-baseline gap-1.5">
                  <span className="text-sm font-semibold text-foreground">
                    {stat.value}
                  </span>
                  <span className="text-[8px] font-medium text-brand">
                    {stat.delta}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 flex h-24 items-end gap-1.5 rounded-lg border border-white/5 bg-white/[0.03] p-3 pb-2">
            {[35, 55, 42, 70, 58, 85, 66, 92, 74, 60, 82, 96].map(
              (h, i) => (
                <Bar
                  key={i}
                  className={cn(
                    "w-full",
                    i >= 9
                      ? "bg-gradient-to-t from-brand/50 to-brand"
                      : "bg-white/10"
                  )}
                  height={`${h}%`}
                  delay={200 + i * 60}
                />
              )
            )}
          </div>
        </div>
      </div>
    </MockFrame>
  );
}

export function BookingPageMockup({ className }: { className?: string }) {
  const days = ["19", "20", "21", "22", "23", "24", "25"];
  const slots = ["09:00", "10:00", "11:00", "13:00", "14:00", "16:00"];

  return (
    <MockFrame className={className}>
      <div className="p-5">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-full bg-gradient-to-br from-brand to-emerald-400 text-xs font-bold text-background">
            M
          </span>
          <div>
            <p className="text-[11px] font-semibold text-foreground">
              Maya Patel
            </p>
            <p className="text-[9px] text-muted-foreground">
              Product Demo · 30 min
            </p>
          </div>
        </div>
        <div className="mt-4">
          <p className="mb-2 text-[10px] font-semibold text-foreground">
            Select a date
          </p>
          <div className="flex gap-1.5">
            {days.map((day, i) => (
              <div
                key={day}
                className={cn(
                  "flex h-12 flex-1 flex-col items-center justify-center rounded-lg border text-[8px]",
                  i === 3
                    ? "border-brand/60 bg-brand text-background"
                    : "border-white/10 bg-white/[0.03] text-muted-foreground"
                )}
              >
                <span className="opacity-70">Aug</span>
                <span className="text-[11px] font-semibold">{day}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-4">
          <p className="mb-2 text-[10px] font-semibold text-foreground">
            Available times
          </p>
          <div className="grid grid-cols-3 gap-1.5">
            {slots.map((slot, i) => (
              <div
                key={slot}
                className={cn(
                  "rounded-lg border px-2 py-1.5 text-center text-[9px] font-medium",
                  i === 2
                    ? "border-brand/60 bg-brand text-background"
                    : "border-white/10 bg-white/[0.03] text-foreground"
                )}
              >
                {slot}
              </div>
            ))}
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between rounded-lg bg-white/[0.04] px-3 py-2.5">
          <div className="text-[9px] text-muted-foreground">
            <p className="font-semibold text-foreground">Wed, 24 Aug</p>
            <p>11:00 – 11:30 AM</p>
          </div>
          <span className="rounded-md bg-brand px-2.5 py-1.5 text-[9px] font-semibold text-background">
            Confirm
          </span>
        </div>
      </div>
    </MockFrame>
  );
}

export function AvailabilityMockup({ className }: { className?: string }) {
  const days = [
    { name: "Mon", active: true, hours: "9:00 – 17:00" },
    { name: "Tue", active: true, hours: "9:00 – 17:00" },
    { name: "Wed", active: true, hours: "9:00 – 13:00" },
    { name: "Thu", active: true, hours: "9:00 – 17:00" },
    { name: "Fri", active: true, hours: "9:00 – 15:00" },
    { name: "Sat", active: false, hours: "Off" },
    { name: "Sun", active: false, hours: "Off" },
  ];

  return (
    <MockFrame className={className}>
      <div className="grid grid-cols-[1.4fr_1fr]">
        <div className="p-4">
          <p className="mb-3 text-[10px] font-semibold text-foreground">
            Weekly availability
          </p>
          <div className="space-y-1.5">
            {days.map((day) => (
              <div
                key={day.name}
                className={cn(
                  "flex items-center justify-between rounded-lg border px-2.5 py-2",
                  day.active
                    ? "border-white/10 bg-white/[0.03]"
                    : "border-white/5 bg-transparent opacity-50"
                )}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "flex size-3.5 items-center justify-center rounded-[4px]",
                      day.active ? "bg-brand" : "border border-white/15"
                    )}
                  >
                    {day.active && (
                      <svg
                        viewBox="0 0 12 12"
                        className="size-2.5 text-background"
                        fill="none"
                      >
                        <path
                          d="M2.5 6.5 5 9l4.5-6"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </span>
                  <span className="text-[9px] font-medium text-foreground">
                    {day.name}
                  </span>
                </div>
                <span className="text-[8px] text-muted-foreground">
                  {day.hours}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="border-l border-white/5 bg-white/[0.02] p-4">
          <p className="mb-3 text-[10px] font-semibold text-foreground">
            Buffer &amp; limits
          </p>
          <div className="space-y-2.5">
            <div>
              <div className="mb-1 flex justify-between text-[8px] text-muted-foreground">
                <span>Buffer before/after</span>
                <span className="text-foreground">15 min</span>
              </div>
              <div className="h-1.5 rounded-full bg-white/10">
                <div className="h-full w-1/3 rounded-full bg-brand/60" />
              </div>
            </div>
            <div>
              <div className="mb-1 flex justify-between text-[8px] text-muted-foreground">
                <span>Daily booking limit</span>
                <span className="text-foreground">4</span>
              </div>
              <div className="h-1.5 rounded-full bg-white/10">
                <div className="h-full w-2/5 rounded-full bg-brand/60" />
              </div>
            </div>
          </div>
          <div className="mt-4 rounded-lg border border-white/10 bg-white/[0.03] p-2.5">
            <p className="text-[8px] font-semibold text-foreground">
              Time zone
            </p>
            <p className="mt-0.5 text-[8px] text-muted-foreground">
              Asia/Kolkata · automatic
            </p>
          </div>
        </div>
      </div>
    </MockFrame>
  );
}

export function TeamsMockup({ className }: { className?: string }) {
  const members = [
    { name: "Maya Patel", role: "Owner", color: "from-brand to-emerald-400", online: true },
    { name: "Jordan Lee", role: "Member", color: "from-indigo-400 to-violet-500", online: true },
    { name: "Alex Rivera", role: "Member", color: "from-amber-400 to-orange-500", online: false },
    { name: "Sam Cooper", role: "Admin", color: "from-sky-400 to-cyan-500", online: true },
  ];

  return (
    <MockFrame className={className}>
      <div className="p-4">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-semibold text-foreground">
              Growth team
            </p>
            <p className="text-[8px] text-muted-foreground">4 members</p>
          </div>
          <span className="rounded-md bg-brand/15 px-2 py-1 text-[8px] font-semibold text-brand ring-1 ring-brand/25">
            + Add member
          </span>
        </div>
        <div className="space-y-1.5">
          {members.map((member) => (
            <div
              key={member.name}
              className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.03] px-2.5 py-2"
            >
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "relative flex size-7 items-center justify-center rounded-full bg-gradient-to-br text-[8px] font-bold text-background",
                    member.color
                  )}
                >
                  {member.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                  <span
                    className={cn(
                      "absolute -bottom-0.5 -right-0.5 size-2 rounded-full ring-2 ring-[#0d0d12]",
                      member.online ? "bg-brand" : "bg-white/25"
                    )}
                  />
                </span>
                <span className="text-[9px] font-medium text-foreground">
                  {member.name}
                </span>
              </div>
              <span
                className={cn(
                  "rounded px-1.5 py-0.5 text-[7px] font-semibold uppercase tracking-wide",
                  member.role === "Owner"
                    ? "bg-brand/15 text-brand"
                    : "bg-white/5 text-muted-foreground"
                )}
              >
                {member.role}
              </span>
            </div>
          ))}
        </div>
      </div>
    </MockFrame>
  );
}

export function AnalyticsMockup({ className }: { className?: string }) {
  const kpis = [
    { label: "Total bookings", value: "1,248", delta: "+12.4%" },
    { label: "No-shows", value: "3.1%", delta: "-1.2%" },
    { label: "Busiest day", value: "Tuesday", delta: "" },
  ];

  return (
    <MockFrame className={className}>
      <div className="p-4">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-[10px] font-semibold text-foreground">
            Bookings overview
          </p>
          <span className="rounded-md bg-white/5 px-2 py-1 text-[8px] text-muted-foreground">
            Last 30 days
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {kpis.map((kpi) => (
            <div
              key={kpi.label}
              className="rounded-lg border border-white/5 bg-white/[0.03] p-2.5"
            >
              <p className="text-[8px] text-muted-foreground">{kpi.label}</p>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span className="text-[13px] font-semibold text-foreground">
                  {kpi.value}
                </span>
                {kpi.delta && (
                  <span
                    className={cn(
                      "text-[8px] font-medium",
                      kpi.delta.startsWith("-") ? "text-rose-400" : "text-brand"
                    )}
                  >
                    {kpi.delta}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3 flex h-24 items-end gap-1.5 rounded-lg border border-white/5 bg-white/[0.03] p-3 pb-2">
          {[28, 44, 36, 60, 52, 74, 64, 88, 58, 70, 92, 78].map((h, i) => (
            <Bar
              key={i}
              className={cn(
                "w-full",
                i === 10
                  ? "bg-gradient-to-t from-brand/40 to-brand"
                  : "bg-white/10"
              )}
              height={`${h}%`}
              delay={150 + i * 55}
            />
          ))}
        </div>
        <div className="mt-3 space-y-1.5">
          {[
            { text: "Discovery call booked", time: "2m ago", color: "bg-brand" },
            { text: "Weekly sync rescheduled", time: "18m ago", color: "bg-sky-400" },
            { text: "Onboarding booked", time: "1h ago", color: "bg-amber-400" },
          ].map((event) => (
            <div
              key={event.text}
              className="flex items-center gap-2 rounded-lg bg-white/[0.03] px-2.5 py-1.5"
            >
              <span className={cn("size-1.5 rounded-full", event.color)} />
              <span className="flex-1 truncate text-[8px] text-foreground">
                {event.text}
              </span>
              <span className="text-[7px] text-muted-foreground">
                {event.time}
              </span>
            </div>
          ))}
        </div>
      </div>
    </MockFrame>
  );
}
