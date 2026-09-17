import { useState, useRef, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, MessageSquare, Sparkles, Lightbulb, HelpCircle, FileText, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { aiService } from '../services/ai';
import { aiRouter } from '../services/ai/router';
import { Button, EmptyState, Badge } from '../components/UI';
import { TutorMessage } from '../types';
import { v4 as uuid } from 'uuid';

export function TutorPage() {
  const { id } = useParams<{ id: string }>();
  const { sets, saveSet } = useApp();
  const navigate = useNavigate();
  const studySet = sets.find(s => s.id === id);
  const [messages, setMessages] = useState<TutorMessage[]>(studySet?.tutorMessages || []);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!studySet) {
    return <EmptyState icon={MessageSquare} title="Set no encontrado" description="" action={<Link to="/app"><Button>Volver</Button></Link>} />;
  }

  const suggestions = ['Explícalo más simple', 'Dame un ejemplo', 'Hazme una pregunta sobre esto', 'Resume los puntos clave'];

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg: TutorMessage = { id: uuid(), role: 'user', content: text, timestamp: new Date().toISOString() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const response = await aiService.chatWithTutor(studySet.id, newMessages, text);
      const updated = { ...studySet, tutorMessages: [...newMessages, response] };
      saveSet(updated);
      setMessages([...newMessages, response]);
    } catch {
      const errorMsg: TutorMessage = { id: uuid(), role: 'assistant', content: 'Hubo un error al procesar tu mensaje. Intenta de nuevo.', timestamp: new Date().toISOString() };
      setMessages([...newMessages, errorMsg]);
    }
    setLoading(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <div className="max-w-2xl mx-auto flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4 shrink-0">
        <button onClick={() => navigate(`/app/set/${id}`)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"><ArrowLeft size={18} /></button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-gray-800 flex items-center gap-2"><Sparkles size={16} className="text-orange-500" />Tutor IA</h1>
            {aiRouter.isDemoMode() && <Badge color="orange">Demo</Badge>}
          </div>
          <p className="text-xs text-gray-500">{studySet.title}</p>
        </div>
      </div>

      {/* Demo mode notice */}
      {aiRouter.isDemoMode() && messages.length <= 1 && (
        <div className="mb-4 p-3 rounded-xl bg-orange-50 border border-orange-200 flex items-start gap-2 shrink-0">
          <AlertCircle size={14} className="text-orange-600 shrink-0 mt-0.5" />
          <p className="text-xs text-orange-700">
            <strong>Modo demostración:</strong> Las respuestas son predefinidas. Conecta un proveedor de IA para respuestas personalizadas basadas en tu material.
          </p>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pb-4">
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${msg.role === 'user' ? 'bg-orange-500 text-white' : 'bg-white border border-gray-100 text-gray-700 shadow-sm'}`}>
              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              {msg.suggestions && msg.role === 'assistant' && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {msg.suggestions.map((s, i) => (
                    <button key={i} onClick={() => sendMessage(s)} className="text-xs px-2.5 py-1 rounded-full bg-orange-50 text-orange-600 hover:bg-orange-100 transition">{s}</button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-100 rounded-2xl px-4 py-3 shadow-sm">
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick actions */}
      <div className="flex gap-2 mb-3 overflow-x-auto pb-1 shrink-0">
        {[
          { icon: Lightbulb, label: 'Explica más fácil', msg: '¿Puedes explicarme el último tema de forma más simple?' },
          { icon: HelpCircle, label: 'Hazme una pregunta', msg: 'Hazme una pregunta sobre el material para probar mi conocimiento.' },
          { icon: FileText, label: 'Resume esto', msg: 'Haz un resumen de los puntos más importantes del material.' },
        ].map((action, i) => (
          <button key={i} onClick={() => sendMessage(action.msg)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 hover:border-orange-200 transition whitespace-nowrap shrink-0">
            <action.icon size={12} />{action.label}
          </button>
        ))}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="flex gap-2 shrink-0">
        <input type="text" value={input} onChange={e => setInput(e.target.value)} placeholder="Pregunta lo que quieras..." className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none text-sm" disabled={loading} />
        <Button type="submit" disabled={!input.trim() || loading}><Send size={16} /></Button>
      </form>
    </div>
  );
}
