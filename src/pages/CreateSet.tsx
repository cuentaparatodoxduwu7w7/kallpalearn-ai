import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, FileText, Link, Mic, X, CheckCircle, Loader2, Plus, BookOpen, Brain, MessageSquare, Headphones, FileCheck, PenTool, Radio, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Button, Badge } from '../components/UI';
import { StudySet, SourceFile, SourceStatus } from '../types';
import { v4 as uuid } from 'uuid';
import { ingestionPipeline } from '../services/ingestion';
import { aiRouter } from '../services/ai/router';

const ACCEPTED_TYPES = ['.pdf','.doc','.docx','.ppt','.pptx','.jpg','.jpeg','.png','.webp','.txt','.mp3','.wav','.m4a','.mp4'];
const MAX_FILES = 10;

const generationOptions = [
  { id: 'tutor', label: 'Tutor IA', icon: MessageSquare, desc: 'Chat inteligente sobre tu material' },
  { id: 'flashcards', label: 'Flashcards', icon: Brain, desc: 'Tarjetas de estudio interactivas' },
  { id: 'quiz', label: 'Quiz', icon: FileCheck, desc: 'Preguntas de opción múltiple' },
  { id: 'written', label: 'Examen escrito', icon: PenTool, desc: 'Preguntas abiertas' },
  { id: 'fillblanks', label: 'Completar espacios', icon: FileText, desc: 'Rellena los espacios en blanco' },
  { id: 'notes', label: 'Notas inteligentes', icon: BookOpen, desc: 'Resumen y conceptos clave' },
  { id: 'podcast', label: 'Podcast', icon: Radio, desc: 'Audio de estudio' },
];

