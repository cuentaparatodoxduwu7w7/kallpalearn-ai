import { Link } from 'react-router-dom';
import { Zap, BookOpen, Brain, MessageSquare, Headphones, FileText, CheckCircle, ArrowRight, Sparkles, Target, Layers } from 'lucide-react';
import { Button } from '../components/UI';

export function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50/60 via-white to-violet-50/40">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-md border-b border-gray-100/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-sm">
              <Zap size={16} className="text-white" />
            </div>
            <span className="font-bold text-gray-800 text-lg">KallpaLearn <span className="text-violet-500 text-sm">AI</span></span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
            <a href="#features" className="hover:text-orange-600 transition">Funcionalidades</a>
            <a href="#methods" className="hover:text-orange-600 transition">Métodos</a>
            <a href="#how" className="hover:text-orange-600 transition">Cómo funciona</a>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-orange-600 transition">Iniciar sesión</Link>
            <Link to="/register"><Button size="sm">Comenzar gratis</Button></Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-28 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-100 text-violet-700 text-sm font-medium mb-6">
            <Sparkles size={14} />
            Potenciado por Inteligencia Artificial
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
            Sube tu material.<br />
            <span className="bg-gradient-to-r from-orange-500 to-violet-500 bg-clip-text text-transparent">Estudia de muchas formas.</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Convierte tus apuntes, PDFs y videos en flashcards, quizzes, exámenes, podcasts y más. Tu tutor personal con IA que se adapta a tu forma de aprender.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register">
              <Button size="lg" className="text-base px-8">
                Comenzar a estudiar <ArrowRight size={18} className="ml-2" />
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="secondary" size="lg" className="text-base px-8">
                Ya tengo cuenta
              </Button>
            </Link>
          </div>
          <p className="text-sm text-gray-400 mt-4">Gratis • Sin tarjeta de crédito • Acceso inmediato</p>
        </div>

        {/* Hero visual */}
        <div className="max-w-4xl mx-auto mt-16 relative">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 sm:p-8">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { icon: Brain, label: 'Flashcards', color: 'from-orange-400 to-orange-500' },
                { icon: FileText, label: 'Quiz', color: 'from-violet-400 to-violet-500' },
                { icon: MessageSquare, label: 'Tutor IA', color: 'from-blue-400 to-blue-500' },
                { icon: Headphones, label: 'Podcast', color: 'from-green-400 to-green-500' },
              ].map((item, i) => (
                <div key={i} className="flex flex-col items-center p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition group">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                    <item.icon size={22} className="text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="absolute -top-4 -right-4 w-24 h-24 bg-orange-200/30 rounded-full blur-2xl" />
          <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-violet-200/30 rounded-full blur-2xl" />
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="py-20 px-4 sm:px-6 lg:px-8 bg-white/50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">¿Cómo funciona?</h2>
          <p className="text-center text-gray-600 mb-12 max-w-xl mx-auto">Tres simples pasos para transformar tu material en herramientas de estudio efectivas.</p>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '1', title: 'Sube tu material', desc: 'PDFs, apuntes, videos de YouTube, audio o texto. Arrastra y suelta o pega directamente.', icon: Layers },
              { step: '2', title: 'Elige tu método', desc: 'Flashcards, quizzes, exámenes, podcasts, notas inteligentes o tutoría IA. Tú decides.', icon: Target },
              { step: '3', title: 'Estudia y domina', desc: 'Practica con feedback inmediato, seguimiento de progreso y repetición espaciada.', icon: CheckCircle },
            ].map((item, i) => (
              <div key={i} className="relative bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center text-white font-bold text-sm mb-4">{item.step}</div>
                <item.icon size={24} className="text-violet-500 mb-3" />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">Todo lo que necesitas para estudiar mejor</h2>
          <p className="text-center text-gray-600 mb-12 max-w-xl mx-auto">Herramientas inteligentes que se adaptan a tu estilo de aprendizaje.</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Brain, title: 'Flashcards inteligentes', desc: 'Tarjetas con repetición espaciada que se adaptan a tu nivel de dominio.' },
              { icon: FileText, title: 'Quizzes adaptativos', desc: 'Preguntas generadas por IA con explicaciones detalladas.' },
              { icon: MessageSquare, title: 'Tutor IA 24/7', desc: 'Pregunta lo que quieras sobre tu material y obtén respuestas claras.' },
              { icon: Headphones, title: 'Podcasts de estudio', desc: 'Convierte tus apuntes en audio para estudiar mientras caminas.' },
              { icon: BookOpen, title: 'Exámenes escritos', desc: 'Practica respuestas abiertas con evaluación automática.' },
              { icon: Sparkles, title: 'Notas inteligentes', desc: 'Resúmenes, conceptos clave y definiciones generados automáticamente.' },
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-orange-200 hover:shadow-md transition group">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-orange-100 to-violet-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <item.icon size={20} className="text-orange-600" />
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Methods section */}
      <section id="methods" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-orange-50 to-violet-50">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Sube una vez, estudia de muchas formas</h2>
          <p className="text-gray-600 mb-12 max-w-xl mx-auto">Un solo material, múltiples métodos de aprendizaje. Elige el que mejor funcione para ti.</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-4">
            {['Flashcards', 'Quiz', 'Examen', 'Completar', 'Notas', 'Podcast', 'Tutor'].map((m, i) => (
              <div key={i} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-1 transition-all">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-400 to-violet-400 flex items-center justify-center mx-auto mb-2">
                  <span className="text-white font-bold text-xs">{m[0]}</span>
                </div>
                <span className="text-xs font-medium text-gray-700">{m}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center bg-gradient-to-br from-orange-500 to-violet-600 rounded-3xl p-10 sm:p-14 shadow-2xl">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Empieza a estudiar más inteligente hoy</h2>
          <p className="text-white/80 mb-8 text-lg">Únete a miles de estudiantes que ya aprenden mejor con KallpaLearn AI.</p>
          <Link to="/register">
            <button className="px-8 py-3.5 bg-white text-orange-600 font-semibold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all text-base">
              Crear cuenta gratis
            </button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
              <Zap size={14} className="text-white" />
            </div>
            <span className="font-bold text-gray-700">KallpaLearn AI</span>
          </div>
          <p className="text-sm text-gray-500">© 2024 KallpaLearn AI. Todos los derechos reservados.</p>
          <div className="flex gap-4 text-sm text-gray-500">
            <a href="#" className="hover:text-orange-600 transition">Privacidad</a>
            <a href="#" className="hover:text-orange-600 transition">Términos</a>
            <a href="#" className="hover:text-orange-600 transition">Contacto</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
