import { useState, useRef } from 'react';
import { Upload, Camera, Image, Loader2, CheckCircle, ArrowLeft, HelpCircle, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button, EmptyState, Badge } from '../components/UI';
import { ResolveResult } from '../types';
import { aiRouter } from '../services/ai/router';

export function ResolvePage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<ResolveResult | null>(null);

  const handleImage = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setImageUrl(e.target?.result as string);
      processImage();
    };
    reader.readAsDataURL(file);
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (const item of items) {
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile();
        if (file) handleImage(file);
        break;
      }
    }
  };

  const processImage = async () => {
    setIsProcessing(true);
    // Simulate AI processing
    await new Promise(r => setTimeout(r, 2500));
    setResult({
      id: Date.now().toString(),
      imageUrl: imageUrl || '',
      detectedProblem: 'Resolver la ecuación: 2x + 5 = 15',
      solution: 'x = 5',
      steps: [
        'Restar 5 a ambos lados: 2x = 15 - 5',
        'Simplificar: 2x = 10',
        'Dividir ambos lados entre 2: x = 10/2',
        'Resultado: x = 5',
      ],
      explanation: 'Para resolver esta ecuación lineal, aislamos la variable x realizando operaciones inversas en ambos lados de la ecuación.',
      followUpQuestions: [
        '¿Qué pasa si la ecuación es 2x + 5 = 16?',
        '¿Cómo resolverías 3x - 7 = 8?',
        '¿Qué es una ecuación de segundo grado?',
      ],
    });
    setIsProcessing(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/app')} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"><ArrowLeft size={18} /></button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-gray-800">Resolver ejercicio</h1>
            {aiRouter.isDemoMode() && <Badge color="orange">Modo Demo</Badge>}
          </div>
          <p className="text-xs text-gray-500">Sube una imagen y obtén la solución paso a paso</p>
        </div>
      </div>

      {/* Demo mode indicator */}
      {aiRouter.isDemoMode() && (
        <div className="p-3 rounded-xl bg-orange-50 border border-orange-200 flex items-start gap-2">
          <AlertCircle size={16} className="text-orange-600 shrink-0 mt-0.5" />
          <div className="text-xs text-orange-700">
            <strong>Modo demostración:</strong> La resolución de ejercicios con IA requiere configurar un proveedor de visión en el backend. Los resultados mostrados son de demostración.
          </div>
        </div>
      )}

      {!imageUrl && !result && (
        <div className="space-y-4">
          <div onPaste={handlePaste} className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-10 text-center hover:border-orange-300 transition focus-within:border-orange-400" tabIndex={0}>
            <Upload size={40} className="mx-auto text-gray-300 mb-4" />
            <p className="text-sm font-medium text-gray-700 mb-2">Sube una imagen del ejercicio</p>
            <p className="text-xs text-gray-400 mb-4">Arrastra, pega (Ctrl+V) o selecciona un archivo</p>
            <div className="flex gap-3 justify-center">
              <Button variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()}><Image size={14} className="mr-1" />Seleccionar imagen</Button>
              <Button variant="secondary" size="sm" onClick={() => cameraInputRef.current?.click()}><Camera size={14} className="mr-1" />Tomar foto</Button>
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleImage(e.target.files[0])} />
            <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={e => e.target.files?.[0] && handleImage(e.target.files[0])} />
          </div>
        </div>
      )}

      {isProcessing && (
        <div className="bg-white rounded-2xl p-10 border border-gray-100 text-center">
          <Loader2 size={40} className="mx-auto text-orange-500 animate-spin mb-4" />
          <p className="text-sm font-medium text-gray-700">Analizando el ejercicio...</p>
          <p className="text-xs text-gray-400 mt-1">La IA está detectando y resolviendo el problema</p>
        </div>
      )}

      {result && !isProcessing && (
        <div className="space-y-4">
          {/* Image preview */}
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
            <img src={result.imageUrl} alt="Exercise" className="w-full max-h-48 object-contain rounded-xl bg-gray-50" />
          </div>

          {/* Problem detected */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <h2 className="font-semibold text-gray-800 mb-2 flex items-center gap-2"><HelpCircle size={16} className="text-orange-500" />Problema detectado</h2>
            <p className="text-gray-700">{result.detectedProblem}</p>
          </div>

          {/* Solution */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-5 border border-green-100">
            <h2 className="font-semibold text-green-800 mb-2 flex items-center gap-2"><CheckCircle size={16} />Solución</h2>
            <p className="text-lg font-bold text-green-700">{result.solution}</p>
          </div>

          {/* Steps */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <h2 className="font-semibold text-gray-800 mb-3">Procedimiento paso a paso</h2>
            <ol className="space-y-2">
              {result.steps.map((step, i) => (
                <li key={i} className="flex items-start gap-3 text-sm">
                  <span className="w-6 h-6 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-xs font-bold shrink-0">{i + 1}</span>
                  <span className="text-gray-700">{step}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Explanation */}
          <div className="bg-violet-50 rounded-2xl p-5 border border-violet-100">
            <h2 className="font-semibold text-violet-800 mb-2">Explicación</h2>
            <p className="text-sm text-violet-700">{result.explanation}</p>
          </div>

          {/* Follow-up */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <h2 className="font-semibold text-gray-800 mb-3">Preguntas de seguimiento</h2>
            <div className="space-y-2">
              {result.followUpQuestions.map((q, i) => (
                <div key={i} className="p-3 rounded-xl bg-gray-50 text-sm text-gray-700 hover:bg-orange-50 cursor-pointer transition">❓ {q}</div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => { setImageUrl(null); setResult(null); }}>Resolver otro ejercicio</Button>
            <Button onClick={() => navigate('/app')}>Volver al inicio</Button>
          </div>
        </div>
      )}

      {/* Info */}
      <div className="bg-orange-50 rounded-2xl p-4 border border-orange-100">
        <p className="text-xs text-orange-700">
          <strong>Nota:</strong> La resolución por IA con visión estará disponible cuando conectemos el servicio de reconocimiento de imágenes. Los resultados mostrados son una demostración.
        </p>
      </div>
    </div>
  );
}
