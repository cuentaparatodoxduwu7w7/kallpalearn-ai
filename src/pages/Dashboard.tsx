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
    <div className="space-y-6 animate-fade-in">
      {/* Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold gradient-text">¡Hola, {user?.name?.split(' ')[0] || 'Estudiante'}!</h1>
          <p className="text-gray-600 text-sm mt-2 flex items-center gap-2">
            <Sparkles size={16} className="text-orange-500" />
            ¿Listo para seguir aprendiendo hoy?
          </p>
        </div>
        <Link to="/app/create">
          <Button className="btn-press">
            <Plus size={16} className="mr-2" />
            Crear nuevo set
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Dominio general', value: `${avgMastery}%`, icon: Target, color: 'from-orange-400 to-orange-500', bg: 'bg-orange-50' },
          { label: 'Tarjetas pendientes', value: pendingCards.toString(), icon: Brain, color: 'from-violet-400 to-violet-500', bg: 'bg-violet-50' },
          { label: 'Sets activos', value: sets.length.toString(), icon: BookOpen, color: 'from-blue-400 to-blue-500', bg: 'bg-blue-50' },
          { label: 'Sesiones', value: sessions.length.toString(), icon: Clock, color: 'from-green-400 to-green-500', bg: 'bg-green-50' },
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

      {/* Progress overview */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm card-hover">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-semibold text-gray-800 flex items-center gap-2 text-lg">
            <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
              <TrendingUp size={16} className="text-orange-600" />
            </div>
            Tu progreso
          </h2>
          <Link to="/app/progress" className="text-sm text-orange-600 hover:text-orange-700 font-medium flex items-center gap-1 transition">
            Ver más <ChevronRight size={14} />
          </Link>
        </div>
        <div className="mb-5">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600 font-medium">Camino al dominio</span>
            <span className="font-bold text-orange-600">{avgMastery}%</span>
          </div>
          <ProgressBar value={avgMastery} color="orange" />
        </div>
        <div className="grid grid-cols-4 gap-3 pt-4 border-t border-gray-100">
          {[
            { label: 'Dominado', value: masteredCards, color: 'bg-green-500', bg: 'bg-green-50' },
            { label: 'Familiar', value: sets.reduce((a, s) => a + s.progress.familiarCards, 0), color: 'bg-blue-500', bg: 'bg-blue-50' },
            { label: 'Aprendiendo', value: sets.reduce((a, s) => a + s.progress.learningCards, 0), color: 'bg-yellow-500', bg: 'bg-yellow-50' },
            { label: 'Nuevo', value: sets.reduce((a, s) => a + s.progress.unfamiliarCards, 0), color: 'bg-gray-400', bg: 'bg-gray-50' },
          ].map((item, i) => (
            <div key={i} className={`${item.bg} rounded-xl p-3 text-center transition hover:scale-105`}>
              <div className={`w-2 h-2 rounded-full ${item.color} mx-auto mb-2`} />
              <p className="text-xl font-bold text-gray-800">{item.value}</p>
              <p className="text-[11px] text-gray-600 font-medium mt-1">{item.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Sets */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-semibold text-gray-800 text-lg">Sets recientes</h2>
          <Link to="/app/sets" className="text-sm text-orange-600 hover:text-orange-700 font-medium flex items-center gap-1 transition">
            Ver todos <ChevronRight size={14} />
          </Link>
        </div>
        {recentSets.length === 0 ? (
          <div className="bg-gradient-to-br from-orange-50 to-violet-50 rounded-2xl p-10 border border-gray-100 text-center">
            <div className="w-16 h-16 rounded-2xl bg-white shadow-md flex items-center justify-center mx-auto mb-4">
              <Sparkles size={32} className="text-orange-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">¡Comienza tu viaje de aprendizaje!</h3>
            <p className="text-gray-600 mb-5 max-w-md mx-auto">Crea tu primer set de estudio y descubre cómo la IA puede ayudarte a aprender más rápido.</p>
            <Link to="/app/create">
              <Button className="btn-press">
                <Plus size={16} className="mr-2" />
                Crear tu primer set
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {recentSets.map((set, index) => (
              <Link 
                key={set.id} 
                to={`/app/set/${set.id}`} 
                className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm card-hover group animate-slide-up"
                style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'both' }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-800 group-hover:text-orange-700 transition truncate">
                      {set.title}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(set.updatedAt).toLocaleDateString('es', { day: 'numeric', month: 'short' })}
                    </p>
                  </div>
                  <Badge color={set.progress.masteryPercent >= 70 ? 'green' : set.progress.masteryPercent >= 40 ? 'orange' : 'gray'}>
                    {set.progress.masteryPercent}%
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{set.description}</p>
                <ProgressBar value={set.progress.masteryPercent} color="orange" />
                <div className="flex items-center gap-4 mt-4 pt-3 border-t border-gray-100 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Brain size={12} />
                    {set.flashcards.length} tarjetas
                  </span>
                  <span className="flex items-center gap-1">
                    <BookOpen size={12} />
                    {set.quiz.questions.length} preguntas
                  </span>
                  <span className="flex items-center gap-1">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                      <polyline points="14 2 14 8 20 8"></polyline>
                    </svg>
                    {set.sourceFiles.length} archivos
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
