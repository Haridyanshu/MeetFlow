import { prisma } from "@/lib/prisma"
import { addDaysInZone, endOfDayInZone, startOfDayInZone, startOfWeekInZone } from "@/lib/date"

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
  timeZone: string,
  now: Date = new Date(),
): BookingRuleCheck {
  if (maximumAdvanceDays <= 0) return { ok: true }
  const lastAllowedEnd = endOfDayInZone(addDaysInZone(now, timeZone, maximumAdvanceDays), timeZone)
  const startOfDay = startOfDayInZone(date, timeZone)
  if (startOfDay > lastAllowedEnd) {
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
  timeZone: string,
): Promise<BookingRuleCheck> {
  if (maximumBookingsPerDay <= 0) return { ok: true }
  const dayStart = startOfDayInZone(date, timeZone)
  const dayEnd = endOfDayInZone(date, timeZone)
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
  timeZone: string,
): Promise<BookingRuleCheck> {
  if (maximumBookingsPerWeek <= 0) return { ok: true }
  const weekStart = startOfWeekInZone(date, timeZone)
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
  timeZone: string,
  now: Date = new Date(),
): Promise<BookingRuleCheck | null> {
  const windowCheck = checkBookingWindow(startTime, eventType.maximumAdvanceDays, timeZone, now)
  if (!windowCheck.ok) return windowCheck
  const noticeCheck = checkMinimumNotice(startTime, eventType.minimumNotice, now)
  if (!noticeCheck.ok) return noticeCheck
  const dailyCheck = await checkDailyLimit(eventType.id, startTime, eventType.maximumBookingsPerDay, timeZone)
  if (!dailyCheck.ok) return dailyCheck
  const weeklyCheck = await checkWeeklyLimit(eventType.id, startTime, eventType.maximumBookingsPerWeek, timeZone)
  if (!weeklyCheck.ok) return weeklyCheck
  return null
}
