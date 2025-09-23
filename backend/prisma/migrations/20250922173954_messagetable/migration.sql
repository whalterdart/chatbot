-- CreateEnum
CREATE TYPE "MessageType" AS ENUM ('CLIENTE', 'IA');

-- CreateEnum
CREATE TYPE "PedidoStatus" AS ENUM ('EM_ANDAMENTO', 'FINALIZADO');

-- AlterTable
ALTER TABLE "Pedido" ADD COLUMN     "status" "PedidoStatus" NOT NULL DEFAULT 'EM_ANDAMENTO';

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "type" "MessageType" NOT NULL,
    "pedidoId" TEXT NOT NULL,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_pedidoId_fkey" FOREIGN KEY ("pedidoId") REFERENCES "Pedido"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
