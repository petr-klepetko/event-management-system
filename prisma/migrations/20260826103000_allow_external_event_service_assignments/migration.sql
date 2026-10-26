ALTER TABLE "EventServiceItemAssignment" ADD COLUMN "supplierName" TEXT;
ALTER TABLE "EventServiceItemAssignment" ALTER COLUMN "userId" DROP NOT NULL;
