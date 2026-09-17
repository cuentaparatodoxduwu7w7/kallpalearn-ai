# KallpaLearn AI - Arquitectura de Ingestión de Conocimiento

## 🎯 Overview

KallpaLearn AI ahora cuenta con un pipeline completo de ingestión de conocimiento que procesa material de estudio y genera contenido educativo utilizando IA.

## 🏗️ Arquitectura de Servicios

### Capas de Servicios

```
src/services/
├── ingestion/          # Pipeline principal de ingestión
├── extraction/         # Extracción de contenido de archivos
│   ├── youtube.ts     # Servicio para videos de YouTube
│   └── web-scraper.ts # Servicio para páginas web
├── chunking/          # División de contenido en fragmentos
├── embeddings/        # Generación de embeddings para búsqueda
├── ai/                # Servicios de IA
│   ├── router.ts      # Router de proveedores de IA
│   ├── demo-provider.ts # Proveedor de demostración
│   └── index.ts       # Servicio de IA legacy
├── study-generation/  # Generación de contenido de estudio
├── storage/           # Almacenamiento de datos
├── config.ts          # Configuración de la aplicación
└── types.ts           # Interfaces de proveedores
```

### Flujo de Ingestión

```
Usuario sube material
    ↓
Identificación de tipo
    ↓
Extracción de contenido
    ↓
Normalización
    ↓
División en chunks
    ↓
Generación de embeddings
    ↓
Indexación
    ↓
Generación de materiales de estudio
    ↓
Conexión al Study Set
```

## 📦 Tipos de Entrada Soportados

### Documentos
- **PDF**: Extracción de texto con metadatos de página
- **DOC/DOCX**: Extracción de texto y estructura
- **PPT/PPTX**: Extracción por diapositivas
- **TXT**: Texto plano

### Imágenes
- **JPG/PNG/WEBP**: OCR para extracción de texto (preparado)

### Audio/Video
- **MP3/WAV/M4A**: Transcripción de audio (preparado)
- **MP4**: Extracción de audio + transcripción (preparado)

### URLs
- **YouTube**: Obtención de transcripción (requiere backend)
- **Website**: Web scraping (requiere backend)

### Otros
- **Texto pegado**: Procesamiento directo
- **Grabación de audio**: Transcripción en tiempo real (preparado)

## 🔄 Estados de Procesamiento

Cada fuente de material pasa por los siguientes estados:

1. `queued` - En cola para procesamiento
2. `uploading` - Subiendo archivo
3. `processing` - Procesando
4. `extracting` - Extrayendo contenido
5. `chunking` - Dividiendo en fragmentos
6. `indexing` - Generando índices/embeddings
7. `generating` - Generando contenido de estudio
8. `completed` - Completado exitosamente
9. `error` - Error en el procesamiento

## 🤖 Proveedores de IA

### AI Router

El sistema utiliza un router que permite seleccionar entre diferentes proveedores:

```typescript
import { aiRouter } from './services/ai/router';

// Cambiar proveedor
aiRouter.setProvider('openai'); // o 'anthropic', 'demo', etc.

// Verificar modo demo
if (aiRouter.isDemoMode()) {
  // Usar contenido de demostración
}
```

### Proveedor Demo

El proveedor demo funciona sin API keys y genera contenido de demostración:

- **Flashcards**: Tarjetas de ejemplo
- **Quiz**: Preguntas de demostración
- **Notas**: Resumen de ejemplo
- **Tutor**: Respuestas predefinidas

### Conectar Proveedores Reales

Para conectar proveedores reales (OpenAI, Anthropic, etc.):

1. **NUNCA** pongas API keys en el frontend
2. Configura las API keys en el backend
3. Crea un provider que se comunique con tu backend
4. Registra el provider en el router

Ejemplo:
```typescript
// src/services/ai/openai-provider.ts
export class OpenAIProvider implements AIProvider {
  async generateText(prompt: string): Promise<string> {
    // Llamar a tu backend, NO directamente a OpenAI
    const response = await fetch('/api/generate', {
      method: 'POST',
      body: JSON.stringify({ prompt })
    });
    return response.text();
  }
}

// Registrar en router
aiRouter.registerProvider('openai', new OpenAIProvider());
```

## 📚 Generación de Contenido

### Métodos Disponibles

```typescript
import { studyGenerationService } from './services/study-generation';

// Generar flashcards
const flashcards = await studyGenerationService.generateFlashcards(chunks, 10);

// Generar quiz
const quiz = await studyGenerationService.generateQuiz(chunks, 10);

// Generar examen escrito
const writtenTest = await studyGenerationService.generateWrittenTest(chunks);

// Generar completar espacios
const fillBlanks = await studyGenerationService.generateFillBlanks(chunks);

// Generar notas inteligentes
const notes = await studyGenerationService.generateNotes(chunks);

// Generar guión de podcast
const script = await studyGenerationService.generatePodcastScript(chunks, 'Título');
```

