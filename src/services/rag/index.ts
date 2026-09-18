/**
 * RAG Service (Retrieval Augmented Generation)
 * Implementa el sistema de recuperación y generación aumentada
 * Busca chunks relevantes y los envía al AIProvider para generar respuestas contextualizadas
 */

import { KnowledgeChunk, LearnerProfile } from '../../types';
import { knowledgeBaseService } from '../knowledge-base';
import { learnerProfileService } from '../learner-profile';
import { embeddingsService } from '../embeddings';
import { aiRouter } from '../ai/router';

export interface RAGContext {
  relevantChunks: KnowledgeChunk[];
  citations: Citation[];
  learnerProfile?: LearnerProfile;
}

export interface Citation {
  chunkId: string;
  sourceId: string;
  sourceName?: string;
  pageNumber?: number;
  slideNumber?: number;
  timestamp?: number;
  section?: string;
  relevanceScore: number;
}

export interface RAGResponse {
  answer: string;
  citations: Citation[];
  confidence: number;
  contextUsed: boolean;
}

export class RAGService {
  /**
   * Buscar chunks relevantes para una pregunta
   */
  async retrieveRelevantChunks(
    query: string,
    studySetId: string,
    userId: string,
    topK: number = 5
  ): Promise<{ chunks: KnowledgeChunk[]; citations: Citation[] }> {
    // Obtener chunks del Study Set
    const chunks = knowledgeBaseService.getStudySetChunks(studySetId, userId);
    
    if (chunks.length === 0) {
      return { chunks: [], citations: [] };
    }

    // Si hay embeddings, usar búsqueda semántica
    if (embeddingsService.isEnabled() && chunks.some(c => c.embedding && c.embedding.length > 0)) {
      const results = await embeddingsService.searchSimilar(query, chunks, topK);
      
      const citations: Citation[] = results.map(r => ({
        chunkId: r.chunk.id,
        sourceId: r.chunk.sourceId,
        pageNumber: r.chunk.metadata.pageNumber,
        slideNumber: r.chunk.metadata.slideNumber,
        timestamp: r.chunk.metadata.timestamp,
        section: r.chunk.metadata.section,
        relevanceScore: r.similarity
      }));

      return { chunks: results.map(r => r.chunk), citations };
    }

    // Fallback: búsqueda por palabras clave
    const queryTerms = query.toLowerCase().split(/\s+/).filter(t => t.length > 3);
    
    const scoredChunks = chunks.map(chunk => {
      const content = chunk.content.toLowerCase();
      let score = 0;
      
      for (const term of queryTerms) {
        if (content.includes(term)) {
          score += 1;
        }
      }

      // Normalizar score
      const normalizedScore = queryTerms.length > 0 ? score / queryTerms.length : 0;

      return { chunk, score: normalizedScore };
    });

    // Ordenar por score y tomar top K
    const topChunks = scoredChunks
      .filter(s => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);

    const citations: Citation[] = topChunks.map(r => ({
      chunkId: r.chunk.id,
      sourceId: r.chunk.sourceId,
      pageNumber: r.chunk.metadata.pageNumber,
      slideNumber: r.chunk.metadata.slideNumber,
      timestamp: r.chunk.metadata.timestamp,
      section: r.chunk.metadata.section,
      relevanceScore: r.score
    }));

    return { chunks: topChunks.map(r => r.chunk), citations };
  }

  /**
   * Construir contexto para el AIProvider
   */
  buildContext(
    relevantChunks: KnowledgeChunk[],
    citations: Citation[],
    learnerProfile?: LearnerProfile
  ): string {
    if (relevantChunks.length === 0) {
      return '';
    }

    let context = '## Material de estudio relevante:\n\n';

    relevantChunks.forEach((chunk, index) => {
      const citation = citations[index];
      context += `### Fragmento ${index + 1}`;
      
      // Agregar metadatos de fuente
      if (citation.pageNumber) {
        context += ` (Página ${citation.pageNumber})`;
      } else if (citation.slideNumber) {
        context += ` (Diapositiva ${citation.slideNumber})`;
      } else if (citation.timestamp) {
        const minutes = Math.floor(citation.timestamp / 60);
        const seconds = Math.floor(citation.timestamp % 60);
        context += ` (${minutes}:${seconds.toString().padStart(2, '0')})`;
      } else if (citation.section) {
        context += ` (${citation.section})`;
      }
      
      context += `:\n${chunk.content}\n\n`;
    });

    // Agregar preferencias del estudiante si están disponibles
    if (learnerProfile) {
      context += '## Preferencias del estudiante:\n';
      
      if (learnerProfile.preferredExplanationStyle === 'simple') {
        context += '- Explicar de forma simple y clara\n';
      } else if (learnerProfile.preferredExplanationStyle === 'detailed') {
        context += '- Proporcionar explicaciones detalladas\n';
      } else if (learnerProfile.preferredExplanationStyle === 'examples') {
        context += '- Incluir ejemplos prácticos\n';
      }
      
      if (learnerProfile.weakTopics.length > 0) {
        context += `- Temas que necesita reforzar: ${learnerProfile.weakTopics.join(', ')}\n`;
      }
      
      context += '\n';
    }

    return context;
  }

