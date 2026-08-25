CREATE TABLE "EventServiceItemAssignment" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "eventServiceItemId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "workDescription" TEXT,
    "reward" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventServiceItemAssignment_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "EventServiceItemAssignment_eventServiceItemId_userId_key" ON "EventServiceItemAssignment"("eventServiceItemId", "userId");
CREATE INDEX "EventServiceItemAssignment_tenantId_idx" ON "EventServiceItemAssignment"("tenantId");
CREATE INDEX "EventServiceItemAssignment_eventServiceItemId_idx" ON "EventServiceItemAssignment"("eventServiceItemId");
CREATE INDEX "EventServiceItemAssignment_userId_idx" ON "EventServiceItemAssignment"("userId");

ALTER TABLE "EventServiceItemAssignment" ADD CONSTRAINT "EventServiceItemAssignment_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "EventServiceItemAssignment" ADD CONSTRAINT "EventServiceItemAssignment_eventServiceItemId_fkey" FOREIGN KEY ("eventServiceItemId") REFERENCES "EventServiceItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "EventServiceItemAssignment" ADD CONSTRAINT "EventServiceItemAssignment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
