import { Idea, SessionRecord, IdeaStatus, DomainKey } from './types';
import { INITIAL_IDEAS } from './initialData';

const IDEAS_STORAGE_KEY = 'black_hole_ideas_vault_v2';
const SESSIONS_STORAGE_KEY = 'black_hole_sessions_v2';
const LANGUAGE_STORAGE_KEY = 'black_hole_lang_v2';

// In-memory cache fallback for environments without localStorage or server-side
let memoryIdeas: Idea[] = [...INITIAL_IDEAS];
let memorySessions: SessionRecord[] = [
  {
    id: 'session-demo-1',
    topic: 'تعليم بالذكاء الاصطناعي',
    domain: 'edtech',
    boldness: 'bold',
    ideas_count: 3,
    created_at: '2026-10-23T10:15:00.000Z',
    idea_ids: ['idea-101'],
  },
  {
    id: 'session-demo-2',
    topic: 'حلول الاستدامة والمشتريات للمطاعم',
    domain: 'business',
    boldness: 'bold',
    ideas_count: 2,
    created_at: '2026-10-23T09:30:00.000Z',
    idea_ids: ['idea-102'],
  },
  {
    id: 'session-demo-3',
    topic: 'أدوات المستقلين العرب',
    domain: 'tech',
    boldness: 'realistic',
    ideas_count: 2,
    created_at: '2026-10-23T08:00:00.000Z',
    idea_ids: ['idea-103'],
  },
];

function isStorageAvailable(): boolean {
  try {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
  } catch {
    return false;
  }
}

export function getStoredIdeas(): Idea[] {
  if (!isStorageAvailable()) return memoryIdeas;
  try {
    const raw = window.localStorage.getItem(IDEAS_STORAGE_KEY);
    if (!raw) {
      window.localStorage.setItem(IDEAS_STORAGE_KEY, JSON.stringify(INITIAL_IDEAS));
      return [...INITIAL_IDEAS];
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      memoryIdeas = parsed;
      return parsed;
    }
    window.localStorage.setItem(IDEAS_STORAGE_KEY, JSON.stringify(INITIAL_IDEAS));
    return [...INITIAL_IDEAS];
  } catch (e) {
    console.error('Error reading ideas from localStorage', e);
    return memoryIdeas;
  }
}

export function persistIdeas(ideas: Idea[]): void {
  memoryIdeas = ideas;
  if (!isStorageAvailable()) return;
  try {
    window.localStorage.setItem(IDEAS_STORAGE_KEY, JSON.stringify(ideas));
  } catch (e) {
    console.error('Error writing ideas to localStorage', e);
  }
}

export function getIdeaById(id: string): Idea | undefined {
  const ideas = getStoredIdeas();
  return ideas.find((i) => i.id === id);
}

export function saveIdea(idea: Idea): Idea {
  const ideas = getStoredIdeas();
  const existingIdx = ideas.findIndex((i) => i.id === idea.id);
  let updatedList: Idea[];
  if (existingIdx >= 0) {
    updatedList = [...ideas];
    updatedList[existingIdx] = { ...idea, updated_at: new Date().toISOString() };
  } else {
    updatedList = [idea, ...ideas];
  }
  persistIdeas(updatedList);
  return idea;
}

export function saveMultipleIdeas(newIdeas: Idea[]): void {
  const current = getStoredIdeas();
  const existingIds = new Set(current.map((i) => i.id));
  const toAdd = newIdeas.filter((i) => !existingIds.has(i.id));
  const merged = [...toAdd, ...current];
  persistIdeas(merged);
}

export function updateIdea(id: string, updates: Partial<Idea>): Idea | null {
  const ideas = getStoredIdeas();
  const index = ideas.findIndex((i) => i.id === id);
  if (index === -1) return null;
  const updated: Idea = {
    ...ideas[index],
    ...updates,
    updated_at: new Date().toISOString(),
  };
  ideas[index] = updated;
  persistIdeas(ideas);
  return updated;
}

export function deleteIdea(id: string): boolean {
  const ideas = getStoredIdeas();
  const filtered = ideas.filter((i) => i.id !== id);
  if (filtered.length === ideas.length) return false;
  persistIdeas(filtered);
  return true;
}

export function toggleStarIdea(id: string): boolean {
  const ideas = getStoredIdeas();
  const idea = ideas.find((i) => i.id === id);
  if (!idea) return false;
  idea.starred = !idea.starred;
  idea.updated_at = new Date().toISOString();
  persistIdeas(ideas);
  return idea.starred;
}

export function updateIdeaStatus(id: string, status: IdeaStatus): boolean {
  const ideas = getStoredIdeas();
  const idea = ideas.find((i) => i.id === id);
  if (!idea) return false;
  idea.status = status;
  idea.updated_at = new Date().toISOString();
  persistIdeas(ideas);
  return true;
}

export function getStoredSessions(): SessionRecord[] {
  if (!isStorageAvailable()) return memorySessions;
  try {
    const raw = window.localStorage.getItem(SESSIONS_STORAGE_KEY);
    if (!raw) {
      window.localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(memorySessions));
      return memorySessions;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      memorySessions = parsed;
      return parsed;
    }
    return memorySessions;
  } catch {
    return memorySessions;
  }
}

export function saveSession(session: SessionRecord): void {
  const current = getStoredSessions();
  const updated = [session, ...current.filter((s) => s.id !== session.id)];
  memorySessions = updated;
  if (!isStorageAvailable()) return;
  try {
    window.localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Error saving session', e);
  }
}

export function deleteSession(id: string): boolean {
  const sessions = getStoredSessions();
  const updated = sessions.filter((s) => s.id !== id);
  memorySessions = updated;
  if (!isStorageAvailable()) return true;
  try {
    window.localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(updated));
    return true;
  } catch {
    return false;
  }
}

export function getStoredLanguage(): 'ar' | 'en' {
  if (!isStorageAvailable()) return 'ar';
  try {
    const lang = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    return lang === 'en' ? 'en' : 'ar';
  } catch {
    return 'ar';
  }
}

export function setStoredLanguage(lang: 'ar' | 'en'): void {
  if (!isStorageAvailable()) return;
  try {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang;
      document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    }
  } catch (e) {
    console.error('Error saving language', e);
  }
}

export function getVaultStats() {
  const ideas = getStoredIdeas();
  const sessions = getStoredSessions();
  const totalIdeas = ideas.length;
  const starredIdeas = ideas.filter((i) => i.starred).length;
  const developedIdeas = ideas.filter((i) => i.status === 'developed' || i.status === 'in_progress').length;
  const totalSessions = sessions.length;

  const domainCounts: Record<DomainKey, number> = {
    tech: 0,
    business: 0,
    sustainability: 0,
    health: 0,
    edtech: 0,
    creator: 0,
    ecommerce: 0,
    social: 0,
  };

  ideas.forEach((i) => {
    if (domainCounts[i.domain] !== undefined) {
      domainCounts[i.domain]++;
    }
  });

  return {
    totalIdeas,
    starredIdeas,
    developedIdeas,
    totalSessions,
    domainCounts,
  };
}
