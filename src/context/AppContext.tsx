import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, StudySet, Folder, Toast, StudySession } from '../types';
import { authRepository, setsRepository, foldersRepository, sessionsRepository } from '../services/storage';
import { initializeDemoData } from '../data/demo';
import { authService } from '../services/supabase';
import { supabase } from '../lib/supabase';

interface AppContextType {
  user: User | null;
  sets: StudySet[];
  folders: Folder[];
  sessions: StudySession[];
  toasts: Toast[];
  isLoading: boolean;
  isAuthenticated: boolean;
  authError: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  saveSet: (set: StudySet) => void;
  deleteSet: (id: string) => void;
  saveFolder: (folder: Folder) => void;
  deleteFolder: (id: string) => void;
  addSession: (session: StudySession) => void;
  addToast: (type: Toast['type'], message: string) => void;
  removeToast: (id: string) => void;
  refreshData: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [sets, setSets] = useState<StudySet[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const refreshData = useCallback(() => {
    setSets(setsRepository.getAll());
    setFolders(foldersRepository.getAll());
    setSessions(sessionsRepository.getAll());
  }, []);

  // Inicializar datos demo y escuchar cambios de autenticación
  useEffect(() => {
    initializeDemoData();
    
    // Verificar sesión actual
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          // Usuario autenticado con Supabase
          const supabaseUser: User = {
            id: session.user.id,
            name: session.user.user_metadata?.full_name || session.user.email || 'Usuario',
            email: session.user.email || '',
            preferences: {
              language: 'es',
              timezone: 'America/Lima',
              notifications: true,
              studyReminders: true,
              theme: 'light'
            },
            createdAt: session.user.created_at || new Date().toISOString()
          };
          setUser(supabaseUser);
          setIsAuthenticated(true);
          authRepository.setUser(supabaseUser);
          authRepository.setAuth(true);
        } else {
          // No hay sesión de Supabase, usar datos demo
          const demoUser = authRepository.getUser();
          if (demoUser) {
            setUser(demoUser);
            setIsAuthenticated(true);
          }
        }
        
        refreshData();
        setIsLoading(false);
      } catch (error) {
        console.error('Error checking session:', error);
        // Fallback a modo demo
        const demoUser = authRepository.getUser();
        if (demoUser) {
          setUser(demoUser);
          setIsAuthenticated(true);
        }
        setIsLoading(false);
      }
    };

    checkSession();

    // Escuchar cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const supabaseUser: User = {
            id: session.user.id,
            name: session.user.user_metadata?.full_name || session.user.email || 'Usuario',
            email: session.user.email || '',
            preferences: {
              language: 'es',
              timezone: 'America/Lima',
              notifications: true,
              studyReminders: true,
              theme: 'light'
            },
            createdAt: session.user.created_at || new Date().toISOString()
          };
          setUser(supabaseUser);
          setIsAuthenticated(true);
          setAuthError(null);
          authRepository.setUser(supabaseUser);
          authRepository.setAuth(true);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setIsAuthenticated(false);
          authRepository.clearUser();
        } else if (event === 'TOKEN_REFRESHED') {
          // Token renovado exitosamente
          if (session?.user) {
            const supabaseUser: User = {
              id: session.user.id,
              name: session.user.user_metadata?.full_name || session.user.email || 'Usuario',
              email: session.user.email || '',
              preferences: {
                language: 'es',
                timezone: 'America/Lima',
                notifications: true,
                studyReminders: true,
                theme: 'light'
              },
              createdAt: session.user.created_at || new Date().toISOString()
            };
            setUser(supabaseUser);
            authRepository.setUser(supabaseUser);
          }
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [refreshData]);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setAuthError(null);
    
    try {
      // Intentar login con Supabase
      await authService.signIn(email, password);
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error('Supabase login failed, trying demo mode:', error);
      
      // Fallback a modo demo
      await new Promise(r => setTimeout(r, 800));
      const u = authRepository.getUser();
      if (u) {
        setUser(u);
        setIsAuthenticated(true);
        authRepository.setAuth(true);
        setIsLoading(false);
        return true;
      }
      
      setAuthError('Credenciales inválidas. Intenta de nuevo.');
      setIsLoading(false);
      return false;
    }
  };

  const loginWithGoogle = async () => {
    setIsLoading(true);
    setAuthError(null);
    
    try {
      await authService.signInWithGoogle();
    } catch (error) {
      console.error('Google login error:', error);
      setAuthError('Error al iniciar sesión con Google');
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setAuthError(null);
    
    try {
      // Intentar registro con Supabase
      await authService.signUp(email, password, name);
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error('Supabase register failed, trying demo mode:', error);
      
      // Fallback a modo demo
      await new Promise(r => setTimeout(r, 800));
      const newUser: User = {
        id: crypto.randomUUID?.() || Date.now().toString(),
        name,
        email,
        preferences: {
          language: 'es',
          timezone: 'America/Lima',
          notifications: true,
          studyReminders: true,
          theme: 'light'
        },
        createdAt: new Date().toISOString()
      };
      authRepository.setUser(newUser);
      authRepository.setAuth(true);
      setUser(newUser);
      setIsAuthenticated(true);
      setIsLoading(false);
      return true;
    }
  };

  const logout = async () => {
    setIsLoading(true);
    
    try {
      await authService.signOut();
    } catch (error) {
      console.error('Supabase logout error:', error);
    }
    
    // Limpiar datos locales
    authRepository.clearUser();
    setUser(null);
    setIsAuthenticated(false);
    setIsLoading(false);
  };

  const saveSet = (studySet: StudySet) => {
    setsRepository.save(studySet);
    refreshData();
  };

  const deleteSet = (id: string) => {
    setsRepository.delete(id);
    refreshData();
  };

  const saveFolder = (folder: Folder) => {
    foldersRepository.save(folder);
    refreshData();
  };

  const deleteFolder = (id: string) => {
    foldersRepository.delete(id);
    refreshData();
  };

  const addSession = (session: StudySession) => {
    sessionsRepository.save(session);
    refreshData();
  };

  const addToast = (type: Toast['type'], message: string) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <AppContext.Provider value={{
      user,
      sets,
      folders,
      sessions,
      toasts,
      isLoading,
      isAuthenticated,
      authError,
      login,
      loginWithGoogle,
      register,
      logout,
      saveSet,
      deleteSet,
      saveFolder,
      deleteFolder,
      addSession,
      addToast,
      removeToast,
      refreshData
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
