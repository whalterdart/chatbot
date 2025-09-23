import { Request, Response } from 'express';
import { UserService } from './user.service';

export class UserController {
  static async createUser(req: Request, res: Response) {
    const { nome, telefone } = req.body;
    if (!nome || !telefone) {
      return res.status(400).json({ error: 'Nome e telefone são obrigatórios.' });
    }
    try {
      const existingUser = await UserService.findByTelefone(telefone);
      if (existingUser) {
        return res.json(existingUser);
      }
      const user = await UserService.createUser(nome, telefone);
      res.json(user);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static async findByTelefone(req: Request, res: Response) {
    const { telefone } = req.params;
    try {
      const user = await UserService.findByTelefone(telefone);
      if (!user) {
        return res.status(404).json({ error: 'Cliente não encontrado.' });
      }
      if (res.statusCode === 304) {
        console.warn('Tentativa de enviar 304 Not Modified para o frontend!');
      }
      res.status(200).set('ETag', '').json(user);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
} 