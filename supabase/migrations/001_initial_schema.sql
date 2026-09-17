-- KallpaLearn AI - Supabase Database Schema
-- Ejecutar este script en el SQL Editor de Supabase

-- ============================================
-- TABLAS PRINCIPALES
-- ============================================

-- Perfiles de usuario
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  preferred_language TEXT DEFAULT 'es',
  timezone TEXT DEFAULT 'America/Lima',
  notifications BOOLEAN DEFAULT true,
  study_reminders BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Carpetas para organizar Study Sets
CREATE TABLE IF NOT EXISTS folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#f97316',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Study Sets (conjuntos de estudio)
CREATE TABLE IF NOT EXISTS study_sets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  folder_id UUID REFERENCES folders(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Fuentes de material (archivos subidos)
CREATE TABLE IF NOT EXISTS sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  study_set_id UUID NOT NULL REFERENCES study_sets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  size BIGINT NOT NULL,
  type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'queued',
  progress INTEGER DEFAULT 0,
  url TEXT,
  extracted_content TEXT,
  metadata JSONB DEFAULT '{}',
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chunks de conocimiento (fragmentos extraídos)
CREATE TABLE IF NOT EXISTS source_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  study_set_id UUID NOT NULL REFERENCES study_sets(id) ON DELETE CASCADE,
  source_id UUID NOT NULL REFERENCES sources(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  embedding VECTOR(384),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Flashcards
CREATE TABLE IF NOT EXISTS flashcards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  study_set_id UUID NOT NULL REFERENCES study_sets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  front TEXT NOT NULL,
  back TEXT NOT NULL,
  status TEXT DEFAULT 'unfamiliar',
  is_difficult BOOLEAN DEFAULT false,
  times_reviewed INTEGER DEFAULT 0,
  last_reviewed TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Quizzes
CREATE TABLE IF NOT EXISTS quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  study_set_id UUID NOT NULL REFERENCES study_sets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Preguntas de quiz
CREATE TABLE IF NOT EXISTS quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_index INTEGER NOT NULL,
  explanation TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Exámenes escritos
CREATE TABLE IF NOT EXISTS written_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  study_set_id UUID NOT NULL REFERENCES study_sets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Preguntas de examen escrito
CREATE TABLE IF NOT EXISTS written_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  written_test_id UUID NOT NULL REFERENCES written_tests(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  model_answer TEXT NOT NULL,
  explanation TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ejercicios de completar espacios
CREATE TABLE IF NOT EXISTS fill_blanks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  study_set_id UUID NOT NULL REFERENCES study_sets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  sentence TEXT NOT NULL,
  blanks JSONB NOT NULL,
  explanation TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notas inteligentes
CREATE TABLE IF NOT EXISTS notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  study_set_id UUID NOT NULL REFERENCES study_sets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  main_concepts JSONB DEFAULT '[]',
  definitions JSONB DEFAULT '[]',
  examples JSONB DEFAULT '[]',
  key_points JSONB DEFAULT '[]',
  custom_content TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Podcasts
CREATE TABLE IF NOT EXISTS podcasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  study_set_id UUID NOT NULL REFERENCES study_sets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  duration INTEGER DEFAULT 0,
  audio_url TEXT,
  cover_url TEXT,
  status TEXT DEFAULT 'generating',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Perfiles de aprendizaje
CREATE TABLE IF NOT EXISTS learner_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  preferred_language TEXT DEFAULT 'es',
  study_level TEXT DEFAULT 'intermediate',
  subjects JSONB DEFAULT '[]',
  goals JSONB DEFAULT '[]',
  preferred_explanation_style TEXT DEFAULT 'detailed',
  difficulty_preference TEXT DEFAULT 'adaptive',
  common_mistakes JSONB DEFAULT '[]',
  weak_topics JSONB DEFAULT '[]',
  strong_topics JSONB DEFAULT '[]',
  recent_study_activity JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Conversaciones del tutor
CREATE TABLE IF NOT EXISTS tutor_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  study_set_id UUID NOT NULL REFERENCES study_sets(id) ON DELETE CASCADE,
  context JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Mensajes del tutor
CREATE TABLE IF NOT EXISTS tutor_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES tutor_conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  suggestions JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Eventos de progreso
CREATE TABLE IF NOT EXISTS progress_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  study_set_id UUID NOT NULL REFERENCES study_sets(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  event_data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ÍNDICES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_folders_user_id ON folders(user_id);
CREATE INDEX IF NOT EXISTS idx_study_sets_user_id ON study_sets(user_id);
CREATE INDEX IF NOT EXISTS idx_study_sets_folder_id ON study_sets(folder_id);
CREATE INDEX IF NOT EXISTS idx_sources_study_set_id ON sources(study_set_id);
CREATE INDEX IF NOT EXISTS idx_sources_user_id ON sources(user_id);
CREATE INDEX IF NOT EXISTS idx_source_chunks_study_set_id ON source_chunks(study_set_id);
CREATE INDEX IF NOT EXISTS idx_source_chunks_user_id ON source_chunks(user_id);
CREATE INDEX IF NOT EXISTS idx_flashcards_study_set_id ON flashcards(study_set_id);
CREATE INDEX IF NOT EXISTS idx_flashcards_user_id ON flashcards(user_id);
CREATE INDEX IF NOT EXISTS idx_quizzes_study_set_id ON quizzes(study_set_id);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_quiz_id ON quiz_questions(quiz_id);
CREATE INDEX IF NOT EXISTS idx_written_tests_study_set_id ON written_tests(study_set_id);
CREATE INDEX IF NOT EXISTS idx_written_questions_test_id ON written_questions(written_test_id);
CREATE INDEX IF NOT EXISTS idx_fill_blanks_study_set_id ON fill_blanks(study_set_id);
CREATE INDEX IF NOT EXISTS idx_notes_study_set_id ON notes(study_set_id);
CREATE INDEX IF NOT EXISTS idx_podcasts_study_set_id ON podcasts(study_set_id);
CREATE INDEX IF NOT EXISTS idx_learner_profiles_user_id ON learner_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_tutor_conversations_user_id ON tutor_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_tutor_conversations_study_set_id ON tutor_conversations(study_set_id);
CREATE INDEX IF NOT EXISTS idx_tutor_messages_conversation_id ON tutor_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_progress_events_user_id ON progress_events(user_id);
CREATE INDEX IF NOT EXISTS idx_progress_events_study_set_id ON progress_events(study_set_id);

-- Índice para búsqueda vectorial (embeddings)
CREATE INDEX IF NOT EXISTS idx_source_chunks_embedding ON source_chunks 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Habilitar RLS en todas las tablas
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE source_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE flashcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE written_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE written_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE fill_blanks ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE podcasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE learner_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tutor_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE tutor_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress_events ENABLE ROW LEVEL SECURITY;

-- ============================================
-- POLÍTICAS RLS
-- ============================================

-- Profiles: usuarios solo pueden ver y modificar su propio perfil
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Folders: usuarios solo pueden acceder a sus propias carpetas
CREATE POLICY "Users can view own folders"
  ON folders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own folders"
  ON folders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own folders"
  ON folders FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own folders"
  ON folders FOR DELETE
  USING (auth.uid() = user_id);

-- Study Sets: usuarios solo pueden acceder a sus propios sets
CREATE POLICY "Users can view own study sets"
  ON study_sets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own study sets"
  ON study_sets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own study sets"
  ON study_sets FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own study sets"
  ON study_sets FOR DELETE
  USING (auth.uid() = user_id);

-- Sources: usuarios solo pueden acceder a sus propias fuentes
CREATE POLICY "Users can view own sources"
  ON sources FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own sources"
  ON sources FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sources"
  ON sources FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own sources"
  ON sources FOR DELETE
  USING (auth.uid() = user_id);

-- Source Chunks: usuarios solo pueden acceder a sus propios chunks
CREATE POLICY "Users can view own chunks"
  ON source_chunks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own chunks"
  ON source_chunks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own chunks"
  ON source_chunks FOR DELETE
  USING (auth.uid() = user_id);

-- Flashcards: usuarios solo pueden acceder a sus propias flashcards
CREATE POLICY "Users can view own flashcards"
  ON flashcards FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own flashcards"
  ON flashcards FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own flashcards"
  ON flashcards FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own flashcards"
  ON flashcards FOR DELETE
  USING (auth.uid() = user_id);

-- Quizzes: usuarios solo pueden acceder a sus propios quizzes
CREATE POLICY "Users can view own quizzes"
  ON quizzes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own quizzes"
  ON quizzes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own quizzes"
  ON quizzes FOR DELETE
  USING (auth.uid() = user_id);

-- Quiz Questions: acceso basado en el quiz padre
CREATE POLICY "Users can view own quiz questions"
  ON quiz_questions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM quizzes
      WHERE quizzes.id = quiz_questions.quiz_id
      AND quizzes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create own quiz questions"
  ON quiz_questions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM quizzes
      WHERE quizzes.id = quiz_questions.quiz_id
      AND quizzes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own quiz questions"
  ON quiz_questions FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM quizzes
      WHERE quizzes.id = quiz_questions.quiz_id
      AND quizzes.user_id = auth.uid()
    )
  );

-- Written Tests: usuarios solo pueden acceder a sus propios exámenes
CREATE POLICY "Users can view own written tests"
  ON written_tests FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own written tests"
  ON written_tests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own written tests"
  ON written_tests FOR DELETE
  USING (auth.uid() = user_id);

-- Written Questions: acceso basado en el test padre
CREATE POLICY "Users can view own written questions"
  ON written_questions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM written_tests
      WHERE written_tests.id = written_questions.written_test_id
      AND written_tests.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create own written questions"
  ON written_questions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM written_tests
      WHERE written_tests.id = written_questions.written_test_id
      AND written_tests.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own written questions"
  ON written_questions FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM written_tests
      WHERE written_tests.id = written_questions.written_test_id
      AND written_tests.user_id = auth.uid()
    )
  );

