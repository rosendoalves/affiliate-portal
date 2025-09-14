-- CreateTable
CREATE TABLE "Network" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "SubAffiliate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "code" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Conversion" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "networkId" INTEGER NOT NULL,
    "subAffiliateId" INTEGER NOT NULL,
    "extConversionId" TEXT NOT NULL,
    "campaign" TEXT,
    "amount" REAL NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "eventAt" DATETIME NOT NULL,
    "lastUpdateAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Conversion_networkId_fkey" FOREIGN KEY ("networkId") REFERENCES "Network" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Conversion_subAffiliateId_fkey" FOREIGN KEY ("subAffiliateId") REFERENCES "SubAffiliate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Click" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "networkId" INTEGER NOT NULL,
    "subAffiliateId" INTEGER NOT NULL,
    "extClickId" TEXT,
    "campaign" TEXT,
    "eventAt" DATETIME NOT NULL,
    CONSTRAINT "Click_networkId_fkey" FOREIGN KEY ("networkId") REFERENCES "Network" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Click_subAffiliateId_fkey" FOREIGN KEY ("subAffiliateId") REFERENCES "SubAffiliate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Network_name_key" ON "Network"("name");

-- CreateIndex
CREATE UNIQUE INDEX "SubAffiliate_code_key" ON "SubAffiliate"("code");

-- CreateIndex
CREATE INDEX "Conversion_subAffiliateId_eventAt_idx" ON "Conversion"("subAffiliateId", "eventAt");

-- CreateIndex
CREATE INDEX "Conversion_networkId_eventAt_idx" ON "Conversion"("networkId", "eventAt");

-- CreateIndex
CREATE UNIQUE INDEX "Conversion_networkId_extConversionId_key" ON "Conversion"("networkId", "extConversionId");

-- CreateIndex
CREATE INDEX "Click_subAffiliateId_eventAt_idx" ON "Click"("subAffiliateId", "eventAt");

-- CreateIndex
CREATE INDEX "Click_networkId_eventAt_idx" ON "Click"("networkId", "eventAt");
