/**
 * Provider Interfaces
 * Define las interfaces para los proveedores de servicios de IA
 */

// AI Provider - Para generación de contenido
export interface AIProvider {
  id: string;
  name: string;
  
  generateText(prompt: string, options?: GenerateOptions): Promise<string>;
  generateStructured<T>(prompt: string, schema: any): Promise<T>;
  chat(messages: ChatMessage[], options?: GenerateOptions): Promise<string>;
}

export interface GenerateOptions {
  temperature?: number;
  maxTokens?: number;
  model?: string;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

// Embedding Provider - Para generar embeddings de texto
export interface EmbeddingProvider {
  id: string;
  name: string;
  
  generateEmbedding(text: string): Promise<number[]>;
  generateEmbeddings(texts: string[]): Promise<number[][]>;
  dimensions: number;
}

// Transcription Provider - Para audio/video
export interface TranscriptionProvider {
  id: string;
  name: string;
  
  transcribe(audioFile: File | Blob, options?: TranscriptionOptions): Promise<TranscriptionResult>;
}

export interface TranscriptionOptions {
  language?: string;
  timestamps?: boolean;
}

export interface TranscriptionResult {
  text: string;
  segments?: TranscriptionSegment[];
  language?: string;
  duration?: number;
}

export interface TranscriptionSegment {
  start: number;
  end: number;
  text: string;
}

// OCR Provider - Para imágenes
export interface OCRProvider {
  id: string;
  name: string;
  
  extractText(imageFile: File | Blob, options?: OCROptions): Promise<OCRResult>;
}

export interface OCROptions {
  language?: string;
}

export interface OCRResult {
  text: string;
  confidence?: number;
  blocks?: OCRBlock[];
}

export interface OCRBlock {
  text: string;
  bbox?: { x: number; y: number; width: number; height: number };
  confidence?: number;
}

// Storage Provider - Para almacenamiento de archivos
export interface StorageProvider {
  id: string;
  name: string;
  
  upload(file: File, path: string): Promise<string>;
  download(url: string): Promise<Blob>;
  delete(url: string): Promise<void>;
  getSignedUrl(path: string, expiresIn?: number): Promise<string>;
}

// Web Scraper Provider - Para URLs
export interface WebScraperProvider {
  id: string;
  name: string;
  
  scrape(url: string): Promise<WebScrapeResult>;
}

export interface WebScrapeResult {
  title: string;
  content: string;
  metadata?: Record<string, any>;
}

// YouTube Provider - Para videos de YouTube
export interface YouTubeProvider {
  id: string;
  name: string;
  
  getVideoInfo(videoId: string): Promise<YouTubeVideoInfo>;
  getTranscript(videoId: string, language?: string): Promise<TranscriptionResult>;
}

export interface YouTubeVideoInfo {
  id: string;
  title: string;
  description: string;
  duration: number;
  thumbnailUrl: string;
  channelName: string;
}