  /**
   * Generar respuesta usando RAG
   */
  async generateResponse(
    query: string,
    studySetId: string,
    userId: string,
    conversationHistory: { role: 'user' | 'assistant'; content: string }[] = []
  ): Promise<RAGResponse> {
    // 1. Recuperar chunks relevantes
    const { chunks, citations } = await this.retrieveRelevantChunks(query, studySetId, userId);

    // 2. Obtener perfil del estudiante
    const learnerProfile = learnerProfileService.getProfile(userId);

    // 3. Construir contexto
    const context = this.buildContext(chunks, citations, learnerProfile);

    // 4. Construir prompt para el AIProvider
    const systemPrompt = this.buildSystemPrompt(context, citations.length > 0);

    // 5. Preparar mensajes para el chat
    const messages = [
      { role: 'system' as const, content: systemPrompt },
      ...conversationHistory,
      { role: 'user' as const, content: query }
    ];

    // 6. Generar respuesta
    const answer = await aiRouter.chat(messages);

    // 7. Calcular confianza basada en la relevancia de los chunks
    const confidence = citations.length > 0
      ? citations.reduce((sum, c) => sum + c.relevanceScore, 0) / citations.length
      : 0;

    return {
      answer,
      citations,
      confidence,
      contextUsed: chunks.length > 0
    };
  }

  /**
   * Construir prompt del sistema
   */
  private buildSystemPrompt(context: string, hasContext: boolean): string {
    let prompt = `Eres un tutor de estudio personalizado para KallpaLearn AI. Tu trabajo es ayudar al estudiante a aprender usando el material que ha subido.

${hasContext ? `
${context}

INSTRUCCIONES IMPORTANTES:
1. Responde basándote PRINCIPALMENTE en el material de estudio proporcionado arriba.
2. Cuando cites información del material, indica la fuente (página, diapositiva, sección, etc.).
3. Si la información NO está en el material, di claramente: "Esto no aparece en el material que subiste. Puedo darte una explicación general si quieres."
4. NO inventes que algo aparece en el material si no aparece.
5. Sé claro, educativo y alentador.
6. Adapta tu estilo de explicación a las preferencias del estudiante cuando estén indicadas.
7. Si el estudiante tiene temas débiles, ofrece explicaciones adicionales sobre esos temas.
` : `
No hay material de estudio disponible para este tema. Responde con conocimiento general, pero indica claramente que no tienes acceso al material específico del estudiante.
`}

Formato de respuesta:
- Usa un tono amigable y educativo
- Estructura tus respuestas con claridad
- Usa ejemplos cuando sea apropiado
- Si hay citas, inclúyelas al final de la respuesta en el formato:
  "Fuentes: [nombre del archivo], página X" o "Fuentes: [nombre del archivo], diapositiva X"
`;

    return prompt;
  }

  /**
   * Formatear citas para mostrar en la UI
   */
  formatCitations(citations: Citation[], sourceNames?: Record<string, string>): string {
    if (citations.length === 0) return '';

    const formattedCitations = citations.map(citation => {
      const sourceName = sourceNames?.[citation.sourceId] || citation.sourceId;
      let location = '';

      if (citation.pageNumber) {
        location = `página ${citation.pageNumber}`;
      } else if (citation.slideNumber) {
        location = `diapositiva ${citation.slideNumber}`;
      } else if (citation.timestamp) {
        const minutes = Math.floor(citation.timestamp / 60);
        const seconds = Math.floor(citation.timestamp % 60);
        location = `${minutes}:${seconds.toString().padStart(2, '0')}`;
      } else if (citation.section) {
        location = citation.section;
      }

      return location ? `${sourceName}, ${location}` : sourceName;
    });

    return `Fuentes: ${formattedCitations.join('; ')}`;
  }
}

export const ragService = new RAGService();
