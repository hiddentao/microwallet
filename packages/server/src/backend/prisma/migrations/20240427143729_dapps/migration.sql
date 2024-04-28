/*
  Warnings:

  - You are about to drop the column `key` on the `users` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[provider,providerUserId]` on the table `user_accounts` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "users_key_key";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "key";

-- CreateTable
CREATE TABLE "dapps" (
    "id" SERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "dapps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_wallets" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "dappId" INTEGER NOT NULL,
    "key" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_wallets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "dapps_key_key" ON "dapps"("key");

-- CreateIndex
CREATE UNIQUE INDEX "user_wallets_key_key" ON "user_wallets"("key");

-- CreateIndex
CREATE UNIQUE INDEX "user_wallets_userId_dappId_key" ON "user_wallets"("userId", "dappId");

-- CreateIndex
CREATE UNIQUE INDEX "user_accounts_provider_providerUserId_key" ON "user_accounts"("provider", "providerUserId");

-- AddForeignKey
ALTER TABLE "user_wallets" ADD CONSTRAINT "user_wallets_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_wallets" ADD CONSTRAINT "user_wallets_dappId_fkey" FOREIGN KEY ("dappId") REFERENCES "dapps"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