-- Fill Blanks: usuarios solo pueden acceder a sus propios ejercicios
CREATE POLICY "Users can view own fill blanks"
  ON fill_blanks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own fill blanks"
  ON fill_blanks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own fill blanks"
  ON fill_blanks FOR DELETE
  USING (auth.uid() = user_id);

-- Notes: usuarios solo pueden acceder a sus propias notas
CREATE POLICY "Users can view own notes"
  ON notes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own notes"
  ON notes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notes"
  ON notes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notes"
  ON notes FOR DELETE
  USING (auth.uid() = user_id);

-- Podcasts: usuarios solo pueden acceder a sus propios podcasts
CREATE POLICY "Users can view own podcasts"
  ON podcasts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own podcasts"
  ON podcasts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own podcasts"
  ON podcasts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own podcasts"
  ON podcasts FOR DELETE
  USING (auth.uid() = user_id);

-- Learner Profiles: usuarios solo pueden acceder a su propio perfil de aprendizaje
CREATE POLICY "Users can view own learner profile"
  ON learner_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own learner profile"
  ON learner_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own learner profile"
  ON learner_profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own learner profile"
  ON learner_profiles FOR DELETE
  USING (auth.uid() = user_id);

-- Tutor Conversations: usuarios solo pueden acceder a sus propias conversaciones
CREATE POLICY "Users can view own conversations"
  ON tutor_conversations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own conversations"
  ON tutor_conversations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own conversations"
  ON tutor_conversations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own conversations"
  ON tutor_conversations FOR DELETE
  USING (auth.uid() = user_id);

