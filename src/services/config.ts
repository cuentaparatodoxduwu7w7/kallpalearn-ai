/**
 * Configuration Service
 * Maneja la configuración de la aplicación y variables de entorno
 * Las API keys NUNCA deben estar en el frontend
 */

export interface AppConfig {
  ai: {
    provider: 'demo' | 'openai' | 'anthropic' | 'custom';
    // Las API keys se manejan en el backend
    // Aquí solo configuramos qué proveedor usar
  };
  embeddings: {
    enabled: boolean;
    provider: 'demo' | 'openai' | 'custom';
  };
  transcription: {
    provider: 'demo' | 'whisper' | 'custom';
  };
  ocr: {
    provider: 'demo' | 'tesseract' | 'custom';
  };
  storage: {
    provider: 'local' | 'supabase' | 's3';
  };
  features: {
    demoMode: boolean;
    youtubeEnabled: boolean;
    webScrapingEnabled: boolean;
  };
}

class ConfigService {
  private config: AppConfig;

  constructor() {
    // Configuración por defecto (modo demo)
    this.config = {
      ai: {
        provider: 'demo'
      },
      embeddings: {
        enabled: true,
        provider: 'demo'
      },
      transcription: {
        provider: 'demo'
      },
      ocr: {
        provider: 'demo'
      },
      storage: {
        provider: 'local'
      },
      features: {
        demoMode: true,
        youtubeEnabled: false,
        webScrapingEnabled: false
      }
    };

    // Cargar configuración desde variables de entorno (si están disponibles)
    this.loadFromEnv();
  }

  /**
   * Cargar configuración desde variables de entorno
   * IMPORTANTE: Las API keys NO deben estar aquí
   * Solo configuramos qué proveedores usar
   */
  private loadFromEnv(): void {
    // En Vite, las variables de entorno deben empezar con VITE_
    // Pero NUNCA pongas API keys en el frontend
    
    // Ejemplo de configuración (sin API keys):
    // if (import.meta.env.VITE_AI_PROVIDER) {
    //   this.config.ai.provider = import.meta.env.VITE_AI_PROVIDER;
    // }
    
    // if (import.meta.env.VITE_EMBEDDINGS_ENABLED === 'false') {
    //   this.config.embeddings.enabled = false;
    // }
  }

  /**
   * Obtener configuración actual
   */
  getConfig(): AppConfig {
    return { ...this.config };
  }

  /**
   * Actualizar configuración
   */
  updateConfig(updates: Partial<AppConfig>): void {
    this.config = { ...this.config, ...updates };
  }

  /**
   * Verificar si está en modo demo
   */
  isDemoMode(): boolean {
    return this.config.features.demoMode || this.config.ai.provider === 'demo';
  }

  /**
   * Obtener información de configuración para mostrar en UI
   */
  getStatusInfo(): {
    mode: string;
    aiProvider: string;
    embeddingsEnabled: boolean;
    features: string[];
  } {
    const features: string[] = [];
    
    if (this.config.features.youtubeEnabled) features.push('YouTube');
    if (this.config.features.webScrapingEnabled) features.push('Web Scraping');
    if (this.config.embeddings.enabled) features.push('Embeddings');
    
    return {
      mode: this.isDemoMode() ? 'Demostración' : 'Producción',
      aiProvider: this.config.ai.provider,
      embeddingsEnabled: this.config.embeddings.enabled,
      features
    };
  }
}

export const configService = new ConfigService();
