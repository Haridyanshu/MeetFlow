"use client"

import {
  LineChart,
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

interface RevenueOverTime {
  date: string
  amount: number
}

const COLORS = ["#22c55e", "#ef4444", "#3b82f6", "#f59e0b", "#8b5cf6"]

export function BookingsOverTimeChart({ data }: { data: BookingsOverTime[] }) {
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Bookings over time</CardTitle>
        </CardHeader>
        <CardContent className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
          No booking data for this period.
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bookings over time</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11 }}
                tickFormatter={(v: string) => v.slice(5)}
                className="text-muted-foreground"
              />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} className="text-muted-foreground" />
              <Tooltip />
              <Line type="monotone" dataKey="booked" stroke="#22c55e" name="Booked" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="cancelled" stroke="#ef4444" name="Cancelled" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

export function StatusDistributionChart({ data }: { data: StatusDist[] }) {
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Booking status</CardTitle>
        </CardHeader>
        <CardContent className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
          No data for this period.
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Booking status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={(entry: { name?: string; percent?: number }) => `${entry.name ?? ""} ${((entry.percent ?? 0) * 100).toFixed(0)}%`}
              >
                {data.map((_, idx) => (
                  <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
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
        <CardContent className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
          No event types with bookings in this period.
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Event type popularity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} className="text-muted-foreground" />
              <YAxis
                type="category"
                dataKey="title"
                width={140}
                tick={{ fontSize: 11 }}
                className="text-muted-foreground"
              />
              <Tooltip />
              <Bar dataKey="bookings" fill="#3b82f6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

export function RevenueOverTimeChart({ data }: { data: RevenueOverTime[] }) {
  if (data.length === 0 || data.every((d) => d.amount === 0)) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Revenue over time</CardTitle>
        </CardHeader>
        <CardContent className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
          No revenue data for this period.
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue over time</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11 }}
                tickFormatter={(v: string) => v.slice(5)}
                className="text-muted-foreground"
              />
              <YAxis
                tick={{ fontSize: 11 }}
                className="text-muted-foreground"
                tickFormatter={(v) => `$${(Number(v) / 100).toFixed(0)}`}
              />
              <Tooltip formatter={(value) => [`$${(Number(value) / 100).toFixed(2)}`, "Revenue"]} />
              <Line type="monotone" dataKey="amount" stroke="#f59e0b" name="Revenue" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
