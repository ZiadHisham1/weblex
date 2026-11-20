/*
  Warnings:

  - You are about to drop the column `blueprintId` on the `Tenant` table. All the data in the column will be lost.
  - You are about to drop the column `theme` on the `Tenant` table. All the data in the column will be lost.
  - You are about to drop the `Block` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Blueprint` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `BlueprintBlock` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Page` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `updatedAt` to the `SiteInstance` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Tenant` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TenantRole" AS ENUM ('VIEWER', 'EDITOR', 'ADMIN', 'OWNER');

-- CreateEnum
CREATE TYPE "SiteType" AS ENUM ('COMMERCE', 'SERVICE', 'PORTFOLIO');

-- CreateEnum
CREATE TYPE "ProvisioningState" AS ENUM ('PENDING', 'PROVISIONING', 'READY', 'FAILED');

-- DropForeignKey
ALTER TABLE "BlueprintBlock" DROP CONSTRAINT "BlueprintBlock_blockId_fkey";

-- DropForeignKey
ALTER TABLE "BlueprintBlock" DROP CONSTRAINT "BlueprintBlock_blueprintId_fkey";

-- DropForeignKey
ALTER TABLE "Page" DROP CONSTRAINT "Page_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "Tenant" DROP CONSTRAINT "Tenant_blueprintId_fkey";

-- AlterTable
ALTER TABLE "SiteInstance" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "Tenant" DROP COLUMN "blueprintId",
DROP COLUMN "theme",
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "siteType" "SiteType" NOT NULL DEFAULT 'COMMERCE',
ADD COLUMN     "themeTokens" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- DropTable
DROP TABLE "Block";

-- DropTable
DROP TABLE "Blueprint";

-- DropTable
DROP TABLE "BlueprintBlock";

-- DropTable
DROP TABLE "Page";

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "name" TEXT,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TenantMember" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "role" "TenantRole" NOT NULL DEFAULT 'VIEWER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TenantMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MedusaBinding" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "backendUrl" TEXT,
    "publishableKey" TEXT,
    "salesChannelId" TEXT,
    "regionId" TEXT,
    "adminApiKey" TEXT,
    "provisioningState" "ProvisioningState" NOT NULL DEFAULT 'PENDING',
    "provisionedAt" TIMESTAMP(3),
    "lastError" TEXT,
    "lastErrorAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MedusaBinding_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CmsBinding" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "apiUrl" TEXT,
    "apiKey" TEXT,
    "payloadTenantId" TEXT,
    "provisioningState" "ProvisioningState" NOT NULL DEFAULT 'PENDING',
    "provisionedAt" TIMESTAMP(3),
    "lastError" TEXT,
    "lastErrorAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CmsBinding_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContactSubmission" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "sourcePage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "handledAt" TIMESTAMP(3),
    "handledBy" TEXT,

    CONSTRAINT "ContactSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Session_token_key" ON "Session"("token");

-- CreateIndex
CREATE INDEX "TenantMember_tenantId_idx" ON "TenantMember"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "TenantMember_userId_tenantId_key" ON "TenantMember"("userId", "tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "MedusaBinding_tenantId_key" ON "MedusaBinding"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "CmsBinding_tenantId_key" ON "CmsBinding"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "CmsBinding_payloadTenantId_key" ON "CmsBinding"("payloadTenantId");

-- CreateIndex
CREATE INDEX "ContactSubmission_tenantId_createdAt_idx" ON "ContactSubmission"("tenantId", "createdAt");

-- CreateIndex
CREATE INDEX "CustomDomain_hostname_verified_idx" ON "CustomDomain"("hostname", "verified");

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantMember" ADD CONSTRAINT "TenantMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantMember" ADD CONSTRAINT "TenantMember_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MedusaBinding" ADD CONSTRAINT "MedusaBinding_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CmsBinding" ADD CONSTRAINT "CmsBinding_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContactSubmission" ADD CONSTRAINT "ContactSubmission_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
