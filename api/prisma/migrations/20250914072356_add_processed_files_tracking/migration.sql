/*
  Warnings:

  - You are about to drop the `Click` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Conversion` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Network` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SubAffiliate` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Click";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Conversion";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Network";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "SubAffiliate";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "networks" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "sub_affiliates" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "code" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "conversions" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "networkId" INTEGER NOT NULL,
    "subAffiliateId" INTEGER NOT NULL,
    "extConversionId" TEXT NOT NULL,
    "campaign" TEXT,
    "amount" REAL NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "eventAt" DATETIME NOT NULL,
    "lastUpdateAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "conversions_networkId_fkey" FOREIGN KEY ("networkId") REFERENCES "networks" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "conversions_subAffiliateId_fkey" FOREIGN KEY ("subAffiliateId") REFERENCES "sub_affiliates" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "clicks" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "networkId" INTEGER NOT NULL,
    "subAffiliateId" INTEGER NOT NULL,
    "extClickId" TEXT,
    "campaign" TEXT,
    "eventAt" DATETIME NOT NULL,
    CONSTRAINT "clicks_networkId_fkey" FOREIGN KEY ("networkId") REFERENCES "networks" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "clicks_subAffiliateId_fkey" FOREIGN KEY ("subAffiliateId") REFERENCES "sub_affiliates" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "processed_files" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "filePath" TEXT NOT NULL,
    "fileHash" TEXT NOT NULL,
    "processedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "recordsRead" INTEGER NOT NULL,
    "clicks" INTEGER NOT NULL,
    "conversions" INTEGER NOT NULL,
    "duplicates" INTEGER NOT NULL,
    "errors" INTEGER NOT NULL,
    "processingTime" REAL NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "networks_name_key" ON "networks"("name");

-- CreateIndex
CREATE UNIQUE INDEX "sub_affiliates_code_key" ON "sub_affiliates"("code");

-- CreateIndex
CREATE INDEX "conversions_subAffiliateId_eventAt_idx" ON "conversions"("subAffiliateId", "eventAt");

-- CreateIndex
CREATE INDEX "conversions_networkId_eventAt_idx" ON "conversions"("networkId", "eventAt");

-- CreateIndex
CREATE UNIQUE INDEX "conversions_networkId_extConversionId_key" ON "conversions"("networkId", "extConversionId");

-- CreateIndex
CREATE INDEX "clicks_subAffiliateId_eventAt_idx" ON "clicks"("subAffiliateId", "eventAt");

-- CreateIndex
CREATE INDEX "clicks_networkId_eventAt_idx" ON "clicks"("networkId", "eventAt");

-- CreateIndex
CREATE UNIQUE INDEX "processed_files_filePath_key" ON "processed_files"("filePath");
