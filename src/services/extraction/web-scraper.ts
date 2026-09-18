/**
 * Web Scraper Service
 * Servicio para extraer contenido de páginas web
 * Requiere backend para funcionar en producción (CORS, etc.)
 */

import { WebScraperProvider, WebScrapeResult } from '../types';

export class DemoWebScraperProvider implements WebScraperProvider {
  id = 'demo';
  name = 'Demo Web Scraper';

  async scrape(url: string): Promise<WebScrapeResult> {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    return {
      title: 'Página de demostración',
      content: `[Contenido web de demostración]\n\nEste es el contenido extraído de la página web: ${url}\n\nEn producción, este servicio extraería el contenido real de la página web, incluyendo:\n- Título de la página\n- Contenido principal (artículos, textos)\n- Ignorando navegación, anuncios, footers, etc.\n\nEl contenido web es útil para crear materiales de estudio a partir de artículos, documentación, blogs educativos y otros recursos en línea.\n\nPara que este servicio funcione con URLs reales, se requiere un backend que pueda:\n1. Realizar requests HTTP sin restricciones de CORS\n2. Parsear HTML y extraer contenido relevante\n3. Manejar páginas con JavaScript dinámico\n4. Respetar robots.txt y términos de servicio`,
      metadata: {
        url,
        scrapedAt: new Date().toISOString(),
        provider: 'demo'
      }
    };
  }
}

export class WebScraperService {
  private provider: WebScraperProvider;

  constructor() {
    this.provider = new DemoWebScraperProvider();
  }

  setProvider(provider: WebScraperProvider): void {
    this.provider = provider;
  }

  /**
   * Extraer contenido de una URL
   */
  async scrape(url: string): Promise<WebScrapeResult | null> {
    try {
      // Validar URL
      if (!this.isValidUrl(url)) {
        throw new Error('URL inválida');
      }

      return await this.provider.scrape(url);
    } catch (error) {
      console.error('Error scraping URL:', error);
      return null;
    }
  }

  /**
   * Validar URL
   */
  private isValidUrl(url: string): boolean {
    try {
      const parsed = new URL(url);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  }

  /**
   * Verificar si el servicio está disponible
   */
  isAvailable(): boolean {
    return this.provider.id !== 'demo';
  }
}

export const webScraperService = new WebScraperService();
