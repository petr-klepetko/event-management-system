-- CreateTable
CREATE TABLE "ServiceCatalogItemAssignee" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "serviceCatalogItemId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ServiceCatalogItemAssignee_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ServiceCatalogItemAssignee_serviceCatalogItemId_userId_key" ON "ServiceCatalogItemAssignee"("serviceCatalogItemId", "userId");
CREATE INDEX "ServiceCatalogItemAssignee_tenantId_idx" ON "ServiceCatalogItemAssignee"("tenantId");
CREATE INDEX "ServiceCatalogItemAssignee_serviceCatalogItemId_idx" ON "ServiceCatalogItemAssignee"("serviceCatalogItemId");
CREATE INDEX "ServiceCatalogItemAssignee_userId_idx" ON "ServiceCatalogItemAssignee"("userId");

-- AddForeignKey
ALTER TABLE "ServiceCatalogItemAssignee" ADD CONSTRAINT "ServiceCatalogItemAssignee_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ServiceCatalogItemAssignee" ADD CONSTRAINT "ServiceCatalogItemAssignee_serviceCatalogItemId_fkey" FOREIGN KEY ("serviceCatalogItemId") REFERENCES "ServiceCatalogItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ServiceCatalogItemAssignee" ADD CONSTRAINT "ServiceCatalogItemAssignee_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
