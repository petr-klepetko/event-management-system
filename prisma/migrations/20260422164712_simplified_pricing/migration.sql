-- AlterTable
ALTER TABLE "EventServiceItem"
ADD COLUMN     "description" TEXT,
ADD COLUMN     "note" TEXT,
ADD COLUMN     "price" DECIMAL(10,2),
ADD COLUMN     "sortOrder" INTEGER NOT NULL DEFAULT 0;

UPDATE "EventServiceItem"
SET "price" = "totalPrice";

ALTER TABLE "EventServiceItem"
ALTER COLUMN "price" SET NOT NULL,
DROP COLUMN "discountType",
DROP COLUMN "discountValue",
DROP COLUMN "quantity",
DROP COLUMN "totalPrice",
DROP COLUMN "unitPrice";

-- AlterTable
ALTER TABLE "ServiceCatalogItem"
ADD COLUMN     "defaultPrice" DECIMAL(10,2),
ADD COLUMN     "description" TEXT;

UPDATE "ServiceCatalogItem"
SET "defaultPrice" = "defaultUnitPrice";

ALTER TABLE "ServiceCatalogItem"
ALTER COLUMN "defaultPrice" SET NOT NULL,
DROP COLUMN "defaultUnitPrice";

-- DropEnum
DROP TYPE "DiscountType";
