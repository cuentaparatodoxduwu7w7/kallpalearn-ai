# KallpaLearn AI 🧠✨

Plataforma educativa con Inteligencia Artificial que convierte tu material de estudio en múltiples métodos de aprendizaje personalizados.

![KallpaLearn AI](https://img.shields.io/badge/React-18.2-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue) ![Vite](https://img.shields.io/badge/Vite-6.3-purple) ![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1-cyan)

## 🎯 ¿Qué es KallpaLearn AI?

KallpaLearn AI es una plataforma educativa moderna que utiliza inteligencia artificial para transformar cualquier material de estudio (PDFs, documentos, videos, audio) en múltiples formatos de aprendizaje adaptados a tu estilo.

### Características Principales

- 📚 **Múltiples métodos de estudio**: Flashcards, quizzes, exámenes escritos, completar espacios, notas inteligentes, podcasts y tutor IA
- 🤖 **IA Personalizada**: Sistema RAG (Retrieval Augmented Generation) que responde basándose en TU material
- 🎯 **Perfil de Aprendizaje**: La IA aprende tus preferencias, temas fuertes y débiles
- 🔒 **Privacidad Total**: Tus datos están aislados y nunca se comparten
- 📱 **Responsive**: Funciona perfectamente en desktop, tablet y móvil
- 🎨 **UX/UI Moderna**: Diseño cálido y amigable con animaciones fluidas

## 🚀 Funcionalidades

### Gestión de Material
- Subir archivos (PDF, DOC, PPT, imágenes, audio, video)
- Pegar texto directamente
- URLs de YouTube y websites
- Procesamiento automático con pipeline de ingestión

### Métodos de Estudio
- **Flashcards**: Tarjetas interactivas con repetición espaciada
- **Quiz**: Preguntas de opción múltiple con explicaciones
- **Examen Escrito**: Preguntas abiertas con evaluación
- **Completar Espacios**: Ejercicios de relleno
- **Notas Inteligentes**: Resúmenes y conceptos clave generados por IA
- **Podcast**: Audio generado a partir de tu material
- **Tutor IA**: Chat contextual basado en tu material

### Progreso y Personalización
- Dashboard con métricas de progreso
- Perfil de aprendizaje adaptativo
- Tracking de temas fuertes y débiles
- Historial de actividad

### Organización
- Carpetas para organizar Study Sets
- Búsqueda y filtrado
- Gestión completa de contenido

## 🛠️ Stack Tecnológico

### Frontend
- **React 18.2** - Biblioteca UI
- **TypeScript 5.7** - Tipado estático
- **Vite 6.3** - Build tool y dev server
- **Tailwind CSS 4.1** - Framework CSS
- **React Router 6.8** - Routing
- **Lucide React** - Iconos
- **Framer Motion** - Animaciones
- **Recharts** - Gráficos

### Backend & Storage
- **Supabase** - Autenticación, base de datos y storage
- **PostgreSQL** - Base de datos con RLS
- **LocalStorage** - Fallback para modo demo

### IA & Procesamiento
- **Sistema RAG** - Retrieval Augmented Generation
- **Embeddings** - Búsqueda semántica
- **Pipeline de Ingestión** - Extracción y procesamiento de contenido
- **Proveedor Demo** - Funcional sin APIs configuradas

## 📁 Estructura del Proyecto

```
kallpalearn-ai/
├── src/
│   ├── components/          # Componentes reutilizables
│   │   ├── Layout.tsx       # Layout principal con sidebar
│   │   └── UI.tsx           # Componentes UI (Button, Modal, etc.)
│   ├── context/
│   │   └── AppContext.tsx   # Estado global de la aplicación
│   ├── data/
│   │   └── demo.ts          # Datos de demostración
│   ├── lib/
│   │   └── supabase.ts      # Cliente de Supabase
│   ├── pages/               # Páginas de la aplicación
│   │   ├── Auth.tsx         # Login, registro, recuperar contraseña
│   │   ├── Dashboard.tsx    # Dashboard principal
│   │   ├── CreateSet.tsx    # Crear nuevo Study Set
│   │   ├── StudySet.tsx     # Vista de Study Set
│   │   ├── Flashcards.tsx   # Sistema de flashcards
│   │   ├── Quiz.tsx         # Quizzes
│   │   ├── WrittenTest.tsx  # Exámenes escritos y completar espacios
│   │   ├── Notes.tsx        # Notas inteligentes
│   │   ├── Tutor.tsx        # Tutor IA
│   │   ├── Podcast.tsx      # Reproductor de podcast
│   │   ├── Resolve.tsx      # Resolver ejercicios con imagen
│   │   ├── Folders.tsx      # Gestión de carpetas
│   │   ├── Progress.tsx     # Dashboard de progreso
│   │   ├── LearnerProfile.tsx # Perfil de aprendizaje
│   │   ├── Settings.tsx     # Configuración
│   │   └── Landing.tsx      # Página de aterrizaje
│   ├── services/            # Capa de servicios
│   │   ├── ai/              # Servicios de IA
│   │   │   ├── router.ts    # Router de proveedores de IA
│   │   │   └── demo-provider.ts
│   │   ├── ingestion/       # Pipeline de ingestión
│   │   ├── extraction/      # Extracción de contenido
│   │   ├── chunking/        # División en chunks
│   │   ├── embeddings/      # Generación de embeddings
│   │   ├── rag/             # Retrieval Augmented Generation
│   │   ├── knowledge-base/  # Base de conocimiento
│   │   ├── learner-profile/ # Perfil de aprendizaje
│   │   ├── memory/          # Memoria del tutor
│   │   ├── study-generation/# Generación de contenido
│   │   ├── cleanup/         # Limpieza de datos
│   │   ├── supabase/        # Servicio de Supabase
│   │   └── storage.ts       # Almacenamiento local
│   ├── types/               # Tipos TypeScript
│   │   └── index.ts
│   ├── App.tsx              # Componente principal
│   ├── main.tsx             # Punto de entrada
│   └── index.css            # Estilos globales
├── supabase/
│   └── migrations/          # Migraciones de base de datos
│       └── 001_initial_schema.sql
├── .env.example             # Variables de entorno de ejemplo
├── .gitignore
├── package.json
├── tsconfig.json
├── vite.config.js
└── README.md
```

## 🔧 Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```bash
# Supabase (Opcional - funciona sin configurar)
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key

# AI Provider (Opcional - modo demo por defecto)
VITE_AI_PROVIDER=demo

# Embeddings (Opcional)
VITE_EMBEDDINGS_ENABLED=true
```

**Nota**: Las API keys de proveedores de IA (OpenAI, Anthropic, etc.) deben configurarse en el backend, NUNCA en el frontend.

## 📦 Instalación

1. **Clonar el repositorio**
```bash
git clone https://github.com/tu-usuario/kallpalearn-ai.git
cd kallpalearn-ai
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno** (opcional)
```bash
cp .env.example .env.local
# Edita .env.local con tus credenciales
```

## 🚀 Ejecutar Localmente

### Modo Desarrollo
```bash
npm run dev
```
Abre [http://localhost:5173](http://localhost:5173) en tu navegador.

### Modo Producción
```bash
npm run build
npm run preview
```

### Verificación de Tipos
```bash
npm run typecheck
```

## 🔌 Conectar Supabase

### 1. Crear Proyecto en Supabase
1. Ve a [supabase.com](https://supabase.com)
2. Crea un nuevo proyecto
3. Espera a que esté listo

### 2. Ejecutar Migraciones
1. Ve al SQL Editor en Supabase
2. Copia el contenido de `supabase/migrations/001_initial_schema.sql`
3. Ejecuta el script

### 3. Configurar Autenticación
1. Ve a Authentication > Providers
2. Habilita Email provider
3. (Opcional) Habilita Google OAuth

### 4. Configurar Storage
1. Ve a Storage
2. Verifica que el bucket "study-materials" se creó

### 5. Actualizar Variables de Entorno
```bash
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key
```

## 🤖 Configurar Proveedor de IA

### Modo Demo (Por Defecto)
La aplicación funciona completamente en modo demo sin necesidad de configurar APIs.

### Conectar Proveedor Real
Para usar un proveedor de IA real (OpenAI, Anthropic, etc.):

1. **Crear Backend**: Necesitas un backend que maneje las API keys
2. **Implementar Provider**: Crea un provider que se comunique con tu backend
3. **Registrar en Router**:
```typescript
import { aiRouter } from './services/ai/router';
aiRouter.setProvider('openai'); // o 'anthropic', 'custom'
```

**IMPORTANTE**: NUNCA pongas API keys en el frontend. Siempre usa un backend.

## 📊 Funciones que Dependen de APIs

### Requieren Backend Configurado
- ❌ Procesamiento real de PDFs/DOCs
- ❌ Transcripción de audio/video
- ❌ OCR de imágenes
- ❌ Extracción de YouTube
- ❌ Web scraping
- ❌ Generación de contenido con IA real
- ❌ Generación de embeddings reales
- ❌ Text-to-Speech para podcasts

### Funcionan en Modo Demo
- ✅ Toda la interfaz de usuario
- ✅ Navegación completa
- ✅ Creación de Study Sets
- ✅ Flashcards, quizzes, exámenes
- ✅ Tutor IA (respuestas predefinidas)
- ✅ Podcast (reproductor demo)
- ✅ Resolver ejercicios (resultados demo)
- ✅ Perfil de aprendizaje
- ✅ Progreso y estadísticas
- ✅ Carpetas y organización
- ✅ Autenticación (localStorage)

## 🏗️ Generar Build

```bash
npm run build
```

El build se genera en la carpeta `dist/` y está listo para desplegar.

## 🌐 Desplegar

### Vercel
```bash
npm install -g vercel
vercel
```

### Netlify
```bash
npm install -g netlify-cli
netlify deploy --prod
```

### GitHub Pages
```bash
npm run build
# Sube la carpeta dist/ a la rama gh-pages
```

### Docker
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
FROM nginx:alpine
COPY --from=0 /app/dist /usr/share/nginx/html
```

## 🔒 Seguridad

- ✅ Row Level Security (RLS) en Supabase
- ✅ Aislamiento total de datos por usuario
- ✅ Sin API keys en el frontend
- ✅ Variables de entorno para credenciales
- ✅ HTTPS por defecto
- ✅ Tokens JWT con expiración

## 📝 Scripts Disponibles

```bash
npm run dev          # Iniciar servidor de desarrollo
npm run build        # Generar build de producción
npm run preview      # Preview del build de producción
npm run typecheck    # Verificación de tipos TypeScript
npm run lint         # Linting (actualmente typecheck)
```

## 🎨 Personalización

### Colores
Edita `src/index.css` para cambiar la paleta de colores:
```css
:root {
  --color-primary: #f97316;    /* Coral/Naranja */
  --color-secondary: #a855f7;  /* Violeta */
  --color-background: #fef7f0; /* Crema */
}
```

### Logo
Reemplaza el componente `Zap` en `src/components/Layout.tsx` con tu propio logo.

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 🙏 Agradecimientos

- [React](https://react.dev/)
- [Supabase](https://supabase.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Lucide Icons](https://lucide.dev/)
- [Vite](https://vitejs.dev/)

## 📧 Contacto

Para preguntas o soporte, abre un issue en GitHub.

---

**Desarrollado con ❤️ para estudiantes de todo el mundo**

*Tu tutor privado que conoce tus materiales, tu progreso y tus preferencias.*
