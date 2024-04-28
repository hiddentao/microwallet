/*
  Warnings:

  - You are about to drop the column `settings` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `wallet` on the `users` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[key]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `key` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "UserAccountProvider" AS ENUM ('GOOGLE', 'FACEBOOK', 'TWITTER', 'INSTAGRAM', 'TIKTOK', 'GITHUB', 'EMAIL');

-- DropIndex
DROP INDEX "users_wallet_key";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "settings",
DROP COLUMN "wallet",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "key" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "user_accounts" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "provider" "UserAccountProvider" NOT NULL,
    "providerUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_key_key" ON "users"("key");

-- AddForeignKey
ALTER TABLE "user_accounts" ADD CONSTRAINT "user_accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
