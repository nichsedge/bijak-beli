-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "nameId" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "brandCount" INTEGER NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "Brand" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "nameId" TEXT,
    "logo" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "subcategory" TEXT,
    "tagline" TEXT NOT NULL,
    "taglineId" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "parentCompany" TEXT,
    "ultimateOwner" TEXT,
    "ownerCountry" TEXT,
    "foundedYear" INTEGER,
    "halalCertified" BOOLEAN NOT NULL,
    "halalCertifier" TEXT,
    "scoreHalal" INTEGER NOT NULL,
    "scoreEthical" INTEGER NOT NULL,
    "scoreEsg" INTEGER NOT NULL,
    "scorePolitical" INTEGER NOT NULL,
    "scoreCommunity" INTEGER NOT NULL,
    "communityVotesUp" INTEGER NOT NULL DEFAULT 0,
    "communityVotesDown" INTEGER NOT NULL DEFAULT 0,
    "lastUpdated" DATETIME NOT NULL,
    "description" TEXT NOT NULL,
    "descriptionId" TEXT NOT NULL,
    "boycottActive" BOOLEAN NOT NULL,
    "boycottReason" TEXT,
    "boycottReasonId" TEXT,
    CONSTRAINT "Brand_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Controversy" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL,
    "title" TEXT NOT NULL,
    "titleId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "descriptionId" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "sourceUrl" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "BrandControversy" (
    "brandId" TEXT NOT NULL,
    "controversyId" TEXT NOT NULL,

    PRIMARY KEY ("brandId", "controversyId"),
    CONSTRAINT "BrandControversy_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "BrandControversy_controversyId_fkey" FOREIGN KEY ("controversyId") REFERENCES "Controversy" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BrandCertification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "brandId" TEXT NOT NULL,
    "certification" TEXT NOT NULL,
    CONSTRAINT "BrandCertification_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Source" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "brandId" TEXT NOT NULL,
    CONSTRAINT "Source_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BrandAlternative" (
    "brandId" TEXT NOT NULL,
    "alternativeId" TEXT NOT NULL,

    PRIMARY KEY ("brandId", "alternativeId"),
    CONSTRAINT "BrandAlternative_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "BrandAlternative_alternativeId_fkey" FOREIGN KEY ("alternativeId") REFERENCES "Brand" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
