import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, RotateCcw, Star, Edit2, Trash2, Plus, ArrowLeft, Shuffle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Button, Badge, Modal, EmptyState } from '../components/UI';
import { Flashcard, CardStatus } from '../types';

export function FlashcardsPage() {
  const { id } = useParams<{ id: string }>();
  const { sets, saveSet, addSession, addToast } = useApp();
  const navigate = useNavigate();
  const studySet = sets.find(s => s.id === id);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [editFront, setEditFront] = useState('');
  const [editBack, setEditBack] = useState('');
  const [startTime] = useState(Date.now());

  const cards = studySet?.flashcards || [];
  const card = cards[currentIndex];

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') next();
      else if (e.key === 'ArrowLeft') prev();
      else if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); setIsFlipped(f => !f); }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [currentIndex]);

  const next = () => { setCurrentIndex(i => Math.min(i + 1, cards.length - 1)); setIsFlipped(false); };
  const prev = () => { setCurrentIndex(i => Math.max(i - 1, 0)); setIsFlipped(false); };

  const markCard = (status: CardStatus) => {
    if (!studySet || !card) return;
    const updated = { ...studySet, flashcards: studySet.flashcards.map(f => f.id === card.id ? { ...f, status, timesReviewed: f.timesReviewed + 1, lastReviewed: new Date().toISOString() } : f) };
    // Update progress
    const statuses = updated.flashcards.map(f => f.status);
    updated.progress = { ...updated.progress, masteredCards: statuses.filter(s => s === 'mastered').length, familiarCards: statuses.filter(s => s === 'familiar').length, learningCards: statuses.filter(s => s === 'learning').length, unfamiliarCards: statuses.filter(s => s === 'unfamiliar').length, totalCards: statuses.length, masteryPercent: Math.round((statuses.filter(s => s === 'mastered').length / statuses.length) * 100) };
    saveSet(updated);
    next();
  };

  const toggleDifficult = () => {
    if (!studySet || !card) return;
    const updated = { ...studySet, flashcards: studySet.flashcards.map(f => f.id === card.id ? { ...f, isDifficult: !f.isDifficult } : f) };
    saveSet(updated);
  };

  const deleteCard = () => {
    if (!studySet || !card) return;
    const updated = { ...studySet, flashcards: studySet.flashcards.filter(f => f.id !== card.id) };
    saveSet(updated);
    addToast('info', 'Tarjeta eliminada');
    if (currentIndex >= updated.flashcards.length) setCurrentIndex(Math.max(0, updated.flashcards.length - 1));
  };

  const saveEdit = () => {
    if (!studySet || !card || !editFront.trim() || !editBack.trim()) return;
    const updated = { ...studySet, flashcards: studySet.flashcards.map(f => f.id === card.id ? { ...f, front: editFront, back: editBack } : f) };
    saveSet(updated);
    setShowEdit(false);
    addToast('success', 'Tarjeta actualizada');
  };

  const addCard = () => {
    if (!studySet || !editFront.trim() || !editBack.trim()) return;
    const newCard: Flashcard = { id: Date.now().toString(), front: editFront, back: editBack, status: 'unfamiliar', isDifficult: false, timesReviewed: 0 };
    const updated = { ...studySet, flashcards: [...studySet.flashcards, newCard], progress: { ...studySet.progress, totalCards: studySet.progress.totalCards + 1, unfamiliarCards: studySet.progress.unfamiliarCards + 1 } };
    saveSet(updated);
    setShowAdd(false);
    setEditFront('');
    setEditBack('');
    addToast('success', 'Tarjeta agregada');
  };

  const finishSession = () => {
    addSession({ id: Date.now().toString(), userId: studySet?.userId || '', setId: studySet?.id || '', type: 'flashcards', duration: Math.round((Date.now() - startTime) / 1000), cardsReviewed: cards.length, date: new Date().toISOString() });
    addToast('success', '¡Sesión completada!');
    navigate(`/app/set/${id}`);
  };

  if (!studySet) return <EmptyState icon={RotateCcw} title="Set no encontrado" description="" action={<Link to="/app"><Button>Volver</Button></Link>} />;
  if (cards.length === 0) return <EmptyState icon={Plus} title="Sin flashcards" description="Agrega tarjetas para empezar a estudiar." action={<Button onClick={() => setShowAdd(true)}>Agregar tarjeta</Button>} />;

  const statusColors: Record<CardStatus, 'gray' | 'orange' | 'blue' | 'green'> = { unfamiliar: 'gray', learning: 'orange', familiar: 'blue', mastered: 'green' };
  const statusLabels: Record<CardStatus, string> = { unfamiliar: 'Nuevo', learning: 'Aprendiendo', familiar: 'Familiar', mastered: 'Dominado' };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Modal isOpen={showEdit || showAdd} onClose={() => { setShowEdit(false); setShowAdd(false); }} title={showEdit ? 'Editar tarjeta' : 'Nueva tarjeta'}>
        <div className="space-y-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Frente</label><textarea value={editFront} onChange={e => setEditFront(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none text-sm h-24 resize-none" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Reverso</label><textarea value={editBack} onChange={e => setEditBack(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none text-sm h-24 resize-none" /></div>
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" onClick={() => { setShowEdit(false); setShowAdd(false); }}>Cancelar</Button>
            <Button onClick={showEdit ? saveEdit : addCard}>{showEdit ? 'Guardar' : 'Agregar'}</Button>
          </div>
        </div>
      </Modal>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(`/app/set/${id}`)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"><ArrowLeft size={18} /></button>
          <div>
            <h1 className="text-lg font-bold text-gray-800">Flashcards</h1>
            <p className="text-xs text-gray-500">{studySet.title}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => setShowAdd(true)}><Plus size={14} className="mr-1" />Agregar</Button>
          <Button variant="ghost" size="sm" onClick={finishSession}>Terminar</Button>
        </div>
      </div>

      {/* Progress */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-500">Tarjeta {currentIndex + 1} de {cards.length}</span>
        <Badge color={statusColors[card?.status || 'unfamiliar']}>{statusLabels[card?.status || 'unfamiliar']}</Badge>
      </div>

      {/* Card */}
      <div className="perspective-1000">
        <div onClick={() => setIsFlipped(!isFlipped)} className={`relative w-full min-h-[280px] sm:min-h-[320px] cursor-pointer transition-transform duration-500 transform-style-preserve-3d ${isFlipped ? 'rotate-y-180' : ''}`} style={{ transformStyle: 'preserve-3d', transform: isFlipped ? 'rotateY(180deg)' : '' }}>
          {/* Front */}
          <div className="absolute inset-0 bg-white rounded-2xl border border-gray-100 shadow-lg p-6 sm:p-8 flex flex-col items-center justify-center text-center backface-hidden" style={{ backfaceVisibility: 'hidden' }}>
            {card?.isDifficult && <Star size={16} className="absolute top-4 right-4 text-yellow-500 fill-yellow-500" />}
            <p className="text-lg sm:text-xl font-medium text-gray-800">{card?.front}</p>
            <p className="text-xs text-gray-400 mt-4">Toca para ver la respuesta</p>
          </div>
          {/* Back */}
          <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-violet-50 rounded-2xl border border-orange-100 shadow-lg p-6 sm:p-8 flex flex-col items-center justify-center text-center" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
            <p className="text-base sm:text-lg text-gray-700">{card?.back}</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={prev} disabled={currentIndex === 0}><ChevronLeft size={16} /></Button>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => markCard('unfamiliar')}>No lo sabía</Button>
          <Button onClick={() => markCard('mastered')}>Lo sabía ✓</Button>
        </div>
        <Button variant="ghost" size="sm" onClick={next} disabled={currentIndex === cards.length - 1}><ChevronRight size={16} /></Button>
      </div>

      {/* Card actions */}
      <div className="flex items-center justify-center gap-3">
        <button onClick={toggleDifficult} className={`p-2 rounded-lg text-sm flex items-center gap-1 ${card?.isDifficult ? 'text-yellow-600 bg-yellow-50' : 'text-gray-400 hover:text-yellow-600 hover:bg-gray-50'}`}><Star size={14} />{card?.isDifficult ? 'Difícil' : 'Marcar difícil'}</button>
        <button onClick={() => { setEditFront(card?.front || ''); setEditBack(card?.back || ''); setShowEdit(true); }} className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-gray-50 text-sm flex items-center gap-1"><Edit2 size={14} />Editar</button>
        <button onClick={deleteCard} className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-gray-50 text-sm flex items-center gap-1"><Trash2 size={14} />Eliminar</button>
      </div>

      {/* Keyboard hint */}
      <p className="text-center text-xs text-gray-400">← → navegar • Espacio voltear</p>
    </div>
  );
}
