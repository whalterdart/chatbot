# 🍕 ChatBot - Sistema de Atendimento Virtual para Pizzaria

Um sistema completo de atendimento virtual para pizzaria, desenvolvido com React, Node.js, WebSocket e integração com Google Gemini AI para proporcionar uma experiência de chat interativa e inteligente.


## 🎯 Visão Geral

O **Chatbot** é um sistema de atendimento virtual inteligente para pizzarias que combina:

- **Interface Web Moderna**: Chat em tempo real com design responsivo
- **Inteligência Artificial**: Integração com Google Gemini para respostas contextuais
- **Persistência de Dados**: Histórico completo de conversas e usuários
- **WebSocket**: Comunicação em tempo real entre cliente e servidor
- **Docker**: Containerização para fácil deploy e desenvolvimento

## 🛠 Tecnologias Utilizadas

### Frontend
- **React 19** - Framework JavaScript
- **TypeScript** - Tipagem estática
- **React Router DOM** - Roteamento
- **React Markdown** - Renderização de markdown
- **CSS-in-JS** - Estilização inline

### Backend
- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **TypeScript** - Tipagem estática
- **WebSocket (ws)** - Comunicação em tempo real
- **Prisma** - ORM para banco de dados
- **PostgreSQL** - Banco de dados relacional

### IA e Serviços
- **Google Gemini AI** - Processamento de linguagem natural
- **CORS** - Cross-origin resource sharing

### DevOps
- **Docker** - Containerização
- **Docker Compose** - Orquestração de containers

## 🏗 Arquitetura do Sistema

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (React)       │◄──►│   (Node.js)     │◄──►│   (PostgreSQL)  │
│   Port: 3000    │    │   Port: 3001    │    │   Port: 5432    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │
         │              ┌─────────────────┐
         └──────────────►│   WebSocket     │
                        │   (Real-time)   │
                        └─────────────────┘
                                 │
                        ┌─────────────────┐
                        │   Google Gemini │
                        │   AI Service    │
                        └─────────────────┘
```

## ✨ Funcionalidades

### 🎨 Interface do Usuário
- **Login/Cadastro**: Sistema de autenticação por nome e telefone
- **Chat em Tempo Real**: Interface de chat moderna e responsiva
- **Histórico Persistente**: Conversas salvas e recuperadas automaticamente
- **Design Responsivo**: Funciona em desktop e mobile
- **Markdown Support**: Mensagens da IA com formatação rica

### 🤖 Inteligência Artificial
- **Atendente Virtual**: IA especializada em atendimento de pizzaria
- **Contexto Persistente**: Mantém o contexto da conversa
- **Cardápio Integrado**: Conhecimento completo do menu
- **Boas-vindas Automáticas**: Mensagem inicial personalizada
- **Respostas Contextuais**: Entende o fluxo da conversa

### 🔧 Funcionalidades Técnicas
- **WebSocket**: Comunicação bidirecional em tempo real
- **API RESTful**: Endpoints para gerenciamento de usuários e mensagens
- **Banco de Dados**: Persistência de usuários e histórico de conversas
- **Docker**: Ambiente containerizado para desenvolvimento e produção

## 🚀 Instalação e Configuração

### Pré-requisitos
- Node.js 18+
- Docker e Docker Compose
- Conta no Google AI Studio - Altere o env com seu GEMINI_API_KEY

### 1. Clone o Repositório
```bash
git https://github.com/whalterdart/chatbot
cd pagana
```
## ⚙️ Configuração do Ambiente

### 2. Variáveis de Ambiente do Backend
Configure o arquivo `backend/.env`:

```env
# Database
DATABASE_URL="postgresql://postgres:pagana@db:5432/pagana?schema=public"

# Google Gemini AI
GEMINI_API_KEY="sua_chave_do_gemini_aqui"

# Server
PORT=3001
```

### 2. Obter Chave da API Gemini
1. Acesse [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Crie uma nova API key
3. Adicione a chave no arquivo `.env`

## 🏃‍♂️ Executando o Projeto

### Opção 1: Docker Compose (Recomendado)
```bash
# Na raiz do projeto
docker-compose up --build
```

### Acessando a Aplicação
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **WebSocket**: ws://localhost:3001


## 💻 Desenvolvimento

### Estrutura do Projeto
```
pagana/
├── backend/
│   ├── src/
│   │   ├── modules/          # Módulos da aplicação
│   │   │   ├── user/         # Gerenciamento de usuários
│   │   │   └── message/      # Gerenciamento de mensagens
│   │   ├── services/         # Serviços externos
│   │   │   └── gemini.service.ts
│   │   ├── ws/              # WebSocket
│   │   │   └── index.ts
│   │   └── server.ts        # Servidor principal
│   ├── prisma/              # Schema e migrações
│   └── dockerfile
├── frontend/
│   ├── src/
│   │   ├── pages/           # Páginas da aplicação
│   │   │   ├── UserLogin.tsx
│   │   │   └── ChatPage.tsx
│   │   └── App.tsx
│   └── dockerfile
└── docker-compose.yml
```
