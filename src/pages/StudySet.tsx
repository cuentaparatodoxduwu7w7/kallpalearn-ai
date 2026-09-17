import { useParams, Link, useNavigate } from 'react-router-dom';
import { Brain, FileCheck, PenTool, FileText, BookOpen, MessageSquare, Headphones, FolderOpen, ArrowLeft, RotateCcw, Play, Clock } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Button, ProgressBar, Badge, EmptyState, ConfirmDialog } from '../components/UI';
import { useState } from 'react';

export function StudySetPage() {
  const { id } = useParams<{ id: string }>();
  const { sets, saveSet, addToast } = useApp();
  const navigate = useNavigate();
  const [showReset, setShowReset] = useState(false);
  const studySet = sets.find(s => s.id === id);

  if (!studySet) {
    return (
      <EmptyState icon={BookOpen} title="Set no encontrado" description="Este set de estudio no existe o fue eliminado." action={<Link to="/app"><Button>Volver al inicio</Button></Link>} />
    );
  }

  const p = studySet.progress;

  const handleReset = () => {
    const updated = { ...studySet, progress: { ...studySet.progress, masteredCards: 0, familiarCards: 0, learningCards: 0, unfamiliarCards: studySet.progress.totalCards, masteryPercent: 0, quizScore: 0, quizAttempts: 0, writtenScore: 0, fillBlankScore: 0, sessionsCompleted: 0 }, flashcards: studySet.flashcards.map(f => ({ ...f, status: 'unfamiliar' as const, timesReviewed: 0 })) };
    saveSet(updated);
    addToast('info', 'Progreso reiniciado');
  };

  const sections = [
    { id: 'flashcards', label: 'Flashcards', icon: Brain, path: `/app/set/${id}/flashcards`, color: 'from-orange-400 to-orange-500', count: studySet.flashcards.length },
    { id: 'quiz', label: 'Quiz', icon: FileCheck, path: `/app/set/${id}/quiz`, color: 'from-violet-400 to-violet-500', count: studySet.quiz.questions.length },
    { id: 'written', label: 'Examen escrito', icon: PenTool, path: `/app/set/${id}/written`, color: 'from-blue-400 to-blue-500', count: studySet.writtenTest.questions.length },
    { id: 'fillblanks', label: 'Completar espacios', icon: FileText, path: `/app/set/${id}/fillblanks`, color: 'from-green-400 to-green-500', count: studySet.fillBlanks.length },
    { id: 'notes', label: 'Notas', icon: BookOpen, path: `/app/set/${id}/notes`, color: 'from-yellow-400 to-yellow-500', count: 1 },
    { id: 'tutor', label: 'Tutor IA', icon: MessageSquare, path: `/app/set/${id}/tutor`, color: 'from-pink-400 to-pink-500', count: studySet.tutorMessages.length },
    { id: 'podcast', label: 'Podcast', icon: Headphones, path: `/app/set/${id}/podcast`, color: 'from-teal-400 to-teal-500', count: 1 },
  ];

  return (
    <div className="space-y-6">
      <ConfirmDialog isOpen={showReset} onClose={() => setShowReset(false)} onConfirm={handleReset} title="Reiniciar progreso" message="¿Estás seguro? Se perderá todo el progreso de este set." />

      {/* Header */}
      <div className="flex items-start gap-4">
        <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 mt-1"><ArrowLeft size={18} /></button>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            {studySet.folderId && <Badge color="orange"><FolderOpen size={10} className="mr-1" />Carpeta</Badge>}
          </div>
          <h1 className="text-2xl font-bold text-gray-800">{studySet.title}</h1>
          <p className="text-gray-500 text-sm mt-1">{studySet.description}</p>
          <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
            <span className="flex items-center gap-1"><Clock size={12} />Creado {new Date(studySet.createdAt).toLocaleDateString('es')}</span>
            <span>{studySet.sourceFiles.length} archivos</span>
            <span>{p.sessionsCompleted} sesiones</span>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-800">Camino al dominio</h2>
          <button onClick={() => setShowReset(true)} className="text-xs text-gray-500 hover:text-red-500 flex items-center gap-1"><RotateCcw size={12} />Reiniciar</button>
        </div>
        <div className="flex items-center gap-3 mb-4">
          <span className="text-3xl font-bold text-orange-600">{p.masteryPercent}%</span>
          <div className="flex-1"><ProgressBar value={p.masteryPercent} color="orange" /></div>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: 'Dominado', value: p.masteredCards, color: 'bg-green-400', badge: 'green' as const },
            { label: 'Familiar', value: p.familiarCards, color: 'bg-blue-400', badge: 'blue' as const },
            { label: 'Aprendiendo', value: p.learningCards, color: 'bg-yellow-400', badge: 'orange' as const },
            { label: 'Nuevo', value: p.unfamiliarCards, color: 'bg-gray-300', badge: 'gray' as const },
          ].map((item, i) => (
            <div key={i} className="text-center p-3 rounded-xl bg-gray-50">
              <div className={`w-3 h-3 rounded-full ${item.color} mx-auto mb-1.5`} />
              <p className="text-xl font-bold text-gray-800">{item.value}</p>
              <p className="text-[10px] text-gray-500">{item.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Continue studying */}
      {p.sessionsCompleted > 0 && (
        <Link to={`/app/set/${id}/flashcards`}>
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-5 text-white flex items-center justify-between hover:shadow-lg transition cursor-pointer">
            <div className="flex items-center gap-3">
              <Play size={20} />
              <div>
                <p className="font-semibold">Continuar estudiando</p>
                <p className="text-sm text-white/80">Retoma donde lo dejaste</p>
              </div>
            </div>
            <Badge color="orange">{p.masteryPercent}%</Badge>
          </div>
        </Link>
      )}

      {/* Sections */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {sections.map(section => (
          <Link key={section.id} to={section.path} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md hover:border-orange-200 transition group">
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${section.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <section.icon size={18} className="text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 text-sm">{section.label}</h3>
                <p className="text-xs text-gray-400">{section.count} {section.count === 1 ? 'elemento' : 'elementos'}</p>
              </div>
            </div>
            {section.id === 'quiz' && p.quizAttempts > 0 && <Badge color={p.quizScore >= 70 ? 'green' : 'orange'}>Último: {p.quizScore}%</Badge>}
          </Link>
        ))}
      </div>
    </div>
  );
}
