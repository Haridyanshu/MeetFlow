export interface ExistingBooking {
  startTime: Date
  endTime: Date
}

export interface Slot {
  startTime: Date
  endTime: Date
}

export interface SlotRange {
  start: Date
  end: Date
}

export interface GenerateSlotsParams {
  ranges: SlotRange[]
  duration: number
  step?: number
  existingBookings: ExistingBooking[]
  bufferBefore: number
  bufferAfter: number
  now: Date
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
    ranges,
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

  for (const range of ranges) {
    const rangeStartMs = range.start.getTime()
    const rangeEndMs = range.end.getTime()

    let cursorMs = rangeStartMs

    while (cursorMs + durationMs <= rangeEndMs) {
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
