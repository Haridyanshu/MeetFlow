import { formatInTimeZone } from "date-fns-tz"
import { resolveTimeZone } from "@/lib/date"

function formatDate(date: Date, timeZone: string): string {
  return formatInTimeZone(date, resolveTimeZone(timeZone), "EEEE, MMMM d, yyyy")
}

function formatTime(date: Date, timeZone: string): string {
  return formatInTimeZone(date, resolveTimeZone(timeZone), "HH:mm")
}

function baseHtml(content: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>MeetFlow</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f5f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
  <table role="presentation" style="width:100%;border-collapse:collapse">
    <tr>
      <td align="center" style="padding:40px 16px">
        <table role="presentation" style="max-width:480px;width:100%;border-collapse:collapse;background-color:#ffffff;border-radius:12px;overflow:hidden">
          <tr>
            <td style="padding:32px 32px 0">
              <h1 style="margin:0;font-size:20px;font-weight:600;color:#1a1a2e">MeetFlow</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 32px 32px;line-height:1.6;color:#334155;font-size:15px">
              ${content}
            </td>
          </tr>
          <tr>
            <td style="padding:16px 32px;border-top:1px solid #e2e8f0;font-size:12px;color:#94a3b8;text-align:center">
              <p style="margin:0">Sent via MeetFlow</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

export interface ConfirmationTemplateData {
  eventTitle: string
  hostName: string
  guestName: string
  guestEmail: string
  date: Date
  startTime: Date
  endTime: Date
  timezone: string
  duration: number
  description: string | null
  managementUrl: string | null
  meetingUrl: string | null
}

export function bookingConfirmationHtml(data: ConfirmationTemplateData): string {
  const details = [
    { label: "Event", value: data.eventTitle },
    { label: "Host", value: data.hostName },
    { label: "Guest", value: `${data.guestName} (${data.guestEmail})` },
    { label: "Date", value: formatDate(data.date, data.timezone) },
    { label: "Time", value: `${formatTime(data.startTime, data.timezone)} \u2013 ${formatTime(data.endTime, data.timezone)}` },
    { label: "Timezone", value: data.timezone },
    { label: "Duration", value: `${data.duration} min` },
  ]

  if (data.description) {
    details.push({ label: "Description", value: data.description })
  }

  const rows = details
    .map(
      (d) => `
    <tr>
      <td style="padding:6px 0;color:#64748b;font-size:13px;white-space:nowrap;vertical-align:top;width:100px">${d.label}</td>
      <td style="padding:6px 0;color:#1a1a2e;font-size:14px;font-weight:500">${d.value}</td>
    </tr>`
    )
    .join("")

  const meetButton = data.meetingUrl
    ? `
    <table role="presentation" style="width:100%;margin-top:24px">
      <tr>
        <td align="center">
          <a href="${data.meetingUrl}" style="display:inline-block;padding:12px 24px;background-color:#1a73e8;color:#ffffff;text-decoration:none;border-radius:8px;font-size:14px;font-weight:500">Join Google Meet</a>
        </td>
      </tr>
      <tr>
        <td align="center" style="padding-top:8px">
          <span style="font-size:13px;color:#64748b">${data.meetingUrl}</span>
        </td>
      </tr>
    </table>`
    : ""

  const manageButton = data.managementUrl
    ? `
    <table role="presentation" style="width:100%;margin-top:24px">
      <tr>
        <td align="center">
          <a href="${data.managementUrl}" style="display:inline-block;padding:12px 24px;background-color:#1a1a2e;color:#ffffff;text-decoration:none;border-radius:8px;font-size:14px;font-weight:500">Manage Booking</a>
        </td>
      </tr>
    </table>`
    : ""

  return baseHtml(`
    <h2 style="margin:0 0 20px;font-size:18px;font-weight:600;color:#1a1a2e">Booking Confirmed</h2>
    <p style="margin:0 0 20px;color:#475569">Your meeting has been scheduled.</p>
    <table role="presentation" style="width:100%;border-collapse:collapse">
      ${rows}
    </table>
    ${meetButton}
    ${manageButton}
  `)
}

export interface CancellationTemplateData {
  eventTitle: string
  hostName: string
  guestName: string
  date: Date
  startTime: Date
  endTime: Date
  timezone: string
}

export function bookingCancellationHtml(data: CancellationTemplateData): string {
  return baseHtml(`
    <h2 style="margin:0 0 20px;font-size:18px;font-weight:600;color:#dc2626">Booking Cancelled</h2>
    <p style="margin:0 0 20px;color:#475569">
      The following meeting has been cancelled by <strong>${data.hostName}</strong>.
    </p>
    <table role="presentation" style="width:100%;border-collapse:collapse">
      <tr>
        <td style="padding:6px 0;color:#64748b;font-size:13px;white-space:nowrap;vertical-align:top;width:100px">Event</td>
        <td style="padding:6px 0;color:#1a1a2e;font-size:14px;font-weight:500">${data.eventTitle}</td>
      </tr>
      <tr>
        <td style="padding:6px 0;color:#64748b;font-size:13px;white-space:nowrap;vertical-align:top;width:100px">Date</td>
        <td style="padding:6px 0;color:#1a1a2e;font-size:14px;font-weight:500">${formatDate(data.date, data.timezone)}</td>
      </tr>
      <tr>
        <td style="padding:6px 0;color:#64748b;font-size:13px;white-space:nowrap;vertical-align:top;width:100px">Time</td>
        <td style="padding:6px 0;color:#1a1a2e;font-size:14px;font-weight:500">${formatTime(data.startTime, data.timezone)} \u2013 ${formatTime(data.endTime, data.timezone)}</td>
      </tr>
      <tr>
        <td style="padding:6px 0;color:#64748b;font-size:13px;white-space:nowrap;vertical-align:top;width:100px">Timezone</td>
        <td style="padding:6px 0;color:#1a1a2e;font-size:14px;font-weight:500">${data.timezone}</td>
      </tr>
      <tr>
        <td style="padding:6px 0;color:#64748b;font-size:13px;white-space:nowrap;vertical-align:top;width:100px">Guest</td>
        <td style="padding:6px 0;color:#1a1a2e;font-size:14px;font-weight:500">${data.guestName}</td>
      </tr>
    </table>
  `)
}
