"use server"

import { prisma } from "@/lib/prisma"
import { getStripe } from "@/lib/stripe"

export async function createCheckoutSession(data: {
  eventTypeId: string
  guestName: string
  guestEmail: string
  guestNotes?: string
  startTime: string
  endTime: string
  timezone: string
}) {
  const eventType = await prisma.eventType.findUnique({
    where: { id: data.eventTypeId },
    select: { id: true, title: true, duration: true, isPaid: true, price: true, currency: true, userId: true },
  })

  if (!eventType || !eventType.isPaid || !eventType.price) {
    return { errors: { _form: ["This event type is not configured for payment"] } }
  }

  const session = await getStripe().checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: eventType.currency ?? "usd",
          product_data: {
            name: eventType.title,
            description: `${eventType.duration} minute meeting`,
          },
          unit_amount: eventType.price,
        },
      },
    ],
    metadata: {
      eventTypeId: data.eventTypeId,
      eventOwnerId: eventType.userId,
      guestName: data.guestName,
      guestEmail: data.guestEmail,
      guestNotes: data.guestNotes ?? "",
      startTime: data.startTime,
      endTime: data.endTime,
      timezone: data.timezone,
    },
    success_url: `${process.env.AUTH_URL ?? "http://localhost:3000"}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.AUTH_URL ?? "http://localhost:3000"}/payment/cancel`,
  })

  return { url: session.url }
}
