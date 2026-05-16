-- Make locale column nullable and remove the default "pt" value
-- New users will have locale = NULL, triggering Accept-Language detection on first login
ALTER TABLE "User" ALTER COLUMN "locale" DROP NOT NULL;
ALTER TABLE "User" ALTER COLUMN "locale" DROP DEFAULT;
