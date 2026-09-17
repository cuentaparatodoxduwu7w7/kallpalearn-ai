import { Link } from 'react-router-dom';
import { BookOpen, Plus, TrendingUp, Clock, Brain, Target, ChevronRight, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Button, ProgressBar, Badge, Skeleton } from '../components/UI';

export function DashboardPage() {
  const { user, sets, sessions, isLoading } = useApp();

  const totalCards = sets.reduce((acc, s) => acc + s.progress.totalCards, 0);
  const masteredCards = sets.reduce((acc, s) => acc + s.progress.masteredCards, 0);
  const pendingCards = totalCards - masteredCards;
  const avgMastery = sets.length ? Math.round(sets.reduce((acc, s) => acc + s.progress.masteryPercent, 0) / sets.length) : 0;
  const recentSets = [...sets].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 4);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-24" />)}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">¡Hola, {user?.name?.split(' ')[0] || 'Estudiante'}! 👋</h1>
          <p className="text-gray-500 text-sm mt-1">¿Listo para seguir aprendiendo hoy?</p>
        </div>
        <Link to="/app/create"><Button><Plus size={16} className="mr-2" />Crear nuevo set</Button></Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Dominio general', value: `${avgMastery}%`, icon: Target, color: 'from-orange-400 to-orange-500' },
          { label: 'Tarjetas pendientes', value: pendingCards.toString(), icon: Brain, color: 'from-violet-400 to-violet-500' },
          { label: 'Sets activos', value: sets.length.toString(), icon: BookOpen, color: 'from-blue-400 to-blue-500' },
          { label: 'Sesiones', value: sessions.length.toString(), icon: Clock, color: 'from-green-400 to-green-500' },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3`}>
              <stat.icon size={18} className="text-white" />
            </div>
            <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Progress overview */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-800 flex items-center gap-2"><TrendingUp size={18} className="text-orange-500" />Tu progreso</h2>
          <Link to="/app/progress" className="text-sm text-orange-600 hover:text-orange-700 font-medium flex items-center gap-1">Ver más <ChevronRight size={14} /></Link>
        </div>
        <div className="flex items-center gap-4 mb-3">
          <div className="flex-1">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Camino al dominio</span>
              <span className="font-medium text-gray-800">{avgMastery}%</span>
            </div>
            <ProgressBar value={avgMastery} color="orange" />
          </div>
        </div>
        <div className="grid grid-cols-4 gap-2 mt-4">
          {[
            { label: 'Dominado', value: masteredCards, color: 'bg-green-400' },
            { label: 'Familiar', value: sets.reduce((a, s) => a + s.progress.familiarCards, 0), color: 'bg-blue-400' },
            { label: 'Aprendiendo', value: sets.reduce((a, s) => a + s.progress.learningCards, 0), color: 'bg-yellow-400' },
            { label: 'Nuevo', value: sets.reduce((a, s) => a + s.progress.unfamiliarCards, 0), color: 'bg-gray-300' },
          ].map((item, i) => (
            <div key={i} className="text-center">
              <div className={`w-3 h-3 rounded-full ${item.color} mx-auto mb-1`} />
              <p className="text-lg font-bold text-gray-800">{item.value}</p>
              <p className="text-[10px] text-gray-500">{item.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Sets */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-800">Sets recientes</h2>
          <Link to="/app/sets" className="text-sm text-orange-600 hover:text-orange-700 font-medium flex items-center gap-1">Ver todos <ChevronRight size={14} /></Link>
        </div>
        {recentSets.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 border border-gray-100 text-center">
            <Sparkles size={32} className="text-orange-400 mx-auto mb-3" />
            <p className="text-gray-600 mb-3">Aún no tienes sets de estudio</p>
            <Link to="/app/create"><Button size="sm"><Plus size={14} className="mr-2" />Crear tu primer set</Button></Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {recentSets.map(set => (
              <Link key={set.id} to={`/app/set/${set.id}`} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md hover:border-orange-200 transition group">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-gray-800 group-hover:text-orange-700 transition">{set.title}</h3>
                  <Badge color={set.progress.masteryPercent >= 70 ? 'green' : set.progress.masteryPercent >= 40 ? 'orange' : 'gray'}>
                    {set.progress.masteryPercent}%
                  </Badge>
                </div>
                <p className="text-sm text-gray-500 mb-3 line-clamp-2">{set.description}</p>
                <ProgressBar value={set.progress.masteryPercent} color="orange" />
                <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                  <span>{set.flashcards.length} tarjetas</span>
                  <span>{set.quiz.questions.length} preguntas</span>
                  <span>{set.sourceFiles.length} archivos</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
