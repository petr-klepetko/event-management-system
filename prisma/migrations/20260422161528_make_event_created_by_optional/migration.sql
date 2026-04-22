-- DropForeignKey
ALTER TABLE "Event" DROP CONSTRAINT "Event_createdByUserId_fkey";

-- AlterTable
ALTER TABLE "Event" ALTER COLUMN "createdByUserId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
