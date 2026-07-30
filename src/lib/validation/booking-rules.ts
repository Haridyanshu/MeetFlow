import { prisma } from "@/lib/prisma"

export type NoSlotsReason =
  | "no_availability"
  | "booking_window"
  | "minimum_notice"
  | "daily_limit"
  | "weekly_limit"

export type BookingRuleCheck =
  | { ok: true }
  | { ok: false; reason: NoSlotsReason; message: string }

export function checkBookingWindow(
  date: Date,
  maximumAdvanceDays: number,
  now: Date = new Date(),
): BookingRuleCheck {
  if (maximumAdvanceDays <= 0) return { ok: true }
  const maxDate = new Date(now)
  maxDate.setDate(maxDate.getDate() + maximumAdvanceDays)
  maxDate.setHours(23, 59, 59, 999)
  const startOfDay = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))
  if (startOfDay > maxDate) {
    return {
      ok: false,
      reason: "booking_window",
      message: "This date is beyond the booking window.",
    }
  }
  return { ok: true }
}

export function checkMinimumNotice(
  startTime: Date,
  minimumNotice: number,
  now: Date = new Date(),
): BookingRuleCheck {
  if (minimumNotice <= 0) return { ok: true }
  const earliestStart = new Date(now.getTime() + minimumNotice * 60 * 1000)
  if (startTime < earliestStart) {
    return {
      ok: false,
      reason: "minimum_notice",
      message: `This time requires at least ${minimumNotice} minutes notice.`,
    }
  }
  return { ok: true }
}

export async function checkDailyLimit(
  eventTypeId: string,
  date: Date,
  maximumBookingsPerDay: number,
): Promise<BookingRuleCheck> {
  if (maximumBookingsPerDay <= 0) return { ok: true }
  const dayStart = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))
  const dayEnd = new Date(dayStart.getTime() + 86400000)
  const count = await prisma.booking.count({
    where: {
      eventTypeId,
      status: "BOOKED",
      startTime: { gte: dayStart, lt: dayEnd },
    },
  })
  if (count >= maximumBookingsPerDay) {
    return {
      ok: false,
      reason: "daily_limit",
      message: `Daily limit of ${maximumBookingsPerDay} booking${maximumBookingsPerDay === 1 ? "" : "s"} reached.`,
    }
  }
  return { ok: true }
}

export async function checkWeeklyLimit(
  eventTypeId: string,
  date: Date,
  maximumBookingsPerWeek: number,
): Promise<BookingRuleCheck> {
  if (maximumBookingsPerWeek <= 0) return { ok: true }
  const dayOfWeek = date.getUTCDay()
  const weekStart = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() - dayOfWeek))
  const weekEnd = new Date(weekStart.getTime() + 7 * 86400000)
  const count = await prisma.booking.count({
    where: {
      eventTypeId,
      status: "BOOKED",
      startTime: { gte: weekStart, lt: weekEnd },
    },
  })
  if (count >= maximumBookingsPerWeek) {
    return {
      ok: false,
      reason: "weekly_limit",
      message: `Weekly limit of ${maximumBookingsPerWeek} booking${maximumBookingsPerWeek === 1 ? "" : "s"} reached.`,
    }
  }
  return { ok: true }
}

export async function validateBookingCreation(
  eventType: { id: string; minimumNotice: number; maximumAdvanceDays: number; maximumBookingsPerDay: number; maximumBookingsPerWeek: number },
  startTime: Date,
  now: Date = new Date(),
): Promise<BookingRuleCheck | null> {
  const windowCheck = checkBookingWindow(startTime, eventType.maximumAdvanceDays, now)
  if (!windowCheck.ok) return windowCheck
  const noticeCheck = checkMinimumNotice(startTime, eventType.minimumNotice, now)
  if (!noticeCheck.ok) return noticeCheck
  const dailyCheck = await checkDailyLimit(eventType.id, startTime, eventType.maximumBookingsPerDay)
  if (!dailyCheck.ok) return dailyCheck
  const weeklyCheck = await checkWeeklyLimit(eventType.id, startTime, eventType.maximumBookingsPerWeek)
  if (!weeklyCheck.ok) return weeklyCheck
  return null
}
