/*
  Warnings:

  - You are about to drop the column `relevante` on the `clientes` table. All the data in the column will be lost.
  - You are about to drop the column `lastUpdated` on the `servicos` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `clientes` DROP COLUMN `relevante`,
    ADD COLUMN `relevancia` INTEGER NULL;

-- AlterTable
ALTER TABLE `servicos` DROP COLUMN `lastUpdated`;
