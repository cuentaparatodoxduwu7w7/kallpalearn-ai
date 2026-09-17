/**
 * AI Service Layer
 * This module provides stubs for AI functionality.
 * Replace implementations with real API calls when connecting to backend.
 */

import { Flashcard, QuizQuestion, WrittenQuestion, FillBlank, Note, TutorMessage, ResolveResult, Podcast } from '../types';
import { v4 as uuid } from 'uuid';

// Simulated delay
const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

export const aiService = {
  /**
   * Generate flashcards from source material
   * TODO: Connect to LLM API
   */
  async generateFlashcards(_material: string, _count: number = 10): Promise<Flashcard[]> {
    await delay(1500);
    return []; // Will be populated by demo data or real API
  },

  /**
   * Generate quiz questions
   * TODO: Connect to LLM API
   */
  async generateQuiz(_material: string, _count: number = 10): Promise<QuizQuestion[]> {
    await delay(1500);
    return [];
  },

  /**
   * Generate written test questions
   * TODO: Connect to LLM API
   */
  async generateWrittenTest(_material: string): Promise<WrittenQuestion[]> {
    await delay(1500);
    return [];
  },

  /**
   * Generate fill-in-the-blank exercises
   * TODO: Connect to LLM API
   */
  async generateFillBlanks(_material: string): Promise<FillBlank[]> {
    await delay(1500);
    return [];
  },

  /**
   * Generate smart notes
   * TODO: Connect to LLM API
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
   * Chat with AI tutor
   * TODO: Connect to LLM API with RAG from study set materials
   */
  async chatWithTutor(_setId: string, _messages: TutorMessage[], _userMessage: string): Promise<TutorMessage> {
    await delay(1000);
    return {
      id: uuid(),
      role: 'assistant',
      content: 'Esta respuesta será generada por IA cuando conectemos el backend. Por ahora, usa los datos de demostración.',
      timestamp: new Date().toISOString(),
      suggestions: ['Explícalo más simple', 'Dame un ejemplo', 'Hazme una pregunta'],
    };
  },

  /**
   * Evaluate written answer
   * TODO: Connect to LLM API
   */
  async evaluateAnswer(_question: string, _modelAnswer: string, _userAnswer: string): Promise<{ score: number; feedback: string }> {
    await delay(1000);
    return { score: 0, feedback: '' };
  },

  /**
   * Generate podcast audio
   * TODO: Connect to TTS API
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
   * TODO: Connect to Vision API
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
   * TODO: Connect to document processing API
   */
  async processFile(_file: File): Promise<string> {
    await delay(2000);
    return '';
  },
};
