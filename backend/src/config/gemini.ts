import { GoogleGenerativeAI } from '@google/generative-ai';

if (!process.env.GEMINI_API_KEY) {
  console.error('AVISO: GEMINI_API_KEY não encontrada nas variáveis de ambiente!');
}

console.log('Inicializando configuração do Gemini...');

export const geminiAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

console.log('Configuração do Gemini inicializada!');
