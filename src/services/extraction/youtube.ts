/**
 * YouTube Service
 * Servicio para obtener y transcribir videos de YouTube
 * Requiere backend autorizado para funcionar en producción
 */

import { YouTubeProvider, YouTubeVideoInfo, TranscriptionResult } from '../types';

export class DemoYouTubeProvider implements YouTubeProvider {
  id = 'demo';
  name = 'Demo YouTube';

  async getVideoInfo(videoId: string): Promise<YouTubeVideoInfo> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      id: videoId,
      title: 'Video de demostración',
      description: 'Este es un video de demostración. En producción, se obtendría la información real del video de YouTube.',
      duration: 300,
      thumbnailUrl: '',
      channelName: 'Canal Demo'
    };
  }

  async getTranscript(videoId: string, language?: string): Promise<TranscriptionResult> {
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    return {
      text: `[Transcripción de YouTube de demostración]\n\nBienvenidos a este video educativo. Hoy vamos a aprender sobre conceptos importantes.\n\n[00:00] Introducción al tema\n[00:30] Primer punto importante\n[01:00] Segundo punto importante\n[01:30] Ejemplos prácticos\n[02:00] Conclusión\n\nEste contenido es una demostración. Para obtener transcripciones reales de videos de YouTube, se requiere un backend autorizado con acceso a la API de YouTube.`,
      language: language || 'es',
      duration: 120,
      segments: [
        { start: 0, end: 30, text: 'Introducción al tema' },
        { start: 30, end: 60, text: 'Primer punto importante' },
        { start: 60, end: 90, text: 'Segundo punto importante' },
        { start: 90, end: 120, text: 'Conclusión' }
      ]
    };
  }
}

export class YouTubeService {
  private provider: YouTubeProvider;

  constructor() {
    this.provider = new DemoYouTubeProvider();
  }

  setProvider(provider: YouTubeProvider): void {
    this.provider = provider;
  }

  /**
   * Extraer video ID de una URL de YouTube
   */
  extractVideoId(url: string): string | null {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/shorts\/([^&\n?#]+)/
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }

    return null;
  }

  /**
   * Obtener información del video
   */
  async getVideoInfo(url: string): Promise<YouTubeVideoInfo | null> {
    const videoId = this.extractVideoId(url);
    if (!videoId) return null;

    try {
      return await this.provider.getVideoInfo(videoId);
    } catch (error) {
      console.error('Error getting video info:', error);
      return null;
    }
  }

  /**
   * Obtener transcripción del video
   */
  async getTranscript(url: string, language?: string): Promise<TranscriptionResult | null> {
    const videoId = this.extractVideoId(url);
    if (!videoId) return null;

    try {
      return await this.provider.getTranscript(videoId, language);
    } catch (error) {
      console.error('Error getting transcript:', error);
      return null;
    }
  }

  /**
   * Verificar si el servicio está disponible
   */
  isAvailable(): boolean {
    return this.provider.id !== 'demo';
  }
}

export const youtubeService = new YouTubeService();
