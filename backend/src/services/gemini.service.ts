import { GoogleGenerativeAI } from '@google/generative-ai';
import { MessageService } from '../modules/message/message.service';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export class GeminiService {
  private static readonly systemPrompt = `Você é um atendente virtual de uma pizzaria.
Seja sempre educado, prestativo e persuasivo, mas nunca agressivo.

Sua função é:
- Dar boas-vindas e apresentar o cardápio
- Ajudar na escolha da pizza
- Tirar dúvidas sobre ingredientes
- Confirmar pedidos e explicar tempo de entrega

Regras importantes:
1. Só ofereça itens do cardápio (pizzas, bebidas e sobremesas).
2. Incentive sempre a escolha de uma pizza.
3. Se o cliente não pedir bebida, ofereça uma.
4. Se o cliente pedir bebida, ofereça também uma sobremesa.
5. Se o cliente recusar, tente outra opção do mesmo grupo.
6. Nunca ofereça promoções, descontos ou itens fora do cardápio.

Cardápio:

🍕 Pizzas:
- Margherita: Molho de tomate, mussarela e manjericão
- Calabresa: Calabresa, cebola e orégano
- Portuguesa: Presunto, ovos, cebola e ervilha
- Pepperoni: Pepperoni e mussarela
- Frango com Catupiry: Frango desfiado e catupiry

🥤 Bebidas:
- Coca-Cola 350ml
- Guaraná 350ml
- Água 500ml
- Suco Natural 300ml

🍨 Sobremesas:
- Pudim
- Brownie
- Sorvete (1 bola)`;

  private static chatHistory: Map<string, { 
    history: any[], 
    model: any, 
    hasWelcomed: boolean 
  }> = new Map();
  private static welcomePromises: Map<string, Promise<any | null>> = new Map();

  static async sendPrompt(prompt: string, userId: string) {
    try {
      const messageHistory = await MessageService.findByMessage(userId);
      
      if (!this.chatHistory.has(userId)) {
        await this.initializeChat(userId);
      }

      const userChat = this.chatHistory.get(userId)!;
      
      let fullPrompt = `${this.systemPrompt}\n\nCONTEXTO DA CONVERSA:\n`;
      
      for (const message of messageHistory) {
        const role = message.type === 'CLIENTE' ? 'Cliente diz' : 'Atendente responde';
        fullPrompt += `\n${role}: ${message.content}`;
      }
      
      for (const message of userChat.history) {
        if (message.role === "user") {
          fullPrompt += `\nCliente diz: ${message.parts[0].text}`;
        } else {
          fullPrompt += `\nAtendente responde: ${message.parts[0].text}`;
        }
      }
      
      fullPrompt += `\n\nCliente diz: ${prompt}\n\nLembre-se: Mantenha o contexto do pedido e NÃO repita boas-vindas ou cardápio completo.`;

      const response = await userChat.model.sendMessage([{
        text: fullPrompt
      }]);
      const text = response.response.text();
      
      userChat.history.push({
        role: "user",
        parts: [{ text: prompt }]
      });
      userChat.history.push({
        role: "model",
        parts: [{ text: text }]
      });

      return text;
    } catch (error) {
      throw error;
    }
  }

  private static async initializeChat(userId: string) {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const chat = model.startChat();
    
    this.chatHistory.set(userId, { 
      history: [],
      model: chat,
      hasWelcomed: false
    });
    
    return chat;
  }

  static async sendWelcomeMessage(userId: string) {
    if (this.welcomePromises.has(userId)) {
      return this.welcomePromises.get(userId);
    }

    const welcomePromise = (async () => {
      try {
        const existing = await MessageService.findByMessage(userId);
        if (existing && existing.some((m: any) => m.type === 'IA')) {
          return existing.find((m: any) => m.type === 'IA') || null;
        }

        if (!this.chatHistory.has(userId)) {
          await this.initializeChat(userId);
        }

        const userChat = this.chatHistory.get(userId)!;
        if (userChat.hasWelcomed) {
          const post = await MessageService.findByMessage(userId);
          return post.find((m: any) => m.type === 'IA') || null;
        }

        userChat.hasWelcomed = true;

        const welcomePrompt = `${this.systemPrompt}\n\nInicie o atendimento dando boas-vindas ao cliente e mostrando o cardápio`;

        const response = await userChat.model.sendMessage([{ text: welcomePrompt }]);
        const text = response.response.text();

        userChat.history.push({ role: 'user', parts: [{ text: welcomePrompt }] });
        userChat.history.push({ role: 'model', parts: [{ text }] });

        const after = await MessageService.findByMessage(userId);
        const already = after.find((m: any) => m.type === 'IA');
        if (already) {
          return already;
        }

        const created = await MessageService.createMessage({ content: text, type: 'IA', userId });
        return created;
      } catch (error) {
        const userChat = this.chatHistory.get(userId);
        if (userChat) userChat.hasWelcomed = false;
        throw error;
      } finally {
        this.welcomePromises.delete(userId);
      }
    })();

    this.welcomePromises.set(userId, welcomePromise);
    return welcomePromise;
  }
}