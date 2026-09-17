/**
 * Knowledge Base Service
 * Gestiona el almacenamiento y recuperación de chunks de conocimiento
 * con aislamiento por usuario y Study Set
 */

import { KnowledgeChunk } from '../../types';
import { authRepository } from '../storage';

export class KnowledgeBaseService {
  private readonly STORAGE_KEY = 'kl_knowledge_base';

  /**
   * Obtener todos los chunks del usuario actual
   */
  getUserChunks(userId?: string): KnowledgeChunk[] {
    const currentUserId = userId || authRepository.getUser()?.id;
    if (!currentUserId) return [];

    const allChunks = this.getAllChunks();
    return allChunks.filter(chunk => chunk.userId === currentUserId);
  }

  /**
   * Obtener chunks de un Study Set específico
   */
  getStudySetChunks(studySetId: string, userId?: string): KnowledgeChunk[] {
    const currentUserId = userId || authRepository.getUser()?.id;
    if (!currentUserId) return [];

    const userChunks = this.getUserChunks(currentUserId);
    return userChunks.filter(chunk => chunk.studySetId === studySetId);
  }

  /**
   * Obtener chunks de una fuente específica
   */
  getSourceChunks(sourceId: string, userId?: string): KnowledgeChunk[] {
    const currentUserId = userId || authRepository.getUser()?.id;
    if (!currentUserId) return [];

    const userChunks = this.getUserChunks(currentUserId);
    return userChunks.filter(chunk => chunk.sourceId === sourceId);
  }

  /**
   * Obtener un chunk por ID
   */
  getChunkById(chunkId: string, userId?: string): KnowledgeChunk | null {
    const currentUserId = userId || authRepository.getUser()?.id;
    if (!currentUserId) return null;

    const userChunks = this.getUserChunks(currentUserId);
    return userChunks.find(chunk => chunk.id === chunkId) || null;
  }

  /**
   * Guardar chunks (agregar o actualizar)
   */
  saveChunks(chunks: KnowledgeChunk[]): void {
    const allChunks = this.getAllChunks();
    
    for (const newChunk of chunks) {
      const existingIndex = allChunks.findIndex(c => c.id === newChunk.id);
      if (existingIndex >= 0) {
        allChunks[existingIndex] = newChunk;
      } else {
        allChunks.push(newChunk);
      }
    }

    this.setAllChunks(allChunks);
  }

  /**
   * Eliminar chunks de un Study Set
   */
  deleteStudySetChunks(studySetId: string, userId?: string): void {
    const currentUserId = userId || authRepository.getUser()?.id;
    if (!currentUserId) return;

    const allChunks = this.getAllChunks();
    const filtered = allChunks.filter(
      chunk => !(chunk.userId === currentUserId && chunk.studySetId === studySetId)
    );
    this.setAllChunks(filtered);
  }

  /**
   * Eliminar todos los chunks del usuario
   */
  deleteUserChunks(userId?: string): void {
    const currentUserId = userId || authRepository.getUser()?.id;
    if (!currentUserId) return;

    const allChunks = this.getAllChunks();
    const filtered = allChunks.filter(chunk => chunk.userId !== currentUserId);
    this.setAllChunks(filtered);
  }

  /**
   * Obtener estadísticas de la base de conocimiento
   */
  getStats(userId?: string): {
    totalChunks: number;
    studySetsCount: number;
    sourcesCount: number;
    chunksWithEmbeddings: number;
  } {
    const chunks = this.getUserChunks(userId);
    const studySetIds = new Set(chunks.map(c => c.studySetId));
    const sourceIds = new Set(chunks.map(c => c.sourceId));
    const withEmbeddings = chunks.filter(c => c.embedding && c.embedding.length > 0).length;

    return {
      totalChunks: chunks.length,
      studySetsCount: studySetIds.size,
      sourcesCount: sourceIds.size,
      chunksWithEmbeddings: withEmbeddings
    };
  }

  /**
   * Obtener todos los chunks (uso interno)
   */
  private getAllChunks(): KnowledgeChunk[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  /**
   * Guardar todos los chunks (uso interno)
   */
  private setAllChunks(chunks: KnowledgeChunk[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(chunks));
    } catch (error) {
      console.error('Error saving knowledge base:', error);
    }
  }
}

export const knowledgeBaseService = new KnowledgeBaseService();
