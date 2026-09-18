/**
 * Memory Service
 * Gestiona la memoria del tutor: conversaciones y items de memoria
 * Permite al tutor recordar el contexto y las interacciones previas
 */

import { TutorConversation, TutorMessage, MemoryItem, ConversationContext } from '../../types';
import { authRepository } from '../storage';

export class MemoryService {
  private readonly CONVERSATIONS_KEY = 'kl_tutor_conversations';
  private readonly MEMORY_ITEMS_KEY = 'kl_memory_items';

  /**
   * Obtener conversación activa de un Study Set
   */
  getActiveConversation(studySetId: string, userId?: string): TutorConversation | null {
    const currentUserId = userId || authRepository.getUser()?.id;
    if (!currentUserId) return null;

    const conversations = this.getAllConversations();
    return conversations.find(
      c => c.userId === currentUserId && c.studySetId === studySetId
    ) || null;
  }

  /**
   * Crear o actualizar conversación
   */
  saveConversation(conversation: TutorConversation): void {
    const conversations = this.getAllConversations();
    const existingIndex = conversations.findIndex(c => c.id === conversation.id);

    if (existingIndex >= 0) {
      conversations[existingIndex] = conversation;
    } else {
      conversations.push(conversation);
    }

    this.setAllConversations(conversations);
  }

  /**
   * Agregar mensaje a una conversación
   */
  addMessageToConversation(
    conversationId: string,
    message: TutorMessage,
    userId?: string
  ): void {
    const conversations = this.getAllConversations();
    const conversation = conversations.find(c => c.id === conversationId);

    if (conversation) {
      conversation.messages.push(message);
      conversation.updatedAt = new Date().toISOString();
      this.setAllConversations(conversations);
    }
  }

