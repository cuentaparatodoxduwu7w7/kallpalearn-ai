/**
 * AI Service - Legacy compatibility layer
 * Mantiene compatibilidad con el código existente mientras usa el nuevo router
 */

import { aiRouter } from './router';
import { Flashcard, QuizQuestion, WrittenQuestion, FillBlank, Note, TutorMessage, Podcast, ResolveResult } from '../../types';
import { v4 as uuid } from 'uuid';

// Simulated delay
const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

export const aiService = {
  /**
   * Generate flashcards from source material
   */
  async generateFlashcards(_material: string, _count: number = 10): Promise<Flashcard[]> {
    await delay(1500);
    return []; // Will be populated by demo data or real API
  },

  /**
   * Generate quiz questions
   */
  async generateQuiz(_material: string, _count: number = 10): Promise<QuizQuestion[]> {
    await delay(1500);
    return [];
  },

  /**
   * Generate written test questions
   */
  async generateWrittenTest(_material: string): Promise<WrittenQuestion[]> {
    await delay(1500);
    return [];
  },

  /**
   * Generate fill-in-the-blank exercises
   */
  async generateFillBlanks(_material: string): Promise<FillBlank[]> {
    await delay(1500);
    return [];
  },

  /**
   * Generate smart notes
   */
  async generateNotes(_material: string): Promise<Note> {
    await delay(1500);
    return {
      id: uuid(),
      title: '',
      summary: '',
      mainConcepts: [],
      definitions: [],
      examples: [],
      keyPoints: [],
      customContent: '',
    };
  },

  /**
   * Chat with AI tutor - Now uses the router
   */
  async chatWithTutor(_setId: string, messages: TutorMessage[], userMessage: string): Promise<TutorMessage> {
    // Convertir mensajes al formato del router
    const chatMessages = messages.map(m => ({
      role: m.role as 'user' | 'assistant',
      content: m.content
    }));
    
    chatMessages.push({ role: 'user' as const, content: userMessage });
    
    const response = await aiRouter.chat(chatMessages);
    
    return {
      id: uuid(),
      role: 'assistant',
      content: response,
      timestamp: new Date().toISOString(),
      suggestions: ['Explícalo más simple', 'Dame un ejemplo', 'Hazme una pregunta'],
    };
  },

  /**
   * Evaluate written answer
   */
  async evaluateAnswer(_question: string, _modelAnswer: string, _userAnswer: string): Promise<{ score: number; feedback: string }> {
    await delay(1000);
    return { score: 0, feedback: '' };
  },

  /**
   * Generate podcast audio
   */
  async generatePodcast(_material: string, _title: string): Promise<Podcast> {
    await delay(2000);
    return {
      id: uuid(),
      title: '',
      description: '',
      duration: 0,
      status: 'generating',
    };
  },

  /**
   * Solve problem from image
   */
  async solveFromImage(_imageUrl: string): Promise<ResolveResult> {
    await delay(2000);
    return {
      id: uuid(),
      imageUrl: '',
      detectedProblem: '',
      solution: '',
      steps: [],
      explanation: '',
      followUpQuestions: [],
    };
  },

  /**
   * Process uploaded file and extract text
   */
  async processFile(_file: File): Promise<string> {
    await delay(2000);
    return '';
  },

  /**
   * Get provider info
   */
  getProviderInfo() {
    return aiRouter.getProviderInfo();
  },

  /**
   * Check if in demo mode
   */
  isDemoMode(): boolean {
    return aiRouter.isDemoMode();
  }
};
