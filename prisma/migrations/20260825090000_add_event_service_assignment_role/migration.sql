CREATE TYPE "EventServiceAssignmentRole" AS ENUM ('RESPONSIBLE', 'WORKER');

ALTER TABLE "EventServiceItemAssignment"
ADD COLUMN "role" "EventServiceAssignmentRole" NOT NULL DEFAULT 'WORKER';
