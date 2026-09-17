export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  preferences: UserPreferences;
  createdAt: string;
}

export interface UserPreferences {
  language: string;
  timezone: string;
  notifications: boolean;
  studyReminders: boolean;
  theme: 'light' | 'dark';
}

export interface StudySet {
  id: string;
  userId: string;
  title: string;
  description: string;
  folderId?: string;
  sourceFiles: SourceFile[];
  flashcards: Flashcard[];
  quiz: Quiz;
  writtenTest: WrittenTest;
  fillBlanks: FillBlank[];
  notes: Note;
  podcast?: Podcast;
  tutorMessages: TutorMessage[];
  progress: SetProgress;
  createdAt: string;
  updatedAt: string;
}

export interface SourceFile {
  id: string;
  name: string;
  size: number;
  type: string;
  status: SourceStatus;
  progress: number;
  url?: string;
  errorMessage?: string;
  extractedContent?: string;
  metadata?: Record<string, any>;
}

export type SourceStatus = 
  | 'queued'
  | 'uploading'
  | 'processing'
  | 'extracting'
  | 'chunking'
  | 'indexing'
  | 'generating'
  | 'completed'
  | 'error';

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  status: CardStatus;
  isDifficult: boolean;
  timesReviewed: number;
  lastReviewed?: string;
}

export type CardStatus = 'unfamiliar' | 'learning' | 'familiar' | 'mastered';

export interface Quiz {
  id: string;
  questions: QuizQuestion[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface WrittenTest {
  id: string;
  questions: WrittenQuestion[];
}

export interface WrittenQuestion {
  id: string;
  question: string;
  modelAnswer: string;
  explanation: string;
  userAnswer?: string;
  evaluated?: boolean;
  score?: number;
  feedback?: string;
}

export interface FillBlank {
  id: string;
  sentence: string;
  blanks: { placeholder: string; answer: string }[];
  explanation: string;
  userAnswers?: string[];
  evaluated?: boolean;
}

export interface Note {
  id: string;
  title: string;
  summary: string;
  mainConcepts: string[];
  definitions: { term: string; definition: string }[];
  examples: string[];
  keyPoints: string[];
  customContent: string;
}

export interface Podcast {
  id: string;
  title: string;
  description: string;
  duration: number;
  audioUrl?: string;
  coverUrl?: string;
  status: 'generating' | 'ready' | 'error';
}

export interface TutorMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  suggestions?: string[];
}

export interface Folder {
  id: string;
  userId: string;
  name: string;
  color: string;
  setIds: string[];
  createdAt: string;
}

export interface SetProgress {
  totalCards: number;
  masteredCards: number;
  familiarCards: number;
  learningCards: number;
  unfamiliarCards: number;
  quizScore: number;
  quizAttempts: number;
  writtenScore: number;
  fillBlankScore: number;
  masteryPercent: number;
  lastStudied?: string;
  sessionsCompleted: number;
}

export interface StudySession {
  id: string;
  userId: string;
  setId: string;
  type: 'flashcards' | 'quiz' | 'written' | 'fillblanks' | 'tutor' | 'podcast';
  duration: number;
  cardsReviewed?: number;
  score?: number;
  date: string;
}

export interface ResolveResult {
  id: string;
  imageUrl: string;
  detectedProblem: string;
  solution: string;
  steps: string[];
  explanation: string;
  followUpQuestions: string[];
}

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
}

// Knowledge Chunks - Fragmentos de conocimiento extraídos
export interface KnowledgeChunk {
  id: string;
  studySetId: string;
  sourceId: string;
  content: string;
  metadata: {
    pageNumber?: number;
    slideNumber?: number;
    timestamp?: number;
    section?: string;
    heading?: string;
  };
  embedding?: number[];
  createdAt: string;
}

// Generated Content - Contenido generado con metadatos
export interface GeneratedContent {
  id: string;
  studySetId: string;
  type: 'flashcards' | 'quiz' | 'written' | 'fillblanks' | 'notes' | 'tutor' | 'podcast';
  sourceIds: string[];
  version: number;
  createdAt: string;
  updatedAt: string;
  status: 'generating' | 'completed' | 'error';
  errorMessage?: string;
}

// Ingestion Pipeline State
export interface IngestionState {
  studySetId: string;
  sources: SourceFile[];
  chunks: KnowledgeChunk[];
  generatedContent: Record<string, GeneratedContent>;
  overallProgress: number;
  status: 'idle' | 'processing' | 'completed' | 'error';
}
