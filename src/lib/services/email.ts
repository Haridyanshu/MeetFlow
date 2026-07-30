import { Resend } from "resend"

import {
  bookingConfirmationHtml,
  bookingCancellationHtml,
} from "@/lib/email/templates"
import type {
  ConfirmationTemplateData,
  CancellationTemplateData,
} from "@/lib/email/templates"

const resend = new Resend(process.env.RESEND_API_KEY!)

interface SendParams {
  to: string
  subject: string
  html: string
}

async function send({ to, subject, html }: SendParams) {
  try {
    await resend.emails.send({
      from: "MeetFlow <onboarding@resend.dev>",
      to,
      subject,
      html,
    })
  } catch (error) {
    console.error("Failed to send email:", error)
  }
}

export async function sendBookingConfirmation(
  data: ConfirmationTemplateData,
  hostEmail: string,
) {
  const html = bookingConfirmationHtml(data)

  const subject = `Booking Confirmed: ${data.eventTitle}`

  await Promise.allSettled([
    send({ to: data.guestEmail, subject, html }),
    send({ to: hostEmail, subject, html }),
  ])
}

export async function sendRescheduleConfirmation(
  data: ConfirmationTemplateData,
  hostEmail: string,
  guestEmail: string,
) {
  const html = bookingConfirmationHtml(data)

  const subject = `Booking Updated: ${data.eventTitle}`

  await Promise.allSettled([
    send({ to: guestEmail, subject, html }),
    send({ to: hostEmail, subject, html }),
  ])
}

export async function sendBookingCancellation(
  data: CancellationTemplateData,
  hostEmail: string,
  guestEmail: string,
) {
  const html = bookingCancellationHtml(data)

  const subject = `Booking Cancelled: ${data.eventTitle}`

  await Promise.allSettled([
    send({ to: guestEmail, subject, html }),
    send({ to: hostEmail, subject, html }),
  ])
}
