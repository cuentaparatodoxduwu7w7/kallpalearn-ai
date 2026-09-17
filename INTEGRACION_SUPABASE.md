# Integración con Supabase - KallpaLearn AI

## 🎯 Overview

KallpaLearn AI está completamente integrado con Supabase para autenticación, base de datos y almacenamiento de archivos.

## 📋 Requisitos

1. Cuenta de Supabase (https://supabase.com)
2. Proyecto creado en Supabase
3. Variables de entorno configuradas

## 🚀 Configuración Inicial

### 1. Crear Proyecto en Supabase

1. Ve a https://supabase.com y crea una cuenta
2. Crea un nuevo proyecto
3. Espera a que el proyecto esté listo (puede tomar 1-2 minutos)

### 2. Ejecutar Migraciones SQL

1. Ve al SQL Editor en tu proyecto de Supabase
2. Copia el contenido de `supabase/migrations/001_initial_schema.sql`
3. Ejecuta el script
4. Verifica que todas las tablas se crearon correctamente

### 3. Configurar Authentication

1. Ve a Authentication > Providers
2. Habilita "Email" provider
3. (Opcional) Habilita "Google" provider:
   - Ve a Google Cloud Console
   - Crea credenciales OAuth 2.0
   - Agrega la URL de tu proyecto en "Authorized redirect URIs"
   - Copia Client ID y Client Secret a Supabase

### 4. Configurar Storage

1. Ve a Storage
2. Verifica que el bucket "study-materials" se creó
3. Configura las políticas de seguridad (ya incluidas en el script SQL)

### 5. Configurar Variables de Entorno

1. Copia `.env.example` a `.env.local`
2. Obtén las credenciales de Supabase:
   - Ve a Settings > API
   - Copia "Project URL" y "anon public key"
3. Actualiza `.env.local`:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key-aqui
```

### 6. Iniciar la Aplicación

```bash
npm install
npm run dev
```

## 🗄️ Estructura de Base de Datos

### Tablas Principales

- **profiles**: Perfiles de usuario
- **folders**: Carpetas para organizar Study Sets
- **study_sets**: Conjuntos de estudio
- **sources**: Fuentes de material (archivos subidos)
- **source_chunks**: Fragmentos de conocimiento extraídos
- **flashcards**: Tarjetas de estudio
- **quizzes**: Quizzes de opción múltiple
- **quiz_questions**: Preguntas de quiz
- **written_tests**: Exámenes escritos
- **written_questions**: Preguntas de examen escrito
- **fill_blanks**: Ejercicios de completar espacios
- **notes**: Notas inteligentes
- **podcasts**: Podcasts generados
- **learner_profiles**: Perfiles de aprendizaje
- **tutor_conversations**: Conversaciones del tutor
- **tutor_messages**: Mensajes del tutor
- **progress_events**: Eventos de progreso

### Relaciones

```
profiles (1) ──< (N) study_sets
profiles (1) ──< (N) folders
study_sets (1) ──< (N) sources
study_sets (1) ──< (N) flashcards
study_sets (1) ──< (1) quizzes
quizzes (1) ──< (N) quiz_questions
study_sets (1) ──< (1) written_tests
written_tests (1) ──< (N) written_questions
study_sets (1) ──< (N) fill_blanks
study_sets (1) ──< (1) notes
study_sets (1) ──< (1) podcasts
study_sets (1) ──< (N) tutor_conversations
tutor_conversations (1) ──< (N) tutor_messages
sources (1) ──< (N) source_chunks
```

## 🔐 Row Level Security (RLS)

Todas las tablas tienen RLS activado con políticas que garantizan:

- **Aislamiento total**: Cada usuario solo puede acceder a sus propios datos
- **Seguridad por diseño**: Las políticas se aplican automáticamente en todas las consultas
- **Integridad referencial**: Las relaciones entre tablas mantienen la consistencia

### Ejemplo de Política RLS

```sql
-- Los usuarios solo pueden ver sus propios Study Sets
CREATE POLICY "Users can view own study sets"
  ON study_sets FOR SELECT
  USING (auth.uid() = user_id);
```

## 💾 Storage

### Estructura de Archivos

```
study-materials/
  └── {userId}/
      └── {studySetId}/
          ├── archivo1.pdf
          ├── archivo2.docx
          └── imagen.jpg
```

### Políticas de Storage

- Los usuarios solo pueden acceder a sus propios archivos
- La estructura por usuario garantiza aislamiento
- Los archivos se eliminan automáticamente cuando se elimina un Study Set

## 🔑 Autenticación

### Métodos Soportados

1. **Email/Password**: Registro y login tradicional
2. **Google OAuth**: Login con cuenta de Google

### Flujo de Autenticación

```typescript
// Login con email/password
await authService.signIn(email, password);

// Login con Google
await authService.signInWithGoogle();

// Registro
await authService.signUp(email, password, fullName);

// Logout
await authService.signOut();

// Recuperar contraseña
await authService.resetPassword(email);
```

### Sesión Persistente

- La sesión se mantiene automáticamente entre recargas
- Los tokens se renuevan automáticamente
- El estado de autenticación se sincroniza en toda la aplicación

## 🛠️ Service Layer

El service layer abstracta todas las operaciones de base de datos:

### authService
- `signUp()`: Registrar nuevo usuario
- `signIn()`: Login con email/password
- `signInWithGoogle()`: Login con Google
- `signOut()`: Cerrar sesión
- `getCurrentUser()`: Obtener usuario actual
- `getSession()`: Obtener sesión actual
- `resetPassword()`: Recuperar contraseña
- `updatePassword()`: Actualizar contraseña

### studySetsService
- `getAll()`: Obtener todos los Study Sets del usuario
- `getById()`: Obtener un Study Set específico
- `create()`: Crear nuevo Study Set
- `update()`: Actualizar Study Set
- `delete()`: Eliminar Study Set

### foldersService
- `getAll()`: Obtener todas las carpetas
- `create()`: Crear nueva carpeta
- `update()`: Actualizar carpeta
- `delete()`: Eliminar carpeta

### flashcardsService
- `getByStudySetId()`: Obtener flashcards de un Study Set
- `create()`: Crear nueva flashcard
- `update()`: Actualizar flashcard
- `delete()`: Eliminar flashcard

### learnerProfilesService
- `getByUserId()`: Obtener perfil de aprendizaje
- `create()`: Crear perfil de aprendizaje
- `update()`: Actualizar perfil de aprendizaje

### storageService
- `uploadFile()`: Subir archivo
- `getPublicUrl()`: Obtener URL pública
- `deleteFile()`: Eliminar archivo
- `deleteStudySetFiles()`: Eliminar todos los archivos de un Study Set

## 📊 Modo Demo vs Producción

### Modo Demo (sin Supabase)

La aplicación funciona completamente en modo demo sin necesidad de configurar Supabase:

- Usa localStorage para persistencia
- Datos de demostración precargados
- Todas las funcionalidades disponibles
- Ideal para desarrollo y pruebas

### Modo Producción (con Supabase)

Cuando se configuran las credenciales de Supabase:

- Autenticación real con email/password y Google
- Base de datos PostgreSQL con RLS
- Storage para archivos
- Escalabilidad y seguridad enterprise

### Detección Automática

La aplicación detecta automáticamente si Supabase está configurado:

```typescript
// En AppContext.tsx
try {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.user) {
    // Modo producción
  } else {
    // Modo demo
  }
} catch (error) {
  // Fallback a modo demo
}
```

## 🔒 Seguridad

### Mejores Prácticas Implementadas

1. **Sin API keys en frontend**: Las API keys de IA van en el backend
2. **RLS estricto**: Cada usuario solo accede a sus datos
3. **Variables de entorno**: Credenciales en `.env.local` (no en git)
4. **HTTPS**: Supabase usa HTTPS por defecto
5. **Tokens JWT**: Autenticación segura con tokens
6. **Cascade deletes**: Eliminación en cascada para integridad

### Checklist de Seguridad

- [x] RLS activado en todas las tablas
- [x] Políticas de aislamiento por usuario
- [x] Storage con políticas de seguridad
- [x] Variables de entorno para credenciales
- [x] Sin secretos en el código
- [x] HTTPS por defecto
- [x] Tokens JWT con expiración
- [x] Refresh tokens automáticos

## 🚀 Despliegue

### Vercel

1. Conecta tu repositorio a Vercel
2. Configura las variables de entorno en Vercel:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Deploy automático

### Netlify

1. Conecta tu repositorio a Netlify
2. Configura las variables de entorno en Netlify
3. Deploy automático

### Supabase (Edge Functions)

Para funciones serverless:

1. Instala Supabase CLI: `npm install -g supabase`
2. Login: `supabase login`
3. Link project: `supabase link --project-ref tu-project-ref`
4. Deploy functions: `supabase functions deploy`

## 🐛 Troubleshooting

### Error: "Supabase credentials not found"

**Solución**: Asegúrate de tener un archivo `.env.local` con las variables correctas.

### Error: "relation does not exist"

**Solución**: Ejecuta el script SQL en el SQL Editor de Supabase.

### Error: "new row violates row-level security policy"

**Solución**: Verifica que el usuario esté autenticado y que las políticas RLS estén correctas.

### Error: "Invalid API key"

**Solución**: Verifica que `VITE_SUPABASE_ANON_KEY` sea la clave pública (anon key), no la service role key.

## 📚 Recursos

- [Supabase Docs](https://supabase.com/docs)
- [Supabase JS Client](https://supabase.com/docs/reference/javascript)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Storage](https://supabase.com/docs/guides/storage)

---

**Desarrollado con ❤️ para KallpaLearn AI**

*Tu plataforma de estudio con IA, segura y escalable.*
