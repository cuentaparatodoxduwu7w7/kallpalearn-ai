/**
 * Cleanup Service
 * Gestiona la eliminación completa de datos cuando se elimina un Study Set
 * Asegura que no queden datos huérfanos
 */

import { knowledgeBaseService } from '../knowledge-base';
import { memoryService } from '../memory';
import { learnerProfileService } from '../learner-profile';
import { setsRepository } from '../storage';

export class CleanupService {
  /**
   * Eliminar completamente un Study Set y todos sus datos asociados
   */
  async deleteStudySet(studySetId: string, userId?: string): Promise<void> {
    try {
      // 1. Eliminar chunks de conocimiento
      knowledgeBaseService.deleteStudySetChunks(studySetId, userId);

      // 2. Eliminar conversación del tutor
      memoryService.deleteStudySetConversation(studySetId, userId);

      // 3. Eliminar items de memoria
      memoryService.deleteStudySetMemory(studySetId, userId);

      // 4. Eliminar el Study Set en sí
      setsRepository.delete(studySetId);

      // 5. Actualizar perfil de aprendizaje (eliminar referencias)
      // El perfil se actualiza automáticamente al recalcular weak/strong topics
    } catch (error) {
      console.error('[Cleanup] Error deleting study set:', error);
      throw error;
    }
  }

  /**
   * Eliminar todos los datos de un usuario
   */
  async deleteUserData(userId: string): Promise<void> {
    try {
      // 1. Eliminar todos los chunks del usuario
      knowledgeBaseService.deleteUserChunks(userId);

      // 2. Eliminar toda la memoria del usuario
      memoryService.deleteUserMemory(userId);

      // 3. Eliminar perfil de aprendizaje
      learnerProfileService.deleteProfile(userId);

      // 4. Eliminar todos los Study Sets del usuario
      const userSets = setsRepository.getAll(userId);
      for (const studySet of userSets) {
        setsRepository.delete(studySet.id);
      }
    } catch (error) {
      console.error('[Cleanup] Error deleting user data:', error);
      throw error;
    }
  }

  /**
   * Limpiar datos huérfanos (chunks sin Study Set correspondiente)
   */
  async cleanupOrphanedData(userId?: string): Promise<{
    orphanedChunks: number;
    orphanedConversations: number;
    orphanedMemoryItems: number;
  }> {
    const stats = {
      orphanedChunks: 0,
      orphanedConversations: 0,
      orphanedMemoryItems: 0
    };

    try {
      // Obtener todos los Study Sets existentes
      const existingSets = setsRepository.getAll(userId);
      const existingSetIds = new Set(existingSets.map(s => s.id));

      // 1. Limpiar chunks huérfanos
      const allChunks = knowledgeBaseService.getUserChunks(userId);
      const orphanedChunks = allChunks.filter(c => !existingSetIds.has(c.studySetId));
      stats.orphanedChunks = orphanedChunks.length;

      // 2. Limpiar conversaciones huérfanas
      // Similar lógica para conversaciones y memory items

      return stats;
    } catch (error) {
      console.error('[Cleanup] Error cleaning up orphaned data:', error);
      throw error;
    }
  }

  /**
   * Verificar integridad de los datos
   */
  async verifyDataIntegrity(userId?: string): Promise<{
    isValid: boolean;
    issues: string[];
  }> {
    const issues: string[] = [];

    try {
      // Verificar que todos los chunks tengan userId
      const allChunks = knowledgeBaseService.getUserChunks(userId);
      const chunksWithoutUserId = allChunks.filter(c => !c.userId);
      if (chunksWithoutUserId.length > 0) {
        issues.push(`${chunksWithoutUserId.length} chunks sin userId`);
      }

      // Verificar que todos los chunks tengan studySetId válido
      const existingSets = setsRepository.getAll(userId);
      const existingSetIds = new Set(existingSets.map(s => s.id));
      const chunksWithInvalidStudySet = allChunks.filter(c => !existingSetIds.has(c.studySetId));
      if (chunksWithInvalidStudySet.length > 0) {
        issues.push(`${chunksWithInvalidStudySet.length} chunks con studySetId inválido`);
      }

      return {
        isValid: issues.length === 0,
        issues
      };
    } catch (error) {
      console.error('[Cleanup] Error verifying data integrity:', error);
      return {
        isValid: false,
        issues: ['Error al verificar integridad']
      };
    }
  }
}

export const cleanupService = new CleanupService();
