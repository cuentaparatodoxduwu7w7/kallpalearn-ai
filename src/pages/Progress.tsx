import { Link } from 'react-router-dom';
import { TrendingUp, BookOpen, Brain, Award, Clock, Calendar, Target } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ProgressBar, Badge, EmptyState } from '../components/UI';

export function ProgressPage() {
  const { sets, sessions, user } = useApp();

  const totalCards = sets.reduce((a, s) => a + s.progress.totalCards, 0);
  const masteredCards = sets.reduce((a, s) => a + s.progress.masteredCards, 0);
  const avgQuiz = sets.length ? Math.round(sets.reduce((a, s) => a + s.progress.quizScore, 0) / sets.filter(s => s.progress.quizAttempts > 0).length || 0) : 0;
  const totalSessions = sessions.length;
  const totalStudyTime = sessions.reduce((a, s) => a + s.duration, 0);
  const uniqueDays = new Set(sessions.map(s => new Date(s.date).toDateString())).size;
  const masteryPercent = totalCards ? Math.round((masteredCards / totalCards) * 100) : 0;

  // Activity by day (last 7 days)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dayStr = d.toDateString();
    const daySessions = sessions.filter(s => new Date(s.date).toDateString() === dayStr);
    return { day: d.toLocaleDateString('es', { weekday: 'short' }), sessions: daySessions.length, time: daySessions.reduce((a, s) => a + s.duration, 0) };
  });

  const maxSessions = Math.max(...last7Days.map(d => d.sessions), 1);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold gradient-text">Tu progreso</h1>
        <p className="text-gray-600 text-sm mt-2">Sigue tu evolución y celebra cada logro</p>
      </div>

      {/* Overview stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Dominio general', value: `${masteryPercent}%`, icon: Target, color: 'from-orange-400 to-orange-500', bg: 'bg-orange-50' },
          { label: 'Sets completados', value: sets.length.toString(), icon: BookOpen, color: 'from-violet-400 to-violet-500', bg: 'bg-violet-50' },
          { label: 'Tarjetas dominadas', value: `${masteredCards}/${totalCards}`, icon: Brain, color: 'from-blue-400 to-blue-500', bg: 'bg-blue-50' },
          { label: 'Promedio quiz', value: `${avgQuiz || 0}%`, icon: Award, color: 'from-green-400 to-green-500', bg: 'bg-green-50' },
        ].map((stat, i) => (
          <div key={i} className={`${stat.bg} rounded-2xl p-5 border border-gray-100 shadow-sm card-hover`}>
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3 shadow-sm`}>
              <stat.icon size={20} className="text-white" />
            </div>
            <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
            <p className="text-xs text-gray-600 mt-1 font-medium">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* More stats */}
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-2"><Calendar size={16} className="text-orange-500" /><span className="text-sm font-medium text-gray-700">Días estudiados</span></div>
          <p className="text-3xl font-bold text-gray-800">{uniqueDays}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-2"><Clock size={16} className="text-violet-500" /><span className="text-sm font-medium text-gray-700">Tiempo de estudio</span></div>
          <p className="text-3xl font-bold text-gray-800">{Math.round(totalStudyTime / 60)}<span className="text-sm text-gray-400 ml-1">min</span></p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-2"><TrendingUp size={16} className="text-green-500" /><span className="text-sm font-medium text-gray-700">Sesiones totales</span></div>
          <p className="text-3xl font-bold text-gray-800">{totalSessions}</p>
        </div>
      </div>

      {/* Activity chart */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm card-hover">
        <h2 className="font-semibold text-gray-800 mb-5 flex items-center gap-2 text-lg">
          <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
            <TrendingUp size={16} className="text-orange-600" />
          </div>
          Actividad de los últimos 7 días
        </h2>
        <div className="flex items-end gap-3 h-40">
          {last7Days.map((day, i) => {
            const height = (day.sessions / maxSessions) * 100;
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                <div className="w-full flex flex-col justify-end h-28 relative">
                  {day.sessions > 0 && (
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                      {day.sessions} {day.sessions === 1 ? 'sesión' : 'sesiones'}
                    </div>
                  )}
                  <div 
                    className="w-full bg-gradient-to-t from-orange-500 to-orange-300 rounded-t-lg transition-all hover:from-orange-600 hover:to-orange-400 cursor-pointer"
                    style={{ height: `${Math.max(height, day.sessions > 0 ? 10 : 3)}%` }}
                  />
                </div>
                <span className="text-xs text-gray-500 font-medium">{day.day}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mastery breakdown */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
        <h2 className="font-semibold text-gray-800 mb-4">Desglose de dominio</h2>
        <div className="space-y-3">
          {[
            { label: 'Dominado', value: masteredCards, total: totalCards, color: 'green' as const },
            { label: 'Familiar', value: sets.reduce((a, s) => a + s.progress.familiarCards, 0), total: totalCards, color: 'blue' as const },
            { label: 'Aprendiendo', value: sets.reduce((a, s) => a + s.progress.learningCards, 0), total: totalCards, color: 'orange' as const },
            { label: 'Nuevo', value: sets.reduce((a, s) => a + s.progress.unfamiliarCards, 0), total: totalCards, color: 'gray' as const },
          ].map((item, i) => (
            <div key={i}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">{item.label}</span>
                <span className="font-medium text-gray-800">{item.value}</span>
              </div>
              <ProgressBar value={item.value} max={Math.max(item.total, 1)} color={item.color} />
            </div>
          ))}
        </div>
      </div>

      {/* Recent activity */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
        <h2 className="font-semibold text-gray-800 mb-4">Actividad reciente</h2>
        {sessions.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">Aún no hay actividad registrada</p>
        ) : (
          <div className="space-y-2">
            {[...sessions].reverse().slice(0, 10).map(session => {
              const set = sets.find(s => s.id === session.setId);
              return (
                <div key={session.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${session.type === 'flashcards' ? 'bg-orange-100' : session.type === 'quiz' ? 'bg-violet-100' : 'bg-blue-100'}`}>
                    {session.type === 'flashcards' ? <Brain size={14} className="text-orange-600" /> : session.type === 'quiz' ? <Award size={14} className="text-violet-600" /> : <BookOpen size={14} className="text-blue-600" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{set?.title || 'Set eliminado'}</p>
                    <p className="text-xs text-gray-400">{session.type} • {Math.round(session.duration / 60)} min</p>
                  </div>
                  <span className="text-xs text-gray-400">{new Date(session.date).toLocaleDateString('es')}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
