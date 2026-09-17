import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FolderOpen, Plus, MoreVertical, Trash2, Edit2, BookOpen, Palette } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Button, Modal, ConfirmDialog, EmptyState, Badge } from '../components/UI';
import { Folder } from '../types';
import { v4 as uuid } from 'uuid';

const COLORS = ['#f97316', '#8b5cf6', '#3b82f6', '#10b981', '#ef4444', '#f59e0b', '#ec4899', '#6366f1'];

export function FoldersPage() {
  const { folders, sets, user, saveFolder, deleteFolder, saveSet, addToast } = useApp();
  const [showCreate, setShowCreate] = useState(false);
  const [editingFolder, setEditingFolder] = useState<Folder | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [movingSetId, setMovingSetId] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState(COLORS[0]);

  const handleCreate = () => {
    if (!newName.trim()) return;
    const folder: Folder = { id: uuid(), userId: user?.id || '', name: newName.trim(), color: newColor, setIds: [], createdAt: new Date().toISOString() };
    saveFolder(folder);
    setShowCreate(false);
    setNewName('');
    addToast('success', 'Carpeta creada');
  };

  const handleEdit = () => {
    if (!editingFolder || !newName.trim()) return;
    saveFolder({ ...editingFolder, name: newName.trim(), color: newColor });
    setEditingFolder(null);
    addToast('success', 'Carpeta actualizada');
  };

  const handleDelete = () => {
    if (!deletingId) return;
    // Move sets out of folder
    sets.filter(s => s.folderId === deletingId).forEach(s => saveSet({ ...s, folderId: undefined }));
    deleteFolder(deletingId);
    setDeletingId(null);
    addToast('info', 'Carpeta eliminada');
  };

  const handleMoveSet = (targetFolderId: string | undefined) => {
    if (!movingSetId) return;
    const set = sets.find(s => s.id === movingSetId);
    if (set) {
      saveSet({ ...set, folderId: targetFolderId });
      addToast('success', targetFolderId ? 'Set movido a carpeta' : 'Set movido a "Todos los sets"');
    }
    setMovingSetId(null);
  };

  const getSetsInFolder = (folderId: string) => sets.filter(s => s.folderId === folderId);
  const allSets = sets.filter(s => !s.folderId);

  return (
    <div className="space-y-6">
      <ConfirmDialog isOpen={!!deletingId} onClose={() => setDeletingId(null)} onConfirm={handleDelete} title="Eliminar carpeta" message="Los sets dentro de esta carpeta no serán eliminados, solo se moverán a 'Sin carpeta'." />
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Nueva carpeta">
        <div className="space-y-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label><input type="text" value={newName} onChange={e => setNewName(e.target.value)} placeholder="Nombre de la carpeta" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none text-sm" autoFocus /></div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
            <div className="flex gap-2">{COLORS.map(c => <button key={c} onClick={() => setNewColor(c)} className={`w-8 h-8 rounded-full border-2 transition ${newColor === c ? 'border-gray-800 scale-110' : 'border-transparent'}`} style={{ backgroundColor: c }} />)}</div>
          </div>
          <div className="flex gap-3 justify-end"><Button variant="secondary" onClick={() => setShowCreate(false)}>Cancelar</Button><Button onClick={handleCreate}>Crear</Button></div>
        </div>
      </Modal>
      <Modal isOpen={!!editingFolder} onClose={() => setEditingFolder(null)} title="Editar carpeta">
        <div className="space-y-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label><input type="text" value={newName} onChange={e => setNewName(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none text-sm" /></div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
            <div className="flex gap-2">{COLORS.map(c => <button key={c} onClick={() => setNewColor(c)} className={`w-8 h-8 rounded-full border-2 transition ${newColor === c ? 'border-gray-800 scale-110' : 'border-transparent'}`} style={{ backgroundColor: c }} />)}</div>
          </div>
          <div className="flex gap-3 justify-end"><Button variant="secondary" onClick={() => setEditingFolder(null)}>Cancelar</Button><Button onClick={handleEdit}>Guardar</Button></div>
        </div>
      </Modal>
      <Modal isOpen={!!movingSetId} onClose={() => setMovingSetId(null)} title="Mover a carpeta">
        <div className="space-y-2">
          <button onClick={() => handleMoveSet(undefined)} className="w-full text-left p-3 rounded-xl hover:bg-gray-50 transition">
            <p className="text-sm font-medium text-gray-800">Todos los sets (sin carpeta)</p>
          </button>
          {folders.map(folder => (
            <button key={folder.id} onClick={() => handleMoveSet(folder.id)} className="w-full text-left p-3 rounded-xl hover:bg-gray-50 transition flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: folder.color }} />
              <p className="text-sm font-medium text-gray-800">{folder.name}</p>
            </button>
          ))}
        </div>
      </Modal>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Carpetas</h1>
        <Button onClick={() => { setNewName(''); setNewColor(COLORS[0]); setShowCreate(true); }}><Plus size={16} className="mr-1" />Nueva carpeta</Button>
      </div>

      {/* All sets */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-800 flex items-center gap-2"><BookOpen size={16} className="text-gray-400" />Todos los sets</h2>
          <Badge color="gray">{allSets.length}</Badge>
        </div>
        {allSets.length === 0 ? (
          <p className="text-sm text-gray-400">No hay sets sin carpeta</p>
        ) : (
          <div className="grid sm:grid-cols-2 gap-3">
            {allSets.map(set => (
              <div key={set.id} className="flex items-center gap-2">
                <Link to={`/app/set/${set.id}`} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition flex-1 min-w-0">
                  <BookOpen size={16} className="text-orange-500 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{set.title}</p>
                    <p className="text-xs text-gray-400">{set.flashcards.length} tarjetas</p>
                  </div>
                </Link>
                <button 
                  onClick={(e) => { e.preventDefault(); setMovingSetId(set.id); }}
                  className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-orange-500 transition"
                  title="Mover a carpeta"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14"></path>
                    <path d="m12 5 7 7-7 7"></path>
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Folders */}
      {folders.length === 0 ? (
        <EmptyState icon={FolderOpen} title="Sin carpetas" description="Organiza tus sets de estudio en carpetas." action={<Button onClick={() => setShowCreate(true)}><Plus size={14} className="mr-1" />Crear carpeta</Button>} />
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {folders.map(folder => {
            const folderSets = getSetsInFolder(folder.id);
            return (
              <div key={folder.id} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: folder.color + '20' }}>
                      <FolderOpen size={16} style={{ color: folder.color }} />
                    </div>
                    <h3 className="font-semibold text-gray-800">{folder.name}</h3>
                  </div>
                  <div className="relative group">
                    <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"><MoreVertical size={16} /></button>
                    <div className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-lg border border-gray-100 py-1 hidden group-hover:block z-10 min-w-[140px]">
                      <button onClick={() => { setEditingFolder(folder); setNewName(folder.name); setNewColor(folder.color); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"><Edit2 size={14} />Editar</button>
                      <button onClick={() => setDeletingId(folder.id)} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"><Trash2 size={14} />Eliminar</button>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-gray-400 mb-3">{folderSets.length} {folderSets.length === 1 ? 'set' : 'sets'}</p>
                {folderSets.length > 0 && (
                  <div className="space-y-1">
                    {folderSets.slice(0, 3).map(set => (
                      <div key={set.id} className="flex items-center gap-1">
                        <Link to={`/app/set/${set.id}`} className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 text-sm text-gray-700 truncate flex-1 min-w-0">
                          <BookOpen size={12} className="text-gray-400 shrink-0" />{set.title}
                        </Link>
                        <button 
                          onClick={(e) => { e.preventDefault(); setMovingSetId(set.id); }}
                          className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-orange-500 transition shrink-0"
                          title="Mover a otra carpeta"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M5 12h14"></path>
                            <path d="m12 5 7 7-7 7"></path>
                          </svg>
                        </button>
                      </div>
                    ))}
                    {folderSets.length > 3 && <p className="text-xs text-gray-400 px-2">+{folderSets.length - 3} más</p>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function SetsListPage() {
  const { sets, deleteSet, addToast } = useApp();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = () => {
    if (!deletingId) return;
    deleteSet(deletingId);
    setDeletingId(null);
    addToast('info', 'Set eliminado');
  };

  return (
    <div className="space-y-6">
      <ConfirmDialog isOpen={!!deletingId} onClose={() => setDeletingId(null)} onConfirm={handleDelete} title="Eliminar set" message="¿Estás seguro? Esta acción no se puede deshacer." />
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Mis Sets</h1>
        <Link to="/app/create"><Button><Plus size={16} className="mr-1" />Nuevo set</Button></Link>
      </div>

      {sets.length === 0 ? (
        <EmptyState icon={BookOpen} title="Sin sets de estudio" description="Crea tu primer set para empezar a estudiar con IA." action={<Link to="/app/create"><Button>Crear set</Button></Link>} />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sets.map(set => (
            <div key={set.id} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition group">
              <div className="flex items-start justify-between mb-2">
                <Link to={`/app/set/${set.id}`} className="font-semibold text-gray-800 hover:text-orange-700 transition">{set.title}</Link>
                <button onClick={() => setDeletingId(set.id)} className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-red-50 text-gray-400 hover:text-red-500 transition"><Trash2 size={14} /></button>
              </div>
              <p className="text-xs text-gray-500 mb-3 line-clamp-2">{set.description}</p>
              <div className="flex items-center gap-3 text-xs text-gray-400">
                <span>{set.flashcards.length} tarjetas</span>
                <span>{set.quiz.questions.length} quiz</span>
                <Badge color={set.progress.masteryPercent >= 70 ? 'green' : set.progress.masteryPercent >= 40 ? 'orange' : 'gray'}>{set.progress.masteryPercent}%</Badge>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
