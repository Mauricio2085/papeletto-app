-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "OrderType" AS ENUM ('PRINT_STANDARD', 'PRINT_SPECIAL', 'DOCUMENT_CV', 'DOCUMENT_DERECHO_PETICION');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('DRAFT', 'QUOTED', 'CONFIRMED', 'PROCESSING', 'SENT_TO_PRINTER', 'READY', 'COMPLETED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "DocumentJobType" AS ENUM ('CV', 'DERECHO_PETICION');

-- CreateEnum
CREATE TYPE "DocumentJobStatus" AS ENUM ('QUEUED', 'PROCESSING', 'READY', 'FAILED');

-- CreateTable
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "type" "OrderType" NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'DRAFT',
    "customerId" TEXT,
    "currency" TEXT NOT NULL DEFAULT 'COP',
    "subtotalCents" INTEGER NOT NULL DEFAULT 0,
    "totalCents" INTEGER NOT NULL DEFAULT 0,
    "pricingSnapshot" JSONB,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Asset" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "byteSize" INTEGER NOT NULL,
    "storageKey" TEXT NOT NULL,
    "pageCount" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Asset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PrintJob" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "printNodeJobId" TEXT,
    "printerId" TEXT NOT NULL,
    "copies" INTEGER NOT NULL DEFAULT 1,
    "options" JSONB,
    "status" TEXT NOT NULL,
    "lastError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PrintJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentJob" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "type" "DocumentJobType" NOT NULL,
    "status" "DocumentJobStatus" NOT NULL DEFAULT 'QUEUED',
    "inputPayload" JSONB NOT NULL,
    "n8nExecutionId" TEXT,
    "resultAssetId" TEXT,
    "lastError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DocumentJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PriceConfig" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "unit" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PriceConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PrinterConfig" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "printNodePrinterId" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "PrinterConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Order_status_idx" ON "Order"("status");

-- CreateIndex
CREATE INDEX "Order_type_idx" ON "Order"("type");

-- CreateIndex
CREATE INDEX "Order_createdAt_idx" ON "Order"("createdAt");

-- CreateIndex
CREATE INDEX "Asset_orderId_idx" ON "Asset"("orderId");

-- CreateIndex
CREATE INDEX "PrintJob_orderId_idx" ON "PrintJob"("orderId");

-- CreateIndex
CREATE INDEX "PrintJob_status_idx" ON "PrintJob"("status");

-- CreateIndex
CREATE INDEX "DocumentJob_orderId_idx" ON "DocumentJob"("orderId");

-- CreateIndex
CREATE INDEX "DocumentJob_status_idx" ON "DocumentJob"("status");

-- CreateIndex
CREATE UNIQUE INDEX "PriceConfig_key_key" ON "PriceConfig"("key");

-- CreateIndex
CREATE UNIQUE INDEX "PrinterConfig_printNodePrinterId_key" ON "PrinterConfig"("printNodePrinterId");

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Asset" ADD CONSTRAINT "Asset_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrintJob" ADD CONSTRAINT "PrintJob_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentJob" ADD CONSTRAINT "DocumentJob_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