-- Tutor Messages: acceso basado en la conversación padre
CREATE POLICY "Users can view own messages"
  ON tutor_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM tutor_conversations
      WHERE tutor_conversations.id = tutor_messages.conversation_id
      AND tutor_conversations.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create own messages"
  ON tutor_messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tutor_conversations
      WHERE tutor_conversations.id = tutor_messages.conversation_id
      AND tutor_conversations.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own messages"
  ON tutor_messages FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM tutor_conversations
      WHERE tutor_conversations.id = tutor_messages.conversation_id
      AND tutor_conversations.user_id = auth.uid()
    )
  );

-- Progress Events: usuarios solo pueden acceder a sus propios eventos
CREATE POLICY "Users can view own progress events"
  ON progress_events FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own progress events"
  ON progress_events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own progress events"
  ON progress_events FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- FUNCIONES Y TRIGGERS
-- ============================================

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para actualizar updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_folders_updated_at
  BEFORE UPDATE ON folders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_study_sets_updated_at
  BEFORE UPDATE ON study_sets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sources_updated_at
  BEFORE UPDATE ON sources
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_flashcards_updated_at
  BEFORE UPDATE ON flashcards
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notes_updated_at
  BEFORE UPDATE ON notes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_podcasts_updated_at
  BEFORE UPDATE ON podcasts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_learner_profiles_updated_at
  BEFORE UPDATE ON learner_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tutor_conversations_updated_at
  BEFORE UPDATE ON tutor_conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Función para crear perfil automáticamente cuando se registra un usuario
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name'
  );
  
  INSERT INTO learner_profiles (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para crear perfil automáticamente
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================
-- STORAGE
-- ============================================

-- Crear bucket para materiales de estudio
INSERT INTO storage.buckets (id, name, public)
VALUES ('study-materials', 'study-materials', false)
ON CONFLICT (id) DO NOTHING;

-- Políticas de storage
CREATE POLICY "Users can view their own files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'study-materials' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can upload their own files"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'study-materials' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can update their own files"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'study-materials' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can delete their own files"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'study-materials' AND (storage.foldername(name))[1] = auth.uid()::text);

-- ============================================
-- FIN DEL SCRIPT
-- ============================================
