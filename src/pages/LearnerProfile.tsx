import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Brain, Target, BookOpen, TrendingUp, Award } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Button, Badge, EmptyState } from '../components/UI';
import { learnerProfileService } from '../services/learner-profile';
import { LearnerProfile } from '../types';

export function LearnerProfilePage() {
  const { user } = useApp();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<LearnerProfile | null>(null);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<LearnerProfile>>({});

  useEffect(() => {
    if (user) {
      const p = learnerProfileService.getProfile(user.id);
      setProfile(p);
      setEditData(p);
    }
  }, [user]);

  const handleSave = () => {
    if (!user || !profile) return;
    const updated = { ...profile, ...editData, updatedAt: new Date().toISOString() };
    learnerProfileService.saveProfile(updated);
    setProfile(updated);
    setEditing(false);
  };

  if (!profile) {
    return <EmptyState icon={Brain} title="Cargando perfil..." description="" />;
  }

  const explanationStyles = [
    { value: 'simple', label: 'Simple y clara', icon: '💡' },
    { value: 'detailed', label: 'Detallada', icon: '📚' },
    { value: 'examples', label: 'Con ejemplos', icon: '🎯' },
    { value: 'visual', label: 'Visual', icon: '🎨' }
  ];

  const difficultyLevels = [
    { value: 'easy', label: 'Fácil', color: 'green' as const },
    { value: 'medium', label: 'Medio', color: 'orange' as const },
    { value: 'hard', label: 'Difícil', color: 'red' as const },
    { value: 'adaptive', label: 'Adaptativo', color: 'violet' as const }
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/app')} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Mi Perfil de Aprendizaje</h1>
            <p className="text-sm text-gray-500">Personaliza tu experiencia de estudio</p>
          </div>
        </div>
        {editing ? (
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => { setEditing(false); setEditData(profile); }}>Cancelar</Button>
            <Button onClick={handleSave}>Guardar</Button>
          </div>
        ) : (
          <Button variant="secondary" onClick={() => setEditing(true)}>Editar</Button>
        )}
      </div>

      {/* Preferencias de explicación */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Brain size={20} className="text-orange-500" />
          <h2 className="text-lg font-semibold text-gray-800">Estilo de explicación preferido</h2>
        </div>
        {editing ? (
          <div className="grid grid-cols-2 gap-3">
            {explanationStyles.map(style => (
              <button
                key={style.value}
                onClick={() => setEditData({ ...editData, preferredExplanationStyle: style.value as any })}
                className={`p-4 rounded-xl border-2 transition ${
                  editData.preferredExplanationStyle === style.value
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-2xl mb-2">{style.icon}</div>
                <div className="text-sm font-medium text-gray-800">{style.label}</div>
              </button>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
            <span className="text-2xl">
              {explanationStyles.find(s => s.value === profile.preferredExplanationStyle)?.icon}
            </span>
            <span className="text-gray-700">
              {explanationStyles.find(s => s.value === profile.preferredExplanationStyle)?.label}
            </span>
          </div>
        )}
      </div>

      {/* Nivel de dificultad */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Target size={20} className="text-violet-500" />
          <h2 className="text-lg font-semibold text-gray-800">Nivel de dificultad preferido</h2>
        </div>
        {editing ? (
          <div className="grid grid-cols-4 gap-2">
            {difficultyLevels.map(level => (
              <button
                key={level.value}
                onClick={() => setEditData({ ...editData, difficultyPreference: level.value as any })}
                className={`p-3 rounded-xl border-2 transition ${
                  editData.difficultyPreference === level.value
                    ? `border-${level.color}-500 bg-${level.color}-50`
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Badge color={level.color}>{level.label}</Badge>
              </button>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
            <Badge color={difficultyLevels.find(l => l.value === profile.difficultyPreference)?.color || 'gray'}>
              {difficultyLevels.find(l => l.value === profile.difficultyPreference)?.label}
            </Badge>
          </div>
        )}
      </div>

      {/* Nivel de estudio */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen size={20} className="text-blue-500" />
          <h2 className="text-lg font-semibold text-gray-800">Nivel de estudio</h2>
        </div>
        {editing ? (
          <select
            value={editData.studyLevel || profile.studyLevel}
            onChange={e => setEditData({ ...editData, studyLevel: e.target.value as any })}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none text-sm"
          >
            <option value="beginner">Principiante</option>
            <option value="intermediate">Intermedio</option>
            <option value="advanced">Avanzado</option>
          </select>
        ) : (
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
            <span className="text-gray-700 capitalize">{profile.studyLevel === 'beginner' ? 'Principiante' : profile.studyLevel === 'intermediate' ? 'Intermedio' : 'Avanzado'}</span>
          </div>
        )}
      </div>

      {/* Temas fuertes */}
      {profile.strongTopics.length > 0 && (
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Award size={20} className="text-green-500" />
            <h2 className="text-lg font-semibold text-gray-800">Tus temas fuertes</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {profile.strongTopics.map((topic, i) => (
              <Badge key={i} color="green">{topic}</Badge>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-3">
            Estos temas se actualizan automáticamente basados en tu desempeño
          </p>
        </div>
      )}

      {/* Temas débiles */}
      {profile.weakTopics.length > 0 && (
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={20} className="text-orange-500" />
            <h2 className="text-lg font-semibold text-gray-800">Temas para reforzar</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {profile.weakTopics.map((topic, i) => (
              <Badge key={i} color="orange">{topic}</Badge>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-3">
            El tutor te ofrecerá explicaciones adicionales sobre estos temas
          </p>
        </div>
      )}

      {/* Actividad reciente */}
      {profile.recentStudyActivity.length > 0 && (
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Actividad reciente</h2>
          <div className="space-y-2">
            {profile.recentStudyActivity.slice(0, 5).map((activity, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div>
                  <div className="text-sm font-medium text-gray-800 capitalize">{activity.action}</div>
                  <div className="text-xs text-gray-500">{activity.topic}</div>
                </div>
                {activity.score !== undefined && (
                  <Badge color={activity.score >= 70 ? 'green' : activity.score >= 40 ? 'orange' : 'red'}>
                    {activity.score}%
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Info */}
      <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
        <p className="text-sm text-blue-800">
          <strong>💡 ¿Cómo funciona?</strong> Tu perfil de aprendizaje se actualiza automáticamente basándose en tus interacciones. 
          El tutor IA usa esta información para personalizar las explicaciones y enfocarse en los temas que necesitas reforzar.
        </p>
      </div>
    </div>
  );
}
