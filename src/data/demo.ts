import { StudySet, Folder, User } from '../types';
import { v4 as uuid } from 'uuid';

export const demoUser: User = {
  id: 'demo-user-1',
  name: 'Estudiante Demo',
  email: 'demo@kallpalearn.ai',
  avatar: '',
  preferences: { language: 'es', timezone: 'America/Lima', notifications: true, studyReminders: true, theme: 'light' },
  createdAt: '2024-01-15T10:00:00Z',
};

export const demoFolder: Folder = {
  id: 'folder-bio',
  userId: 'demo-user-1',
  name: 'Biología',
  color: '#f97316',
  setIds: ['set-cell'],
  createdAt: '2024-01-20T10:00:00Z',
};

export const demoStudySet: StudySet = {
  id: 'set-cell',
  userId: 'demo-user-1',
  title: 'Célula y sus funciones',
  description: 'Estudio completo sobre la estructura y funciones de la célula, organelos y procesos celulares.',
  folderId: 'folder-bio',
  sourceFiles: [
    { id: 'sf1', name: 'biologia_celular.pdf', size: 2400000, type: 'application/pdf', status: 'completed', progress: 100 },
  ],
  flashcards: [
    { id: uuid(), front: '¿Qué es la membrana celular?', back: 'Es una bicapa lipídica que rodea la célula, regulando el paso de sustancias y protegiendo el interior celular.', status: 'mastered', isDifficult: false, timesReviewed: 5 },
    { id: uuid(), front: '¿Cuál es la función de la mitocondria?', back: 'Es el organelo encargado de la respiración celular, produciendo ATP (energía) a partir de glucosa y oxígeno.', status: 'familiar', isDifficult: false, timesReviewed: 3 },
    { id: uuid(), front: '¿Qué es el retículo endoplasmático rugoso?', back: 'Es un sistema de membranas con ribosomas adheridos, responsable de la síntesis y transporte de proteínas.', status: 'learning', isDifficult: true, timesReviewed: 2 },
    { id: uuid(), front: '¿Qué función cumple el aparato de Golgi?', back: 'Modifica, empaqueta y distribuye proteínas y lípidos recibidos del retículo endoplasmático hacia su destino final.', status: 'unfamiliar', isDifficult: false, timesReviewed: 1 },
    { id: uuid(), front: '¿Qué son los lisosomas?', back: 'Son organelos que contienen enzimas digestivas para descomponer materiales de desecho y reciclar componentes celulares.', status: 'learning', isDifficult: false, timesReviewed: 2 },
    { id: uuid(), front: '¿Qué es el núcleo celular?', back: 'Es el centro de control de la célula que contiene el ADN y dirige las actividades celulares como la división y la síntesis de proteínas.', status: 'mastered', isDifficult: false, timesReviewed: 6 },
    { id: uuid(), front: '¿Cuál es la función de los ribosomas?', back: 'Son las estructuras encargadas de la síntesis de proteínas, leyendo la información del ARN mensajero.', status: 'familiar', isDifficult: false, timesReviewed: 4 },
    { id: uuid(), front: '¿Qué es la fotosíntesis?', back: 'Es el proceso por el cual las células vegetales convierten luz solar, agua y CO2 en glucosa y oxígeno, utilizando los cloroplastos.', status: 'unfamiliar', isDifficult: true, timesReviewed: 1 },
  ],
  quiz: {
    id: uuid(),
    questions: [
      { id: uuid(), question: '¿Cuál es el organelo encargado de producir energía en la célula?', options: ['Núcleo', 'Mitocondria', 'Ribosoma', 'Lisosoma'], correctIndex: 1, explanation: 'La mitocondria es conocida como la "central energética" de la célula porque realiza la respiración celular, generando ATP.' },
      { id: uuid(), question: '¿Qué estructura controla el paso de sustancias hacia dentro y fuera de la célula?', options: ['Pared celular', 'Membrana celular', 'Citoplasma', 'Retículo endoplasmático'], correctIndex: 1, explanation: 'La membrana celular (o membrana plasmática) es selectivamente permeable, controlando qué sustancias entran y salen.' },
      { id: uuid(), question: '¿Dónde se almacena el ADN en una célula eucariota?', options: ['Mitocondria', 'Ribosoma', 'Núcleo', 'Aparato de Golgi'], correctIndex: 2, explanation: 'En las células eucariotas, el ADN se encuentra principalmente en el núcleo, protegido por la envoltura nuclear.' },
      { id: uuid(), question: '¿Qué organelo se encarga de empaquetar proteínas?', options: ['Retículo endoplasmático', 'Aparato de Golgi', 'Lisosoma', 'Vacuola'], correctIndex: 1, explanation: 'El aparato de Golgi recibe proteínas del RE, las modifica y las empaqueta en vesículas para su distribución.' },
      { id: uuid(), question: '¿Qué proceso realizan los cloroplastos?', options: ['Respiración celular', 'Fotosíntesis', 'División celular', 'Digestión celular'], correctIndex: 1, explanation: 'Los cloroplastos contienen clorofila y realizan la fotosíntesis, convirtiendo energía lumínica en energía química (glucosa).' },
    ],
  },
  writtenTest: {
    id: uuid(),
    questions: [
      { id: uuid(), question: 'Explica el proceso de la respiración celular y su importancia para la célula.', modelAnswer: 'La respiración celular es el proceso por el cual la célula descompone la glucosa en presencia de oxígeno para producir ATP (energía), CO2 y agua. Ocurre principalmente en la mitocondria. Es fundamental porque provee la energía necesaria para todas las actividades celulares.', explanation: 'Debes mencionar: glucosa como sustrato, mitocondria como lugar, ATP como producto, y la importancia energética.', userAnswer: '', evaluated: false },
      { id: uuid(), question: 'Describe la diferencia entre célula procariota y eucariota.', modelAnswer: 'Las procariotas no tienen núcleo definido ni organelos membranosos (ej: bacterias). Las eucariotas tienen núcleo con envoltura nuclear y organelos especializados como mitocondrias, RE y Golgi (ej: células animales y vegetales).', explanation: 'La clave está en la presencia/ausencia de núcleo definido y organelos membranosos.', userAnswer: '', evaluated: false },
      { id: uuid(), question: '¿Cuál es la función del retículo endoplasmático rugoso y cómo se diferencia del liso?', modelAnswer: 'El RE rugoso tiene ribosomas adheridos y se encarga de la síntesis de proteínas. El RE liso no tiene ribosomas y se dedica a la síntesis de lípidos, detoxificación y almacenamiento de calcio.', explanation: 'Diferencia clave: ribosomas presentes (rugoso = proteínas) vs ausentes (liso = lípidos).', userAnswer: '', evaluated: false },
    ],
  },
  fillBlanks: [
    { id: uuid(), sentence: 'La ___ es la unidad básica de todos los seres vivos.', blanks: [{ placeholder: '___', answer: 'célula' }], explanation: 'La célula es la unidad estructural y funcional de los seres vivos.' },
    { id: uuid(), sentence: 'La ___ celular ocurre en la mitocondria y produce ___.', blanks: [{ placeholder: '___', answer: 'respiración' }, { placeholder: '___', answer: 'ATP' }], explanation: 'La respiración celular es el proceso metabólico que genera ATP como fuente de energía.' },
    { id: uuid(), sentence: 'Los ___ son organelos que contienen enzimas ___ para degradar desechos.', blanks: [{ placeholder: '___', answer: 'lisosomas' }, { placeholder: '___', answer: 'digestivas' }], explanation: 'Los lisosomas son vesículas con enzimas que digieren materiales dentro de la célula.' },
    { id: uuid(), sentence: 'El ___ de Golgi modifica y ___ las proteínas.', blanks: [{ placeholder: '___', answer: 'aparato' }, { placeholder: '___', answer: 'empaqueta' }], explanation: 'El aparato de Golgi es responsable del procesamiento y empaquetamiento de proteínas.' },
    { id: uuid(), sentence: 'La ___ celular es el proceso por el cual las plantas convierten luz en ___.', blanks: [{ placeholder: '___', answer: 'fotosíntesis' }, { placeholder: '___', answer: 'energía' }], explanation: 'La fotosíntesis convierte energía lumínica en energía química almacenada en glucosa.' },
  ],
  notes: {
    id: uuid(),
    title: 'Notas: Célula y sus funciones',
    summary: 'La célula es la unidad básica de la vida. Las células eucariotas contienen organelos especializados que cumplen funciones específicas: el núcleo almacena el ADN, las mitocondrias producen energía, el RE sintetiza proteínas y lípidos, el Golgi empaqueta y distribuye, y los lisosomas digieren desechos.',
    mainConcepts: ['Estructura celular', 'Organelos', 'Membrana celular', 'Metabolismo celular', 'Diferencias procariota/eucariota'],
    definitions: [
      { term: 'Célula', definition: 'Unidad básica estructural y funcional de todos los seres vivos.' },
      { term: 'Organelo', definition: 'Estructura especializada dentro de la célula que cumple una función específica.' },
      { term: 'ATP', definition: 'Adenosín trifosfato, molécula que almacena y transfiere energía en la célula.' },
      { term: 'Membrana plasmática', definition: 'Bicapa lipídica que rodea la célula y regula el intercambio de sustancias.' },
    ],
    examples: ['La célula muscular tiene muchas mitocondrias por su alta demanda energética', 'Los glóbulos rojos maduros pierden su núcleo para transportar más oxígeno'],
    keyPoints: ['Toda célula tiene membrana, citoplasma y material genético', 'Las eucariotas tienen organelos membranosos; las procariotas no', 'La mitocondria es la central energética', 'El núcleo contiene y protege el ADN', 'Cada organelo tiene una función específica'],
    customContent: '',
  },
  podcast: undefined,
  tutorMessages: [
    { id: uuid(), role: 'assistant', content: '¡Hola! Soy tu tutor IA. He revisado tu material sobre "Célula y sus funciones". ¿En qué te puedo ayudar hoy?', timestamp: '2024-01-20T10:00:00Z', suggestions: ['Explícame la mitocondria', '¿Qué es el RE?', 'Hazme preguntas'] },
  ],
  progress: {
    totalCards: 8,
    masteredCards: 2,
    familiarCards: 2,
    learningCards: 2,
    unfamiliarCards: 2,
    quizScore: 80,
    quizAttempts: 3,
    writtenScore: 65,
    fillBlankScore: 70,
    masteryPercent: 45,
    lastStudied: '2024-01-25T14:30:00Z',
    sessionsCompleted: 12,
  },
  createdAt: '2024-01-20T10:00:00Z',
  updatedAt: '2024-01-25T14:30:00Z',
};

import { setsRepository, foldersRepository, authRepository } from '../services/storage';

export function initializeDemoData() {
  if (setsRepository.getAll().length === 0) {
    setsRepository.save(demoStudySet);
  }
  if (foldersRepository.getAll().length === 0) {
    foldersRepository.save(demoFolder);
  }
  if (!authRepository.getUser()) {
    authRepository.setUser(demoUser);
    authRepository.setAuth(true);
  }
}
