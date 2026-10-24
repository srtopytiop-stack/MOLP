import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getStoredIdeas,
  saveIdea,
  updateIdea,
  deleteIdea,
  toggleStarIdea,
  updateIdeaStatus,
  getVaultStats,
} from './storage';
import { Idea } from './types';

test('storage returns initial ideas by default', () => {
  const ideas = getStoredIdeas();
  assert.ok(Array.isArray(ideas));
  assert.ok(ideas.length >= 5);
});

test('saveIdea adds a new idea and updateIdea modifies it', () => {
  const newIdea: Idea = {
    id: `test-idea-${Date.now()}`,
    title: 'فكرة فحص الوحدة للاختبار',
    description: 'وصف تجريبي دقيق للتحقق من سلامة التخزين',
    why_now: 'ضرورة توفير بيانات مستمرة',
    first_step: 'تشغيل الاختبارات البرمجية',
    topic: 'اختبارات البرمجيات',
    domain: 'tech',
    boldness: 'realistic',
    language: 'ar',
    tags: ['#Testing'],
    status: 'seed',
    starred: false,
    notes: 'ملاحظة اختبار',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  saveIdea(newIdea);
  const fetched = getStoredIdeas().find((i) => i.id === newIdea.id);
  assert.ok(fetched);
  assert.equal(fetched.title, newIdea.title);

  updateIdea(newIdea.id, { notes: 'تم التعديل بنجاح' });
  const afterUpdate = getStoredIdeas().find((i) => i.id === newIdea.id);
  assert.equal(afterUpdate?.notes, 'تم التعديل بنجاح');

  const starred = toggleStarIdea(newIdea.id);
  assert.equal(starred, true);

  updateIdeaStatus(newIdea.id, 'developed');
  const afterStatus = getStoredIdeas().find((i) => i.id === newIdea.id);
  assert.equal(afterStatus?.status, 'developed');

  deleteIdea(newIdea.id);
  const afterDelete = getStoredIdeas().find((i) => i.id === newIdea.id);
  assert.equal(afterDelete, undefined);
});

test('getVaultStats computes valid counts and domain distributions', () => {
  const stats = getVaultStats();
  assert.ok(stats.totalIdeas >= 1);
  assert.ok(typeof stats.starredIdeas === 'number');
  assert.ok(typeof stats.developedIdeas === 'number');
  assert.ok(stats.domainCounts.tech !== undefined);
});
