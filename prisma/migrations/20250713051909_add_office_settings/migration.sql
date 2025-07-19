-- CreateTable
CREATE TABLE "office_settings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "companyName" TEXT,
    "address" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "website" TEXT,
    "logoUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
