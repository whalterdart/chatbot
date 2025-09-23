import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';

interface Message {
  id: string;
  content: string;
  type: 'CLIENTE' | 'IA';
  createdAt: string;
  userId?: string;
}

export default function ChatPage() {
  const navigate = useNavigate();
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const wsRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const nomeStorage = localStorage.getItem('nome');
    const telefoneStorage = localStorage.getItem('telefone');

    if (!nomeStorage || !telefoneStorage) {
      navigate('/');
      return;
    }

    setNome(nomeStorage);
    setTelefone(telefoneStorage);

    const ensureUser = async (): Promise<string | null> => {
      const existing = localStorage.getItem('userId');
      if (existing) return existing;

      try {
        const resp = await fetch(`/users?telefone=${encodeURIComponent(telefoneStorage)}`);
        if (resp.ok) {
          const data = await resp.json();
          if (data && data.id) {
            localStorage.setItem('userId', data.id);
            return data.id;
          }
        }

        const createResp = await fetch('api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nome: nomeStorage, telefone: telefoneStorage })
        });

        if (createResp.ok) {
          const created = await createResp.json();
          if (created && created.id) {
            localStorage.setItem('userId', created.id);
            return created.id;
          }
        }
      } catch (err) {

      }

      return null;
    };

    let mounted = true;
    let wsInstance: WebSocket | null = null;

    (async () => {
      const cleanupConnection = () => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.close();
        }
        wsRef.current = null;
      };

      cleanupConnection();

      const userId = await ensureUser();
      if (!mounted) return;

      wsInstance = new WebSocket('ws://localhost:3001');
      wsRef.current = wsInstance;

      wsInstance.onopen = () => {
        if (!mounted) {
          cleanupConnection();
          return;
        }
        const uid = userId || localStorage.getItem('userId') || null;
        wsInstance?.send(JSON.stringify({ type: 'identify', userId: uid }));
      };

      wsInstance.onmessage = (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data);
          const currentUserId = localStorage.getItem('userId');

          if (data.type === 'history') {
            const userMessages = data.messages.filter((msg: Message) => msg.userId === currentUserId);
            setMessages(userMessages);
          } else if (data.type === 'new_message' && data.message) {
            if (data.message.userId === currentUserId) {
              setMessages(prev => {
                if (prev.some(m => m.id === data.message.id)) {
                  return prev;
                }
                return [...prev, data.message];
              });
            }
          }
        } catch (e) {

        }
      };

      wsInstance.onerror = (err: Event) => { };

      return () => {
        mounted = false;
        if (wsInstance) {
          try {
            wsInstance.close();
          } catch (e) {

          }
        }
        wsRef.current = null;
      };
    })();
  }, [navigate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !wsRef.current) return;

    const userId = localStorage.getItem('userId');
    if (!userId) {
      return;
    }

    wsRef.current.send(JSON.stringify({
      type: 'message',
      content: newMessage,
      messageType: 'CLIENTE',
      userId
    }));

    setNewMessage('');
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(120deg, #f7b733 0%, #fc4a1a 100%)',
      padding: '16px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: 624,
        height: '90vh',
        borderRadius: 24,
        background: '#fff',
        boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>

        <div style={{
          background: 'linear-gradient(135deg, #fc4a1a 0%, #f7b733 100%)',
          color: 'white',
          padding: '24px',
          textAlign: 'center',
          position: 'relative'
        }}>
          <div style={{
            position: 'absolute',
            top: '16px',
            left: '16px',
            cursor: 'pointer',
            fontSize: '20px'
          }} onClick={() => navigate('/')}>
            ← Voltar
          </div>
          <h2 style={{
            margin: 0,
            fontWeight: 700,
            fontSize: '24px',
            marginBottom: '8px'
          }}>
            Atendimento Virtual
          </h2>
          <div style={{
            fontSize: '14px',
            opacity: 0.9,
            display: 'flex',
            justifyContent: 'center',
            gap: '16px'
          }}>
            <span><strong>{nome}</strong></span>
            <span>{telefone}</span>
          </div>
        </div>

        <div style={{
          flex: 1,
          padding: '24px',
          overflowY: 'auto',
          background: '#f8f9fa',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {messages.length === 0 ? (
            <div style={{
              textAlign: 'center',
              color: '#6c757d',
              fontSize: '16px',
              marginTop: 'auto',
              marginBottom: 'auto'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>💬</div>
              Olá! Como posso te ajudar hoje?
            </div>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} style={{
                display: 'flex',
                justifyContent: msg.type === 'CLIENTE' ? 'flex-end' : 'flex-start',
                marginBottom: '16px'
              }}>
                <div style={{
                  maxWidth: '85%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: msg.type === 'CLIENTE' ? 'flex-end' : 'flex-start'
                }}>
                  <div style={{
                    fontSize: '12px',
                    color: '#6c757d',
                    marginBottom: '4px',
                    paddingLeft: msg.type === 'CLIENTE' ? '0' : '12px',
                    paddingRight: msg.type === 'CLIENTE' ? '12px' : '0'
                  }}>
                    {msg.type === 'CLIENTE' ? 'Você' : 'Assistente'} • {formatTime(msg.createdAt)}
                  </div>

                  <div style={{
                    background: msg.type === 'CLIENTE'
                      ? 'linear-gradient(135deg, #fc4a1a 0%, #f7b733 100%)'
                      : '#ffffff',
                    color: msg.type === 'CLIENTE' ? 'white' : '#333',
                    padding: '12px 16px',
                    borderRadius: msg.type === 'CLIENTE'
                      ? '20px 20px 6px 20px'
                      : '20px 20px 20px 6px',
                    boxShadow: msg.type === 'CLIENTE'
                      ? '0 4px 12px rgba(252, 74, 26, 0.3)'
                      : '0 2px 8px rgba(0,0,0,0.1)',
                    border: msg.type === 'IA' ? '1px solid #e9ecef' : 'none',
                    fontSize: '16px',
                    lineHeight: '1.5',
                    wordWrap: 'break-word'
                  }}>
                    {msg.type === 'CLIENTE' ? (
                      msg.content
                    ) : (
                      <ReactMarkdown
                        components={{
                          p: ({ node, ...props }) => <p style={{ margin: '0.5em 0' }} {...props} />,
                          strong: ({ node, ...props }) => (
                            <strong style={{
                              color: '#fc4a1a',
                              fontWeight: '600'
                            }} {...props} />
                          ),
                          em: ({ node, ...props }) => (
                            <em style={{
                              fontStyle: 'italic',
                              color: '#2c3e50'
                            }} {...props} />
                          ),
                          ul: ({ node, ...props }) => (
                            <ul style={{
                              marginLeft: '20px',
                              marginTop: '0.5em',
                              marginBottom: '0.5em'
                            }} {...props} />
                          ),
                          li: ({ node, ...props }) => (
                            <li style={{
                              marginBottom: '0.2em'
                            }} {...props} />
                          )
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        <div style={{
          padding: '20px',
          background: '#fff',
          borderTop: '1px solid #e9ecef'
        }}>
          <form onSubmit={sendMessage} style={{
            display: 'flex',
            gap: '12px',
            alignItems: 'flex-end'
          }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage(e);
                  }
                }}
                placeholder="Digite sua mensagem... (Enter para enviar)"
                rows={1}
                style={{
                  width: '100%',
                  minHeight: '44px',
                  maxHeight: '120px',
                  padding: '12px 50px 12px 16px',
                  borderRadius: '22px',
                  border: '2px solid #e9ecef',
                  outline: 'none',
                  fontSize: '15px',
                  fontFamily: 'inherit',
                  resize: 'none',
                  backgroundColor: '#f8f9fa',
                  transition: 'all 0.2s ease',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#fc4a1a';
                  e.target.style.backgroundColor = '#fff';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e9ecef';
                  e.target.style.backgroundColor = '#f8f9fa';
                }}
              />

              <button
                type="submit"
                disabled={!newMessage.trim()}
                style={{
                  position: 'absolute',
                  right: '8px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: newMessage.trim()
                    ? 'linear-gradient(135deg, #fc4a1a 0%, #f7b733 100%)'
                    : '#ccc',
                  color: 'white',
                  border: 'none',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  cursor: newMessage.trim() ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '16px',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  if (newMessage.trim()) {
                    e.currentTarget.style.transform = 'translateY(-50%) scale(1.05)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
                }}
              >
                ↑
              </button>
            </div>
          </form>

          <div style={{
            fontSize: '12px',
            color: '#6c757d',
            textAlign: 'center',
            marginTop: '8px'
          }}>
            Shift + Enter para nova linha
          </div>
        </div>
      </div>
    </div>
  );
}