/*
  Warnings:

  - Made the column `frequencia` on table `clientes` required. This step will fail if there are existing NULL values in that column.
  - Made the column `relevante` on table `clientes` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `clientes` MODIFY `frequencia` INTEGER NOT NULL,
    MODIFY `relevante` INTEGER NOT NULL;
