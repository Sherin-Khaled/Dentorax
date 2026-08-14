-- CreateTable
CREATE TABLE "welcome_promo_codes" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "points" INTEGER NOT NULL,
    "weekdays" INTEGER[],
    "timezone" TEXT NOT NULL DEFAULT 'Africa/Cairo',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "welcome_promo_codes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "welcome_promo_codes_code_key" ON "welcome_promo_codes"("code");

-- Seed the two client-approved welcome promo codes (Friday=5, Saturday=6 in Africa/Cairo).
INSERT INTO "welcome_promo_codes" ("id", "code", "points", "weekdays", "timezone", "isActive", "createdAt", "updatedAt")
VALUES
  ('welcome-promo-rashad500', 'Rashad500', 5000, ARRAY[5,6]::INTEGER[], 'Africa/Cairo', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('welcome-promo-gold300', 'Gold300', 3000, ARRAY[5,6]::INTEGER[], 'Africa/Cairo', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("code") DO NOTHING;
