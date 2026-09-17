import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Globe, Clock, Bell, Shield, LogOut, Camera, Cpu, Zap } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Button, Input, Badge } from '../components/UI';
import { aiRouter } from '../services/ai/router';
import { configService } from '../services/config';

export function SettingsPage() {
  const { user, logout, addToast } = useApp();
  const navigate = useNavigate();
  const [name, setName] = useState(user?.name || '');
  const [language, setLanguage] = useState(user?.preferences.language || 'es');
  const [timezone, setTimezone] = useState(user?.preferences.timezone || 'America/Lima');
  const [notifications, setNotifications] = useState(user?.preferences.notifications ?? true);
  const [studyReminders, setStudyReminders] = useState(user?.preferences.studyReminders ?? true);

  const handleSave = () => {
    addToast('success', 'Configuración guardada');
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Configuración</h1>

      {/* Profile */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2"><User size={16} className="text-orange-500" />Perfil</h2>
        <div className="flex items-center gap-4 mb-5">
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-400 to-violet-400 flex items-center justify-center text-white text-xl font-bold">
              {user?.name?.[0] || 'U'}
            </div>
            <button className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-sm hover:bg-gray-50">
              <Camera size={12} className="text-gray-500" />
            </button>
          </div>
          <div>
            <p className="font-medium text-gray-800">{user?.name}</p>
            <p className="text-sm text-gray-500">{user?.email}</p>
          </div>
        </div>
        <Input label="Nombre" value={name} onChange={e => setName(e.target.value)} />
      </div>

      {/* Preferences */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2"><Globe size={16} className="text-violet-500" />Preferencias</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Idioma</label>
            <select value={language} onChange={e => setLanguage(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none text-sm">
              <option value="es">Español</option>
              <option value="en">English</option>
              <option value="pt">Português</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Zona horaria</label>
            <select value={timezone} onChange={e => setTimezone(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none text-sm">
              <option value="America/Lima">América/Lima (UTC-5)</option>
              <option value="America/Bogota">América/Bogotá (UTC-5)</option>
              <option value="America/Mexico_City">América/CDMX (UTC-6)</option>
              <option value="America/Buenos_Aires">América/Buenos Aires (UTC-3)</option>
              <option value="Europe/Madrid">Europa/Madrid (UTC+1)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2"><Bell size={16} className="text-blue-500" />Notificaciones</h2>
        <div className="space-y-4">
          <label className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">Notificaciones generales</p>
              <p className="text-xs text-gray-400">Recibe actualizaciones sobre tu progreso</p>
            </div>
            <input type="checkbox" checked={notifications} onChange={e => setNotifications(e.target.checked)} className="w-5 h-5 rounded border-gray-300 text-orange-500 focus:ring-orange-400" />
          </label>
          <label className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">Recordatorios de estudio</p>
              <p className="text-xs text-gray-400">Te recordamos estudiar cada día</p>
            </div>
            <input type="checkbox" checked={studyReminders} onChange={e => setStudyReminders(e.target.checked)} className="w-5 h-5 rounded border-gray-300 text-orange-500 focus:ring-orange-400" />
          </label>
        </div>
      </div>

      {/* Privacy */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2"><Shield size={16} className="text-green-500" />Privacidad</h2>
        <p className="text-sm text-gray-600 mb-3">Tu información personal está segura. No compartimos tus datos con terceros.</p>
        <p className="text-xs text-gray-400">Los datos se almacenan localmente en tu navegador hasta que conectemos el backend seguro.</p>
      </div>

      {/* AI Configuration */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2"><Cpu size={16} className="text-violet-500" />Configuración de IA</h2>
        
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Proveedor de IA</span>
              <Badge color={aiRouter.isDemoMode() ? 'orange' : 'green'}>
                {aiRouter.isDemoMode() ? 'Demo' : 'Activo'}
              </Badge>
            </div>
            <p className="text-xs text-gray-500">
              {aiRouter.isDemoMode() 
                ? 'Usando contenido de demostración. Conecta un proveedor de IA en el backend para procesamiento real.'
                : 'Proveedor de IA configurado y activo.'}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Embeddings</span>
              <Badge color={configService.getConfig().embeddings.enabled ? 'green' : 'gray'}>
                {configService.getConfig().embeddings.enabled ? 'Habilitado' : 'Deshabilitado'}
              </Badge>
            </div>
            <p className="text-xs text-gray-500">
              {configService.getConfig().embeddings.enabled
                ? 'Generación de embeddings activa para búsqueda semántica.'
                : 'Embeddings deshabilitados.'}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-orange-50 border border-orange-100">
            <div className="flex items-start gap-2">
              <Zap size={16} className="text-orange-600 shrink-0 mt-0.5" />
              <div className="text-xs text-orange-700">
                <strong>Nota de seguridad:</strong> Las API keys se manejan en el backend, nunca en el frontend. 
                Para configurar proveedores de IA, edita las variables de entorno en el servidor.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button onClick={handleSave} className="flex-1">Guardar cambios</Button>
        <Button variant="danger" onClick={handleLogout}><LogOut size={14} className="mr-2" />Cerrar sesión</Button>
      </div>
    </div>
  );
}
