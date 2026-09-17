/**
 * Chunking Service
 * Divide el contenido en fragmentos manejables
 */

import { KnowledgeChunk } from '../../types';

export interface ChunkingOptions {
  maxChunkSize?: number; // Caracteres máximos por chunk
  overlap?: number; // Caracteres de superposición entre chunks
  respectSentences?: boolean; // Respetar límites de oraciones
  respectParagraphs?: boolean; // Respetar límites de párrafos
}

export class ChunkingService {
  private defaultOptions: ChunkingOptions = {
    maxChunkSize: 1000,
    overlap: 100,
    respectSentences: true,
    respectParagraphs: true
  };

  /**
   * Dividir contenido en chunks
   */
  chunk(
    content: string,
    userId: string,
    studySetId: string,
    sourceId: string,
    options: ChunkingOptions = {}
  ): KnowledgeChunk[] {
    const opts = { ...this.defaultOptions, ...options };
    const chunks: KnowledgeChunk[] = [];

    if (!content || content.trim().length === 0) {
      return chunks;
    }

    // Dividir por párrafos primero si está habilitado
    if (opts.respectParagraphs) {
      const paragraphs = content.split(/\n\s*\n/);
      let currentChunk = '';
      let paragraphIndex = 0;

      for (const paragraph of paragraphs) {
        // Si el párrafo es muy largo, dividirlo
        if (paragraph.length > opts.maxChunkSize!) {
          // Guardar chunk actual si existe
          if (currentChunk.trim()) {
            chunks.push(this.createChunk(currentChunk, userId, studySetId, sourceId, paragraphIndex));
            currentChunk = '';
          }
          // Dividir párrafo largo
          const subChunks = this.splitLongText(paragraph, opts);
          chunks.push(...subChunks.map(text => 
            this.createChunk(text, userId, studySetId, sourceId, paragraphIndex)
          ));
        } else if (currentChunk.length + paragraph.length > opts.maxChunkSize!) {
          // Guardar chunk actual y empezar nuevo
          if (currentChunk.trim()) {
            chunks.push(this.createChunk(currentChunk, userId, studySetId, sourceId, paragraphIndex));
          }
          currentChunk = paragraph;
        } else {
          // Agregar párrafo al chunk actual
          currentChunk += (currentChunk ? '\n\n' : '') + paragraph;
        }
        paragraphIndex++;
      }

      // Guardar último chunk
      if (currentChunk.trim()) {
        chunks.push(this.createChunk(currentChunk, userId, studySetId, sourceId, paragraphIndex));
      }
    } else {
      // Dividir por tamaño sin respetar párrafos
      const textChunks = this.splitLongText(content, opts);
      chunks.push(...textChunks.map((text, i) => 
        this.createChunk(text, userId, studySetId, sourceId, i)
      ));
    }

    return chunks;
  }

  /**
   * Dividir texto largo en partes más pequeñas
   */
  private splitLongText(text: string, options: ChunkingOptions): string[] {
    const chunks: string[] = [];
    const maxSize = options.maxChunkSize!;
    const overlap = options.overlap!;

    if (options.respectSentences) {
      // Dividir por oraciones
      const sentences = this.splitIntoSentences(text);
      let currentChunk = '';

      for (const sentence of sentences) {
        if (currentChunk.length + sentence.length > maxSize) {
          if (currentChunk.trim()) {
            chunks.push(currentChunk.trim());
          }
          // Agregar overlap
          const overlapText = currentChunk.slice(-overlap);
          currentChunk = overlapText + sentence;
        } else {
          currentChunk += (currentChunk ? ' ' : '') + sentence;
        }
      }

      if (currentChunk.trim()) {
        chunks.push(currentChunk.trim());
      }
    } else {
      // Dividir por caracteres
      for (let i = 0; i < text.length; i += maxSize - overlap) {
        const chunk = text.slice(i, i + maxSize);
        if (chunk.trim()) {
          chunks.push(chunk.trim());
        }
      }
    }

    return chunks;
  }

  /**
   * Dividir texto en oraciones
   */
  private splitIntoSentences(text: string): string[] {
    // Dividir por puntos, signos de exclamación e interrogación
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    return sentences.map(s => s.trim()).filter(s => s.length > 0);
  }

  /**
   * Crear objeto KnowledgeChunk
   */
  private createChunk(
    content: string,
    userId: string,
    studySetId: string,
    sourceId: string,
    index: number
  ): KnowledgeChunk {
    return {
      id: `chunk_${Date.now()}_${index}`,
      userId,
      studySetId,
      sourceId,
      content: content.trim(),
      metadata: {
        section: `Chunk ${index + 1}`
      },
      createdAt: new Date().toISOString()
    };
  }

  /**
   * Obtener estadísticas de chunking
   */
  getStats(chunks: KnowledgeChunk[]): {
    totalChunks: number;
    avgChunkSize: number;
    totalCharacters: number;
  } {
    if (chunks.length === 0) {
      return { totalChunks: 0, avgChunkSize: 0, totalCharacters: 0 };
    }

    const totalCharacters = chunks.reduce((sum, chunk) => sum + chunk.content.length, 0);
    return {
      totalChunks: chunks.length,
      avgChunkSize: Math.round(totalCharacters / chunks.length),
      totalCharacters
    };
  }
}

export const chunkingService = new ChunkingService();
