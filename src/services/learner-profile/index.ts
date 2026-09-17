/**
 * Learner Profile Service
 * Gestiona el perfil de aprendizaje personalizado del estudiante
 * Aprende de las interacciones y preferencias del usuario
 */

import { LearnerProfile, QuestionAttempt, TopicMastery, RecentActivity } from '../../types';
import { authRepository } from '../storage';

export class LearnerProfileService {
  private readonly STORAGE_KEY = 'kl_learner_profiles';
  private readonly ATTEMPTS_KEY = 'kl_question_attempts';
  private readonly MASTERY_KEY = 'kl_topic_mastery';

  /**
   * Obtener perfil del usuario actual
   */
  getProfile(userId?: string): LearnerProfile {
    const currentUserId = userId || authRepository.getUser()?.id;
    if (!currentUserId) {
      return this.createDefaultProfile('anonymous');
    }

    const profiles = this.getAllProfiles();
    const profile = profiles.find(p => p.userId === currentUserId);
    
    if (!profile) {
      const newProfile = this.createDefaultProfile(currentUserId);
      this.saveProfile(newProfile);
      return newProfile;
    }

    return profile;
  }

  /**
   * Guardar perfil del usuario
   */
  saveProfile(profile: LearnerProfile): void {
    const profiles = this.getAllProfiles();
    const existingIndex = profiles.findIndex(p => p.userId === profile.userId);
    
    if (existingIndex >= 0) {
      profiles[existingIndex] = profile;
    } else {
      profiles.push(profile);
    }

    this.setAllProfiles(profiles);
  }

