import { notFound } from "next/navigation"

import { prisma } from "@/lib/prisma"
import { BookingPageClient } from "@/components/booking/booking-page-client"

export default async function BookPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const eventType = await prisma.eventType.findFirst({
    where: { slug, isActive: true },
    include: { user: true },
  })

  if (!eventType) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-background">
      <BookingPageClient
        eventType={{
          id: eventType.id,
          title: eventType.title,
          description: eventType.description,
          duration: eventType.duration,
          location: eventType.location,
          isPaid: eventType.isPaid,
          price: eventType.price,
          currency: eventType.currency,
        }}
        host={{
          name: eventType.user.name,
          email: eventType.user.email,
          image: eventType.user.image,
        }}
      />
    </div>
  )
}
