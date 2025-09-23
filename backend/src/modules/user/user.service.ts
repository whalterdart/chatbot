import { prisma } from '../../config/prisma';

export class UserService {
  static async createUser(nome: string, telefone: string) {
    return prisma.user.create({
      data: { nome, telefone },
    });
  }

  static async findByTelefone(telefone: string) {
    return prisma.user.findUnique({
      where: { telefone },
    });
  }
} 