  /**
   * Actualizar preferencias del perfil
   */
  updatePreferences(
    userId: string,
    updates: Partial<Pick<LearnerProfile, 
      'preferredExplanationStyle' | 'difficultyPreference' | 'preferredLanguage' | 'studyLevel'
    >>
  ): void {
    const profile = this.getProfile(userId);
    const updated = {
      ...profile,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.saveProfile(updated);
  }

  /**
   * Registrar actividad de estudio
   */
  recordActivity(
    userId: string,
    studySetId: string,
    topic: string,
    action: 'studied' | 'quiz' | 'reviewed',
    score?: number
  ): void {
    const profile = this.getProfile(userId);
    const activity: RecentActivity = {
      studySetId,
      topic,
      action,
      score,
      timestamp: new Date().toISOString()
    };

    // Mantener solo las últimas 50 actividades
    const recentActivity = [activity, ...profile.recentStudyActivity].slice(0, 50);
    
    const updated = {
      ...profile,
      recentStudyActivity: recentActivity,
      updatedAt: new Date().toISOString()
    };
    this.saveProfile(updated);
  }

  /**
   * Registrar intento de pregunta
   */
  recordQuestionAttempt(attempt: Omit<QuestionAttempt, 'id' | 'timestamp'>): void {
    const attempts = this.getAllAttempts();
    const newAttempt: QuestionAttempt = {
      ...attempt,
      id: `attempt_${Date.now()}_${Math.random()}`,
      timestamp: new Date().toISOString()
    };
    attempts.push(newAttempt);
    this.setAllAttempts(attempts);

    // Actualizar dominio del tema
    this.updateTopicMastery(attempt);
  }

  /**
   * Actualizar dominio de un tema basado en los intentos
   */
  private updateTopicMastery(attempt: Omit<QuestionAttempt, 'id' | 'timestamp'>): void {
    const mastery = this.getAllMastery();
    const existingIndex = mastery.findIndex(
      m => m.topic === attempt.questionId && m.studySetId === attempt.studySetId
    );

    let topicMastery: TopicMastery;
    
    if (existingIndex >= 0) {
      topicMastery = mastery[existingIndex];
      topicMastery.attempts += 1;
      if (attempt.correct) {
        topicMastery.correct += 1;
      } else {
        topicMastery.incorrect += 1;
      }
      topicMastery.lastAttempt = new Date().toISOString();
    } else {
      topicMastery = {
        topic: attempt.questionId,
        studySetId: attempt.studySetId,
        attempts: 1,
        correct: attempt.correct ? 1 : 0,
        incorrect: attempt.correct ? 0 : 1,
        masteryLevel: 'unfamiliar',
        lastAttempt: new Date().toISOString()
      };
    }

    // Calcular nivel de dominio
    const successRate = topicMastery.correct / topicMastery.attempts;
    if (topicMastery.attempts >= 5 && successRate >= 0.9) {
      topicMastery.masteryLevel = 'mastered';
    } else if (topicMastery.attempts >= 3 && successRate >= 0.7) {
      topicMastery.masteryLevel = 'familiar';
    } else if (topicMastery.attempts >= 1 && successRate >= 0.5) {
      topicMastery.masteryLevel = 'learning';
    } else {
      topicMastery.masteryLevel = 'unfamiliar';
    }

    if (existingIndex >= 0) {
      mastery[existingIndex] = topicMastery;
    } else {
      mastery.push(topicMastery);
    }

    this.setAllMastery(mastery);

    // Actualizar weak/strong topics en el perfil
    this.updateWeakStrongTopics(attempt.userId);
  }

  /**
   * Actualizar temas débiles y fuertes del perfil
   */
  private updateWeakStrongTopics(userId: string): void {
    const mastery = this.getAllMastery().filter(m => {
      const chunks = this.getUserStudySets(userId);
      return chunks.includes(m.studySetId);
    });

    const weakTopics: string[] = [];
    const strongTopics: string[] = [];

    for (const m of mastery) {
      if (m.masteryLevel === 'unfamiliar' || m.masteryLevel === 'learning') {
        if (!weakTopics.includes(m.topic)) {
          weakTopics.push(m.topic);
        }
      } else if (m.masteryLevel === 'mastered' || m.masteryLevel === 'familiar') {
        if (!strongTopics.includes(m.topic)) {
          strongTopics.push(m.topic);
        }
      }
    }

    const profile = this.getProfile(userId);
    const updated = {
      ...profile,
      weakTopics: weakTopics.slice(0, 10), // Máximo 10 temas débiles
      strongTopics: strongTopics.slice(0, 10), // Máximo 10 temas fuertes
      updatedAt: new Date().toISOString()
    };
    this.saveProfile(updated);
  }

  /**
   * Obtener Study Sets del usuario
   */
  private getUserStudySets(userId: string): string[] {
    // En producción, esto vendría de la base de datos
    // Por ahora, retornar array vacío (se implementará con la integración completa)
    return [];
  }

  /**
   * Obtener intentos de preguntas del usuario
   */
  getUserAttempts(userId?: string): QuestionAttempt[] {
    const currentUserId = userId || authRepository.getUser()?.id;
    if (!currentUserId) return [];

    const attempts = this.getAllAttempts();
    return attempts.filter(a => a.userId === currentUserId);
  }

  /**
   * Obtener dominio de temas del usuario
   */
  getUserMastery(userId?: string): TopicMastery[] {
    const currentUserId = userId || authRepository.getUser()?.id;
    if (!currentUserId) return [];

    const mastery = this.getAllMastery();
    const userStudySets = this.getUserStudySets(currentUserId);
    return mastery.filter(m => userStudySets.includes(m.studySetId));
  }

  /**
   * Detectar preferencias basadas en interacciones
   */
  detectPreferences(userId: string): void {
    const profile = this.getProfile(userId);
    const attempts = this.getUserAttempts(userId);
    
    // Si el usuario pide "explícamelo más fácil" frecuentemente
    // (esto se detectaría del historial de chat, pero por ahora es un placeholder)
    
    // Si falla muchas preguntas de un tema específico
    const failedByTopic: Record<string, number> = {};
    for (const attempt of attempts.filter(a => !a.correct)) {
      failedByTopic[attempt.questionId] = (failedByTopic[attempt.questionId] || 0) + 1;
    }

    const commonMistakes = Object.entries(failedByTopic)
      .filter(([_, count]) => count >= 3)
      .map(([topic, _]) => topic)
      .slice(0, 5);

    if (commonMistakes.length > 0) {
      const updated = {
        ...profile,
        commonMistakes,
        updatedAt: new Date().toISOString()
      };
      this.saveProfile(updated);
    }
  }

  /**
   * Eliminar perfil del usuario
   */
  deleteProfile(userId?: string): void {
    const currentUserId = userId || authRepository.getUser()?.id;
    if (!currentUserId) return;

    // Eliminar perfil
    const profiles = this.getAllProfiles();
    const filteredProfiles = profiles.filter(p => p.userId !== currentUserId);
    this.setAllProfiles(filteredProfiles);

    // Eliminar intentos
    const attempts = this.getAllAttempts();
    const filteredAttempts = attempts.filter(a => a.userId !== currentUserId);
    this.setAllAttempts(filteredAttempts);

    // Eliminar mastery
    const mastery = this.getAllMastery();
    const userStudySets = this.getUserStudySets(currentUserId);
    const filteredMastery = mastery.filter(m => !userStudySets.includes(m.studySetId));
    this.setAllMastery(filteredMastery);
  }

  /**
   * Crear perfil por defecto
   */
  private createDefaultProfile(userId: string): LearnerProfile {
    return {
      id: `profile_${userId}`,
      userId,
      preferredLanguage: 'es',
      studyLevel: 'intermediate',
      subjects: [],
      goals: [],
      preferredExplanationStyle: 'detailed',
      difficultyPreference: 'adaptive',
      commonMistakes: [],
      weakTopics: [],
      strongTopics: [],
      recentStudyActivity: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  // Métodos de almacenamiento
  private getAllProfiles(): LearnerProfile[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  private setAllProfiles(profiles: LearnerProfile[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(profiles));
    } catch (error) {
      console.error('Error saving learner profiles:', error);
    }
  }

  private getAllAttempts(): QuestionAttempt[] {
    try {
      const data = localStorage.getItem(this.ATTEMPTS_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  private setAllAttempts(attempts: QuestionAttempt[]): void {
    try {
      localStorage.setItem(this.ATTEMPTS_KEY, JSON.stringify(attempts));
    } catch (error) {
      console.error('Error saving question attempts:', error);
    }
  }

  private getAllMastery(): TopicMastery[] {
    try {
      const data = localStorage.getItem(this.MASTERY_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  private setAllMastery(mastery: TopicMastery[]): void {
    try {
      localStorage.setItem(this.MASTERY_KEY, JSON.stringify(mastery));
    } catch (error) {
      console.error('Error saving topic mastery:', error);
    }
  }
}

export const learnerProfileService = new LearnerProfileService();
