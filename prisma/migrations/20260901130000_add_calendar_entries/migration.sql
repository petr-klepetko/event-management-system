-- CreateEnum
CREATE TYPE "CalendarEntryVisibility" AS ENUM ('PRIVATE', 'PUBLIC');

-- CreateTable
CREATE TABLE "CalendarEntry" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "ownerUserId" TEXT,
    "createdByUserId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "visibility" "CalendarEntryVisibility" NOT NULL DEFAULT 'PRIVATE',
    "dateStart" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CalendarEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CalendarEntryParticipant" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "calendarEntryId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CalendarEntryParticipant_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CalendarEntry_tenantId_idx" ON "CalendarEntry"("tenantId");

-- CreateIndex
CREATE INDEX "CalendarEntry_ownerUserId_idx" ON "CalendarEntry"("ownerUserId");

-- CreateIndex
CREATE INDEX "CalendarEntry_createdByUserId_idx" ON "CalendarEntry"("createdByUserId");

-- CreateIndex
CREATE INDEX "CalendarEntry_dateStart_idx" ON "CalendarEntry"("dateStart");

-- CreateIndex
CREATE INDEX "CalendarEntry_visibility_idx" ON "CalendarEntry"("visibility");

-- CreateIndex
CREATE INDEX "CalendarEntryParticipant_tenantId_idx" ON "CalendarEntryParticipant"("tenantId");

-- CreateIndex
CREATE INDEX "CalendarEntryParticipant_calendarEntryId_idx" ON "CalendarEntryParticipant"("calendarEntryId");

-- CreateIndex
CREATE INDEX "CalendarEntryParticipant_userId_idx" ON "CalendarEntryParticipant"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "CalendarEntryParticipant_calendarEntryId_userId_key" ON "CalendarEntryParticipant"("calendarEntryId", "userId");

-- AddForeignKey
ALTER TABLE "CalendarEntry" ADD CONSTRAINT "CalendarEntry_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CalendarEntry" ADD CONSTRAINT "CalendarEntry_ownerUserId_fkey" FOREIGN KEY ("ownerUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CalendarEntry" ADD CONSTRAINT "CalendarEntry_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CalendarEntryParticipant" ADD CONSTRAINT "CalendarEntryParticipant_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CalendarEntryParticipant" ADD CONSTRAINT "CalendarEntryParticipant_calendarEntryId_fkey" FOREIGN KEY ("calendarEntryId") REFERENCES "CalendarEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CalendarEntryParticipant" ADD CONSTRAINT "CalendarEntryParticipant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
