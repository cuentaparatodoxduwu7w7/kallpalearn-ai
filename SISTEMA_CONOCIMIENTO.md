# Sistema de Conocimiento Personalizado - KallpaLearn AI

## 🎯 Overview

KallpaLearn AI ahora cuenta con un sistema de conocimiento personalizado que permite a la IA actuar como un tutor privado que conoce los materiales, preferencias y progreso de cada estudiante.

**IMPORTANTE**: Este sistema NO entrena el modelo de IA globalmente con los documentos del usuario. En su lugar, implementa un sistema privado de memoria y recuperación por usuario y Study Set usando RAG (Retrieval Augmented Generation).

## 🏗️ Arquitectura del Sistema

### Componentes Principales

```
src/services/
├── knowledge-base/      # Almacenamiento de chunks por usuario
├── learner-profile/     # Perfil de aprendizaje personalizado
├── rag/                # Retrieval Augmented Generation
├── memory/             # Memoria del tutor (conversaciones)
└── cleanup/            # Limpieza de datos al eliminar Study Sets
```

### Flujo de Conocimiento

```
1. Usuario sube material
   ↓
2. Se extrae el contenido
   ↓
3. Se divide en chunks con metadatos
   ↓
4. Se generan embeddings (si hay proveedor)
   ↓
5. Se almacenan en KnowledgeBase (aislado por userId)
   ↓
6. Cuando el usuario pregunta:
   ↓
7. RAG busca chunks relevantes
   ↓
8. Se construye contexto con chunks + perfil
   ↓
9. AIProvider genera respuesta contextualizada
   ↓
10. Se muestran citas de fuentes cuando es posible
```

## 🔐 Aislamiento de Datos

### Principio Fundamental

**Un usuario NUNCA debe recuperar información perteneciente a otro usuario.**

Todos los servicios implementan aislamiento estricto:

```typescript
// KnowledgeBase
getUserChunks(userId: string): KnowledgeChunk[] {
  return allChunks.filter(chunk => chunk.userId === userId);
}

// MemoryService
getActiveConversation(studySetId: string, userId: string) {
  return conversations.find(c => 
    c.userId === userId && c.studySetId === studySetId
  );
}

// LearnerProfile
getProfile(userId: string): LearnerProfile {
  return profiles.find(p => p.userId === userId);
}
```

### Preparación para Supabase RLS

Cuando se conecte Supabase, se implementará Row Level Security:

```sql
-- Ejemplo de políticas RLS
CREATE POLICY "Users can only access their own chunks"
ON knowledge_chunks
FOR ALL
USING (auth.uid() = user_id);

CREATE POLICY "Users can only access their own conversations"
ON tutor_conversations
FOR ALL
USING (auth.uid() = user_id);
```

## 📚 Knowledge Base

### Estructura de KnowledgeChunk

```typescript
interface KnowledgeChunk {
  id: string;
  userId: string;              // Aislamiento por usuario
  studySetId: string;          // Asociación al Study Set
  sourceId: string;            // Archivo de origen
  content: string;             // Texto del chunk
  metadata: {
    pageNumber?: number;       // Para PDFs
    slideNumber?: number;      // Para PPTs
    timestamp?: number;        // Para videos/audio
    section?: string;          // Sección del documento
    heading?: string;          // Encabezado
  };
  embedding?: number[];        // Vector para búsqueda semántica
  createdAt: string;
}
```

### Operaciones

```typescript
import { knowledgeBaseService } from './services/knowledge-base';

// Obtener chunks del usuario
const chunks = knowledgeBaseService.getUserChunks(userId);

// Obtener chunks de un Study Set
const setChunks = knowledgeBaseService.getStudySetChunks(studySetId, userId);

// Guardar chunks
knowledgeBaseService.saveChunks(newChunks);

// Eliminar chunks de un Study Set
knowledgeBaseService.deleteStudySetChunks(studySetId, userId);
```

## 👤 Learner Profile

### Estructura del Perfil

```typescript
interface LearnerProfile {
  id: string;
  userId: string;
  preferredLanguage: string;
  studyLevel: 'beginner' | 'intermediate' | 'advanced';
  subjects: string[];
  goals: string[];
  preferredExplanationStyle: 'simple' | 'detailed' | 'examples' | 'visual';
  difficultyPreference: 'easy' | 'medium' | 'hard' | 'adaptive';
  commonMistakes: string[];
  weakTopics: string[];        // Temas que necesita reforzar
  strongTopics: string[];      // Temas que domina
  recentStudyActivity: RecentActivity[];
  createdAt: string;
  updatedAt: string;
}
```

### Aprendizaje Automático de Preferencias

El perfil aprende de las interacciones del usuario:

```typescript
import { learnerProfileService } from './services/learner-profile';

// Registrar intento de pregunta
learnerProfileService.recordQuestionAttempt({
  userId,
  studySetId,
  questionId: 'q123',
  questionType: 'quiz',
  correct: false,
  confidence: 0.6,
  timeSpent: 45
});

// El servicio automáticamente:
// 1. Actualiza el dominio del tema
// 2. Identifica temas débiles (si falla repetidamente)
// 3. Identifica temas fuertes (si domina repetidamente)
// 4. Detecta patrones de errores comunes
```

