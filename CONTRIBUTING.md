# Guía de Contribución

¡Gracias por tu interés en contribuir a KallpaLearn AI! 🎉

## 🚀 Cómo Contribuir

### Reportar Bugs

1. Verifica que el bug no haya sido reportado previamente en [Issues](https://github.com/tu-usuario/kallpalearn-ai/issues)
2. Abre un nuevo Issue usando la plantilla de bug report
3. Incluye:
   - Descripción clara del problema
   - Pasos para reproducir
   - Comportamiento esperado vs actual
   - Screenshots si es aplicable
   - Entorno (SO, navegador, versión)

### Sugerir Mejoras

1. Abre un Issue con la etiqueta "enhancement"
2. Describe la mejora propuesta
3. Explica por qué sería útil
4. Proporciona ejemplos si es posible

### Contribuir Código

1. **Fork** el repositorio
2. **Clona** tu fork:
   ```bash
   git clone https://github.com/tu-usuario/kallpalearn-ai.git
   cd kallpalearn-ai
   ```

3. **Crea una rama** para tu feature:
   ```bash
   git checkout -b feature/nombre-de-tu-feature
   ```

4. **Instala dependencias**:
   ```bash
   npm install
   ```

5. **Haz tus cambios** siguiendo las guías de estilo

6. **Ejecuta tests**:
   ```bash
   npm run typecheck
   npm run build
   ```

7. **Commit** tus cambios:
   ```bash
   git commit -m 'Add: descripción clara del cambio'
   ```

8. **Push** a tu fork:
   ```bash
   git push origin feature/nombre-de-tu-feature
   ```

9. **Abre un Pull Request** en GitHub

## 📝 Guías de Estilo

### Código

- **TypeScript**: Usa tipado estricto
- **Componentes**: Funcionales con hooks
- **Nombres**: Descriptivos en inglés para código, español para UI
- **Comentarios**: En español para documentación, inglés para código complejo
- **Imports**: Ordenar alfabéticamente

### Commits

Usa conventional commits:
- `feat:` Nueva funcionalidad
- `fix:` Corrección de bug
- `docs:` Cambios en documentación
- `style:` Cambios de formato (sin cambios en código)
- `refactor:` Refactorización de código
- `test:` Agregar o modificar tests
- `chore:` Cambios en build o herramientas

Ejemplos:
```
feat: agregar sistema de flashcards
fix: corregir error en carga de archivos
docs: actualizar README con instrucciones de instalación
```

### Pull Requests

- **Título**: Claro y descriptivo
- **Descripción**: Explica qué hace el PR y por qué
- **Tests**: Asegúrate de que el build pase
- **Screenshots**: Si hay cambios visuales
- **Issues**: Referencia issues relacionados con `Closes #123`

## 🏗️ Estructura del Código

### Organización de Archivos

```
src/
├── components/     # Componentes reutilizables
├── pages/         # Páginas de la aplicación
├── services/      # Lógica de negocio y servicios
├── context/       # Estado global
├── types/         # Tipos TypeScript
└── lib/           # Utilidades y configuración
```

### Nombres de Archivos

- **Componentes**: PascalCase (`Button.tsx`, `StudySet.tsx`)
- **Servicios**: kebab-case (`study-generation/index.ts`)
- **Utilidades**: camelCase (`formatDate.ts`)
- **Tipos**: PascalCase (`User.ts`, `StudySet.ts`)

### Componentes

```tsx
// ✅ Bueno
export function StudySetPage() {
  const { id } = useParams<{ id: string }>();
  // ...
}

// ❌ Evitar
export default function Page() {
  // ...
}
```

### Servicios

```typescript
// ✅ Bueno
export class StudyGenerationService {
  async generateFlashcards(chunks: KnowledgeChunk[]): Promise<Flashcard[]> {
    // ...
  }
}

export const studyGenerationService = new StudyGenerationService();
```

## 🧪 Testing

Antes de hacer commit:

```bash
# Verificar tipos
npm run typecheck

# Verificar build
npm run build

# Ejecutar en desarrollo
npm run dev
```

## 📚 Recursos

- [React Docs](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Supabase Docs](https://supabase.com/docs)

## ❓ Preguntas

¿Tienes preguntas? Abre un [Issue](https://github.com/tu-usuario/kallpalearn-ai/issues) con la etiqueta "question".

## 📄 Licencia

Al contribuir, aceptas que tus contribuciones estarán bajo la licencia MIT del proyecto.

---

¡Gracias por ayudar a hacer KallpaLearn AI mejor! 🚀
