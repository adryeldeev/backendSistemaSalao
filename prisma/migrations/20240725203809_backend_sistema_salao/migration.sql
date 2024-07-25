/*
  Warnings:

  - You are about to drop the column `userId` on the `clientes` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `servicos` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `clientes` DROP COLUMN `userId`;

-- AlterTable
ALTER TABLE `servicos` DROP COLUMN `userId`;