  /**
   * Crear nueva conversación
   */
  createConversation(
    studySetId: string,
    userId?: string,
    context?: Partial<ConversationContext>
  ): TutorConversation {
    const currentUserId = userId || authRepository.getUser()?.id;
    if (!currentUserId) {
      throw new Error('User not authenticated');
    }

    const conversation: TutorConversation = {
      id: `conv_${Date.now()}_${Math.random()}`,
      userId: currentUserId,
      studySetId,
      messages: [],
      context: {
        activeStudySetId: studySetId,
        relevantChunks: [],
        ...context
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.saveConversation(conversation);
    return conversation;
  }

  /**
   * Actualizar contexto de la conversación
   */
  updateConversationContext(
    conversationId: string,
    contextUpdates: Partial<ConversationContext>
  ): void {
    const conversations = this.getAllConversations();
    const conversation = conversations.find(c => c.id === conversationId);

    if (conversation) {
      conversation.context = {
        ...conversation.context,
        ...contextUpdates
      };
      conversation.updatedAt = new Date().toISOString();
      this.setAllConversations(conversations);
    }
  }

  /**
   * Obtener historial reciente de conversación
   */
  getRecentMessages(conversationId: string, limit: number = 10): TutorMessage[] {
    const conversations = this.getAllConversations();
    const conversation = conversations.find(c => c.id === conversationId);

    if (!conversation) return [];

    return conversation.messages.slice(-limit);
  }

  /**
   * Guardar item de memoria
   */
  saveMemoryItem(item: MemoryItem): void {
    const items = this.getAllMemoryItems();
    const existingIndex = items.findIndex(i => i.id === item.id);

    if (existingIndex >= 0) {
      items[existingIndex] = item;
    } else {
      items.push(item);
    }

    this.setAllMemoryItems(items);
  }

  /**
   * Crear item de memoria
   */
  createMemoryItem(
    studySetId: string,
    type: MemoryItem['type'],
    content: string,
    metadata: Record<string, any> = {},
    importance: number = 0.5,
    userId?: string
  ): MemoryItem {
    const currentUserId = userId || authRepository.getUser()?.id;
    if (!currentUserId) {
      throw new Error('User not authenticated');
    }

    const item: MemoryItem = {
      id: `memory_${Date.now()}_${Math.random()}`,
      userId: currentUserId,
      studySetId,
      type,
      content,
      metadata,
      importance,
      createdAt: new Date().toISOString()
    };

    this.saveMemoryItem(item);
    return item;
  }

  /**
   * Obtener items de memoria relevantes para un Study Set
   */
  getRelevantMemoryItems(
    studySetId: string,
    userId?: string,
    limit: number = 10
  ): MemoryItem[] {
    const currentUserId = userId || authRepository.getUser()?.id;
    if (!currentUserId) return [];

    const items = this.getAllMemoryItems();
    return items
      .filter(i => i.userId === currentUserId && i.studySetId === studySetId)
      .sort((a, b) => b.importance - a.importance)
      .slice(0, limit);
  }

  /**
   * Actualizar último acceso de un item de memoria
   */
  updateLastAccessed(itemId: string): void {
    const items = this.getAllMemoryItems();
    const item = items.find(i => i.id === itemId);

    if (item) {
      item.lastAccessed = new Date().toISOString();
      this.setAllMemoryItems(items);
    }
  }

  /**
   * Eliminar items de memoria de un Study Set
   */
  deleteStudySetMemory(studySetId: string, userId?: string): void {
    const currentUserId = userId || authRepository.getUser()?.id;
    if (!currentUserId) return;

    const items = this.getAllMemoryItems();
    const filtered = items.filter(
      i => !(i.userId === currentUserId && i.studySetId === studySetId)
    );
    this.setAllMemoryItems(filtered);
  }

  /**
   * Eliminar conversación de un Study Set
   */
  deleteStudySetConversation(studySetId: string, userId?: string): void {
    const currentUserId = userId || authRepository.getUser()?.id;
    if (!currentUserId) return;

    const conversations = this.getAllConversations();
    const filtered = conversations.filter(
      c => !(c.userId === currentUserId && c.studySetId === studySetId)
    );
    this.setAllConversations(filtered);
  }

  /**
   * Eliminar todos los datos de memoria del usuario
   */
  deleteUserMemory(userId?: string): void {
    const currentUserId = userId || authRepository.getUser()?.id;
    if (!currentUserId) return;

    // Eliminar conversaciones
    const conversations = this.getAllConversations();
    const filteredConversations = conversations.filter(c => c.userId !== currentUserId);
    this.setAllConversations(filteredConversations);

    // Eliminar items de memoria
    const items = this.getAllMemoryItems();
    const filteredItems = items.filter(i => i.userId !== currentUserId);
    this.setAllMemoryItems(filteredItems);
  }

  /**
   * Obtener estadísticas de memoria
   */
  getStats(userId?: string): {
    conversationsCount: number;
    memoryItemsCount: number;
    totalMessages: number;
  } {
    const currentUserId = userId || authRepository.getUser()?.id;
    if (!currentUserId) {
      return { conversationsCount: 0, memoryItemsCount: 0, totalMessages: 0 };
    }

    const conversations = this.getAllConversations().filter(c => c.userId === currentUserId);
    const items = this.getAllMemoryItems().filter(i => i.userId === currentUserId);
    const totalMessages = conversations.reduce((sum, c) => sum + c.messages.length, 0);

    return {
      conversationsCount: conversations.length,
      memoryItemsCount: items.length,
      totalMessages
    };
  }

  // Métodos de almacenamiento
  private getAllConversations(): TutorConversation[] {
    try {
      const data = localStorage.getItem(this.CONVERSATIONS_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  private setAllConversations(conversations: TutorConversation[]): void {
    try {
      localStorage.setItem(this.CONVERSATIONS_KEY, JSON.stringify(conversations));
    } catch (error) {
      console.error('Error saving conversations:', error);
    }
  }

  private getAllMemoryItems(): MemoryItem[] {
    try {
      const data = localStorage.getItem(this.MEMORY_ITEMS_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  private setAllMemoryItems(items: MemoryItem[]): void {
    try {
      localStorage.setItem(this.MEMORY_ITEMS_KEY, JSON.stringify(items));
    } catch (error) {
      console.error('Error saving memory items:', error);
    }
  }
}

export const memoryService = new MemoryService();