### Detección de Preferencias

```typescript
// Si el usuario pide "explícamelo más fácil" frecuentemente:
learnerProfile.updatePreferences(userId, {
  preferredExplanationStyle: 'simple'
});

// Si falla muchas preguntas sobre "mitosis":
// weakTopics += "mitosis"

// Si domina repetidamente "fotosíntesis":
// strongTopics += "fotosíntesis"
```

## 🔍 RAG (Retrieval Augmented Generation)

### Flujo de RAG

```typescript
import { ragService } from './services/rag';

// 1. Usuario hace una pregunta
const query = "¿Qué es la mitocondria?";

// 2. RAG busca chunks relevantes
const { chunks, citations } = await ragService.retrieveRelevantChunks(
  query,
  studySetId,
  userId,
  5 // top K
);

// 3. Construye contexto con chunks + perfil
const context = ragService.buildContext(chunks, citations, learnerProfile);

// 4. Genera respuesta usando AIProvider
const response = await ragService.generateResponse(
  query,
  studySetId,
  userId,
  conversationHistory
);

// 5. Respuesta incluye citas de fuentes
console.log(response.answer);
console.log(response.citations); // [{sourceId, pageNumber, ...}]
```

### Búsqueda de Chunks Relevantes

**Con embeddings (búsqueda semántica):**
```typescript
if (embeddingsService.isEnabled() && chunksHaveEmbeddings) {
  const results = await embeddingsService.searchSimilar(query, chunks, topK);
  // Retorna chunks ordenados por similitud coseno
}
```

**Sin embeddings (búsqueda por palabras clave):**
```typescript
// Fallback: búsqueda por términos
const queryTerms = query.toLowerCase().split(/\s+/);
const scoredChunks = chunks.map(chunk => {
  const score = queryTerms.filter(term => 
    chunk.content.toLowerCase().includes(term)
  ).length;
  return { chunk, score };
});
```

### Citas de Fuentes

Cuando la respuesta se basa en el material, se muestran citas:

```typescript
// Formato de cita
"Fuentes: Biología_Unidad1.pdf, página 4"
"Fuentes: Clase_03.pptx, diapositiva 12"
"Fuentes: Video_lectura.mp4, 2:30"

// Implementación
const citationsText = ragService.formatCitations(citations, sourceNames);
responseContent += `\n\n_${citationsText}_`;
```

### Cuando NO hay información en el material

```typescript
// Si no hay chunks relevantes:
if (chunks.length === 0) {
  // La IA responde:
  "Esto no aparece en el material que subiste. 
   Puedo darte una explicación general si quieres."
}
```

## 💬 Memoria del Tutor

### Conversaciones Contextuales

```typescript
import { memoryService } from './services/memory';

// Crear conversación para un Study Set
const conversation = memoryService.createConversation(studySetId);

// Agregar mensajes
memoryService.addMessageToConversation(conversationId, userMessage);
memoryService.addMessageToConversation(conversationId, assistantMessage);

// Obtener historial reciente
const recentMessages = memoryService.getRecentMessages(conversationId, 10);

// Actualizar contexto con chunks relevantes
memoryService.updateConversationContext(conversationId, {
  relevantChunks: ['chunk1', 'chunk2'],
  topic: 'mitocondria'
});
```

### Items de Memoria

```typescript
import { memoryService } from './services/memory';

// Guardar un hecho importante
memoryService.createMemoryItem(
  studySetId,
  'fact',
  'El estudiante prefiere explicaciones con ejemplos',
  { source: 'user_preference' },
  0.8 // importancia
);

// Obtener items relevantes
const items = memoryService.getRelevantMemoryItems(studySetId, userId, 10);
```

## 🧹 Limpieza de Datos

### Eliminación Completa de Study Set

Cuando el usuario elimina un Study Set, se eliminan TODOS los datos asociados:

```typescript
import { cleanupService } from './services/cleanup';

await cleanupService.deleteStudySet(studySetId, userId);

// Esto elimina:
// ✅ Archivos del Study Set
// ✅ Chunks de conocimiento
// ✅ Embeddings
// ✅ Flashcards, quizzes, tests
// ✅ Notas
// ✅ Podcast
// ✅ Conversaciones del tutor
// ✅ Items de memoria
```

### Eliminación de Datos del Usuario

```typescript
// Eliminar todos los datos del usuario
await cleanupService.deleteUserData(userId);

// Esto elimina:
// ✅ Todos los Study Sets
// ✅ Todos los chunks
// ✅ Perfil de aprendizaje
// ✅ Todas las conversaciones
// ✅ Todos los items de memoria
```

### Limpieza de Datos Huérfanos

```typescript
// Limpiar datos que quedaron sin Study Set
const stats = await cleanupService.cleanupOrphanedData(userId);
console.log(`Chunks huérfanos: ${stats.orphanedChunks}`);
```

## 🎨 Integración con la UI

### Tutor IA con RAG

El Tutor ahora usa RAG para responder:

```typescript
// En Tutor.tsx
const ragResponse = await ragService.generateResponse(
  userQuestion,
  studySet.id,
  userId,
  conversationHistory
);

// Mostrar respuesta con citas
let responseContent = ragResponse.answer;
if (ragResponse.citations.length > 0) {
  const citationsText = ragService.formatCitations(citations, sourceNames);
  responseContent += `\n\n_${citationsText}_`;
}
```

### Perfil de Aprendizaje

Nueva página para ver y editar el perfil:

```typescript
// Ruta: /app/profile
import { LearnerProfilePage } from './pages/LearnerProfile';

// Muestra:
// - Estilo de explicación preferido
// - Nivel de dificultad
// - Temas fuertes
// - Temas débiles
// - Actividad reciente
```

### Indicadores de Modo Demo

Cuando no hay proveedor de IA configurado:

```typescript
if (aiRouter.isDemoMode()) {
  // Mostrar badge "Modo Demo"
  // Usar contenido de demostración
  // Nunca mostrar undefined
  // Nunca romper la UI
}
```

## 🔒 Seguridad y Privacidad

### Principios

1. **No entrenar modelos globales**: Los documentos del usuario NUNCA se usan para entrenar el modelo base
2. **Aislamiento estricto**: Cada usuario solo accede a sus propios datos
3. **Sin API keys en frontend**: Las API keys se manejan en el backend
4. **RLS con Supabase**: Cuando se conecte, implementar Row Level Security
5. **Derecho al olvido**: El usuario puede eliminar todos sus datos

### Variables de Entorno

```bash
# .env.example
# Las API keys van en el backend, NO aquí
VITE_AI_PROVIDER=demo
VITE_EMBEDDINGS_ENABLED=true
```

### Preparación para Supabase

```typescript
// Cuando se conecte Supabase:
// 1. Reemplazar localStorage con Supabase client
// 2. Implementar RLS policies
// 3. Usar auth.uid() para aislamiento
// 4. Mantener la misma interfaz de servicios

// Ejemplo:
export class SupabaseKnowledgeBaseService {
  async getUserChunks(userId: string) {
    const { data } = await supabase
      .from('knowledge_chunks')
      .select('*')
      .eq('user_id', userId); // RLS también filtra esto
    return data;
  }
}
```

## 📊 Métricas y Estadísticas

### Knowledge Base Stats

```typescript
const stats = knowledgeBaseService.getStats(userId);
// {
//   totalChunks: 150,
//   studySetsCount: 5,
//   sourcesCount: 12,
//   chunksWithEmbeddings: 150
// }
```

### Learner Profile Stats

```typescript
const profile = learnerProfileService.getProfile(userId);
// weakTopics: ['mitosis', 'fotosíntesis']
// strongTopics: ['célula', 'ADN']
// recentStudyActivity: [...]
```

### Memory Stats

```typescript
const stats = memoryService.getStats(userId);
// {
//   conversationsCount: 15,
//   memoryItemsCount: 42,
//   totalMessages: 230
// }
```

## 🚀 Uso en Producción

### Checklist para Producción

- [ ] Conectar backend con proveedores de IA
- [ ] Implementar Supabase con RLS
- [ ] Configurar servicio de embeddings real
- [ ] Implementar OCR para imágenes
- [ ] Implementar transcripción para audio/video
- [ ] Configurar YouTube API
- [ ] Configurar web scraping
- [ ] Implementar TTS para podcasts
- [ ] Agregar rate limiting
- [ ] Implementar caching de embeddings
- [ ] Agregar monitoring y logging
- [ ] Implementar backup de datos

### Migración de Demo a Producción

```typescript
// 1. Cambiar proveedor de IA
aiRouter.setProvider('openai'); // o 'anthropic'

// 2. Habilitar embeddings reales
embeddingsService.setProvider(new OpenAIEmbeddingProvider());

// 3. Conectar Supabase
// Reemplazar servicios de localStorage con servicios de Supabase

// 4. Deshabilitar modo demo
configService.updateConfig({
  features: { demoMode: false }
});
```

## 📝 Notas Importantes

1. **Fallback Graceful**: Si un servicio falla, la aplicación continúa funcionando
2. **Modo Demo**: La aplicación funciona completamente sin APIs configuradas
3. **Privacidad**: Los datos del usuario están aislados y nunca se comparten
4. **Escalabilidad**: La arquitectura permite agregar nuevos proveedores fácilmente
5. **Mantenibilidad**: Cada servicio tiene una responsabilidad clara

## 🔮 Próximos Pasos

1. **Backend API**: Crear endpoints para procesamiento de IA
2. **Supabase Integration**: Conectar base de datos con RLS
3. **Embeddings Reales**: Implementar OpenAI/ Cohere embeddings
4. **Vector Database**: Considerar Pinecone/Weaviate para búsqueda semántica
5. **Caching**: Implementar cache de respuestas frecuentes
6. **Analytics**: Agregar tracking de uso y efectividad
7. **Personalización Avanzada**: Algoritmos de recomendación de contenido

---

**Desarrollado con ❤️ para KallpaLearn AI**

*Tu tutor privado que conoce tus materiales, tu progreso y tus preferencias.*
