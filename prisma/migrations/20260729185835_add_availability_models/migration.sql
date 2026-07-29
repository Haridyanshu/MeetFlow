-- CreateTable
CREATE TABLE "public"."WeeklyAvailability" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WeeklyAvailability_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AvailabilityInterval" (
    "id" TEXT NOT NULL,
    "weeklyAvailabilityId" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "AvailabilityInterval_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."DateOverride" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "startTime" TEXT,
    "endTime" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DateOverride_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WeeklyAvailability_userId_key" ON "public"."WeeklyAvailability"("userId");

-- CreateIndex
CREATE INDEX "AvailabilityInterval_weeklyAvailabilityId_dayOfWeek_idx" ON "public"."AvailabilityInterval"("weeklyAvailabilityId", "dayOfWeek");

-- CreateIndex
CREATE INDEX "DateOverride_userId_date_idx" ON "public"."DateOverride"("userId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "DateOverride_userId_date_key" ON "public"."DateOverride"("userId", "date");

-- AddForeignKey
ALTER TABLE "public"."WeeklyAvailability" ADD CONSTRAINT "WeeklyAvailability_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AvailabilityInterval" ADD CONSTRAINT "AvailabilityInterval_weeklyAvailabilityId_fkey" FOREIGN KEY ("weeklyAvailabilityId") REFERENCES "public"."WeeklyAvailability"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DateOverride" ADD CONSTRAINT "DateOverride_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
