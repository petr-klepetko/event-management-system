CREATE TABLE "EventCost" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "ownerUserId" TEXT,
    "name" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventCost_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "EventCost_tenantId_idx" ON "EventCost"("tenantId");
CREATE INDEX "EventCost_eventId_idx" ON "EventCost"("eventId");
CREATE INDEX "EventCost_ownerUserId_idx" ON "EventCost"("ownerUserId");

ALTER TABLE "EventCost" ADD CONSTRAINT "EventCost_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "EventCost" ADD CONSTRAINT "EventCost_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "EventCost" ADD CONSTRAINT "EventCost_ownerUserId_fkey" FOREIGN KEY ("ownerUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
