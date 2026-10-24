import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Brain,
  Lightbulb,
  Workflow,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  Shuffle,
  ShieldAlert,
  Flame,
  TrendingUp,
} from 'lucide-react';
import { useI18n } from '../lib/i18n';
import { Idea, BrainThoughtStep } from '../lib/types';
import { MATRIX_PRESETS } from '../lib/domains';
import { saveMultipleIdeas, toggleStarIdea, updateIdeaStatus, deleteIdea } from '../lib/storage';
import { IdeaCard } from '../components/IdeaCard';

export const BrainPage: React.FC = () => {
  const { t, language, isRtl } = useI18n();

  const [activeTab, setActiveTab] = useState<'reasoning' | 'matrix'>('reasoning');

  // Deep Reasoning state
  const [reasoningTopic, setReasoningTopic] = useState('أتمتة المحاسبة والعقود للمستقلين العرب');
  const [reasoningLoading, setReasoningLoading] = useState(false);
  const [thoughtSteps, setThoughtSteps] = useState<BrainThoughtStep[]>([]);
  const [marketGap, setMarketGap] = useState<string>('');
  const [unconventionalAngle, setUnconventionalAngle] = useState<string>('');
  const [breakthroughIdeas, setBreakthroughIdeas] = useState<Idea[]>([]);

  // Matrix Fusion state
  const [conceptA, setConceptA] = useState('المقاهي المختصة');
  const [conceptB, setConceptB] = useState('الذكاء الاصطناعي التوليدي');
  const [matrixLoading, setMatrixLoading] = useState(false);
  const [matrixResult, setMatrixResult] = useState<any>(null);

  const handleRandomPreset = () => {
    const random = MATRIX_PRESETS[Math.floor(Math.random() * MATRIX_PRESETS.length)];
    setConceptA(random.conceptA);
    setConceptB(random.conceptB);
  };

  const runDeepReasoning = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reasoningTopic.trim()) return;

    setReasoningLoading(true);
    setThoughtSteps([]);
    setMarketGap('');
    setUnconventionalAngle('');
    setBreakthroughIdeas([]);

    try {
      const res = await fetch('/api/brain/think', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: reasoningTopic.trim(),
          domain: 'tech',
          language,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setThoughtSteps(data.thoughtFlow || []);
        setMarketGap(data.marketGap || '');
        setUnconventionalAngle(data.unconventionalAngle || '');
        if (Array.isArray(data.breakthroughIdeas) && data.breakthroughIdeas.length > 0) {
          setBreakthroughIdeas(data.breakthroughIdeas);
          saveMultipleIdeas(data.breakthroughIdeas);
          confetti({
            particleCount: 50,
            spread: 70,
            origin: { y: 0.6 },
          });
        }
      }
    } catch (err) {
      console.error('Brain think failed', err);
    } finally {
      setReasoningLoading(false);
    }
  };

  const runMatrixFusion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!conceptA.trim() || !conceptB.trim()) return;

    setMatrixLoading(true);
    setMatrixResult(null);

    try {
      const res = await fetch('/api/brain/matrix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conceptA: conceptA.trim(),
          conceptB: conceptB.trim(),
          language,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setMatrixResult(data);
        if (data.breakthroughIdea) {
          const now = new Date().toISOString();
          const ideaObj: Idea = {
            id: `matrix-${Date.now()}`,
            title: data.breakthroughIdea.title,
            description: data.breakthroughIdea.description,
            why_now: data.breakthroughIdea.secretWeapon || 'دمج استثنائي لقوة قطاعين مختلفين.',
            first_step: data.breakthroughIdea.firstStep || 'إجراء جلسة عمل تجريبية مع خبيرين من كلا المجالين.',
            topic: `${conceptA} + ${conceptB}`,
            domain: 'business',
            boldness: 'revolutionary',
            language,
            tags: ['#مصفوفة_الأفكار', '#ابتكار_هجين'],
            status: 'seed',
            starred: true,
            notes: `دمج فكري بين (${conceptA}) و (${conceptB}).`,
            created_at: now,
            updated_at: now,
          };
          saveMultipleIdeas([ideaObj]);
          confetti({
            particleCount: 60,
            spread: 80,
            origin: { y: 0.65 },
          });
        }
      }
    } catch (err) {
      console.error('Matrix fusion failed', err);
    } finally {
      setMatrixLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="rounded-3xl border border-white/10 bg-gradient-to-r from-amber-500/15 via-[#101624] to-indigo-950/30 p-6 sm:p-10 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-300">
              <Brain className="h-3.5 w-3.5 text-amber-400" />
              <span>COGNITIVE BRAIN ARCHITECTURE</span>
            </div>
            <h1 className="mt-3 text-2xl font-black text-white sm:text-4xl">
              {t('brain_title')}
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              {t('brain_subtitle')}
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex rounded-xl border border-white/10 bg-black/40 p-1.5 self-start sm:self-auto">
            <button
              onClick={() => setActiveTab('reasoning')}
              className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'reasoning'
                  ? 'bg-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Workflow className="h-3.5 w-3.5" />
              <span>{t('brain_mode_reasoning')}</span>
            </button>
            <button
              onClick={() => setActiveTab('matrix')}
              className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'matrix'
                  ? 'bg-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Lightbulb className="h-3.5 w-3.5" />
              <span>{t('brain_mode_matrix')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tab 1: Deep Reasoning Mode */}
      {activeTab === 'reasoning' && (
        <div className="space-y-8">
          {/* Query Bar */}
          <form onSubmit={runDeepReasoning} className="rounded-2xl border border-white/10 bg-[#0d121c] p-4 sm:p-5 shadow-xl">
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              {language === 'ar' ? 'الموضوع أو المشكلة المراد تفكيكها استراتيجياً:' : 'Topic or Challenge to Deconstruct:'}
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={reasoningTopic}
                onChange={(e) => setReasoningTopic(e.target.value)}
                placeholder={t('topic_placeholder')}
                className="flex-1 rounded-xl border border-white/15 bg-slate-900 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-amber-500"
              />
              <button
                type="submit"
                disabled={reasoningLoading || !reasoningTopic.trim()}
                className="flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-6 py-3 text-sm font-bold text-black hover:bg-amber-400 active:scale-95 disabled:opacity-50 cursor-pointer transition-all shadow-[0_0_20px_rgba(245,158,11,0.25)]"
              >
                {reasoningLoading ? (
                  <>
                    <Brain className="h-4 w-4 animate-spin text-black" />
                    <span>{language === 'ar' ? 'العقل يفكر...' : 'Thinking...'}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 text-black" />
                    <span>{language === 'ar' ? 'ابدأ التفكير العميق' : 'Start Deep Reasoning'}</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Active Thinking Animation State */}
          {reasoningLoading && (
            <div className="rounded-3xl border border-amber-500/30 bg-gradient-to-b from-amber-500/10 via-[#121926] to-slate-950/80 p-8 text-center space-y-4 shadow-[0_0_40px_rgba(245,158,11,0.15)]">
              <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-amber-500/40 bg-amber-500/15 shadow-[0_0_30px_rgba(245,158,11,0.3)]">
                <Brain className="h-8 w-8 text-amber-400 animate-pulse" />
                <div className="absolute inset-0 rounded-2xl border border-amber-400/40 animate-ping opacity-30" />
              </div>
              <h3 className="text-base font-bold text-white">
                {language === 'ar'
                  ? 'عقل الثقب الأسود يفكك المشكلة ويستخرج الفرص غير المرئية...'
                  : 'Cognitive brain is deconstructing the problem and uncovering market voids...'}
              </h3>
              <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-amber-300 font-medium">
                <span className="h-2 w-2 rounded-full bg-amber-400 animate-bounce" />
                <span className="h-2 w-2 rounded-full bg-amber-400 animate-bounce [animation-delay:0.2s]" />
                <span className="h-2 w-2 rounded-full bg-amber-400 animate-bounce [animation-delay:0.4s]" />
                <span>
                  {language === 'ar'
                    ? 'تحليل الجذور · الربط العابر للقطاعات · الزاوية المعاكسة · هندسة التدفق النقدي · خطة 48 ساعة'
                    : 'Root Cause · Cross-Domain · Contrarian · Economics · 48h Blueprint'}
                </span>
              </div>
            </div>
          )}

          {/* Thought Flow Display */}
          {thoughtSteps.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-sm font-bold text-amber-400">
                <Workflow className="h-4 w-4" />
                <span>{language === 'ar' ? 'سلسلة التفكير الاستراتيجي والتحليل المعرفي:' : 'Strategic Reasoning Stream:'}</span>
              </div>

              {/* Steps timeline */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {thoughtSteps.map((step, idx) => (
                  <div
                    key={idx}
                    className="relative rounded-2xl border border-white/10 bg-gradient-to-b from-slate-900/90 to-slate-950/90 p-4 shadow-lg flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-mono font-bold text-amber-400/90 uppercase">
                          PHASE 0{idx + 1}
                        </span>
                        <div className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
                      </div>
                      <h4 className="text-xs font-bold text-white mb-2 leading-snug">
                        {step.title}
                      </h4>
                      <p className="text-[11px] leading-relaxed text-slate-300">
                        {step.content}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Market Gap & Unconventional Angle Highlights */}
              {(marketGap || unconventionalAngle) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {marketGap && (
                    <div className="rounded-2xl border border-sky-500/25 bg-sky-950/20 p-4">
                      <div className="flex items-center gap-2 text-xs font-bold text-sky-300 mb-1.5">
                        <ShieldAlert className="h-4 w-4 text-sky-400" />
                        <span>{language === 'ar' ? 'الفجوة السوقية غير المخدومة' : 'The Market Void'}</span>
                      </div>
                      <p className="text-xs text-slate-200 leading-relaxed">{marketGap}</p>
                    </div>
                  )}

                  {unconventionalAngle && (
                    <div className="rounded-2xl border border-amber-500/25 bg-amber-950/20 p-4">
                      <div className="flex items-center gap-2 text-xs font-bold text-amber-300 mb-1.5">
                        <Flame className="h-4 w-4 text-amber-400" />
                        <span>{language === 'ar' ? 'الزاوية غير التقليدية (Unfair Edge)' : 'The Contrarian Angle'}</span>
                      </div>
                      <p className="text-xs text-slate-200 leading-relaxed">{unconventionalAngle}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Breakthrough ideas generated */}
              {breakthroughIdeas.length > 0 && (
                <div className="space-y-4 pt-4 border-t border-white/10">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-amber-400" />
                    <span>{language === 'ar' ? 'الأفكار الخارقة الناتجة عن التفكير العميق' : 'Breakthrough Ideas Born From Reasoning'}</span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {breakthroughIdeas.map((idea) => (
                      <IdeaCard
                        key={idea.id}
                        idea={idea}
                        onToggleStar={(id) => {
                          toggleStarIdea(id);
                          setBreakthroughIdeas((prev) =>
                            prev.map((i) => (i.id === id ? { ...i, starred: !i.starred } : i))
                          );
                        }}
                        onUpdateStatus={(id, s) => {
                          updateIdeaStatus(id, s);
                          setBreakthroughIdeas((prev) =>
                            prev.map((i) => (i.id === id ? { ...i, status: s } : i))
                          );
                        }}
                        onDelete={(id) => {
                          deleteIdea(id);
                          setBreakthroughIdeas((prev) => prev.filter((i) => i.id !== id));
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Concept Matrix Mode */}
      {activeTab === 'matrix' && (
        <div className="space-y-8">
          <form onSubmit={runMatrixFusion} className="rounded-3xl border border-white/10 bg-[#0d121c] p-6 shadow-xl space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-amber-400" />
                <span>{language === 'ar' ? 'توليد أفكار هجينة عبر دمج مجالين متباعدين' : 'Cross-Pollination Matrix'}</span>
              </h3>
              <button
                type="button"
                onClick={handleRandomPreset}
                className="flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 font-semibold cursor-pointer"
              >
                <Shuffle className="h-3.5 w-3.5" />
                <span>{language === 'ar' ? 'اقتراح مفاهيم عشوائية' : 'Surprise Me'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  {t('matrix_concept_a')}
                </label>
                <input
                  type="text"
                  value={conceptA}
                  onChange={(e) => setConceptA(e.target.value)}
                  placeholder="المقاهي المختصة..."
                  required
                  className="w-full rounded-xl border border-white/15 bg-slate-900 px-4 py-3 text-sm text-white outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  {t('matrix_concept_b')}
                </label>
                <input
                  type="text"
                  value={conceptB}
                  onChange={(e) => setConceptB(e.target.value)}
                  placeholder="الذكاء الاصطناعي التوليدي..."
                  required
                  className="w-full rounded-xl border border-white/15 bg-slate-900 px-4 py-3 text-sm text-white outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={matrixLoading || !conceptA.trim() || !conceptB.trim()}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 px-6 py-3.5 text-sm font-bold text-black hover:opacity-90 active:scale-98 disabled:opacity-50 transition-all cursor-pointer shadow-[0_0_20px_rgba(245,158,11,0.3)]"
            >
              {matrixLoading ? (
                <>
                  <Brain className="h-4 w-4 animate-spin text-black" />
                  <span>{language === 'ar' ? 'العقل يدمج المفاهيم...' : 'Fusing concepts in cognitive core...'}</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 text-black" />
                  <span>{t('matrix_fuse_btn')}</span>
                </>
              )}
            </button>
          </form>

          {/* Matrix Result Card */}
          {matrixResult && matrixResult.breakthroughIdea && (
            <div className="rounded-3xl border border-amber-500/30 bg-gradient-to-b from-[#161d2b] to-[#0c1017] p-6 sm:p-8 shadow-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-300 mb-3">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                <span>{language === 'ar' ? 'تم الابتكار وحفظ الفكرة في الخزانة' : 'Synthesized & Preserved in Vault'}</span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-white">
                {matrixResult.breakthroughIdea.title}
              </h2>

              <p className="mt-2 text-sm leading-relaxed text-slate-300">
                {matrixResult.breakthroughIdea.description}
              </p>

              <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
                  <span className="text-xs font-bold text-amber-300 block mb-1">
                    ⚡ {language === 'ar' ? 'السلاح السري والدرع التنافسي:' : 'Secret Weapon & Moat:'}
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {matrixResult.breakthroughIdea.secretWeapon}
                  </p>
                </div>

                <div className="rounded-xl border border-sky-500/20 bg-sky-500/5 p-4">
                  <span className="text-xs font-bold text-sky-300 block mb-1">
                    🚀 {language === 'ar' ? 'أول خطوة عملية خلال 48 ساعة:' : 'Immediate 48h Action Step:'}
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {matrixResult.breakthroughIdea.firstStep}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
