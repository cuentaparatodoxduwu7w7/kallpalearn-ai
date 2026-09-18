import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit2, Save, RotateCcw, BookOpen, Lightbulb, FileText } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Button, Badge, EmptyState, Textarea } from '../components/UI';

export function NotesPage() {
  const { id } = useParams<{ id: string }>();
  const { sets, saveSet, addToast } = useApp();
  const navigate = useNavigate();
  const studySet = sets.find(s => s.id === id);
  const [editing, setEditing] = useState(false);
  const [customContent, setCustomContent] = useState(studySet?.notes.customContent || '');

  if (!studySet || !studySet.notes.summary) {
    return <EmptyState icon={BookOpen} title="Sin notas" description="Las notas inteligentes aún no han sido generadas para este set." action={<Link to={`/app/set/${id}`}><Button>Volver al set</Button></Link>} />;
  }

  const notes = studySet.notes;

  const handleSave = () => {
    const updated = { ...studySet, notes: { ...studySet.notes, customContent } };
    saveSet(updated);
    setEditing(false);
    addToast('success', 'Notas guardadas');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(`/app/set/${id}`)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"><ArrowLeft size={18} /></button>
          <div>
            <h1 className="text-lg font-bold text-gray-800">Notas inteligentes</h1>
            <p className="text-xs text-gray-500">{studySet.title}</p>
          </div>
        </div>
        {editing ? (
          <Button onClick={handleSave} size="sm"><Save size={14} className="mr-1" />Guardar</Button>
        ) : (
          <Button variant="secondary" size="sm" onClick={() => setEditing(true)}><Edit2 size={14} className="mr-1" />Editar</Button>
        )}
      </div>

      {/* Summary */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <FileText size={18} className="text-orange-500" />
          <h2 className="font-semibold text-gray-800">Resumen</h2>
        </div>
        <p className="text-gray-600 text-sm leading-relaxed">{notes.summary}</p>
      </div>

      {/* Main Concepts */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb size={18} className="text-yellow-500" />
          <h2 className="font-semibold text-gray-800">Conceptos principales</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {notes.mainConcepts.map((c, i) => <Badge key={i} color="orange">{c}</Badge>)}
        </div>
      </div>

      {/* Definitions */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <h2 className="font-semibold text-gray-800 mb-3">Definiciones</h2>
        <div className="space-y-3">
          {notes.definitions.map((d, i) => (
            <div key={i} className="p-3 rounded-xl bg-gray-50 border border-gray-100">
              <p className="text-sm font-semibold text-gray-800">{d.term}</p>
              <p className="text-sm text-gray-600">{d.definition}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Key Points */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <h2 className="font-semibold text-gray-800 mb-3">Puntos clave</h2>
        <ul className="space-y-2">
          {notes.keyPoints.map((p, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
              <span className="w-5 h-5 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">{i + 1}</span>
              {p}
            </li>
          ))}
        </ul>
      </div>

      {/* Examples */}
      {notes.examples.length > 0 && (
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h2 className="font-semibold text-gray-800 mb-3">Ejemplos</h2>
          <ul className="space-y-2">
            {notes.examples.map((e, i) => (
              <li key={i} className="text-sm text-gray-600 p-3 rounded-xl bg-violet-50 border border-violet-100">💡 {e}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Custom notes */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <h2 className="font-semibold text-gray-800 mb-3">Mis notas</h2>
        {editing ? (
          <Textarea value={customContent} onChange={e => setCustomContent(e.target.value)} placeholder="Agrega tus propias notas aquí..." className="h-32" />
        ) : (
          <p className="text-sm text-gray-600 whitespace-pre-wrap">{customContent || 'Aún no has agregado notas personales.'}</p>
        )}
      </div>
    </div>
  );
}
