-- AddEnumValue
ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'WORKER';

-- CreateEnum
CREATE TYPE "TenantRole" AS ENUM ('MANAGER', 'WORKER');

-- CreateTable
CREATE TABLE "Tenant" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tenant_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Tenant_slug_key" ON "Tenant"("slug");

-- CreateTable
CREATE TABLE "TenantMembership" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "TenantRole" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TenantMembership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TenantInvite" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "TenantRole" NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "invitedByUserId" TEXT NOT NULL,
    "acceptedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TenantInvite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserSession_pkey" PRIMARY KEY ("id")
);

-- BackfillTenant
INSERT INTO "Tenant" ("id", "name", "slug", "updatedAt")
VALUES ('default-tenant', 'Výchozí tenant', 'default', CURRENT_TIMESTAMP)
ON CONFLICT ("slug") DO NOTHING;

-- AddColumns
ALTER TABLE "Client" ADD COLUMN "tenantId" TEXT;
ALTER TABLE "Client" ADD COLUMN "ownerUserId" TEXT;
ALTER TABLE "ContactPerson" ADD COLUMN "tenantId" TEXT;
ALTER TABLE "Event" ADD COLUMN "tenantId" TEXT;
ALTER TABLE "Event" ADD COLUMN "ownerUserId" TEXT;
ALTER TABLE "ServiceCatalogItem" ADD COLUMN "tenantId" TEXT;
ALTER TABLE "ServiceCatalogItem" ADD COLUMN "ownerUserId" TEXT;
ALTER TABLE "EventServiceItem" ADD COLUMN "tenantId" TEXT;
ALTER TABLE "EventServiceItem" ADD COLUMN "ownerUserId" TEXT;
ALTER TABLE "Document" ADD COLUMN "tenantId" TEXT;

-- BackfillColumns
UPDATE "Client" SET "tenantId" = 'default-tenant' WHERE "tenantId" IS NULL;
UPDATE "ContactPerson" cp
SET "tenantId" = c."tenantId"
FROM "Client" c
WHERE cp."clientId" = c."id" AND cp."tenantId" IS NULL;
UPDATE "Event" e
SET "tenantId" = c."tenantId", "ownerUserId" = e."createdByUserId"
FROM "Client" c
WHERE e."clientId" = c."id" AND e."tenantId" IS NULL;
UPDATE "ServiceCatalogItem" SET "tenantId" = 'default-tenant' WHERE "tenantId" IS NULL;
UPDATE "EventServiceItem" esi
SET "tenantId" = e."tenantId", "ownerUserId" = e."ownerUserId"
FROM "Event" e
WHERE esi."eventId" = e."id" AND esi."tenantId" IS NULL;
UPDATE "Document" d
SET "tenantId" = e."tenantId"
FROM "Event" e
WHERE d."eventId" = e."id" AND d."tenantId" IS NULL;

-- SetNotNull
ALTER TABLE "Client" ALTER COLUMN "tenantId" SET NOT NULL;
ALTER TABLE "ContactPerson" ALTER COLUMN "tenantId" SET NOT NULL;
ALTER TABLE "Event" ALTER COLUMN "tenantId" SET NOT NULL;
ALTER TABLE "ServiceCatalogItem" ALTER COLUMN "tenantId" SET NOT NULL;
ALTER TABLE "EventServiceItem" ALTER COLUMN "tenantId" SET NOT NULL;
ALTER TABLE "Document" ALTER COLUMN "tenantId" SET NOT NULL;

-- Indexes
CREATE UNIQUE INDEX "TenantMembership_tenantId_userId_key" ON "TenantMembership"("tenantId", "userId");
CREATE UNIQUE INDEX "TenantInvite_tokenHash_key" ON "TenantInvite"("tokenHash");
CREATE UNIQUE INDEX "UserSession_tokenHash_key" ON "UserSession"("tokenHash");
CREATE INDEX "TenantMembership_tenantId_idx" ON "TenantMembership"("tenantId");
CREATE INDEX "TenantMembership_userId_idx" ON "TenantMembership"("userId");
CREATE INDEX "TenantInvite_tenantId_idx" ON "TenantInvite"("tenantId");
CREATE INDEX "TenantInvite_email_idx" ON "TenantInvite"("email");
CREATE INDEX "TenantInvite_invitedByUserId_idx" ON "TenantInvite"("invitedByUserId");
CREATE INDEX "UserSession_userId_idx" ON "UserSession"("userId");
CREATE INDEX "UserSession_expiresAt_idx" ON "UserSession"("expiresAt");
CREATE INDEX "Client_tenantId_idx" ON "Client"("tenantId");
CREATE INDEX "Client_ownerUserId_idx" ON "Client"("ownerUserId");
CREATE INDEX "ContactPerson_tenantId_idx" ON "ContactPerson"("tenantId");
CREATE INDEX "Event_tenantId_idx" ON "Event"("tenantId");
CREATE INDEX "Event_ownerUserId_idx" ON "Event"("ownerUserId");
CREATE INDEX "ServiceCatalogItem_tenantId_idx" ON "ServiceCatalogItem"("tenantId");
CREATE INDEX "ServiceCatalogItem_ownerUserId_idx" ON "ServiceCatalogItem"("ownerUserId");
CREATE INDEX "EventServiceItem_tenantId_idx" ON "EventServiceItem"("tenantId");
CREATE INDEX "EventServiceItem_ownerUserId_idx" ON "EventServiceItem"("ownerUserId");
CREATE INDEX "Document_tenantId_idx" ON "Document"("tenantId");

-- ForeignKeys
ALTER TABLE "TenantMembership" ADD CONSTRAINT "TenantMembership_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "TenantMembership" ADD CONSTRAINT "TenantMembership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "TenantInvite" ADD CONSTRAINT "TenantInvite_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "TenantInvite" ADD CONSTRAINT "TenantInvite_invitedByUserId_fkey" FOREIGN KEY ("invitedByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "UserSession" ADD CONSTRAINT "UserSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Client" ADD CONSTRAINT "Client_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Client" ADD CONSTRAINT "Client_ownerUserId_fkey" FOREIGN KEY ("ownerUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ContactPerson" ADD CONSTRAINT "ContactPerson_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Event" ADD CONSTRAINT "Event_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Event" ADD CONSTRAINT "Event_ownerUserId_fkey" FOREIGN KEY ("ownerUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ServiceCatalogItem" ADD CONSTRAINT "ServiceCatalogItem_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ServiceCatalogItem" ADD CONSTRAINT "ServiceCatalogItem_ownerUserId_fkey" FOREIGN KEY ("ownerUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "EventServiceItem" ADD CONSTRAINT "EventServiceItem_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "EventServiceItem" ADD CONSTRAINT "EventServiceItem_ownerUserId_fkey" FOREIGN KEY ("ownerUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Document" ADD CONSTRAINT "Document_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
