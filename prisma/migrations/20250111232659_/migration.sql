/*
  Warnings:

  - Added the required column `redirect_uri` to the `settings` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "settings" ADD COLUMN     "redirect_uri" VARCHAR(255) NOT NULL;
