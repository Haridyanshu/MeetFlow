import { NextResponse } from "next/server"
import { headers } from "next/headers"
import type Stripe from "stripe"
import { getStripe } from "@/lib/stripe"
import { prisma } from "@/lib/prisma"
import { createCalendarEvent } from "@/lib/services/calendar"
import { sendBookingConfirmation } from "@/lib/services/email"

export async function POST(req: Request) {
  const body = await req.text()
  const headersList = await headers()
  const sig = headersList.get("stripe-signature")

  if (!sig) {
    return NextResponse.json({ error: "Missing stripe-signature" }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = getStripe().webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET ?? "")
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session

    if (!session.metadata) {
      return NextResponse.json({ error: "Missing metadata" }, { status: 400 })
    }

    const existing = await prisma.booking.findFirst({
      where: { stripeCheckoutSessionId: session.id },
    })
    if (existing) {
      return NextResponse.json({ received: true })
    }

    const {
      eventTypeId,
      eventOwnerId,
      guestName,
      guestEmail,
      guestNotes,
      startTime: startTimeStr,
      endTime: endTimeStr,
      timezone,
    } = session.metadata

    if (!eventTypeId || !guestName || !guestEmail || !startTimeStr || !endTimeStr || !timezone) {
      return NextResponse.json({ error: "Missing required metadata" }, { status: 400 })
    }

    const startTime = new Date(startTimeStr)
    const endTime = new Date(endTimeStr)
    const paymentIntentId = typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id ?? null
    const amountPaid = session.amount_total ?? null
    const currency = session.currency ?? null

    const eventType = await prisma.eventType.findUnique({
      where: { id: eventTypeId },
      include: { user: true },
    })
    if (!eventType) {
      return NextResponse.json({ error: "Event type not found" }, { status: 404 })
    }

    try {
      const booking = await prisma.booking.create({
        data: {
          userId: eventOwnerId ?? eventType.user.id,
          eventTypeId,
          guestName,
          guestEmail,
          guestNotes: guestNotes || null,
          startTime,
          endTime,
          timezone,
          status: "BOOKED",
          paymentStatus: "PAID",
          stripeCheckoutSessionId: session.id,
          stripePaymentIntentId: paymentIntentId,
          amountPaid,
          currency,
        },
      })

      const calendarUsers = [eventOwnerId ?? eventType.user.id]
      let meetingUrl: string | null = null
      let hostEventId: string | null = null
      let hostCalendarId: string | null = null

      for (const uid of calendarUsers) {
        try {
          const calResult = await createCalendarEvent({
            userId: uid,
            summary: eventType.title,
            description: `Meeting with ${guestName} (${guestEmail})${guestNotes ? `\n\nNotes: ${guestNotes}` : ""}`,
            startTime,
            endTime,
            timezone,
          })

          if (calResult?.meetUrl && !meetingUrl) meetingUrl = calResult.meetUrl
          if (calResult?.eventId) {
            if (uid === (eventOwnerId ?? eventType.user.id)) {
              hostEventId = calResult.eventId
              hostCalendarId = calResult.calendarId ?? "primary"
            }
            await prisma.calendarEvent.create({
              data: {
                bookingId: booking.id,
                userId: uid,
                eventId: calResult.eventId,
                calendarId: calResult.calendarId ?? "primary",
              },
            })
          }
        } catch (calError) {
          console.error(`Failed to create calendar event for user ${uid}:`, calError)
        }
      }

      if (hostEventId) {
        await prisma.booking.update({
          where: { id: booking.id },
          data: {
            googleCalendarEventId: hostEventId,
            googleCalendarId: hostCalendarId,
            meetingUrl,
            meetingProvider: meetingUrl ? "GOOGLE_MEET" : null,
          },
        })
      }

      const managementUrl = `${process.env.AUTH_URL ?? "http://localhost:3000"}/booking/manage/${booking.id}`

      try {
        await sendBookingConfirmation(
          {
            eventTitle: eventType.title,
            hostName: eventType.user.name ?? eventType.user.email,
            guestName,
            guestEmail,
            date: startTime,
            startTime,
            endTime,
            timezone,
            duration: eventType.duration,
            description: eventType.description,
            managementUrl,
            meetingUrl,
          },
          eventType.user.email,
        )
      } catch (emailError) {
        console.error("Failed to send booking confirmation email:", emailError)
      }
    } catch (error) {
      console.error("Failed to create booking from webhook:", error)
      return NextResponse.json({ error: "Failed to create booking" }, { status: 500 })
    }
  }

  if (event.type === "checkout.session.expired") {
    const session = event.data.object
    await prisma.booking.updateMany({
      where: { stripeCheckoutSessionId: session.id },
      data: { paymentStatus: "FAILED" },
    })
  }

  if (event.type === "payment_intent.payment_failed") {
    const paymentIntent = event.data.object as Stripe.PaymentIntent
    await prisma.booking.updateMany({
      where: { stripePaymentIntentId: paymentIntent.id },
      data: { paymentStatus: "FAILED" },
    })
  }

  return NextResponse.json({ received: true })
}
