import test from 'node:test';
import assert from 'node:assert/strict';
import { generateLocalFallbackIdeas, evaluateIdeaPure, generateDevelopmentPlanPure, synthesizeMatrixPure } from './generatorCore';

test('generateLocalFallbackIdeas returns expected number of ideas with full fields', () => {
  const count = 3;
  const ideas = generateLocalFallbackIdeas({
    topic: 'الذكاء الاصطناعي في التعليم',
    domain: 'edtech',
    boldness: 'bold',
    count,
    language: 'ar',
  });

  assert.equal(ideas.length, count);
  ideas.forEach((idea) => {
    assert.ok(idea.id.startsWith('idea-'));
    assert.ok(idea.title.includes('الذكاء الاصطناعي في التعليم'));
    assert.ok(idea.description.length > 20);
    assert.ok(idea.why_now.length > 10);
    assert.ok(idea.first_step.length > 10);
    assert.equal(idea.domain, 'edtech');
    assert.equal(idea.boldness, 'bold');
    assert.ok(idea.evaluation);
    assert.ok(idea.evaluation.feasibilityScore >= 1 && idea.evaluation.feasibilityScore <= 100);
  });
});

test('evaluateIdeaPure calculates higher feasibility for safe and higher innovation for revolutionary', () => {
  const safeEval = evaluateIdeaPure({
    title: 'تطبيق تنظيم المواعيد',
    description: 'تطبيق جدول مواعيد بسيط للمحلات الصغيرة',
    boldness: 'safe',
    domain: 'business',
  });

  const revEval = evaluateIdeaPure({
    title: 'مستعمرة التعدين الفضائي',
    description: 'روبوتات ذاتية التشغيل في الفضاء الخارجي',
    boldness: 'revolutionary',
    domain: 'tech',
  });

  assert.ok(safeEval.feasibilityScore > revEval.feasibilityScore);
  assert.ok(revEval.innovationScore >= safeEval.innovationScore);
  assert.ok(Array.isArray(safeEval.strengths));
  assert.ok(safeEval.strengths.length > 0);
  assert.ok(safeEval.moat.length > 0);
});

test('generateDevelopmentPlanPure creates 3 actionable stages with steps', () => {
  const mockIdea = {
    id: 'test-1',
    title: 'منصة استشارات قانونية فورية',
    description: 'استشارات قانونية عبر الذكاء الاصطناعي',
    why_now: 'الحاجة لتسريع الإجراءات',
    first_step: 'بناء صفحة هبوط أولية',
    topic: 'قانون',
    domain: 'business' as const,
    boldness: 'bold' as const,
    language: 'ar' as const,
    tags: ['legal'],
    status: 'seed' as const,
    starred: false,
    notes: '',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const plan = generateDevelopmentPlanPure(mockIdea);
  assert.ok(plan.stage1Prototype.steps.length >= 2);
  assert.ok(plan.stage2Validation.steps.length >= 2);
  assert.ok(plan.stage3Scale.steps.length >= 2);
  assert.ok(plan.techStackRecommendation.length >= 3);
});

test('synthesizeMatrixPure combines two disparate concepts into a coherent innovation', () => {
  const matrix = synthesizeMatrixPure('القهوة المختصة', 'البلوكشين والذكاء الاصطناعي', 'ar');
  assert.equal(matrix.conceptA, 'القهوة المختصة');
  assert.equal(matrix.conceptB, 'البلوكشين والذكاء الاصطناعي');
  assert.ok(matrix.breakthroughIdea.title.length > 5);
  assert.ok(matrix.breakthroughIdea.secretWeapon.length > 10);
});
