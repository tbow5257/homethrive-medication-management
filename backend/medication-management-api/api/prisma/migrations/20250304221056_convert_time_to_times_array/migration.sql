/*
  Warnings:

  - You are about to drop the column `time` on the `schedules` table. All the data in the column will be lost.

*/
-- First add the new column
ALTER TABLE "schedules" ADD COLUMN "times" TEXT[] DEFAULT '{}';

-- Copy existing time values to the times array
UPDATE "schedules" SET "times" = ARRAY[time];

-- Now drop the old column
ALTER TABLE "schedules" DROP COLUMN "time";
