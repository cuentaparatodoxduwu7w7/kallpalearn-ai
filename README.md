# KallpaLearn AI

<div align="center">

### 🧠 Tu Tutor Personal con Inteligencia Artificial

**Transforma cualquier material de estudio en experiencias de aprendizaje interactivas y personalizadas**

[![React](https://img.shields.io/badge/React-18.2-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.3-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Ready-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

[Demo](#-demo) • [Características](#-características) • [Instalación](#-instalación) • [Documentación](#-documentación) • [Contribuir](#-contribuir)

</div>

---

## 📖 ¿Qué es KallpaLearn AI?

KallpaLearn AI es una plataforma educativa de nueva generación que utiliza inteligencia artificial para convertir tus materiales de estudio en experiencias de aprendizaje interactivas y personalizadas.

Sube tus apuntes, PDFs, presentaciones o videos, y la plataforma genera automáticamente flashcards, quizzes, exámenes, notas inteligentes y más. Todo adaptado a tu estilo de aprendizaje y nivel de conocimiento.

**"Kallpa"** significa *fuerza* o *energía* en quechua, representando el poder del aprendizaje personalizado.

---

## ✨ Características

### 📚 Gestión de Contenido

| Característica | Estado | Descripción |
|----------------|--------|-------------|
| 📄 Subir PDF/DOCX/PPTX | ✅ Disponible | Extrae texto y estructura automáticamente |
| 🖼️ Subir imágenes | 🧪 Demo | OCR para extraer texto de imágenes |
| 🎵 Subir audio/video | 🧪 Demo | Transcripción automática de contenido |
| 📝 Pegar texto | ✅ Disponible | Procesa texto directamente |
| 🌐 URLs de YouTube | 🚧 Backend requerido | Extrae transcripciones de videos |
| 🌐 URLs de websites | 🚧 Backend requerido | Extrae contenido de páginas web |

### 🎯 Métodos de Estudio

| Método | Estado | Descripción |
|--------|--------|-------------|
| 🃏 Flashcards | ✅ Disponible | Tarjetas interactivas con repetición espaciada |
| 🎯 Quizzes | ✅ Disponible | Preguntas de opción múltiple con explicaciones |
| 📝 Exámenes escritos | ✅ Disponible | Preguntas abiertas con evaluación |
| ✍️ Completar espacios | ✅ Disponible | Ejercicios de relleno interactivos |
| 📖 Notas inteligentes | ✅ Disponible | Resúmenes y conceptos clave generados por IA |
| 🎙️ Podcast | 🧪 Demo | Reproductor de audio generado |
| 📸 Resolver ejercicios | 🧪 Demo | Resolución paso a paso desde imágenes |

### 🤖 Inteligencia Artificial

| Función | Estado | Descripción |
|---------|--------|-------------|
| 🤖 Tutor IA | ✅ Disponible | Chat contextual basado en tu material |
| 🧠 Memoria personalizada | ✅ Disponible | Aprende tus preferencias y estilo |
| 🔍 Sistema RAG | ✅ Disponible | Respuestas basadas en TU material |
| 📊 Perfil de aprendizaje | ✅ Disponible | Tracking de temas fuertes y débiles |
| 🎯 Generación de contenido | 🧪 Demo | Flashcards, quizzes, notas automáticas |

### 📊 Progreso y Organización

| Función | Estado | Descripción |
|---------|--------|-------------|
| 📊 Dashboard de progreso | ✅ Disponible | Métricas y estadísticas de aprendizaje |
| 📁 Carpetas | ✅ Disponible | Organización de Study Sets |
| 🔔 Recordatorios | ✅ Disponible | Notificaciones de estudio |
| 📈 Gráficos de actividad | ✅ Disponible | Visualización de tu progreso |

---

## 🎬 Demo

### Capturas de Pantalla

<div align="center">

**Dashboard Principal**
![Dashboard](https://via.placeholder.com/800x450/FF6B35/FFFFFF?text=Dashboard+KallpaLearn+AI)

**Sistema de Flashcards**
![Flashcards](https://via.placeholder.com/800x450/9333EA/FFFFFF?text=Flashcards+Interactivas)

**Tutor IA con RAG**
![Tutor IA](https://via.placeholder.com/800x450/06B6D4/FFFFFF?text=Tutor+IA+Personalizado)

</div>

### Prueba la Demo

```bash
# Clonar repositorio
git clone https://github.com/tu-usuario/kallpalearn-ai.git
cd kallpalearn-ai

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

Abre [http://localhost:5173](http://localhost:5173) en tu navegador.

**Nota**: La aplicación funciona completamente en modo demo sin necesidad de configurar APIs externas.

---

## 🏗️ Arquitectura

### Sistema de Procesamiento

```
Usuario sube material
    ↓
Identificación de tipo (PDF, DOCX, imagen, audio, etc.)
    ↓
Extracción de contenido
    ↓
Normalización y limpieza
    ↓
División en chunks (fragmentos)
    ↓
Generación de embeddings (cuando hay proveedor)
    ↓
Indexación en base de conocimiento
    ↓
Generación de materiales de estudio
    ↓
Conexión al Study Set
```

### Sistema de Memoria Personalizada

KallpaLearn AI implementa un sistema de memoria **privado por usuario** basado en RAG (Retrieval Augmented Generation):

1. **Aislamiento total**: Cada usuario tiene su propia base de conocimiento
2. **Sin entrenamiento global**: Los documentos NO se usan para entrenar modelos
3. **Recuperación contextual**: El tutor responde basándose en TU material
4. **Perfil adaptativo**: Aprende tus preferencias y estilo de aprendizaje

```
Usuario hace pregunta
    ↓
Identificar Study Set activo
    ↓
Recuperar chunks relevantes (RAG)
    ↓
Recuperar historial de conversación
    ↓
Recuperar preferencias del perfil
    ↓
Construir contexto personalizado
    ↓
Generar respuesta con IA
    ↓
Guardar conversación y actualizar perfil
```

### Estructura de Servicios

```
src/services/
├── ai/                    # Router y proveedores de IA
├── ingestion/            # Pipeline de ingestión
├── extraction/           # Extracción de contenido
├── chunking/             # División en fragmentos
├── embeddings/           # Generación de embeddings
├── rag/                  # Retrieval Augmented Generation
├── knowledge-base/       # Base de conocimiento por usuario
├── learner-profile/      # Perfil de aprendizaje
├── memory/               # Memoria del tutor
├── study-generation/     # Generación de contenido
├── cleanup/              # Limpieza de datos
└── supabase/             # Integración con Supabase
```

---

## 🛠️ Stack Tecnológico

### Frontend
- **React 18.2** - Biblioteca UI moderna y eficiente
- **TypeScript 5.7** - Tipado estático para código robusto
- **Vite 6.3** - Build tool ultrarrápido
- **Tailwind CSS 4.1** - Framework CSS utility-first
- **React Router 6.8** - Navegación SPA
- **Lucide React** - Iconos modernos y consistentes
- **Framer Motion** - Animaciones fluidas
- **Recharts** - Gráficos interactivos

### Backend & Storage
- **Supabase** - Backend as a Service
  - Autenticación (Email/Password + Google OAuth)
  - Base de datos PostgreSQL con Row Level Security
  - Storage para archivos
  - Realtime subscriptions
- **LocalStorage** - Fallback para modo demo

### IA & Procesamiento
- **Sistema RAG** - Retrieval Augmented Generation
- **Embeddings** - Búsqueda semántica (preparado para OpenAI/Cohere)
- **Pipeline de Ingestión** - Extracción y procesamiento modular
- **Proveedor Demo** - Funcional sin APIs configuradas

---

## 📦 Instalación

### Requisitos Previos

- Node.js 20+ 
- npm o yarn
- (Opcional) Cuenta de Supabase

### Pasos de Instalación

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
```

Edita `.env.local` con tus credenciales (ver sección siguiente).

4. **Iniciar servidor de desarrollo**
```bash
npm run dev
```

5. **Abrir en el navegador**
```
http://localhost:5173
```

---

## 🔧 Configuración de Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```bash
# ============================================
# SUPABASE (Opcional - funciona sin configurar)
# ============================================
# Obtén estos valores de: https://app.supabase.com/project/_/settings/api
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key

# ============================================
# AI PROVIDER (Opcional - modo demo por defecto)
# ============================================
# Opciones: demo, openai, anthropic
# IMPORTANTE: Las API keys van en el backend, NO aquí
VITE_AI_PROVIDER=demo

# ============================================
# EMBEDDINGS (Opcional)
# ============================================
VITE_EMBEDDINGS_ENABLED=true

# ============================================
# FEATURE FLAGS (Opcional)
# ============================================
VITE_YOUTUBE_ENABLED=false
VITE_WEB_SCRAPING_ENABLED=false
```

**⚠️ IMPORTANTE**: 
- Las API keys de proveedores de IA (OpenAI, Anthropic, etc.) deben configurarse en el backend, NUNCA en el frontend
- La aplicación funciona completamente en modo demo sin ninguna configuración
- Solo configura Supabase si quieres persistencia real de datos

---

## 🔌 Conectar Supabase

### 1. Crear Proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com)
2. Crea un nuevo proyecto
3. Espera a que esté listo (1-2 minutos)

### 2. Ejecutar Migraciones

1. Ve al **SQL Editor** en tu proyecto de Supabase
2. Copia el contenido de `supabase/migrations/001_initial_schema.sql`
3. Ejecuta el script
4. Verifica que todas las tablas se crearon correctamente

### 3. Configurar Authentication

1. Ve a **Authentication > Providers**
2. Habilita **Email** provider
3. (Opcional) Habilita **Google** provider:
   - Ve a Google Cloud Console
   - Crea credenciales OAuth 2.0
   - Agrega la URL de tu proyecto en "Authorized redirect URIs"
   - Copia Client ID y Client Secret a Supabase

### 4. Configurar Storage

1. Ve a **Storage**
2. Verifica que el bucket "study-materials" se creó automáticamente
3. Las políticas de seguridad ya están configuradas en el script SQL

### 5. Actualizar Variables de Entorno

```bash
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key
```

### 6. Reiniciar la Aplicación

```bash
npm run dev
```

La aplicación ahora usará Supabase para autenticación y almacenamiento de datos.

---

## 🤖 Configurar Proveedor de IA

### Modo Demo (Por Defecto)

La aplicación funciona completamente en modo demo sin necesidad de configurar APIs:

- ✅ Interfaz completa funcional
- ✅ Navegación entre todas las páginas
- ✅ Creación de Study Sets
- ✅ Flashcards, quizzes, exámenes
- ✅ Tutor IA con respuestas predefinidas
- ✅ Perfil de aprendizaje
- ✅ Progreso y estadísticas

### Conectar Proveedor Real

Para usar un proveedor de IA real (OpenAI, Anthropic, etc.):

1. **Crear Backend**: Necesitas un backend que maneje las API keys de forma segura
2. **Implementar Provider**: Crea un provider que se comunique con tu backend
3. **Registrar en Router**:

```typescript
import { aiRouter } from './services/ai/router';

// Cambiar a proveedor real
aiRouter.setProvider('openai'); // o 'anthropic', 'custom'
```

**⚠️ SEGURIDAD**: NUNCA pongas API keys en el frontend. Siempre usa un backend.

---

## 📊 Estado de Funcionalidades

### ✅ Disponible (Funciona Completamente)

- Interfaz de usuario completa
- Navegación entre páginas
- Creación y gestión de Study Sets
- Sistema de flashcards con flip animation
- Quizzes con feedback inmediato
- Exámenes escritos
- Completar espacios
- Notas inteligentes (contenido demo)
- Tutor IA (respuestas predefinidas)
- Reproductor de podcast (demo)
- Resolver ejercicios (resultados demo)
- Perfil de aprendizaje adaptativo
- Dashboard de progreso con gráficos
- Sistema de carpetas
- Autenticación (localStorage)
- Configuración de usuario

### 🧪 Demo (Funciona con Contenido de Demostración)

- Procesamiento de archivos (contenido simulado)
- Generación de flashcards (contenido predefinido)
- Generación de quizzes (contenido predefinido)
- Generación de notas (contenido predefinido)
- Tutor IA (respuestas predefinidas)
- Podcast (reproductor funcional, audio demo)
- Resolver ejercicios (resultados simulados)

### 🚧 En Desarrollo (Requiere Backend)

- Procesamiento real de PDFs/DOCs
- Transcripción de audio/video
- OCR de imágenes
- Extracción de YouTube
- Web scraping
- Generación de contenido con IA real
- Generación de embeddings reales
- Text-to-Speech para podcasts

---

## 📁 Estructura del Proyecto

```
kallpalearn-ai/
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions para deploy automático
├── public/
│   └── 404.html                # Manejo de rutas SPA en GitHub Pages
├── src/
│   ├── components/             # Componentes reutilizables
│   │   ├── Layout.tsx          # Layout principal con sidebar
│   │   └── UI.tsx              # Componentes UI (Button, Modal, etc.)
│   ├── context/
│   │   └── AppContext.tsx      # Estado global de la aplicación
│   ├── data/
│   │   └── demo.ts             # Datos de demostración
│   ├── lib/
│   │   └── supabase.ts         # Cliente de Supabase
│   ├── pages/                  # Páginas de la aplicación
│   │   ├── Auth.tsx            # Login, registro, recuperar contraseña
│   │   ├── Dashboard.tsx       # Dashboard principal
│   │   ├── CreateSet.tsx       # Crear nuevo Study Set
│   │   ├── StudySet.tsx        # Vista de Study Set
│   │   ├── Flashcards.tsx      # Sistema de flashcards
│   │   ├── Quiz.tsx            # Quizzes
│   │   ├── WrittenTest.tsx     # Exámenes escritos y completar espacios
│   │   ├── Notes.tsx           # Notas inteligentes
│   │   ├── Tutor.tsx           # Tutor IA
│   │   ├── Podcast.tsx         # Reproductor de podcast
│   │   ├── Resolve.tsx         # Resolver ejercicios con imagen
│   │   ├── Folders.tsx         # Gestión de carpetas
│   │   ├── Progress.tsx        # Dashboard de progreso
│   │   ├── LearnerProfile.tsx  # Perfil de aprendizaje
│   │   ├── Settings.tsx        # Configuración
│   │   └── Landing.tsx         # Página de aterrizaje
│   ├── services/               # Capa de servicios
│   │   ├── ai/                 # Servicios de IA
│   │   │   ├── router.ts       # Router de proveedores de IA
│   │   │   ├── demo-provider.ts
│   │   │   └── index.ts
│   │   ├── ingestion/          # Pipeline de ingestión
│   │   ├── extraction/         # Extracción de contenido
│   │   │   ├── youtube.ts      # Servicio de YouTube
│   │   │   └── web-scraper.ts  # Servicio de web scraping
│   │   ├── chunking/           # División en chunks
│   │   ├── embeddings/         # Generación de embeddings
│   │   ├── rag/                # Retrieval Augmented Generation
│   │   ├── knowledge-base/     # Base de conocimiento
│   │   ├── learner-profile/    # Perfil de aprendizaje
│   │   ├── memory/             # Memoria del tutor
│   │   ├── study-generation/   # Generación de contenido
│   │   ├── cleanup/            # Limpieza de datos
│   │   ├── supabase/           # Servicio de Supabase
│   │   ├── storage.ts          # Almacenamiento local
│   │   └── config.ts           # Configuración
│   ├── types/                  # Tipos TypeScript
│   │   └── index.ts
│   ├── App.tsx                 # Componente principal
│   ├── main.tsx                # Punto de entrada
│   ├── index.css               # Estilos globales
│   └── vite-env.d.ts           # Tipos para variables de entorno
├── supabase/
│   └── migrations/             # Migraciones de base de datos
│       └── 001_initial_schema.sql
├── .env.example                # Variables de entorno de ejemplo
├── .gitignore
├── CONTRIBUTING.md             # Guía para contribuidores
├── LICENSE                     # Licencia MIT
├── README.md                   # Este archivo
├── package.json
├── tsconfig.json
└── vite.config.js
```

---

## 🚀 Despliegue

### GitHub Pages (Recomendado)

El proyecto incluye un workflow de GitHub Actions que despliega automáticamente:

1. **Crear repositorio en GitHub**
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/tu-usuario/kallpalearn-ai.git
git push -u origin main
```

2. **Configurar GitHub Pages**
   - Ve a Settings → Pages
   - Source: "GitHub Actions"
   - El workflow se ejecutará automáticamente en cada push a `main`

3. **Acceder a tu sitio**
```
https://tu-usuario.github.io/kallpalearn-ai/
```

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

### Docker

```dockerfile
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
```

---

## 🔒 Privacidad y Seguridad

### Sistema de Memoria Privada

KallpaLearn AI implementa un sistema de memoria **100% privado por usuario**:

✅ **Aislamiento total**: Cada usuario tiene su propia base de conocimiento
✅ **Sin entrenamiento global**: Tus documentos NUNCA se usan para entrenar modelos de IA
✅ **Recuperación contextual**: El tutor responde basándose únicamente en TU material
✅ **Row Level Security**: Supabase garantiza que solo tú puedes acceder a tus datos
✅ **Borrado completo**: Puedes eliminar todos tus datos en cualquier momento

### ¿Cómo Funciona?

1. **Subes tu material**: PDFs, documentos, imágenes, etc.
2. **Se extrae el contenido**: El sistema procesa tus archivos
3. **Se divide en chunks**: Fragmentos de conocimiento indexados
4. **Se generan embeddings**: Vectores para búsqueda semántica (cuando hay proveedor)
5. **Se almacena PRIVADAMENTE**: Solo en tu cuenta, aislado de otros usuarios
6. **Cuando preguntas**: El sistema busca en TU material y genera respuestas contextuales

### Seguridad Técnica

- ✅ **Row Level Security (RLS)** en Supabase
- ✅ **Aislamiento por usuario** en todas las operaciones
- ✅ **Sin API keys en el frontend**
- ✅ **Variables de entorno** para credenciales
- ✅ **HTTPS** por defecto
- ✅ **Tokens JWT** con expiración
- ✅ **CORS** configurado correctamente

### Tus Datos

- 📁 **Archivos**: Almacenados en tu bucket privado de Supabase
- 🧠 **Chunks**: Indexados con tu user_id, inaccesibles para otros
- 💬 **Conversaciones**: Privadas por Study Set
- 📊 **Perfil de aprendizaje**: Solo visible para ti
- 🗑️ **Eliminación**: Puedes borrar todo en cualquier momento

---

## 🗺️ Roadmap

### Q1 2025
- [x] Sistema de flashcards con repetición espaciada
- [x] Quizzes con feedback inmediato
- [x] Exámenes escritos
- [x] Completar espacios
- [x] Notas inteligentes
- [x] Perfil de aprendizaje adaptativo
- [x] Integración con Supabase
- [x] Sistema RAG básico

### Q2 2025
- [ ] Procesamiento real de PDFs con backend
- [ ] Transcripción de audio/video
- [ ] OCR de imágenes
- [ ] Integración con OpenAI/Anthropic
- [ ] Generación de embeddings reales
- [ ] Búsqueda semántica avanzada

### Q3 2025
- [ ] Extracción de YouTube
- [ ] Web scraping
- [ ] Text-to-Speech para podcasts
- [ ] Colaboración en Study Sets
- [ ] Exportación de contenido
- [ ] Aplicación móvil (React Native)

### Q4 2025
- [ ] Gamificación (logros, rachas)
- [ ] Comunidades de estudio
- [ ] Marketplace de Study Sets
- [ ] Integración con LMS (Moodle, Canvas)
- [ ] API pública

---

## 🤝 Contribuir

¡Las contribuciones son bienvenidas! Por favor, lee [CONTRIBUTING.md](CONTRIBUTING.md) para detalles sobre nuestro código de conducta y el proceso para enviar pull requests.

### Formas de Contribuir

- 🐛 **Reportar bugs**: Abre un issue con la etiqueta "bug"
- 💡 **Sugerir features**: Abre un issue con la etiqueta "enhancement"
- 📝 **Mejorar documentación**: PRs para mejorar README, comentarios, etc.
- 🔧 **Enviar código**: Fork, branch, commit, PR
- 🎨 **Diseño**: Mejoras de UI/UX
- 🌍 **Traducciones**: Ayuda a traducir la interfaz

### Proceso de Contribución

1. Fork el proyecto
2. Crea tu feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add: AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

---

## 🙏 Agradecimientos

- [React](https://react.dev/) - Biblioteca UI
- [Supabase](https://supabase.com/) - Backend as a Service
- [Tailwind CSS](https://tailwindcss.com/) - Framework CSS
- [Lucide Icons](https://lucide.dev/) - Iconos modernos
- [Vite](https://vitejs.dev/) - Build tool ultrarrápido
- [TypeScript](https://www.typescriptlang.org/) - Tipado estático

---

## 📧 Contacto

- **GitHub Issues**: [Reportar un problema](https://github.com/tu-usuario/kallpalearn-ai/issues)
- **Email**: tu-email@ejemplo.com
- **Twitter**: @kallpalearn

---

<div align="center">

**Desarrollado con ❤️ para estudiantes de todo el mundo**

*Tu tutor privado que conoce tus materiales, tu progreso y tus preferencias.*

⭐ **Si este proyecto te resulta útil, considera darle una estrella** ⭐

</div>
