/**
 * Study Generation Service
 * Genera contenido de estudio a partir de chunks de conocimiento
 */

import { Flashcard, QuizQuestion, WrittenQuestion, FillBlank, Note } from '../../types';
import { aiRouter } from '../ai/router';
import { KnowledgeChunk } from '../../types';

export class StudyGenerationService {
  /**
   * Recuperar contexto relevante de los chunks
   */
  private getContext(chunks: KnowledgeChunk[], maxChars: number = 5000): string {
    let context = '';
    for (const chunk of chunks) {
      if (context.length + chunk.content.length > maxChars) break;
      context += chunk.content + '\n\n';
    }
    return context.trim();
  }

  /**
   * Generar flashcards
   */
  async generateFlashcards(chunks: KnowledgeChunk[], count: number = 10): Promise<Flashcard[]> {
    const context = this.getContext(chunks);
    
    if (aiRouter.isDemoMode()) {
      return this.getDemoFlashcards();
    }

    try {
      const prompt = `Basándote en el siguiente material de estudio, genera ${count} flashcards educativas.

Material:
${context}

Genera las flashcards en formato JSON con la siguiente estructura:
[
  {
    "front": "pregunta o concepto",
    "back": "respuesta o explicación"
  }
]

Las flashcards deben ser claras, concisas y educativas.`;

      const response = await aiRouter.generateText(prompt);
      const flashcards = JSON.parse(response);
      
      return flashcards.map((fc: any, i: number) => ({
        id: `fc_${Date.now()}_${i}`,
        front: fc.front,
        back: fc.back,
        status: 'unfamiliar' as const,
        isDifficult: false,
        timesReviewed: 0
      }));
    } catch (error) {
      console.error('Error generating flashcards:', error);
      return this.getDemoFlashcards();
    }
  }

  /**
   * Generar quiz
   */
  async generateQuiz(chunks: KnowledgeChunk[], count: number = 10): Promise<QuizQuestion[]> {
    const context = this.getContext(chunks);
    
    if (aiRouter.isDemoMode()) {
      return this.getDemoQuiz();
    }

    try {
      const prompt = `Basándote en el siguiente material de estudio, genera ${count} preguntas de opción múltiple.

Material:
${context}

Genera las preguntas en formato JSON con la siguiente estructura:
[
  {
    "question": "pregunta",
    "options": ["opción A", "opción B", "opción C", "opción D"],
    "correctIndex": 0,
    "explanation": "explicación de la respuesta correcta"
  }
]

Las preguntas deben ser claras y las opciones deben ser plausibles.`;

      const response = await aiRouter.generateText(prompt);
      const questions = JSON.parse(response);
      
      return questions.map((q: any, i: number) => ({
        id: `q_${Date.now()}_${i}`,
        question: q.question,
        options: q.options,
        correctIndex: q.correctIndex,
        explanation: q.explanation
      }));
    } catch (error) {
      console.error('Error generating quiz:', error);
      return this.getDemoQuiz();
    }
  }

  /**
   * Generar examen escrito
   */
  async generateWrittenTest(chunks: KnowledgeChunk[]): Promise<WrittenQuestion[]> {
    const context = this.getContext(chunks);
    
    if (aiRouter.isDemoMode()) {
      return this.getDemoWrittenTest();
    }

    try {
      const prompt = `Basándote en el siguiente material de estudio, genera 5 preguntas de respuesta abierta.

Material:
${context}

Genera las preguntas en formato JSON con la siguiente estructura:
[
  {
    "question": "pregunta abierta",
    "modelAnswer": "respuesta modelo completa",
    "explanation": "qué aspectos debe cubrir una buena respuesta"
  }
]

Las preguntas deben requerir explicaciones detalladas.`;

      const response = await aiRouter.generateText(prompt);
      const questions = JSON.parse(response);
      
      return questions.map((q: any, i: number) => ({
        id: `wq_${Date.now()}_${i}`,
        question: q.question,
        modelAnswer: q.modelAnswer,
        explanation: q.explanation,
        userAnswer: '',
        evaluated: false
      }));
    } catch (error) {
      console.error('Error generating written test:', error);
      return this.getDemoWrittenTest();
    }
  }

  /**
   * Generar completar espacios
   */
  async generateFillBlanks(chunks: KnowledgeChunk[]): Promise<FillBlank[]> {
    const context = this.getContext(chunks);
    
    if (aiRouter.isDemoMode()) {
      return this.getDemoFillBlanks();
    }

    try {
      const prompt = `Basándote en el siguiente material de estudio, genera 5 ejercicios de completar espacios en blanco.

Material:
${context}

Genera los ejercicios en formato JSON con la siguiente estructura:
[
  {
    "sentence": "oración con ___ donde faltan palabras",
    "blanks": [{"placeholder": "___", "answer": "palabra correcta"}],
    "explanation": "explicación de por qué esa es la respuesta"
  }
]

Cada oración debe tener 1-2 espacios en blanco.`;

      const response = await aiRouter.generateText(prompt);
      const exercises = JSON.parse(response);
      
      return exercises.map((ex: any, i: number) => ({
        id: `fb_${Date.now()}_${i}`,
        sentence: ex.sentence,
        blanks: ex.blanks,
        explanation: ex.explanation,
        userAnswers: [],
        evaluated: false
      }));
    } catch (error) {
      console.error('Error generating fill blanks:', error);
      return this.getDemoFillBlanks();
    }
  }

