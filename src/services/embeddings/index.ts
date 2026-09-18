/**
 * Embeddings Service
 * Genera embeddings para los chunks de conocimiento
 * En modo demo, genera embeddings simulados
 */

import { KnowledgeChunk } from '../../types';
import { EmbeddingProvider } from '../types';

export class DemoEmbeddingProvider implements EmbeddingProvider {
  id = 'demo';
  name = 'Demo Embeddings';
  dimensions = 384;

  async generateEmbedding(text: string): Promise<number[]> {
    // Simular delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Generar embedding simulado basado en el contenido
    // En producción, usar un modelo real como OpenAI embeddings
    return this.generateMockEmbedding(text);
  }

  async generateEmbeddings(texts: string[]): Promise<number[][]> {
    return Promise.all(texts.map(text => this.generateEmbedding(text)));
  }

  private generateMockEmbedding(text: string): number[] {
    // Crear un embedding determinístico basado en el contenido
    // Esto permite que textos similares tengan embeddings similares
    const embedding: number[] = [];
    const hash = this.simpleHash(text);
    
    for (let i = 0; i < this.dimensions; i++) {
      // Usar hash para generar valores pseudo-aleatorios pero determinísticos
      const value = Math.sin(hash + i) * 0.5 + 0.5;
      embedding.push(value);
    }
    
    // Normalizar el vector
    const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
    return embedding.map(val => val / magnitude);
  }

  private simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }
}

export class EmbeddingsService {
  private provider: EmbeddingProvider;
  private enabled: boolean = true;

  constructor() {
    // Usar proveedor demo por defecto
    this.provider = new DemoEmbeddingProvider();
  }

  /**
   * Establecer proveedor de embeddings
   */
  setProvider(provider: EmbeddingProvider): void {
    this.provider = provider;
  }

  /**
   * Habilitar/deshabilitar generación de embeddings
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  /**
   * Verificar si embeddings están habilitados
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Generar embedding para un chunk
   */
  async generateEmbedding(chunk: KnowledgeChunk): Promise<KnowledgeChunk> {
    if (!this.enabled) {
      return chunk;
    }

    try {
      const embedding = await this.provider.generateEmbedding(chunk.content);
      return {
        ...chunk,
        embedding
      };
    } catch (error) {
      console.error('Error generating embedding:', error);
      return chunk; // Retornar sin embedding si falla
    }
  }

  /**
   * Generar embeddings para múltiples chunks
   */
  async generateEmbeddings(chunks: KnowledgeChunk[]): Promise<KnowledgeChunk[]> {
    if (!this.enabled || chunks.length === 0) {
      return chunks;
    }

    try {
      const texts = chunks.map(chunk => chunk.content);
      const embeddings = await this.provider.generateEmbeddings(texts);
      
      return chunks.map((chunk, index) => ({
        ...chunk,
        embedding: embeddings[index]
      }));
    } catch (error) {
      console.error('Error generating embeddings:', error);
      return chunks; // Retornar chunks sin embeddings si falla
    }
  }

  /**
   * Calcular similitud coseno entre dos embeddings
   */
  cosineSimilarity(embedding1: number[], embedding2: number[]): number {
    if (embedding1.length !== embedding2.length) {
      throw new Error('Embeddings must have the same dimensions');
    }

    let dotProduct = 0;
    let magnitude1 = 0;
    let magnitude2 = 0;

    for (let i = 0; i < embedding1.length; i++) {
      dotProduct += embedding1[i] * embedding2[i];
      magnitude1 += embedding1[i] * embedding1[i];
      magnitude2 += embedding2[i] * embedding2[i];
    }

    magnitude1 = Math.sqrt(magnitude1);
    magnitude2 = Math.sqrt(magnitude2);

    if (magnitude1 === 0 || magnitude2 === 0) {
      return 0;
    }

    return dotProduct / (magnitude1 * magnitude2);
  }

  /**
   * Buscar chunks similares a una consulta
   */
  async searchSimilar(
    query: string,
    chunks: KnowledgeChunk[],
    topK: number = 5
  ): Promise<{ chunk: KnowledgeChunk; similarity: number }[]> {
    if (!this.enabled || chunks.length === 0) {
      return [];
    }

    // Generar embedding de la consulta
    const queryEmbedding = await this.provider.generateEmbedding(query);

    // Calcular similitud con cada chunk
    const similarities = chunks
      .filter(chunk => chunk.embedding)
      .map(chunk => ({
        chunk,
        similarity: this.cosineSimilarity(queryEmbedding, chunk.embedding!)
      }))
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topK);

    return similarities;
  }

  /**
   * Obtener información del proveedor
   */
  getProviderInfo(): { id: string; name: string; dimensions: number } {
    return {
      id: this.provider.id,
      name: this.provider.name,
      dimensions: this.provider.dimensions
    };
  }
}

export const embeddingsService = new EmbeddingsService();
