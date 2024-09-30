/*
  Warnings:

  - You are about to drop the column `relevancia` on the `clientes` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `clientes` DROP COLUMN `relevancia`,
    ADD COLUMN `relevante` INTEGER NULL;

-- AlterTable
ALTER TABLE `servicos` ADD COLUMN `lastUpdated` DATETIME(3) NULL;