  /**
   * Generar notas inteligentes
   */
  async generateNotes(chunks: KnowledgeChunk[]): Promise<Note> {
    const context = this.getContext(chunks);
    
    if (aiRouter.isDemoMode()) {
      return this.getDemoNotes();
    }

    try {
      const prompt = `Basándote en el siguiente material de estudio, genera notas inteligentes completas.

Material:
${context}

Genera las notas en formato JSON con la siguiente estructura:
{
  "title": "título de las notas",
  "summary": "resumen conciso del material",
  "mainConcepts": ["concepto1", "concepto2"],
  "definitions": [{"term": "término", "definition": "definición"}],
  "examples": ["ejemplo1", "ejemplo2"],
  "keyPoints": ["punto clave 1", "punto clave 2"]
}`;

      const response = await aiRouter.generateText(prompt);
      const notes = JSON.parse(response);
      
      return {
        id: `note_${Date.now()}`,
        title: notes.title,
        summary: notes.summary,
        mainConcepts: notes.mainConcepts,
        definitions: notes.definitions,
        examples: notes.examples,
        keyPoints: notes.keyPoints,
        customContent: ''
      };
    } catch (error) {
      console.error('Error generating notes:', error);
      return this.getDemoNotes();
    }
  }

  /**
   * Generar guión de podcast
   */
  async generatePodcastScript(chunks: KnowledgeChunk[], title: string): Promise<string> {
    const context = this.getContext(chunks);
    
    if (aiRouter.isDemoMode()) {
      return this.getDemoPodcastScript(title);
    }

    try {
      const prompt = `Basándote en el siguiente material de estudio, genera un guión de podcast educativo titulado "${title}".

Material:
${context}

El guión debe:
- Ser conversacional y engaging
- Durar aproximadamente 5-7 minutos
- Incluir introducción, desarrollo y conclusión
- Usar ejemplos y analogías
- Ser adecuado para audio (sin referencias visuales)`;

      return await aiRouter.generateText(prompt);
    } catch (error) {
      console.error('Error generating podcast script:', error);
      return this.getDemoPodcastScript(title);
    }
  }

  // Métodos de demostración
  private getDemoFlashcards(): Flashcard[] {
    return [
      {
        id: 'demo_fc_1',
        front: '¿Qué es la membrana celular?',
        back: 'Es una bicapa lipídica que rodea la célula, regulando el paso de sustancias y protegiendo el interior celular.',
        status: 'unfamiliar',
        isDifficult: false,
        timesReviewed: 0
      },
      {
        id: 'demo_fc_2',
        front: '¿Cuál es la función de la mitocondria?',
        back: 'Es el organelo encargado de la respiración celular, produciendo ATP (energía) a partir de glucosa y oxígeno.',
        status: 'unfamiliar',
        isDifficult: false,
        timesReviewed: 0
      }
    ];
  }

  private getDemoQuiz(): QuizQuestion[] {
    return [
      {
        id: 'demo_q_1',
        question: '¿Cuál es el organelo encargado de producir energía en la célula?',
        options: ['Núcleo', 'Mitocondria', 'Ribosoma', 'Lisosoma'],
        correctIndex: 1,
        explanation: 'La mitocondria es conocida como la "central energética" de la célula.'
      }
    ];
  }

  private getDemoWrittenTest(): WrittenQuestion[] {
    return [
      {
        id: 'demo_wq_1',
        question: 'Explica el proceso de la respiración celular y su importancia.',
        modelAnswer: 'La respiración celular es el proceso por el cual la célula descompone la glucosa en presencia de oxígeno para producir ATP.',
        explanation: 'Debes mencionar glucosa, oxígeno, ATP y mitocondria.',
        userAnswer: '',
        evaluated: false
      }
    ];
  }

  private getDemoFillBlanks(): FillBlank[] {
    return [
      {
        id: 'demo_fb_1',
        sentence: 'La ___ es la unidad básica de todos los seres vivos.',
        blanks: [{ placeholder: '___', answer: 'célula' }],
        explanation: 'La célula es la unidad estructural y funcional de los seres vivos.',
        userAnswers: [],
        evaluated: false
      }
    ];
  }

  private getDemoNotes(): Note {
    return {
      id: 'demo_note_1',
      title: 'Notas de Demostración: Biología Celular',
      summary: 'La célula es la unidad básica de la vida. Las células eucariotas contienen organelos especializados.',
      mainConcepts: ['Estructura celular', 'Organelos', 'Membrana celular'],
      definitions: [
        { term: 'Célula', definition: 'Unidad básica estructural y funcional de todos los seres vivos.' }
      ],
      examples: ['La célula muscular tiene muchas mitocondrias'],
      keyPoints: ['Toda célula tiene membrana, citoplasma y material genético'],
      customContent: ''
    };
  }

  private getDemoPodcastScript(title: string): string {
    return `# Guión de Podcast: ${title}

[BGM: Música suave de fondo]

**Narrador:** Bienvenidos a este episodio de KallpaLearn.

**Narrador:** Hoy exploraremos conceptos fundamentales de nuestro material de estudio.

[Música de transición]

**Narrador:** Este es un guión de demostración. Conecta un proveedor de IA para generar guiones personalizados basados en tu material.

[Fin]`;
  }
}

export const studyGenerationService = new StudyGenerationService();
