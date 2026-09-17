import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, StudySet, Folder, Toast, StudySession } from '../types';
import { authRepository, setsRepository, foldersRepository, sessionsRepository } from '../services/storage';
import { initializeDemoData } from '../data/demo';

interface AppContextType {
  user: User | null;
  sets: StudySet[];
  folders: Folder[];
  sessions: StudySession[];
  toasts: Toast[];
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
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

  const refreshData = useCallback(() => {
    setSets(setsRepository.getAll());
    setFolders(foldersRepository.getAll());
    setSessions(sessionsRepository.getAll());
  }, []);

  useEffect(() => {
    initializeDemoData();
    const u = authRepository.getUser();
    setUser(u);
    setIsAuthenticated(authRepository.isAuthenticated());
    refreshData();
    setIsLoading(false);
  }, [refreshData]);

  const login = async (_email: string, _password: string): Promise<boolean> => {
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 800));
    const u = authRepository.getUser();
    if (u) {
      setUser(u);
      setIsAuthenticated(true);
      authRepository.setAuth(true);
      setIsLoading(false);
      return true;
    }
    setIsLoading(false);
    return false;
  };

  const register = async (name: string, email: string, _password: string): Promise<boolean> => {
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 800));
    const newUser: User = {
      id: crypto.randomUUID?.() || Date.now().toString(),
      name,
      email,
      preferences: { language: 'es', timezone: 'America/Lima', notifications: true, studyReminders: true, theme: 'light' },
      createdAt: new Date().toISOString(),
    };
    authRepository.setUser(newUser);
    authRepository.setAuth(true);
    setUser(newUser);
    setIsAuthenticated(true);
    setIsLoading(false);
    return true;
  };

  const logout = () => {
    authRepository.clearUser();
    setUser(null);
    setIsAuthenticated(false);
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
    <AppContext.Provider value={{ user, sets, folders, sessions, toasts, isLoading, isAuthenticated, login, register, logout, saveSet, deleteSet, saveFolder, deleteFolder, addSession, addToast, removeToast, refreshData }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
