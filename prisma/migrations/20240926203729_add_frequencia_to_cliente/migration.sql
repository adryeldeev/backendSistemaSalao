/*
  Warnings:

  - Made the column `frequencia` on table `servicos` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `servicos` MODIFY `frequencia` INTEGER NOT NULL;