### Editabilidad

Todo contenido generado puede ser:
- ✅ Editado manualmente
- ✅ Regenerado
- ✅ Eliminado
- ✅ Agregado manualmente

## 🔍 Embeddings y Búsqueda

### Generación de Embeddings

```typescript
import { embeddingsService } from './services/embeddings';

// Habilitar/deshabilitar
embeddingsService.setEnabled(true);

// Generar embedding para un chunk
const chunkWithEmbedding = await embeddingsService.generateEmbedding(chunk);

// Buscar chunks similares
const results = await embeddingsService.searchSimilar(query, chunks, 5);
```

### Modo Demo

En modo demo, se generan embeddings simulados que permiten probar la funcionalidad sin un proveedor real.

## 🔐 Seguridad

### Variables de Entorno

Las API keys **NUNCA** deben estar en:
- ❌ Componentes React
- ❌ Archivos públicos
- ❌ localStorage
- ❌ Código frontend

Configuración segura:
```bash
# .env.example
VITE_AI_PROVIDER=demo
VITE_EMBEDDINGS_ENABLED=true
# Las API keys van en el backend, NO aquí
```

### Configuración

```typescript
import { configService } from './services/config';

// Obtener configuración
const config = configService.getConfig();

// Verificar modo demo
if (configService.isDemoMode()) {
  // Mostrar indicadores de demo
}
```

## 🎨 Indicadores de Modo Demo

La aplicación muestra indicadores claros cuando está en modo demo:

- Badge "Modo Demo" en páginas principales
- Mensajes informativos sobre limitaciones
- Contenido de demostración claramente identificado
- Nunca muestra `undefined` o rompe la UI

## 🚀 Uso del Pipeline

### Pipeline Completo

```typescript
import { ingestionPipeline } from './services/ingestion';

const result = await ingestionPipeline.runFullPipeline(
  studySet,
  ['flashcards', 'quiz', 'notes'],
  {
    onProgress: (progress) => {
      console.log(`${progress.status}: ${progress.progress}%`);
    },
    onComplete: (finalSet) => {
      console.log('Pipeline completado');
    },
    onError: (error, sourceId) => {
      console.error('Error:', error);
    }
  }
);
```

### Procesamiento Individual

```typescript
// Procesar una sola fuente
const { chunks, extractedContent } = await ingestionPipeline.processSource(
  sourceFile,
  studySetId,
  callbacks
);

// Generar contenido específico
const updatedSet = await ingestionPipeline.generateStudyContent(
  studySet,
  ['flashcards', 'quiz'],
  callbacks
);
```

## 📊 Metadatos

Cada contenido generado incluye:

```typescript
interface GeneratedContent {
  id: string;
  studySetId: string;
  type: 'flashcards' | 'quiz' | 'written' | 'fillblanks' | 'notes' | 'tutor' | 'podcast';
  sourceIds: string[];        // IDs de las fuentes utilizadas
  version: number;            // Versión de generación
  createdAt: string;
  updatedAt: string;
  status: 'generating' | 'completed' | 'error';
  errorMessage?: string;
}
```

## 🧪 Testing

### Modo Demo

La aplicación funciona completamente en modo demo sin necesidad de:
- API keys
- Backend
- Servicios externos

Esto permite:
- Desarrollo local sin configuración
- Testing de UI/UX
- Demostraciones
- Desarrollo de features

### Transición a Producción

Para pasar a producción:

1. Configurar backend con proveedores de IA
2. Actualizar variables de entorno
3. Crear providers que se comuniquen con el backend
4. Registrar providers en el router
5. Deshabilitar modo demo

## 📝 Notas Importantes

1. **Fallback Graceful**: Si un servicio falla, la aplicación continúa funcionando
2. **No Duplicación**: Los chunks se reutilizan para diferentes tipos de contenido
3. **Progreso Visual**: Los usuarios ven el progreso en tiempo real
4. **Manejo de Errores**: Errores en una fuente no afectan a las demás
5. **Retry Logic**: Fuentes fallidas pueden reintentarse

## 🔮 Próximos Pasos

Para completar la integración:

1. **Backend API**: Crear endpoints para procesamiento
2. **Proveedores de IA**: Implementar providers para OpenAI/Anthropic
3. **Almacenamiento**: Conectar Supabase o S3 para archivos
4. **Embeddings**: Configurar servicio de embeddings real
5. **YouTube API**: Implementar extracción de transcripciones
6. **Web Scraping**: Configurar servicio de scraping
7. **OCR**: Integrar Tesseract o servicio de OCR
8. **Transcripción**: Conectar Whisper o similar

## 📚 Recursos

- [Documentación de OpenAI](https://platform.openai.com/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)

---

**Desarrollado con ❤️ para KallpaLearn AI**
