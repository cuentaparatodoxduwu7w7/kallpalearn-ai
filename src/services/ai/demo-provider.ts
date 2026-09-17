/**
 * Demo AI Provider
 * Proporciona respuestas de demostración sin necesidad de API keys
 */

import { AIProvider, GenerateOptions, ChatMessage } from '../types';

export class DemoAIProvider implements AIProvider {
  id = 'demo';
  name = 'Demo Provider';

  async generateText(prompt: string, options?: GenerateOptions): Promise<string> {
    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Generar respuesta basada en el prompt
    if (prompt.toLowerCase().includes('flashcard')) {
      return this.generateDemoFlashcards();
    } else if (prompt.toLowerCase().includes('quiz') || prompt.toLowerCase().includes('pregunta')) {
      return this.generateDemoQuiz();
    } else if (prompt.toLowerCase().includes('nota') || prompt.toLowerCase().includes('resumen')) {
      return this.generateDemoNotes();
    } else if (prompt.toLowerCase().includes('podcast')) {
      return this.generateDemoPodcastScript();
    }
    
    return 'Esta es una respuesta de demostración. Conecta un proveedor de IA real para obtener respuestas personalizadas basadas en tu material de estudio.';
  }

  async generateStructured<T>(prompt: string, schema: any): Promise<T> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Retornar datos de demostración según el tipo
    if (schema.type === 'array' && schema.items?.type === 'flashcard') {
      return this.getDemoFlashcards() as any;
    } else if (schema.type === 'array' && schema.items?.type === 'quiz-question') {
      return this.getDemoQuizQuestions() as any;
    } else if (schema.type === 'object' && schema.properties?.summary) {
      return this.getDemoNotes() as any;
    }
    
    return {} as T;
  }

  async chat(messages: ChatMessage[], options?: GenerateOptions): Promise<string> {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const lastMessage = messages[messages.length - 1];
    const content = lastMessage.content.toLowerCase();
    
    if (content.includes('hola') || content.includes('hi')) {
      return '¡Hola! Soy tu tutor de demostración. ¿En qué puedo ayudarte con tu material de estudio?';
    } else if (content.includes('explica')) {
      return 'En modo demostración, puedo ayudarte a entender conceptos básicos. Para explicaciones detalladas basadas en tu material específico, conecta un proveedor de IA.';
    } else if (content.includes('ejemplo')) {
      return 'Aquí tienes un ejemplo de demostración: La célula es la unidad básica de la vida. Todas las células tienen membrana, citoplasma y material genético.';
    } else if (content.includes('pregunta') || content.includes('examen')) {
      return '¿Cuáles son los tres componentes principales de una célula? (Pista: membrana, citoplasma, material genético)';
    } else if (content.includes('resume')) {
      return 'Resumen de demostración: El material cubre conceptos fundamentales sobre la estructura y función celular, incluyendo organelos y procesos metabólicos.';
    }
    
    return 'Entiendo tu pregunta. En modo demostración, mis respuestas son limitadas. Para obtener ayuda personalizada basada en tu material, conecta un proveedor de IA real.';
  }

  private generateDemoFlashcards(): string {
    return JSON.stringify(this.getDemoFlashcards());
  }

  private generateDemoQuiz(): string {
    return JSON.stringify(this.getDemoQuizQuestions());
  }

  private generateDemoNotes(): string {
    return JSON.stringify(this.getDemoNotes());
  }

  private generateDemoPodcastScript(): string {
    return `# Guión de Podcast: Introducción a la Biología Celular

[BGM: Música suave de fondo]

**Narrador:** Bienvenidos a este episodio especial de KallpaLearn, donde exploraremos el fascinante mundo de la biología celular.

[Música transición]

**Narrador:** La célula es la unidad básica de la vida. Imagina que tu cuerpo es como una ciudad enorme, y cada célula es como un pequeño barrio con sus propias funciones especializadas.

[Pausa dramática]

**Narrador:** Todas las células tienen tres componentes fundamentales:
- La membrana celular, que actúa como las murallas de la ciudad
- El citoplasma, que es como las calles y espacios públicos
- El material genético, que contiene los planos de construcción

[Música de transición]

**Narrador:** En las células eucariotas, como las nuestras, encontramos organelos especializados:
- Las mitocondrias son las centrales eléctricas
- El retículo endoplasmático es la fábrica de proteínas
- El aparato de Golgi es el centro de distribución

[Pausa]

**Narrador:** Cada organelo tiene una función específica, y juntos trabajan en armonía para mantener la vida.

[Música de cierre]

**Narrador:** Esto ha sido KallpaLearn. Gracias por aprender con nosotros.

[Fin]`;
  }

  private getDemoFlashcards() {
    return [
      {
        front: '¿Qué es la membrana celular?',
        back: 'Es una bicapa lipídica que rodea la célula, regulando el paso de sustancias y protegiendo el interior celular.'
      },
      {
        front: '¿Cuál es la función de la mitocondria?',
        back: 'Es el organelo encargado de la respiración celular, produciendo ATP (energía) a partir de glucosa y oxígeno.'
      },
      {
        front: '¿Qué es el núcleo celular?',
        back: 'Es el centro de control de la célula que contiene el ADN y dirige las actividades celulares como la división y la síntesis de proteínas.'
      }
    ];
  }

  private getDemoQuizQuestions() {
    return [
      {
        question: '¿Cuál es el organelo encargado de producir energía en la célula?',
        options: ['Núcleo', 'Mitocondria', 'Ribosoma', 'Lisosoma'],
        correctIndex: 1,
        explanation: 'La mitocondria es conocida como la "central energética" de la célula porque realiza la respiración celular, generando ATP.'
      },
      {
        question: '¿Qué estructura controla el paso de sustancias hacia dentro y fuera de la célula?',
        options: ['Pared celular', 'Membrana celular', 'Citoplasma', 'Retículo endoplasmático'],
        correctIndex: 1,
        explanation: 'La membrana celular (o membrana plasmática) es selectivamente permeable, controlando qué sustancias entran y salen.'
      }
    ];
  }

  private getDemoNotes() {
    return {
      title: 'Notas de Demostración: Biología Celular',
      summary: 'La célula es la unidad básica de la vida. Las células eucariotas contienen organelos especializados que cumplen funciones específicas: el núcleo almacena el ADN, las mitocondrias producen energía, el RE sintetiza proteínas y lípidos.',
      mainConcepts: ['Estructura celular', 'Organelos', 'Membrana celular', 'Metabolismo celular'],
      definitions: [
        { term: 'Célula', definition: 'Unidad básica estructural y funcional de todos los seres vivos.' },
        { term: 'Organelo', definition: 'Estructura especializada dentro de la célula que cumple una función específica.' },
        { term: 'ATP', definition: 'Adenosín trifosfato, molécula que almacena y transfiere energía en la célula.' }
      ],
      examples: [
        'La célula muscular tiene muchas mitocondrias por su alta demanda energética',
        'Los glóbulos rojos maduros pierden su núcleo para transportar más oxígeno'
      ],
      keyPoints: [
        'Toda célula tiene membrana, citoplasma y material genético',
        'Las eucariotas tienen organelos membranosos; las procariotas no',
        'La mitocondria es la central energética',
        'El núcleo contiene y protege el ADN'
      ],
      customContent: ''
    };
  }
}
