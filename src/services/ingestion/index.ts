/**
 * Ingestion Pipeline Service
 * Orquesta el proceso completo de ingestión de conocimiento
 */

import { StudySet, SourceFile, KnowledgeChunk, SourceStatus } from '../../types';
import { extractionService } from '../extraction';
import { chunkingService } from '../chunking';
import { embeddingsService } from '../embeddings';
import { studyGenerationService } from '../study-generation';
import { setsRepository } from '../storage';

export interface IngestionProgress {
  sourceId: string;
  status: SourceStatus;
  progress: number;
  message: string;
}

export interface IngestionCallbacks {
  onProgress?: (progress: IngestionProgress) => void;
  onComplete?: (studySet: StudySet) => void;
  onError?: (error: Error, sourceId?: string) => void;
}

export class IngestionPipeline {
  /**
   * Procesar una fuente individual
   */
  async processSource(
    source: SourceFile,
    studySetId: string,
    callbacks: IngestionCallbacks = {}
  ): Promise<{ chunks: KnowledgeChunk[]; extractedContent: string }> {
    const { onProgress, onError } = callbacks;

    try {
      // 1. Extracting
      onProgress?.({ sourceId: source.id, status: 'extracting', progress: 20, message: 'Extrayendo contenido...' });
      
      const extractionResult = await extractionService.extract(
        new Blob([]), // En producción, pasar el archivo real
        source.type
      );

      if (!extractionResult.success) {
        throw new Error(extractionResult.error || 'Error en extracción');
      }

      const extractedContent = extractionResult.content;

      // 2. Chunking
      onProgress?.({ sourceId: source.id, status: 'chunking', progress: 40, message: 'Dividiendo en fragmentos...' });
      
      const chunks = chunkingService.chunk(extractedContent, studySetId, source.id);

      // 3. Indexing (generar embeddings)
      onProgress?.({ sourceId: source.id, status: 'indexing', progress: 60, message: 'Generando índices...' });
      
      const chunksWithEmbeddings = await embeddingsService.generateEmbeddings(chunks);

      // 4. Completed
      onProgress?.({ sourceId: source.id, status: 'completed', progress: 100, message: 'Procesamiento completado' });

      return { chunks: chunksWithEmbeddings, extractedContent };
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Error desconocido');
      onProgress?.({ sourceId: source.id, status: 'error', progress: 0, message: err.message });
      onError?.(err, source.id);
      throw err;
    }
  }

  /**
   * Procesar todas las fuentes de un Study Set
   */
  async processStudySet(
    studySet: StudySet,
    callbacks: IngestionCallbacks = {}
  ): Promise<StudySet> {
    const { onProgress, onComplete, onError } = callbacks;
    const allChunks: KnowledgeChunk[] = [];
    const updatedSources: SourceFile[] = [];

    try {
      // Procesar cada fuente
      for (let i = 0; i < studySet.sourceFiles.length; i++) {
        const source = studySet.sourceFiles[i];
        
        onProgress?.({ 
          sourceId: source.id, 
          status: 'processing', 
          progress: (i / studySet.sourceFiles.length) * 100,
          message: `Procesando fuente ${i + 1} de ${studySet.sourceFiles.length}...`
        });

        try {
          const result = await this.processSource(source, studySet.id, callbacks);
          allChunks.push(...result.chunks);
          
          updatedSources.push({
            ...source,
            status: 'completed',
            progress: 100,
            extractedContent: result.extractedContent,
            metadata: source.metadata
          });
        } catch (error) {
          // Marcar fuente como error pero continuar con las demás
          updatedSources.push({
            ...source,
            status: 'error',
            progress: 0,
            errorMessage: error instanceof Error ? error.message : 'Error desconocido'
          });
        }
      }

      // Actualizar Study Set con los chunks procesados
      const updatedStudySet: StudySet = {
        ...studySet,
        sourceFiles: updatedSources,
        updatedAt: new Date().toISOString()
      };

      // Guardar en storage (en producción, guardar chunks en base de datos)
      setsRepository.save(updatedStudySet);

      onComplete?.(updatedStudySet);
      return updatedStudySet;
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Error en pipeline');
      onError?.(err);
      throw err;
    }
  }

  /**
   * Generar contenido de estudio para un Study Set
   */
  async generateStudyContent(
    studySet: StudySet,
    contentTypes: ('flashcards' | 'quiz' | 'written' | 'fillblanks' | 'notes' | 'podcast')[],
    callbacks: IngestionCallbacks = {}
  ): Promise<StudySet> {
    const { onProgress } = callbacks;

    // Obtener chunks del Study Set (en producción, desde base de datos)
    // Por ahora, usar contenido extraído de las fuentes
    const mockChunks: KnowledgeChunk[] = studySet.sourceFiles
      .filter(s => s.extractedContent)
      .map((s, i) => ({
        id: `chunk_${s.id}_${i}`,
        studySetId: studySet.id,
        sourceId: s.id,
        content: s.extractedContent || '',
        metadata: {},
        createdAt: new Date().toISOString()
      }));

    const updatedStudySet = { ...studySet };

    for (let i = 0; i < contentTypes.length; i++) {
      const type = contentTypes[i];
      
      onProgress?.({
        sourceId: 'generation',
        status: 'generating',
        progress: (i / contentTypes.length) * 100,
        message: `Generando ${type}...`
      });

      try {
        switch (type) {
          case 'flashcards':
            updatedStudySet.flashcards = await studyGenerationService.generateFlashcards(mockChunks);
            break;
          case 'quiz':
            updatedStudySet.quiz = {
              id: updatedStudySet.quiz.id,
              questions: await studyGenerationService.generateQuiz(mockChunks)
            };
            break;
          case 'written':
            updatedStudySet.writtenTest = {
              id: updatedStudySet.writtenTest.id,
              questions: await studyGenerationService.generateWrittenTest(mockChunks)
            };
            break;
          case 'fillblanks':
            updatedStudySet.fillBlanks = await studyGenerationService.generateFillBlanks(mockChunks);
            break;
          case 'notes':
            updatedStudySet.notes = await studyGenerationService.generateNotes(mockChunks);
            break;
          case 'podcast':
            // El podcast se genera como script, el audio se genera después
            break;
        }
      } catch (error) {
        console.error(`Error generating ${type}:`, error);
        // Continuar con los demás tipos
      }
    }

    // Actualizar progreso
    updatedStudySet.progress = {
      ...updatedStudySet.progress,
      totalCards: updatedStudySet.flashcards.length
    };

    updatedStudySet.updatedAt = new Date().toISOString();
    setsRepository.save(updatedStudySet);

    onProgress?.({
      sourceId: 'generation',
      status: 'completed',
      progress: 100,
      message: 'Contenido generado exitosamente'
    });

    return updatedStudySet;
  }

  /**
   * Pipeline completo: procesar fuentes y generar contenido
   */
  async runFullPipeline(
    studySet: StudySet,
    contentTypes: ('flashcards' | 'quiz' | 'written' | 'fillblanks' | 'notes' | 'podcast')[],
    callbacks: IngestionCallbacks = {}
  ): Promise<StudySet> {
    // 1. Procesar fuentes
    const processedSet = await this.processStudySet(studySet, callbacks);

    // 2. Generar contenido
    const finalSet = await this.generateStudyContent(processedSet, contentTypes, callbacks);

    return finalSet;
  }
}

export const ingestionPipeline = new IngestionPipeline();
