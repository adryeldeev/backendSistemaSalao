-- CreateTable
CREATE TABLE `clientes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(191) NOT NULL,
    `sobrenome` VARCHAR(191) NOT NULL,
    `celular` VARCHAR(191) NOT NULL,
    `dataCadastro` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `horario` VARCHAR(191) NOT NULL,
    `userId` INTEGER NOT NULL,
    `created_at` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `servico_catalogo` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(191) NOT NULL,
    `preco` DOUBLE NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `servicos` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `produtoNome` VARCHAR(191) NOT NULL,
    `descricao` VARCHAR(191) NOT NULL,
    `realizadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `quantidade` INTEGER NOT NULL,
    `valor` DOUBLE NOT NULL,
    `desconto` DOUBLE NOT NULL,
    `total` DOUBLE NOT NULL,
    `funcionario` VARCHAR(191) NOT NULL,
    `clienteId` INTEGER NOT NULL,
    `userId` INTEGER NOT NULL,
    `servicoCatalogoId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `servicos` ADD CONSTRAINT `servicos_clienteId_fkey` FOREIGN KEY (`clienteId`) REFERENCES `clientes`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `servicos` ADD CONSTRAINT `servicos_servicoCatalogoId_fkey` FOREIGN KEY (`servicoCatalogoId`) REFERENCES `servico_catalogo`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
