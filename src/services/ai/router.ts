/**
 * AI Service Router
 * Selecciona el proveedor de IA según la configuración
 */

import { AIProvider, ChatMessage, GenerateOptions } from '../types';
import { DemoAIProvider } from './demo-provider';

type ProviderType = 'demo' | 'openai' | 'anthropic' | 'custom';

class AIRouter {
  private providers: Map<ProviderType, AIProvider> = new Map();
  private currentProvider: ProviderType = 'demo';

  constructor() {
    // Registrar proveedor demo siempre disponible
    this.providers.set('demo', new DemoAIProvider());
    
    // Aquí se registrarían otros proveedores cuando estén configurados
    // this.providers.set('openai', new OpenAIProvider());
    // this.providers.set('anthropic', new AnthropicProvider());
  }

  /**
   * Seleccionar proveedor activo
   */
  setProvider(providerType: ProviderType): void {
    if (!this.providers.has(providerType)) {
      console.warn(`Provider ${providerType} not available, falling back to demo`);
      this.currentProvider = 'demo';
    } else {
      this.currentProvider = providerType;
    }
  }

  /**
   * Obtener proveedor actual
   */
  getCurrentProvider(): AIProvider {
    return this.providers.get(this.currentProvider)!;
  }

  /**
   * Verificar si está en modo demo
   */
  isDemoMode(): boolean {
    return this.currentProvider === 'demo';
  }

  /**
   * Generar texto
   */
  async generateText(prompt: string, options?: GenerateOptions): Promise<string> {
    const provider = this.getCurrentProvider();
    return provider.generateText(prompt, options);
  }

  /**
   * Generar contenido estructurado
   */
  async generateStructured<T>(prompt: string, schema: any): Promise<T> {
    const provider = this.getCurrentProvider();
    return provider.generateStructured<T>(prompt, schema);
  }

  /**
   * Chat con IA
   */
  async chat(messages: ChatMessage[], options?: GenerateOptions): Promise<string> {
    const provider = this.getCurrentProvider();
    return provider.chat(messages, options);
  }

  /**
   * Obtener información del proveedor actual
   */
  getProviderInfo(): { id: string; name: string; isDemo: boolean } {
    const provider = this.getCurrentProvider();
    return {
      id: provider.id,
      name: provider.name,
      isDemo: this.isDemoMode()
    };
  }
}

// Instancia singleton
export const aiRouter = new AIRouter();
