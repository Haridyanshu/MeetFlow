"use client"

import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Area,
  AreaChart,
  Legend,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface BookingsOverTime {
  date: string
  created: number
  cancelled: number
  booked: number
}

interface StatusDist {
  name: string
  value: number
}

interface EventTypePop {
  title: string
  bookings: number
}

const BRAND = "#10B981"
const RED = "#ef4444"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ChartTooltip({ active, payload, label, formatter }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-md text-sm">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      {payload.map((entry: any, idx: number) => (
        <div key={idx} className="flex items-center gap-2 text-xs">
          <span className="size-2 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-muted-foreground">{entry.name}:</span>
          <span className="font-medium tabular-nums text-foreground">
            {formatter ? formatter(entry.value) : entry.value}
          </span>
        </div>
      ))}
    </div>
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomPieLabel({ cx, cy, midAngle, outerRadius, percent }: any) {
  const RADIAN = Math.PI / 180
  const radius = outerRadius + 24
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)

  if (percent < 0.05) return null

  return (
    <text
      x={x}
      y={y}
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
      className="fill-muted-foreground text-[11px]"
    >
      {(percent * 100).toFixed(0)}%
    </text>
  )
}

export function BookingsOverTimeChart({ data }: { data: BookingsOverTime[] }) {
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Bookings over time</CardTitle>
        </CardHeader>
        <CardContent className="flex h-[320px] items-center justify-center text-sm text-muted-foreground">
          No booking data for this period.
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Bookings over time</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="bookedGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={BRAND} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={BRAND} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted/50" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11 }}
                tickFormatter={(v: string) => v.slice(5)}
                className="text-muted-foreground"
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 11 }}
                className="text-muted-foreground"
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<ChartTooltip />} />
              <Area
                type="monotone"
                dataKey="booked"
                stroke={BRAND}
                fill="url(#bookedGrad)"
                name="Booked"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="cancelled"
                stroke={RED}
                name="Cancelled"
                strokeWidth={1.5}
                dot={false}
                strokeDasharray="4 3"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

export function StatusDistributionChart({ data }: { data: StatusDist[] }) {
  const COLORS = [BRAND, RED]

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Booking status</CardTitle>
        </CardHeader>
        <CardContent className="flex h-[320px] items-center justify-center text-sm text-muted-foreground">
          No data for this period.
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Booking status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="45%"
                innerRadius={60}
                outerRadius={100}
                label={<CustomPieLabel />}
                strokeWidth={0}
              >
                {data.map((_, idx) => (
                  <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<ChartTooltip />} />
              <Legend
                verticalAlign="bottom"
                iconType="circle"
                iconSize={8}
                formatter={(value: string) => (
                  <span className="text-xs text-muted-foreground">{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

export function EventTypePopularityChart({ data }: { data: EventTypePop[] }) {
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Event type popularity</CardTitle>
        </CardHeader>
        <CardContent className="flex h-[320px] items-center justify-center text-sm text-muted-foreground">
          No event types with bookings in this period.
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Event type popularity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted/50" horizontal={false} />
              <XAxis
                type="number"
                allowDecimals={false}
                tick={{ fontSize: 11 }}
                className="text-muted-foreground"
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="title"
                width={150}
                tick={{ fontSize: 11 }}
                className="text-muted-foreground"
                axisLine={false}
                tickLine={false}
              />
      <Tooltip content={<ChartTooltip />} />
      <Bar dataKey="bookings" fill={BRAND} radius={[0, 4, 4, 0]} maxBarSize={20} />
    </BarChart>
  </ResponsiveContainer>
</div>
</CardContent>
</Card>
)
}
