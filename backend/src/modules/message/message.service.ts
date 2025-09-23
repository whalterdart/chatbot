import { prisma } from '../../config/prisma';
import { MessageType } from '@prisma/client';

interface CreateMessageData {
  content: string;
  type: MessageType;
  userId?: string;
}

export class MessageService {
  static async createMessage(data: CreateMessageData) {
    return prisma.message.create({
      data: {
        content: data.content,
        type: data.type,
        userId: data.userId
      },
      include: {
        user: true
      }
    });
  }

  static async findByMessage(userId: string) {
    return prisma.message.findMany({
      where: { 
        userId,
        OR: [
          { type: 'CLIENTE' },
          { type: 'IA' }
        ]
      },
      include: {
        user: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    });
  }
}