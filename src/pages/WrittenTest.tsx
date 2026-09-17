import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Send, RotateCcw, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Button, Badge, ProgressBar, EmptyState } from '../components/UI';

export function WrittenTestPage() {
  const { id } = useParams<{ id: string }>();
  const { sets, saveSet, addToast } = useApp();
  const navigate = useNavigate();
  const studySet = sets.find(s => s.id === id);
  const questions = studySet?.writtenTest.questions || [];
  const [currentQ, setCurrentQ] = useState(0);
  const [answer, setAnswer] = useState('');
  const [evaluated, setEvaluated] = useState(false);
  const [finished, setFinished] = useState(false);
  const [scores, setScores] = useState<number[]>([]);

  if (!studySet || questions.length === 0) {
    return <EmptyState icon={RotateCcw} title="Sin preguntas" description="Este set aún no tiene preguntas de examen escrito." action={<Link to={`/app/set/${id}`}><Button>Volver al set</Button></Link>} />;
  }

  const question = questions[currentQ];

  const handleEvaluate = () => {
    if (!answer.trim()) return;
    // Simple evaluation: check if key terms from model answer appear in user answer
    const modelTerms = question.modelAnswer.toLowerCase().split(/\s+/).filter(w => w.length > 4);
    const userTerms = answer.toLowerCase();
    const matches = modelTerms.filter(t => userTerms.includes(t)).length;
    const score = Math.min(100, Math.round((matches / Math.max(modelTerms.length, 1)) * 100) + 20);
    setScores(prev => [...prev, score]);
    setEvaluated(true);
  };

  const handleNext = () => {
    if (currentQ < questions.length - 1) {
      setCurrentQ(c => c + 1);
      setAnswer('');
      setEvaluated(false);
    } else {
      setFinished(true);
      const avgScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
      const updated = { ...studySet, progress: { ...studySet.progress, writtenScore: avgScore } };
      saveSet(updated);
      addToast('success', '¡Examen completado!');
    }
  };

  if (finished) {
    const avg = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
    return (
      <div className="max-w-lg mx-auto text-center space-y-6">
        <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
          <div className={`w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center ${avg >= 70 ? 'bg-green-100' : 'bg-orange-100'}`}>
            <span className={`text-3xl font-bold ${avg >= 70 ? 'text-green-600' : 'text-orange-600'}`}>{avg}%</span>
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Examen completado</h2>
          <p className="text-gray-500 mb-4">Puntuación promedio: {avg}%</p>
          <div className="flex gap-3 justify-center">
            <Button variant="secondary" onClick={() => navigate(`/app/set/${id}`)}>Volver al set</Button>
            <Button onClick={() => { setCurrentQ(0); setAnswer(''); setEvaluated(false); setFinished(false); setScores([]); }}>Reintentar</Button>
          </div>
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
            <h1 className="text-lg font-bold text-gray-800">Examen escrito</h1>
            <p className="text-xs text-gray-500">{studySet.title}</p>
          </div>
        </div>
        <Badge color="violet">{currentQ + 1}/{questions.length}</Badge>
      </div>

      <ProgressBar value={currentQ + 1} max={questions.length} color="violet" />

      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">{question.question}</h2>
        <textarea value={answer} onChange={e => setAnswer(e.target.value)} disabled={evaluated} placeholder="Escribe tu respuesta aquí..." className="w-full h-40 px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none text-sm resize-none disabled:bg-gray-50" />

        {!evaluated ? (
          <div className="flex justify-end mt-4">
            <Button onClick={handleEvaluate} disabled={!answer.trim()}><Send size={14} className="mr-2" />Enviar respuesta</Button>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
              <p className="text-sm font-medium text-blue-800 mb-2">📝 Respuesta modelo:</p>
              <p className="text-sm text-blue-700">{question.modelAnswer}</p>
            </div>
            <div className="p-4 rounded-xl bg-violet-50 border border-violet-100">
              <p className="text-sm font-medium text-violet-800 mb-2">💡 Explicación:</p>
              <p className="text-sm text-violet-700">{question.explanation}</p>
            </div>
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
              <p className="text-sm font-medium text-gray-700">Puntuación: <span className="text-orange-600 font-bold">{scores[scores.length - 1]}%</span></p>
              <p className="text-xs text-gray-500 mt-1">Evaluación básica por palabras clave. La evaluación por IA estará disponible próximamente.</p>
            </div>
            <div className="flex justify-end mt-4">
              <Button onClick={handleNext}>
                {currentQ < questions.length - 1 ? 'Siguiente pregunta' : 'Ver resultados'} <ChevronRight size={16} className="ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function FillBlanksPage() {
  const { id } = useParams<{ id: string }>();
  const { sets, saveSet, addToast } = useApp();
  const navigate = useNavigate();
  const studySet = sets.find(s => s.id === id);
  const items = studySet?.fillBlanks || [];
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userAnswers, setUserAnswers] = useState<string[]>([]);
  const [evaluated, setEvaluated] = useState(false);
  const [finished, setFinished] = useState(false);
  const [scores, setScores] = useState<number[]>([]);

  if (!studySet || items.length === 0) {
    return <EmptyState icon={RotateCcw} title="Sin ejercicios" description="Este set aún no tiene ejercicios de completar espacios." action={<Link to={`/app/set/${id}`}><Button>Volver al set</Button></Link>} />;
  }

  const item = items[currentIdx];

  const handleCheck = () => {
    if (userAnswers.some(a => !a.trim())) return;
    const correct = item.blanks.filter((b, i) => b.answer.toLowerCase().trim() === userAnswers[i]?.toLowerCase().trim()).length;
    const score = Math.round((correct / item.blanks.length) * 100);
    setScores(prev => [...prev, score]);
    setEvaluated(true);
  };

  const handleNext = () => {
    if (currentIdx < items.length - 1) {
      setCurrentIdx(c => c + 1);
      setUserAnswers([]);
      setEvaluated(false);
    } else {
      setFinished(true);
      const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
      const updated = { ...studySet, progress: { ...studySet.progress, fillBlankScore: avg } };
      saveSet(updated);
      addToast('success', '¡Ejercicios completados!');
    }
  };

  if (finished) {
    const avg = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
    return (
      <div className="max-w-lg mx-auto text-center space-y-6">
        <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
          <div className={`w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center ${avg >= 70 ? 'bg-green-100' : 'bg-orange-100'}`}>
            <span className={`text-3xl font-bold ${avg >= 70 ? 'text-green-600' : 'text-orange-600'}`}>{avg}%</span>
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">¡Completado!</h2>
          <p className="text-gray-500 mb-4">Puntuación: {avg}%</p>
          <div className="flex gap-3 justify-center">
            <Button variant="secondary" onClick={() => navigate(`/app/set/${id}`)}>Volver</Button>
            <Button onClick={() => { setCurrentIdx(0); setUserAnswers([]); setEvaluated(false); setFinished(false); setScores([]); }}>Reintentar</Button>
          </div>
        </div>
      </div>
    );
  }

  // Render sentence with blanks
  const renderSentence = () => {
    const parts = item.sentence.split('___');
    return parts.map((part, i) => (
      <span key={i} className="inline">
        {part}
        {i < parts.length - 1 && (
          <span className="inline-block mx-1">
            <input
              type="text"
              value={userAnswers[i] || ''}
              onChange={e => { const na = [...userAnswers]; na[i] = e.target.value; setUserAnswers(na); }}
              disabled={evaluated}
              className={`w-28 px-2 py-1 text-center border-b-2 text-sm font-medium outline-none transition ${
                evaluated
                  ? item.blanks[i].answer.toLowerCase().trim() === (userAnswers[i] || '').toLowerCase().trim()
                    ? 'border-green-400 bg-green-50 text-green-700'
                    : 'border-red-400 bg-red-50 text-red-700'
                  : 'border-orange-300 bg-orange-50 text-orange-700 focus:border-orange-500'
              }`}
              placeholder="..."
            />
          </span>
        )}
      </span>
    ));
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(`/app/set/${id}`)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"><ArrowLeft size={18} /></button>
          <div>
            <h1 className="text-lg font-bold text-gray-800">Completar espacios</h1>
            <p className="text-xs text-gray-500">{studySet.title}</p>
          </div>
        </div>
        <Badge color="green">{currentIdx + 1}/{items.length}</Badge>
      </div>

      <ProgressBar value={currentIdx + 1} max={items.length} color="green" />

      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <div className="text-lg text-gray-800 leading-relaxed mb-6">{renderSentence()}</div>

        {!evaluated ? (
          <div className="flex justify-end">
            <Button onClick={handleCheck} disabled={userAnswers.some(a => !a?.trim()) || userAnswers.length < item.blanks.length}>
              <CheckCircle size={14} className="mr-2" />Verificar
            </Button>
          </div>
        ) : (
          <div className="space-y-3 mt-4">
            {item.blanks.map((b, i) => (
              <div key={i} className={`p-3 rounded-xl text-sm ${userAnswers[i]?.toLowerCase().trim() === b.answer.toLowerCase().trim() ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                {userAnswers[i]?.toLowerCase().trim() === b.answer.toLowerCase().trim() ? '✓' : '✗'} Respuesta correcta: <strong>{b.answer}</strong>
              </div>
            ))}
            <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
              <p className="text-sm text-blue-700">{item.explanation}</p>
            </div>
            <div className="flex justify-end">
              <Button onClick={handleNext}>
                {currentIdx < items.length - 1 ? 'Siguiente' : 'Ver resultados'} <ChevronRight size={16} className="ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
