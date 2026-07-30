import { google } from "googleapis"

import { prisma } from "@/lib/prisma"

const SCOPES = ["https://www.googleapis.com/auth/calendar.events"]

async function getGoogleClient(userId: string) {
  const account = await prisma.account.findFirst({
    where: { userId, provider: "google" },
  })

  if (!account?.access_token || !account?.refresh_token) {
    return null
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.AUTH_GOOGLE_ID,
    process.env.AUTH_GOOGLE_SECRET,
  )

  oauth2Client.setCredentials({
    access_token: account.access_token,
    refresh_token: account.refresh_token,
    expiry_date: account.expires_at ? account.expires_at * 1000 : undefined,
    scope: SCOPES.join(" "),
  })

  oauth2Client.on("tokens", async (tokens) => {
    const updateData: Record<string, unknown> = {}
    if (tokens.access_token) updateData.access_token = tokens.access_token
    if (tokens.refresh_token) updateData.refresh_token = tokens.refresh_token
    if (tokens.expiry_date)
      updateData.expires_at = Math.floor(tokens.expiry_date / 1000)

    if (Object.keys(updateData).length > 0) {
      await prisma.account.updateMany({
        where: { userId, provider: "google" },
        data: updateData,
      })
    }
  })

  return oauth2Client
}

function formatFloatingTime(date: Date): string {
  const y = date.getUTCFullYear()
  const mo = String(date.getUTCMonth() + 1).padStart(2, "0")
  const d = String(date.getUTCDate()).padStart(2, "0")
  const h = String(date.getUTCHours()).padStart(2, "0")
  const mi = String(date.getUTCMinutes()).padStart(2, "0")
  const s = String(date.getUTCSeconds()).padStart(2, "0")
  return `${y}-${mo}-${d}T${h}:${mi}:${s}`
}

function buildEvent({
  summary,
  description,
  startTime,
  endTime,
  timezone,
}: {
  summary: string
  description: string
  startTime: Date
  endTime: Date
  timezone: string
}) {
  return {
    summary,
    description,
    start: {
      dateTime: formatFloatingTime(startTime),
      timeZone: timezone,
    },
    end: {
      dateTime: formatFloatingTime(endTime),
      timeZone: timezone,
    },
  }
}

export async function createCalendarEvent({
  userId,
  summary,
  description,
  startTime,
  endTime,
  timezone,
  calendarId = "primary",
}: {
  userId: string
  summary: string
  description: string
  startTime: Date
  endTime: Date
  timezone: string
  calendarId?: string
}) {
  const auth = await getGoogleClient(userId)
  if (!auth) return null

  const calendar = google.calendar({ version: "v3", auth })

  const event = buildEvent({
    summary,
    description,
    startTime,
    endTime,
    timezone,
  })

  const response = await calendar.events.insert({
    calendarId,
    requestBody: event,
  })

  return {
    eventId: response.data.id ?? null,
    calendarId,
  }
}

export async function updateCalendarEvent({
  userId,
  eventId,
  calendarId = "primary",
  summary,
  description,
  startTime,
  endTime,
  timezone,
}: {
  userId: string
  eventId: string
  calendarId?: string
  summary?: string
  description?: string
  startTime?: Date
  endTime?: Date
  timezone?: string
}) {
  const auth = await getGoogleClient(userId)
  if (!auth) return

  const calendar = google.calendar({ version: "v3", auth })

  const requestBody: Record<string, unknown> = {}
  if (summary) requestBody.summary = summary
  if (description) requestBody.description = description
  if (startTime && endTime && timezone) {
    requestBody.start = {
      dateTime: formatFloatingTime(startTime),
      timeZone: timezone,
    }
    requestBody.end = {
      dateTime: formatFloatingTime(endTime),
      timeZone: timezone,
    }
  }

  await calendar.events.update({
    calendarId,
    eventId,
    requestBody,
  })
}

export async function deleteCalendarEvent({
  userId,
  eventId,
  calendarId = "primary",
}: {
  userId: string
  eventId: string
  calendarId?: string
}) {
  const auth = await getGoogleClient(userId)
  if (!auth) return

  const calendar = google.calendar({ version: "v3", auth })

  await calendar.events.delete({
    calendarId,
    eventId,
  })
}

export async function getPrimaryCalendar(userId: string) {
  const auth = await getGoogleClient(userId)
  if (!auth) return null

  const calendar = google.calendar({ version: "v3", auth })

  const response = await calendar.calendars.get({
    calendarId: "primary",
  })

  return {
    id: response.data.id ?? null,
    summary: response.data.summary ?? null,
  }
}
