/**
 * Edge Functions Service
 * Servicio para llamar a las Edge Functions de Supabase
 * Este servicio maneja todas las llamadas al backend de IA
 */

import { supabase } from '../../lib/supabase';

export interface AIChatResponse {
  content: string;
  citations: Array<{
    chunkId: string;
    metadata: any;
  }>;
  hasContext: boolean;
  provider: string;
}

export interface GenerateContentResponse {
  status: 'success' | 'error' | 'no_content';
  count?: number;
  error?: string;
}

export interface SystemStatus {
  authentication: 'CONNECTED' | 'NOT_CONFIGURED' | 'ERROR';
  database: 'CONNECTED' | 'NOT_CONFIGURED' | 'ERROR';
  storage: 'CONNECTED' | 'NOT_CONFIGURED' | 'ERROR';
  ai: 'CONNECTED' | 'NOT_CONFIGURED' | 'ERROR' | 'DEMO';
  embeddings: 'CONNECTED' | 'NOT_CONFIGURED' | 'ERROR' | 'DEMO';
  rag: 'CONNECTED' | 'NOT_CONFIGURED' | 'ERROR' | 'DEMO';
  ocr: 'CONNECTED' | 'NOT_CONFIGURED' | 'ERROR';
  transcription: 'CONNECTED' | 'NOT_CONFIGURED' | 'ERROR';
  vision: 'CONNECTED' | 'NOT_CONFIGURED' | 'ERROR';
  podcast: 'CONNECTED' | 'NOT_CONFIGURED' | 'ERROR';
}

class EdgeFunctionsService {
  /**
   * Llamar a la Edge Function de AI Chat
   */
  async chatWithTutor(
    studySetId: string,
    message: string,
    conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }> = []
  ): Promise<AIChatResponse> {
    try {
      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: {
          studySetId,
          message,
          conversationHistory
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      return data;
    } catch (error) {
      console.error('Error calling ai-chat:', error);
      throw error;
    }
  }

  /**
   * Generar flashcards con IA
   */
  async generateFlashcards(studySetId: string): Promise<GenerateContentResponse> {
    try {
      const { data, error } = await supabase.functions.invoke('generate-flashcards', {
        body: { studySetId }
      });

      if (error) {
        throw new Error(error.message);
      }

      return data;
    } catch (error) {
      console.error('Error generating flashcards:', error);
      throw error;
    }
  }

  /**
   * Generar quiz con IA
   */
  async generateQuiz(studySetId: string): Promise<GenerateContentResponse> {
    try {
      const { data, error } = await supabase.functions.invoke('generate-quiz', {
        body: { studySetId }
      });

      if (error) {
        throw new Error(error.message);
      }

      return data;
    } catch (error) {
      console.error('Error generating quiz:', error);
      throw error;
    }
  }

  /**
   * Generar notas con IA
   */
  async generateNotes(studySetId: string): Promise<GenerateContentResponse> {
    try {
      const { data, error } = await supabase.functions.invoke('generate-notes', {
        body: { studySetId }
      });

      if (error) {
        throw new Error(error.message);
      }

      return data;
    } catch (error) {
      console.error('Error generating notes:', error);
      throw error;
    }
  }

  /**
   * Generar examen escrito con IA
   */
  async generateWrittenTest(studySetId: string): Promise<GenerateContentResponse> {
    try {
      const { data, error } = await supabase.functions.invoke('generate-written-test', {
        body: { studySetId }
      });

      if (error) {
        throw new Error(error.message);
      }

      return data;
    } catch (error) {
      console.error('Error generating written test:', error);
      throw error;
    }
  }

  /**
   * Generar ejercicios de completar espacios con IA
   */
  async generateFillBlanks(studySetId: string): Promise<GenerateContentResponse> {
    try {
      const { data, error } = await supabase.functions.invoke('generate-fill-blanks', {
        body: { studySetId }
      });

      if (error) {
        throw new Error(error.message);
      }

      return data;
    } catch (error) {
      console.error('Error generating fill blanks:', error);
      throw error;
    }
  }

  /**
   * Procesar archivo subido
   */
  async processFile(sourceId: string, studySetId: string): Promise<GenerateContentResponse> {
    try {
      const { data, error } = await supabase.functions.invoke('process-file', {
        body: { sourceId, studySetId }
      });

      if (error) {
        throw new Error(error.message);
      }

      return data;
    } catch (error) {
      console.error('Error processing file:', error);
      throw error;
    }
  }

  /**
   * Obtener estado del sistema
   */
  async getSystemStatus(): Promise<SystemStatus> {
    const status: SystemStatus = {
      authentication: 'NOT_CONFIGURED',
      database: 'NOT_CONFIGURED',
      storage: 'NOT_CONFIGURED',
      ai: 'NOT_CONFIGURED',
      embeddings: 'NOT_CONFIGURED',
      rag: 'NOT_CONFIGURED',
      ocr: 'NOT_CONFIGURED',
      transcription: 'NOT_CONFIGURED',
      vision: 'NOT_CONFIGURED',
      podcast: 'NOT_CONFIGURED'
    };

    try {
      // Verificar autenticación
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        status.authentication = 'CONNECTED';
      }

      // Verificar base de datos
      const { data: dbTest, error: dbError } = await supabase
        .from('study_sets')
        .select('count')
        .limit(1);
      
      if (!dbError) {
        status.database = 'CONNECTED';
      }

      // Verificar storage
      const { data: storageTest, error: storageError } = await supabase.storage
        .getBucket('study-materials');
      
      if (!storageError) {
        status.storage = 'CONNECTED';
      }

      // Verificar AI (intentar llamar a ai-chat con datos mínimos)
      try {
        const { data: aiTest, error: aiError } = await supabase.functions.invoke('ai-chat', {
          body: {
            studySetId: 'test',
            message: 'test',
            conversationHistory: []
          }
        });

        if (aiTest) {
          if (aiTest.provider === 'demo') {
            status.ai = 'DEMO';
          } else {
            status.ai = 'CONNECTED';
          }
        } else if (aiError) {
          status.ai = 'ERROR';
        }
      } catch {
        status.ai = 'NOT_CONFIGURED';
      }

      // RAG depende de AI
      status.rag = status.ai;

      // Embeddings (por ahora en demo)
      status.embeddings = 'DEMO';

      // OCR, Transcription, Vision, Podcast (pendientes de implementación)
      status.ocr = 'NOT_CONFIGURED';
      status.transcription = 'NOT_CONFIGURED';
      status.vision = 'NOT_CONFIGURED';
      status.podcast = 'NOT_CONFIGURED';

    } catch (error) {
      console.error('Error checking system status:', error);
    }

    return status;
  }
}

export const edgeFunctionsService = new EdgeFunctionsService();
