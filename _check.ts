import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  datasources: { db: { url: "postgresql://meetflow:meetflow123@localhost:5432/meetflow?schema=public" } },
});

async function main() {
  const users = await prisma.user.findMany({ select: { id: true, name: true, email: true } });
  console.log("=== USERS ===");
  console.log(JSON.stringify(users, null, 2));

  const eventTypes = await prisma.eventType.findMany({ select: { id: true, title: true, slug: true, isActive: true, userId: true } });
  console.log("\n=== EVENT TYPES ===");
  console.log(JSON.stringify(eventTypes, null, 2));

  const wa = await prisma.weeklyAvailability.findMany({ include: { intervals: { orderBy: { dayOfWeek: "asc" } } } });
  console.log("\n=== WEEKLY AVAILABILITY ===");
  console.log(JSON.stringify(wa, null, 2));

  const overrides = await prisma.dateOverride.findMany();
  console.log("\n=== DATE OVERRIDES ===");
  console.log(JSON.stringify(overrides, null, 2));
}
main().catch((e) => console.error(e.message)).finally(() => prisma.$disconnect());
