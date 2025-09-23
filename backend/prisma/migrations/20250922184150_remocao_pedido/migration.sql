/*
  Warnings:

  - You are about to drop the column `pedidoId` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the `Pedido` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_pedidoId_fkey";

-- DropForeignKey
ALTER TABLE "Pedido" DROP CONSTRAINT "Pedido_userId_fkey";

-- AlterTable
ALTER TABLE "Message" DROP COLUMN "pedidoId";

-- DropTable
DROP TABLE "Pedido";
