import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle, ChevronRight, RotateCcw } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Button, Badge, ProgressBar, EmptyState } from '../components/UI';

export function QuizPage() {
  const { id } = useParams<{ id: string }>();
  const { sets, saveSet, addSession, addToast } = useApp();
  const navigate = useNavigate();
  const studySet = sets.find(s => s.id === id);
  const questions = studySet?.quiz.questions || [];
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [finished, setFinished] = useState(false);
  const [startTime] = useState(Date.now());

  if (!studySet || questions.length === 0) {
    return <EmptyState icon={RotateCcw} title="Sin preguntas" description="Este set aún no tiene preguntas de quiz generadas." action={<Link to={`/app/set/${id}`}><Button>Volver al set</Button></Link>} />;
  }

  const question = questions[currentQ];

  const handleSelect = (idx: number) => {
    if (showResult) return;
    setSelected(idx);
    setShowResult(true);
    const isCorrect = idx === question.correctIndex;
    if (isCorrect) setScore(s => s + 1);
    setAnswers(prev => [...prev, idx]);
  };

  const handleNext = () => {
    if (currentQ < questions.length - 1) {
      setCurrentQ(c => c + 1);
      setSelected(null);
      setShowResult(false);
    } else {
      setFinished(true);
      const finalScore = Math.round(((score + (selected === question.correctIndex ? 0 : 0)) / questions.length) * 100);
      const updated = { ...studySet, progress: { ...studySet.progress, quizScore: Math.round((score / questions.length) * 100), quizAttempts: studySet.progress.quizAttempts + 1 } };
      saveSet(updated);
      addSession({ id: Date.now().toString(), userId: studySet.userId, setId: studySet.id, type: 'quiz', duration: Math.round((Date.now() - startTime) / 1000), score: Math.round((score / questions.length) * 100), date: new Date().toISOString() });
      addToast('success', '¡Quiz completado!');
    }
  };

  if (finished) {
    const pct = Math.round((score / questions.length) * 100);
    return (
      <div className="max-w-lg mx-auto text-center space-y-6">
        <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
          <div className={`w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center ${pct >= 70 ? 'bg-green-100' : pct >= 40 ? 'bg-orange-100' : 'bg-red-100'}`}>
            <span className={`text-3xl font-bold ${pct >= 70 ? 'text-green-600' : pct >= 40 ? 'text-orange-600' : 'text-red-600'}`}>{pct}%</span>
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            {pct >= 70 ? '¡Excelente trabajo!' : pct >= 40 ? '¡Buen intento!' : 'Sigue practicando'}
          </h2>
          <p className="text-gray-500 mb-4">Respondiste {score} de {questions.length} correctamente</p>
          <ProgressBar value={pct} color={pct >= 70 ? 'green' : pct >= 40 ? 'orange' : 'orange'} />
          <div className="flex gap-3 justify-center mt-6">
            <Button variant="secondary" onClick={() => navigate(`/app/set/${id}`)}>Volver al set</Button>
            <Button onClick={() => { setCurrentQ(0); setSelected(null); setShowResult(false); setScore(0); setAnswers([]); setFinished(false); }}>Reintentar</Button>
          </div>
        </div>
        {/* Review */}
        <div className="space-y-3 text-left">
          <h3 className="font-semibold text-gray-800">Resumen</h3>
          {questions.map((q, i) => (
            <div key={q.id} className={`p-4 rounded-xl border ${answers[i] === q.correctIndex ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
              <p className="text-sm font-medium text-gray-800 mb-1">{i + 1}. {q.question}</p>
              <p className="text-xs text-gray-600">Tu respuesta: <span className={answers[i] === q.correctIndex ? 'text-green-700' : 'text-red-700'}>{q.options[answers[i] ?? 0]}</span></p>
              {answers[i] !== q.correctIndex && <p className="text-xs text-green-700 mt-1">Correcta: {q.options[q.correctIndex]}</p>}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(`/app/set/${id}`)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"><ArrowLeft size={18} /></button>
          <div>
            <h1 className="text-lg font-bold text-gray-800">Quiz</h1>
            <p className="text-xs text-gray-500">{studySet.title}</p>
          </div>
        </div>
        <Badge color="orange">{currentQ + 1}/{questions.length}</Badge>
      </div>

      <ProgressBar value={currentQ + 1} max={questions.length} color="violet" />

      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-800 mb-5">{question.question}</h2>
        <div className="space-y-3">
          {question.options.map((opt, i) => {
            const isSelected = selected === i;
            const isCorrect = i === question.correctIndex;
            let cls = 'border-gray-200 hover:border-orange-300 hover:bg-orange-50';
            if (showResult) {
              if (isCorrect) cls = 'border-green-400 bg-green-50';
              else if (isSelected && !isCorrect) cls = 'border-red-400 bg-red-50';
              else cls = 'border-gray-100 opacity-60';
            } else if (isSelected) {
              cls = 'border-orange-400 bg-orange-50';
            }
            return (
              <button key={i} onClick={() => handleSelect(i)} disabled={showResult} className={`w-full text-left p-4 rounded-xl border-2 transition text-sm ${cls}`}>
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-full border-2 border-current flex items-center justify-center text-xs font-bold shrink-0">{String.fromCharCode(65 + i)}</span>
                  <span className="flex-1">{opt}</span>
                  {showResult && isCorrect && <CheckCircle size={18} className="text-green-500 shrink-0" />}
                  {showResult && isSelected && !isCorrect && <XCircle size={18} className="text-red-500 shrink-0" />}
                </div>
              </button>
            );
          })}
        </div>

        {showResult && (
          <div className={`mt-4 p-4 rounded-xl ${selected === question.correctIndex ? 'bg-green-50 border border-green-100' : 'bg-orange-50 border border-orange-100'}`}>
            <p className="text-sm font-medium text-gray-800 mb-1">{selected === question.correctIndex ? '✓ ¡Correcto!' : '✗ Incorrecto'}</p>
            <p className="text-sm text-gray-600">{question.explanation}</p>
          </div>
        )}
      </div>

      {showResult && (
        <div className="flex justify-end">
          <Button onClick={handleNext}>
            {currentQ < questions.length - 1 ? 'Siguiente pregunta' : 'Ver resultados'} <ChevronRight size={16} className="ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
}
