export interface TimeInterval {
  start: string
  end: string
}

export interface ExistingBooking {
  startTime: Date
  endTime: Date
}

export interface Slot {
  startTime: Date
  endTime: Date
}

export interface GenerateSlotsParams {
  date: Date
  intervals: TimeInterval[]
  duration: number
  step?: number
  existingBookings: ExistingBooking[]
  bufferBefore: number
  bufferAfter: number
  now: Date
}

function timeStringToDate(date: Date, time: string): Date {
  const [hours, minutes] = time.split(":").map(Number)
  return new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
      hours,
      minutes,
      0,
      0
    )
  )
}

function intervalsOverlap(
  aStart: Date,
  aEnd: Date,
  bStart: Date,
  bEnd: Date
): boolean {
  return aStart < bEnd && aEnd > bStart
}

export function generateSlots(params: GenerateSlotsParams): Slot[] {
  const {
    date,
    intervals,
    duration,
    step = 15,
    existingBookings,
    bufferBefore,
    bufferAfter,
    now,
  } = params

  const durationMs = duration * 60 * 1000
  const stepMs = step * 60 * 1000

  const blocked: ExistingBooking[] = existingBookings.map((booking) => ({
    startTime: new Date(
      booking.startTime.getTime() - bufferBefore * 60 * 1000
    ),
    endTime: new Date(booking.endTime.getTime() + bufferAfter * 60 * 1000),
  }))

  const slots: Slot[] = []

  for (const interval of intervals) {
    const intervalStartMs = timeStringToDate(date, interval.start).getTime()
    const intervalEndMs = timeStringToDate(date, interval.end).getTime()

    let cursorMs = intervalStartMs

    while (cursorMs + durationMs <= intervalEndMs) {
      const slotStart = new Date(cursorMs)
      const slotEnd = new Date(cursorMs + durationMs)

      if (slotEnd <= now) {
        cursorMs += stepMs
        continue
      }

      const hasOverlap = blocked.some((b) =>
        intervalsOverlap(slotStart, slotEnd, b.startTime, b.endTime)
      )

      if (!hasOverlap) {
        slots.push({ startTime: slotStart, endTime: slotEnd })
      }

      cursorMs += stepMs
    }
  }

  return slots
}
