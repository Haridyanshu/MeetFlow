import { addDays, endOfDay, startOfDay, startOfWeek } from "date-fns"
import {
  formatInTimeZone,
  fromZonedTime,
  toZonedTime,
} from "date-fns-tz"

export const DEFAULT_TIMEZONE = "Asia/Kolkata"

export const COMMON_TIMEZONES = [
  "UTC",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Anchorage",
  "Pacific/Honolulu",
  "Europe/London",
  "Europe/Berlin",
  "Europe/Paris",
  "Europe/Moscow",
  "Asia/Dubai",
  "Asia/Kolkata",
  "Asia/Shanghai",
  "Asia/Tokyo",
  "Asia/Seoul",
  "Australia/Sydney",
  "Pacific/Auckland",
] as const

export function isValidTimeZone(timeZone: string | null | undefined): boolean {
  if (!timeZone) return false
  try {
    new Intl.DateTimeFormat("en-US", { timeZone }).format()
    return true
  } catch {
    return false
  }
}

export function resolveTimeZone(timeZone?: string | null): string {
  return isValidTimeZone(timeZone) ? (timeZone as string) : DEFAULT_TIMEZONE
}

export function detectClientTimeZone(): string {
  if (typeof window === "undefined") return DEFAULT_TIMEZONE
  return resolveTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone)
}

export function toDate(date: Date | string): Date {
  return typeof date === "string" ? new Date(date) : date
}

export function formatZoned(
  date: Date | string,
  timeZone: string,
  formatStr: string,
): string {
  return formatInTimeZone(toDate(date), resolveTimeZone(timeZone), formatStr)
}

export function toZonedDateStr(date: Date, timeZone: string): string {
  return formatZoned(date, timeZone, "yyyy-MM-dd")
}

export function formatDate(date: Date | string, timeZone: string): string {
  return formatZoned(date, timeZone, "EEEE, MMMM d, yyyy")
}

export function formatDateMedium(date: Date | string, timeZone: string): string {
  return formatZoned(date, timeZone, "EEE, MMM d, yyyy")
}

export function formatDateShort(date: Date | string, timeZone: string): string {
  return formatZoned(date, timeZone, "MMM d")
}

export function formatDateTime(date: Date | string, timeZone: string): string {
  return formatZoned(date, timeZone, "EEE, MMM d, yyyy 'at' HH:mm")
}

export function formatTime(date: Date | string, timeZone: string): string {
  return formatZoned(date, timeZone, "HH:mm")
}

export function startOfDayInZone(
  date: Date | string,
  timeZone: string,
): Date {
  const tz = resolveTimeZone(timeZone)
  return fromZonedTime(startOfDay(toZonedTime(toDate(date), tz)), tz)
}

export function endOfDayInZone(date: Date | string, timeZone: string): Date {
  const tz = resolveTimeZone(timeZone)
  return fromZonedTime(endOfDay(toZonedTime(toDate(date), tz)), tz)
}

export function startOfWeekInZone(
  date: Date | string,
  timeZone: string,
): Date {
  const tz = resolveTimeZone(timeZone)
  return fromZonedTime(startOfWeek(toZonedTime(toDate(date), tz)), tz)
}

export function dayRangeInZone(
  dateStr: string,
  timeZone: string,
): { start: Date; end: Date } {
  const tz = resolveTimeZone(timeZone)
  const start = fromZonedTime(`${dateStr}T00:00:00`, tz)
  return { start, end: new Date(start.getTime() + 24 * 60 * 60 * 1000) }
}

export function zonedWallClock(date: Date, timeZone: string): Date {
  return toZonedTime(date, resolveTimeZone(timeZone))
}

export function zonedWeekday(date: Date, timeZone: string): number {
  return toZonedTime(date, resolveTimeZone(timeZone)).getDay()
}

export function zonedHour(date: Date, timeZone: string): number {
  return toZonedTime(date, resolveTimeZone(timeZone)).getHours()
}

export function zonedDateStrToUtc(dateStr: string, timeZone: string): Date {
  return fromZonedTime(`${dateStr}T00:00:00`, resolveTimeZone(timeZone))
}

export function addDaysInZone(
  date: Date | string,
  timeZone: string,
  amount: number,
): Date {
  const tz = resolveTimeZone(timeZone)
  return fromZonedTime(addDays(toZonedTime(toDate(date), tz), amount), tz)
}

export function getPartOfDay(timeZone: string): "morning" | "afternoon" | "evening" {
  const hour = Number(formatZoned(new Date(), timeZone, "H"))
  if (hour < 12) return "morning"
  if (hour < 17) return "afternoon"
  return "evening"
}

export function getTodayLabel(timeZone: string): string {
  return formatZoned(new Date(), timeZone, "EEEE, MMMM d")
}

export function getCurrentTime(timeZone: string): string {
  return formatZoned(new Date(), timeZone, "h:mm a")
}

export function formatRelativeTime(
  date: Date,
  timeZone: string,
  now: Date = new Date(),
): string {
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  if (diffMins < 1) return "Just now"
  if (diffMins < 60) return `${diffMins}m ago`
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours}h ago`
  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 7) return `${diffDays}d ago`
  return formatDateShort(date, timeZone)
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
] as const

export function formatMonthYear(year: number, month: number): string {
  return `${MONTH_NAMES[month]} ${year}`
}

export function formatWeekdayShort(dayOfWeek: number): string {
  const names = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
  return names[dayOfWeek] ?? ""
}
