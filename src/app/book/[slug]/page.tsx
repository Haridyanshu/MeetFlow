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
    <div className="min-h-dvh bg-background">
      <div className="mx-auto max-w-5xl border-x border-border/40">
        <BookingPageClient
          eventType={{
            id: eventType.id,
            title: eventType.title,
            description: eventType.description,
            duration: eventType.duration,
            location: eventType.location,
          }}
          host={{
            name: eventType.user.name,
            email: eventType.user.email,
            image: eventType.user.image,
          }}
        />
      </div>
    </div>
  )
}
