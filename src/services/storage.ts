import { User, StudySet, Folder, StudySession } from '../types';

const KEYS = {
  USER: 'kl_user',
  SETS: 'kl_sets',
  FOLDERS: 'kl_folders',
  SESSIONS: 'kl_sessions',
  AUTH: 'kl_auth',
};

function get<T>(key: string, fallback: T): T {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch {
    return fallback;
  }
}

function set<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

// Auth Repository
export const authRepository = {
  getUser: (): User | null => get<User | null>(KEYS.USER, null),
  setUser: (user: User) => set(KEYS.USER, user),
  clearUser: () => { localStorage.removeItem(KEYS.USER); localStorage.removeItem(KEYS.AUTH); },
  isAuthenticated: (): boolean => !!localStorage.getItem(KEYS.AUTH),
  setAuth: (v: boolean) => v ? localStorage.setItem(KEYS.AUTH, '1') : localStorage.removeItem(KEYS.AUTH),
};

// Study Sets Repository
export const setsRepository = {
  getAll: (userId?: string): StudySet[] => {
    const sets = get<StudySet[]>(KEYS.SETS, []);
    return userId ? sets.filter(s => s.userId === userId) : sets;
  },
  getById: (id: string): StudySet | undefined => {
    const sets = get<StudySet[]>(KEYS.SETS, []);
    return sets.find(s => s.id === id);
  },
  save: (studySet: StudySet) => {
    const sets = get<StudySet[]>(KEYS.SETS, []);
    const idx = sets.findIndex(s => s.id === studySet.id);
    if (idx >= 0) sets[idx] = studySet;
    else sets.push(studySet);
    set(KEYS.SETS, sets);
  },
  delete: (id: string) => {
    const sets = get<StudySet[]>(KEYS.SETS, []).filter(s => s.id !== id);
    set(KEYS.SETS, sets);
  },
};

// Folders Repository
export const foldersRepository = {
  getAll: (userId?: string): Folder[] => {
    const folders = get<Folder[]>(KEYS.FOLDERS, []);
    return userId ? folders.filter(f => f.userId === userId) : folders;
  },
  save: (folder: Folder) => {
    const folders = get<Folder[]>(KEYS.FOLDERS, []);
    const idx = folders.findIndex(f => f.id === folder.id);
    if (idx >= 0) folders[idx] = folder;
    else folders.push(folder);
    set(KEYS.FOLDERS, folders);
  },
  delete: (id: string) => {
    const folders = get<Folder[]>(KEYS.FOLDERS, []).filter(f => f.id !== id);
    set(KEYS.FOLDERS, folders);
  },
};

// Sessions Repository
export const sessionsRepository = {
  getAll: (userId?: string): StudySession[] => {
    const sessions = get<StudySession[]>(KEYS.SESSIONS, []);
    return userId ? sessions.filter(s => s.userId === userId) : sessions;
  },
  save: (session: StudySession) => {
    const sessions = get<StudySession[]>(KEYS.SESSIONS, []);
    sessions.push(session);
    set(KEYS.SESSIONS, sessions);
  },
};
