import { useState, useRef, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, Pause, SkipBack, SkipForward, Download, Headphones, RotateCcw, Volume2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Button, ProgressBar, EmptyState } from '../components/UI';

export function PodcastPage() {
  const { id } = useParams<{ id: string }>();
  const { sets } = useApp();
  const navigate = useNavigate();
  const studySet = sets.find(s => s.id === id);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [duration] = useState(342); // 5:42 demo duration
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setProgress(p => {
          if (p >= 100) { setIsPlaying(false); return 100; }
          return p + (100 / (duration / speed));
        });
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isPlaying, speed, duration]);

  if (!studySet) {
    return <EmptyState icon={Headphones} title="Set no encontrado" description="" action={<Link to="/app"><Button>Volver</Button></Link>} />;
  }

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const currentTime = Math.round((progress / 100) * duration);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(`/app/set/${id}`)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"><ArrowLeft size={18} /></button>
        <div>
          <h1 className="text-lg font-bold text-gray-800">Podcast de estudio</h1>
          <p className="text-xs text-gray-500">{studySet.title}</p>
        </div>
      </div>

      {/* Cover */}
      <div className="bg-gradient-to-br from-orange-400 via-orange-500 to-violet-500 rounded-2xl p-8 text-center text-white shadow-xl">
        <div className="w-24 h-24 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-4">
          <Headphones size={40} className="text-white" />
        </div>
        <h2 className="text-xl font-bold mb-1">{studySet.title}</h2>
        <p className="text-white/80 text-sm">Podcast generado a partir de tu material de estudio</p>
        <p className="text-white/60 text-xs mt-2">Duración: {formatTime(duration)}</p>
      </div>

      {/* Player */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        {/* Progress bar */}
        <div className="mb-4">
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden cursor-pointer" onClick={e => { const rect = e.currentTarget.getBoundingClientRect(); setProgress(((e.clientX - rect.left) / rect.width) * 100); }}>
            <div className="h-full bg-gradient-to-r from-orange-400 to-orange-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-6">
          <button onClick={() => setProgress(p => Math.max(0, p - 10))} className="p-2 rounded-full hover:bg-gray-100 text-gray-500"><SkipBack size={20} /></button>
          <button onClick={() => setIsPlaying(!isPlaying)} className="w-14 h-14 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white shadow-lg hover:shadow-xl transition hover:scale-105">
            {isPlaying ? <Pause size={24} /> : <Play size={24} className="ml-1" />}
          </button>
          <button onClick={() => setProgress(p => Math.min(100, p + 10))} className="p-2 rounded-full hover:bg-gray-100 text-gray-500"><SkipForward size={20} /></button>
        </div>

        {/* Speed & Download */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <Volume2 size={16} className="text-gray-400" />
            <span className="text-xs text-gray-500">Velocidad:</span>
            {[0.5, 1, 1.5, 2].map(s => (
              <button key={s} onClick={() => setSpeed(s)} className={`px-2 py-0.5 rounded text-xs font-medium ${speed === s ? 'bg-orange-100 text-orange-700' : 'text-gray-500 hover:bg-gray-100'}`}>{s}x</button>
            ))}
          </div>
          <button className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-orange-600 transition">
            <Download size={14} />Descargar
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="bg-orange-50 rounded-2xl p-4 border border-orange-100">
        <p className="text-xs text-orange-700">
          <strong>Nota:</strong> La generación de podcast con IA estará disponible cuando conectemos el servicio de Text-to-Speech. Por ahora, este reproductor es una demostración de la interfaz.
        </p>
      </div>
    </div>
  );
}
