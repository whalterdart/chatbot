import { Server as HttpServer } from 'http';
import { WebSocket, WebSocketServer } from 'ws';
import { MessageService } from '../modules/message/message.service';
import { GeminiService } from '../services/gemini.service';

interface ConnectedClient {
  ws: WebSocket;
  userId?: string | null;
}

const clients: ConnectedClient[] = [];

export function setupWebSocket(server: HttpServer) {
  const wss = new WebSocketServer({ server });

  wss.on('connection', (ws) => {
    const client: ConnectedClient = { ws, userId: null };
    clients.push(client);
    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message.toString());

        if (data.type === 'identify') {
          client.userId = data.userId || null;
          const uid = client.userId;
          
          if (uid) {
            try {
              const history = await MessageService.findByMessage(uid);
              ws.send(JSON.stringify({ type: 'history', messages: history }));

              const hasIAAlready = history.some((m: any) => m.type === 'IA');
              if (hasIAAlready) {
                return;
              }

               const welcomeResponse = await GeminiService.sendWelcomeMessage(uid);
               if (welcomeResponse) {
                 let welcomeMessageRecord: any;

                 if (typeof welcomeResponse === 'object' && welcomeResponse.id) {
                   welcomeMessageRecord = welcomeResponse;
                 } else {
                   const currentHistoryAfter = await MessageService.findByMessage(uid);
                   if (currentHistoryAfter.some((m: any) => m.type === 'IA')) {
                     return;
                   }

                   welcomeMessageRecord = await MessageService.createMessage({
                     content: welcomeResponse as any,
                     type: 'IA',
                     userId: uid
                   });
                 }

                const payload = JSON.stringify({ type: 'new_message', message: welcomeMessageRecord });
                for (const c of clients) {
                  try {
                    if (c.userId === uid && c.ws.readyState === c.ws.OPEN) {
                      c.ws.send(payload);
                    }
                  } catch (err) {
                    console.error('Erro ao enviar welcome para conexão do usuário:', err);
                  }
                }

                try {
                  const updated = await MessageService.findByMessage(uid);
                  ws.send(JSON.stringify({ type: 'history', messages: updated }));
                } catch (e) {
                  console.error('Erro ao enviar histórico atualizado após welcome:', e);
                }
               }
             } catch (error) {
               ws.send(JSON.stringify({ 
                 type: 'error', 
                 message: 'Erro ao carregar histórico do chat.' 
               }));
             } finally {
             }
           } else {
             ws.send(JSON.stringify({ type: 'history', messages: [] }));
           }
         } else if (data.type === 'message') {
           try {
             if (!client.userId) {
               throw new Error('Usuario não identificado');
             }

             const clientMessage = await MessageService.createMessage({
               content: data.content,
               type: 'CLIENTE',
               userId: client.userId
             });
             sendMessageToUser(clientMessage, client.userId);

             const aiResponse = await GeminiService.sendPrompt(data.content, client.userId);
             
             if (aiResponse) {
               const aiMessage = await MessageService.createMessage({
                 content: aiResponse,
                 type: 'IA',
                 userId: client.userId
               });
               sendMessageToUser(aiMessage, client.userId);
             }
           } catch (err) {
             ws.send(JSON.stringify({ 
               type: 'error', 
               message: err instanceof Error ? err.message : 'Erro ao processar mensagem.' 
             }));
           }
         }
       } catch (err) {
         ws.send(JSON.stringify({ 
           type: 'error', 
           message: 'Erro ao processar mensagem.' 
         }));
       }
     });

     ws.on('close', () => {
       const idx = clients.indexOf(client);
       if (idx !== -1) clients.splice(idx, 1);
     });

     ws.send(JSON.stringify({ type: 'info', message: 'Conexão WebSocket estabelecida!' }));
   });
 }

 export function sendMessageToUser(message: any, userId: string | null) {
   const payload = JSON.stringify({ type: 'new_message', message });
   try {
     for (let i = clients.length - 1; i >= 0; i--) {
       const c = clients[i];
       if (c.userId === userId && c.ws.readyState === c.ws.OPEN) {
         c.ws.send(payload);
         return;
       }
     }

     for (const c of clients) {
       try {
         if (c.userId === userId) {
           c.ws.send(payload);
           return;
         }
       } catch (err) {
         
       }
     }
   } catch (err) {
     
   }
 }