export function CreateSetPage() {
  const { user, saveSet, addToast } = useApp();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState('');
  const [files, setFiles] = useState<SourceFile[]>([]);
  const [pastedText, setPastedText] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [inputMode, setInputMode] = useState<'upload' | 'text' | 'youtube' | 'website'>('upload');
  const [selectedMethods, setSelectedMethods] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [step, setStep] = useState<'input' | 'methods'>('input');

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList) return;
    const remaining = MAX_FILES - files.length;
    const newFiles: SourceFile[] = Array.from(fileList).slice(0, remaining).map(f => ({
      id: uuid(),
      name: f.name,
      size: f.size,
      type: f.type || 'unknown',
      status: 'uploading' as const,
      progress: 0,
    }));
    setFiles(prev => [...prev, ...newFiles]);
    // Simulate upload progress
    newFiles.forEach((nf, i) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 30;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          setFiles(prev => prev.map(f => f.id === nf.id ? { ...f, status: 'completed', progress: 100 } : f));
        } else {
          setFiles(prev => prev.map(f => f.id === nf.id ? { ...f, progress: Math.min(progress, 99), status: 'processing' } : f));
        }
      }, 300 + i * 100);
    });
  };

  const removeFile = (id: string) => setFiles(prev => prev.filter(f => f.id !== id));

  const retryFile = (id: string) => {
    setFiles(prev => prev.map(f => {
      if (f.id === id) {
        // Reiniciar el proceso de subida
        let progress = 0;
        const interval = setInterval(() => {
          progress += Math.random() * 30;
          if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            setFiles(prev => prev.map(file => file.id === id ? { ...file, status: 'completed', progress: 100, errorMessage: undefined } : file));
            addToast('success', `Archivo ${f.name} procesado correctamente`);
          } else {
            setFiles(prev => prev.map(file => file.id === id ? { ...file, progress: Math.min(progress, 99), status: 'processing' } : file));
          }
        }, 300);
        return { ...f, status: 'uploading' as const, progress: 0, errorMessage: undefined };
      }
      return f;
    }));
  };

  const hasContent = files.some(f => f.status === 'completed') || pastedText.trim().length > 0 || youtubeUrl.trim().length > 0 || websiteUrl.trim().length > 0;

  const toggleMethod = (id: string) => {
    setSelectedMethods(prev => prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]);
  };

  const handleGenerate = async () => {
    if (!title.trim()) { addToast('warning', 'Por favor ingresa un nombre para el set'); return; }
    if (selectedMethods.length === 0) { addToast('warning', 'Selecciona al menos un método de estudio'); return; }
    setIsGenerating(true);
    
    // Crear Study Set inicial
    const newSet: StudySet = {
      id: uuid(),
      userId: user?.id || '',
      title: title.trim(),
      description: `Set de estudio creado con ${selectedMethods.length} métodos.`,
      sourceFiles: files.filter(f => f.status === 'completed' || f.status === 'uploading'),
      flashcards: [],
      quiz: { id: uuid(), questions: [] },
      writtenTest: { id: uuid(), questions: [] },
      fillBlanks: [],
      notes: { id: uuid(), title: `Notas: ${title}`, summary: '', mainConcepts: [], definitions: [], examples: [], keyPoints: [], customContent: '' },
      tutorMessages: [],
      progress: { totalCards: 0, masteredCards: 0, familiarCards: 0, learningCards: 0, unfamiliarCards: 0, quizScore: 0, quizAttempts: 0, writtenScore: 0, fillBlankScore: 0, masteryPercent: 0, sessionsCompleted: 0 },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    // Guardar set inicial
    saveSet(newSet);
    
    // Ejecutar pipeline de ingestión
    try {
      const contentTypes = selectedMethods.map(m => m as 'flashcards' | 'quiz' | 'written' | 'fillblanks' | 'notes' | 'podcast');
      
      const processedSet = await ingestionPipeline.runFullPipeline(
        newSet,
        contentTypes,
        {
          onProgress: (progress) => {
            // Actualizar estado de las fuentes
            const updatedFiles = newSet.sourceFiles.map(f => 
              f.id === progress.sourceId 
                ? { ...f, status: progress.status as SourceStatus, progress: progress.progress }
                : f
            );
            newSet.sourceFiles = updatedFiles;
            saveSet(newSet);
          },
          onComplete: (finalSet) => {
            saveSet(finalSet);
          },
          onError: (error, sourceId) => {
            console.error('Error en pipeline:', error);
            if (sourceId) {
              addToast('error', `Error procesando fuente: ${error.message}`);
            }
          }
        }
      );
      
      setIsGenerating(false);
      addToast('success', '¡Set creado y procesado exitosamente!');
      
      // Mostrar mensaje si está en modo demo
      if (aiRouter.isDemoMode()) {
        addToast('info', 'Modo demostración: Conecta un proveedor de IA para procesamiento real');
      }
      
      navigate(`/app/set/${processedSet.id}`);
    } catch (error) {
      setIsGenerating(false);
      addToast('error', 'Error al procesar el set. Intenta de nuevo.');
      console.error(error);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-1">Crear nuevo set</h1>
      <p className="text-gray-500 text-sm mb-6">Agrega tu material y elige cómo quieres estudiarlo</p>
      
      {/* Demo mode indicator */}
      {aiRouter.isDemoMode() && (
        <div className="mb-4 p-3 rounded-xl bg-orange-50 border border-orange-200 flex items-start gap-2">
          <AlertCircle size={16} className="text-orange-600 shrink-0 mt-0.5" />
          <div className="text-xs text-orange-700">
            <strong>Modo demostración:</strong> Los archivos se procesarán con contenido de demostración. Para procesamiento real con IA, configura un proveedor en el backend.
          </div>
        </div>
      )}

      {step === 'input' && (
        <div className="space-y-6">
          {/* Title */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <label className="block text-sm font-medium text-gray-700 mb-2">Nombre del set</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Ej: Biología - Capítulo 3" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none transition text-sm" />
          </div>

          {/* Input mode tabs */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex gap-2 mb-4 flex-wrap">
              {[
                { id: 'upload', label: 'Archivos', icon: Upload },
                { id: 'text', label: 'Texto', icon: FileText },
                { id: 'youtube', label: 'YouTube', icon: Link },
                { id: 'website', label: 'Website', icon: Link },
              ].map(tab => (
                <button key={tab.id} onClick={() => setInputMode(tab.id as typeof inputMode)} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition ${inputMode === tab.id ? 'bg-orange-50 text-orange-700 border border-orange-200' : 'text-gray-600 hover:bg-gray-50'}`}>
                  <tab.icon size={14} />{tab.label}
                </button>
              ))}
            </div>

            {inputMode === 'upload' && (
              <div>
                <div onDragOver={e => { e.preventDefault(); }} onDrop={e => { e.preventDefault(); handleFiles(e.dataTransfer.files); }} onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center cursor-pointer hover:border-orange-300 hover:bg-orange-50/30 transition">
                  <Upload size={32} className="mx-auto text-gray-400 mb-3" />
                  <p className="text-sm font-medium text-gray-700">Arrastra archivos aquí o haz clic para seleccionar</p>
                  <p className="text-xs text-gray-400 mt-1">PDF, DOC, PPT, JPG, PNG, TXT, MP3, MP4 — Máx. {MAX_FILES} archivos</p>
                  <input ref={fileInputRef} type="file" multiple accept={ACCEPTED_TYPES.join(',')} className="hidden" onChange={e => handleFiles(e.target.files)} />
                </div>

                {files.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {files.map(f => (
                      <div key={f.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                        <FileText size={18} className="text-orange-500 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-700 truncate">{f.name}</p>
                          <div className="flex items-center gap-2">
                            <p className="text-xs text-gray-400">{formatSize(f.size)}</p>
                            {f.status === 'extracting' && <Badge color="orange">Extrayendo...</Badge>}
                            {f.status === 'chunking' && <Badge color="orange">Dividiendo...</Badge>}
                            {f.status === 'indexing' && <Badge color="violet">Indexando...</Badge>}
                            {f.status === 'generating' && <Badge color="violet">Generando...</Badge>}
                          </div>
                        </div>
                        {(f.status === 'uploading' || f.status === 'processing' || f.status === 'extracting' || f.status === 'chunking' || f.status === 'indexing' || f.status === 'generating') && (
                          <div className="flex items-center gap-2">
                            <Loader2 size={14} className="text-orange-500 animate-spin" />
                            <span className="text-xs text-gray-500">{Math.round(f.progress)}%</span>
                          </div>
                        )}
                        {f.status === 'completed' && <CheckCircle size={16} className="text-green-500" />}
                        {f.status === 'error' && (
                          <div className="flex items-center gap-1">
                            <X size={14} className="text-red-500" />
                            <button onClick={() => retryFile(f.id)} className="text-xs text-orange-600 hover:text-orange-700 font-medium">Reintentar</button>
                          </div>
                        )}
                        <button onClick={() => removeFile(f.id)} className="p-1 rounded hover:bg-gray-200 text-gray-400 hover:text-red-500"><X size={14} /></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {inputMode === 'text' && (
              <textarea value={pastedText} onChange={e => setPastedText(e.target.value)} placeholder="Pega aquí el texto de tu material de estudio..." className="w-full h-40 px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none transition text-sm resize-none" />
            )}

            {inputMode === 'youtube' && (
              <div className="space-y-3">
                <input type="url" value={youtubeUrl} onChange={e => setYoutubeUrl(e.target.value)} placeholder="https://youtube.com/watch?v=..." className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none transition text-sm" />
                {youtubeUrl && <p className="text-xs text-gray-500">Se extraerá el audio y la transcripción del video.</p>}
              </div>
            )}

            {inputMode === 'website' && (
              <div className="space-y-3">
                <input type="url" value={websiteUrl} onChange={e => setWebsiteUrl(e.target.value)} placeholder="https://ejemplo.com/articulo" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none transition text-sm" />
                {websiteUrl && <p className="text-xs text-gray-500">Se extraerá el contenido textual de la página.</p>}
              </div>
            )}
          </div>

          <Button onClick={() => setStep('methods')} disabled={!hasContent && !title.trim()} className="w-full" size="lg">
            Continuar → Seleccionar métodos
          </Button>
        </div>
      )}

      {step === 'methods' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <h2 className="font-semibold text-gray-800 mb-1">¿Qué quieres generar?</h2>
            <p className="text-sm text-gray-500 mb-4">Selecciona uno o varios métodos de estudio</p>
            <div className="grid sm:grid-cols-2 gap-3">
              {generationOptions.map(opt => (
                <button key={opt.id} onClick={() => toggleMethod(opt.id)} className={`flex items-start gap-3 p-4 rounded-xl border-2 text-left transition ${selectedMethods.includes(opt.id) ? 'border-orange-400 bg-orange-50' : 'border-gray-100 hover:border-gray-200'}`}>
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${selectedMethods.includes(opt.id) ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-500'}`}>
                    <opt.icon size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{opt.label}</p>
                    <p className="text-xs text-gray-500">{opt.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setStep('input')}>← Volver</Button>
            <Button onClick={handleGenerate} disabled={isGenerating || selectedMethods.length === 0} className="flex-1" size="lg">
              {isGenerating ? <><Loader2 size={16} className="animate-spin mr-2" />Generando...</> : <>Generar set ✨</>}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
