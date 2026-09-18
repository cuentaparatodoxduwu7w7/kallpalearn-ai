import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle, AlertCircle, Loader2, Server, Database, HardDrive, Brain, Cpu, Image, Mic, Video, Radio } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Button, Badge } from '../components/UI';
import { edgeFunctionsService, SystemStatus } from '../services/edge-functions';

export function SystemStatusPage() {
  const { user } = useApp();
  const navigate = useNavigate();
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = async () => {
    setLoading(true);
    setError(null);
    try {
      const systemStatus = await edgeFunctionsService.getSystemStatus();
      setStatus(systemStatus);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar el estado del sistema');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (statusValue: string) => {
    switch (statusValue) {
      case 'CONNECTED':
        return <CheckCircle size={20} className="text-green-500" />;
      case 'DEMO':
        return <AlertCircle size={20} className="text-orange-500" />;
      case 'ERROR':
        return <XCircle size={20} className="text-red-500" />;
      default:
        return <XCircle size={20} className="text-gray-400" />;
    }
  };

  const getStatusColor = (statusValue: string) => {
    switch (statusValue) {
      case 'CONNECTED':
        return 'bg-green-50 border-green-200';
      case 'DEMO':
        return 'bg-orange-50 border-orange-200';
      case 'ERROR':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getStatusLabel = (statusValue: string) => {
    switch (statusValue) {
      case 'CONNECTED':
        return 'Conectado';
      case 'DEMO':
        return 'Modo Demo';
      case 'ERROR':
        return 'Error';
      default:
        return 'No Configurado';
    }
  };

  const getStatusBadgeColor = (statusValue: string): 'green' | 'orange' | 'red' | 'gray' => {
    switch (statusValue) {
      case 'CONNECTED':
        return 'green';
      case 'DEMO':
        return 'orange';
      case 'ERROR':
        return 'red';
      default:
        return 'gray';
    }
  };

  const components = status ? [
    { name: 'Autenticación', key: 'authentication', icon: Server, description: 'Supabase Auth' },
    { name: 'Base de Datos', key: 'database', icon: Database, description: 'PostgreSQL con RLS' },
    { name: 'Storage', key: 'storage', icon: HardDrive, description: 'Almacenamiento de archivos' },
    { name: 'IA (LLM)', key: 'ai', icon: Brain, description: 'Proveedor de IA' },
    { name: 'Embeddings', key: 'embeddings', icon: Cpu, description: 'Generación de vectores' },
    { name: 'RAG', key: 'rag', icon: Brain, description: 'Retrieval Augmented Generation' },
    { name: 'OCR', key: 'ocr', icon: Image, description: 'Reconocimiento de texto en imágenes' },
    { name: 'Transcripción', key: 'transcription', icon: Mic, description: 'Audio a texto' },
    { name: 'Visión', key: 'vision', icon: Video, description: 'Análisis de imágenes' },
    { name: 'Podcast', key: 'podcast', icon: Radio, description: 'Text-to-Speech' },
  ] : [];

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/app')} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Estado del Sistema</h1>
            <p className="text-sm text-gray-500">Verificando componentes...</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-12 border border-gray-100 text-center">
          <Loader2 size={40} className="mx-auto text-orange-500 animate-spin mb-4" />
          <p className="text-gray-600">Cargando estado del sistema...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/app')} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Estado del Sistema</h1>
            <p className="text-sm text-gray-500">Error al verificar componentes</p>
          </div>
        </div>
        <div className="bg-red-50 rounded-2xl p-6 border border-red-200">
          <div className="flex items-start gap-3">
            <XCircle size={24} className="text-red-500 shrink-0" />
            <div>
              <p className="font-semibold text-red-800 mb-1">Error al cargar el estado</p>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
          <Button onClick={loadStatus} className="mt-4" variant="secondary">
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/app')} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-3xl font-bold gradient-text">Estado del Sistema</h1>
            <p className="text-gray-600 text-sm mt-1">Verifica el estado de todos los componentes</p>
          </div>
        </div>
        <Button onClick={loadStatus} variant="secondary" size="sm">
          Actualizar
        </Button>
      </div>

      {/* User info */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-violet-400 flex items-center justify-center text-white font-bold">
            {user?.name?.[0] || 'U'}
          </div>
          <div>
            <p className="font-semibold text-gray-800">{user?.name || 'Usuario'}</p>
            <p className="text-sm text-gray-500">{user?.email}</p>
          </div>
          <div className="ml-auto">
            <Badge color={status?.authentication === 'CONNECTED' ? 'green' : 'gray'}>
              {status?.authentication === 'CONNECTED' ? 'Autenticado' : 'No autenticado'}
            </Badge>
          </div>
        </div>
      </div>

      {/* Components status */}
      <div className="grid gap-4">
        {components.map((component) => {
          const statusValue = status?.[component.key as keyof SystemStatus] || 'NOT_CONFIGURED';
          return (
            <div
              key={component.key}
              className={`bg-white rounded-2xl p-5 border-2 shadow-sm card-hover ${getStatusColor(statusValue)}`}
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center shrink-0">
                  <component.icon size={24} className="text-gray-700" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-800">{component.name}</h3>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(statusValue)}
                      <Badge color={getStatusBadgeColor(statusValue)}>
                        {getStatusLabel(statusValue)}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">{component.description}</p>
                  
                  {/* Additional info based on status */}
                  {statusValue === 'DEMO' && (
                    <div className="mt-3 p-3 rounded-xl bg-orange-100 border border-orange-200">
                      <p className="text-xs text-orange-800">
                        <strong>Modo Demo:</strong> Este componente está funcionando con datos de demostración. 
                        Para usar la funcionalidad real, configura el proveedor correspondiente en Supabase Edge Functions.
                      </p>
                    </div>
                  )}
                  {statusValue === 'NOT_CONFIGURED' && (
                    <div className="mt-3 p-3 rounded-xl bg-gray-100 border border-gray-200">
                      <p className="text-xs text-gray-700">
                        <strong>No configurado:</strong> Este componente no está disponible actualmente.
                        {component.key === 'ocr' && ' La funcionalidad de OCR requiere un proveedor de visión.'}
                        {component.key === 'transcription' && ' La transcripción requiere un proveedor de audio.'}
                        {component.key === 'vision' && ' El análisis de imágenes requiere un proveedor de visión.'}
                        {component.key === 'podcast' && ' La generación de podcast requiere un proveedor TTS.'}
                      </p>
                    </div>
                  )}
                  {statusValue === 'ERROR' && (
                    <div className="mt-3 p-3 rounded-xl bg-red-100 border border-red-200">
                      <p className="text-xs text-red-800">
                        <strong>Error:</strong> Este componente tiene un error de configuración. 
                        Verifica las variables de entorno en Supabase Edge Functions.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Info box */}
      <div className="bg-blue-50 rounded-2xl p-5 border border-blue-200">
        <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
          <AlertCircle size={18} />
          Información Importante
        </h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li>• Las API keys de IA deben configurarse en <strong>Supabase Edge Functions Secrets</strong>, nunca en el frontend</li>
          <li>• Los componentes marcados como "Modo Demo" funcionan con datos de demostración</li>
          <li>• Para usar IA real, configura <code className="bg-blue-100 px-1.5 py-0.5 rounded">AI_PROVIDER</code> y las API keys correspondientes en Supabase</li>
          <li>• Todas las operaciones de IA están aisladas por usuario y Study Set</li>
          <li>• Tus datos nunca se comparten con otros usuarios ni se usan para entrenar modelos</li>
        </ul>
      </div>
    </div>
  );
}
