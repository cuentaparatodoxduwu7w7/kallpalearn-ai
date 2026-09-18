import { supabase } from '../../lib/supabase';
import type { User, StudySet, Folder, Flashcard, Quiz, WrittenTest, FillBlank, Note, Podcast, LearnerProfile } from '../../types';

// Auth Service
export const authService = {
  async signUp(email: string, password: string, fullName: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName }
      }
    });
    
    if (error) throw error;
    return data;
  },

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) throw error;
    return data;
  },

  async signInWithGoogle() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    });
    
    if (error) throw error;
    return data;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  },

  async getSession() {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  },

  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
  },

  async resetPassword(email: string) {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    });
    
    if (error) throw error;
    return data;
  },

  async updatePassword(newPassword: string) {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword
    });
    
    if (error) throw error;
    return data;
  }
};

// Profiles Service
export const profilesService = {
  async getProfile(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateProfile(userId: string, updates: Partial<User>) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};

// Study Sets Service
export const studySetsService = {
  async getAll(userId: string) {
    const { data, error } = await supabase
      .from('study_sets')
      .select(`
        *,
        folders(id, name)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('study_sets')
      .select(`
        *,
        folders(id, name),
        sources(*),
        flashcards(*),
        quizzes(*),
        written_tests(*),
        fill_blanks(*),
        notes(*),
        podcasts(*)
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async create(studySet: Omit<StudySet, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('study_sets')
      .insert(studySet)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Partial<StudySet>) {
    const { data, error } = await supabase
      .from('study_sets')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('study_sets')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};

// Folders Service
export const foldersService = {
  async getAll(userId: string) {
    const { data, error } = await supabase
      .from('folders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async create(folder: Omit<Folder, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('folders')
      .insert(folder)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Partial<Folder>) {
    const { data, error } = await supabase
      .from('folders')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('folders')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};

// Flashcards Service
export const flashcardsService = {
  async getByStudySetId(studySetId: string) {
    const { data, error } = await supabase
      .from('flashcards')
      .select('*')
      .eq('study_set_id', studySetId)
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  async create(flashcard: Omit<Flashcard, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('flashcards')
      .insert(flashcard)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Partial<Flashcard>) {
    const { data, error } = await supabase
      .from('flashcards')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('flashcards')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};

// Learner Profiles Service
export const learnerProfilesService = {
  async getByUserId(userId: string) {
    const { data, error } = await supabase
      .from('learner_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = not found
    return data;
  },

  async create(profile: Omit<LearnerProfile, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('learner_profiles')
      .insert(profile)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(userId: string, updates: Partial<LearnerProfile>) {
    const { data, error } = await supabase
      .from('learner_profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('user_id', userId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};

// Storage Service
export const storageService = {
  async uploadFile(userId: string, studySetId: string, file: File) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${studySetId}/${Date.now()}.${fileExt}`;
    
    const { data, error } = await supabase.storage
      .from('study-materials')
      .upload(fileName, file);
    
    if (error) throw error;
    return data;
  },

  async getPublicUrl(userId: string, studySetId: string, filePath: string) {
    const { data } = supabase.storage
      .from('study-materials')
      .getPublicUrl(`${userId}/${studySetId}/${filePath}`);
    
    return data.publicUrl;
  },

  async deleteFile(userId: string, studySetId: string, filePath: string) {
    const { error } = await supabase.storage
      .from('study-materials')
      .remove([`${userId}/${studySetId}/${filePath}`]);
    
    if (error) throw error;
  },

  async deleteStudySetFiles(userId: string, studySetId: string) {
    const { data: files, error: listError } = await supabase.storage
      .from('study-materials')
      .list(`${userId}/${studySetId}`);
    
    if (listError) throw listError;
    
    if (files && files.length > 0) {
      const filePaths = files.map((f: any) => `${userId}/${studySetId}/${f.name}`);
      const { error } = await supabase.storage
        .from('study-materials')
        .remove(filePaths);
      
      if (error) throw error;
    }
  }
};
