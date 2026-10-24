import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Orbit, Sparkles, Zap, ChevronDown, CheckCircle2, AlertCircle } from 'lucide-react';
import { DomainKey, BoldnessKey, Idea, SessionRecord, IdeaStatus } from '../lib/types';
import { DOMAINS, BOLDNESS_LEVELS, QUICK_PROMPTS } from '../lib/domains';
import { useI18n } from '../lib/i18n';
import { saveMultipleIdeas, saveSession, getStoredIdeas, toggleStarIdea, updateIdeaStatus, deleteIdea } from '../lib/storage';
import { generateLocalFallbackIdeas } from '../lib/generatorCore';
import { IdeaCard } from '../components/IdeaCard';

export const Studio: React.FC = () => {
  const { t, language, isRtl } = useI18n();

  const [topic, setTopic] = useState('');
  const [domain, setDomain] = useState<DomainKey>('tech');
  const [boldness, setBoldness] = useState<BoldnessKey>('bold');
  const [count, setCount] = useState<number>(3);
  const [loading, setLoading] = useState(false);
  const [generatedIdeas, setGeneratedIdeas] = useState<Idea[]>([]);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleSparkClick = (spark: (typeof QUICK_PROMPTS)[0]) => {
    setTopic(language === 'ar' ? spark.ar : spark.en);
    setDomain(spark.domain);
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setLoading(true);
    setStatusMessage(null);

    const targetTopic = topic.trim();
    let newIdeas: Idea[] = [];

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: targetTopic,
          domain,
          boldness,
          count,
          language,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data.ideas) && data.ideas.length > 0) {
          newIdeas = data.ideas;
        }
      }
    } catch (err) {
      console.warn('Network API attempt failed, switching to deterministic generator core immediately:', err);
    }

    // If server failed or network was down, run the instant fallback generator
    if (newIdeas.length === 0) {
      newIdeas = generateLocalFallbackIdeas({
        topic: targetTopic,
        domain,
        boldness,
        count,
        language,
      });
    }

    // Persist to local storage vault immediately
    saveMultipleIdeas(newIdeas);

    // Save session record
    const sessionRecord: SessionRecord = {
      id: `session-${Date.now()}`,
      topic: targetTopic,
      domain,
      boldness,
      ideas_count: newIdeas.length,
      created_at: new Date().toISOString(),
      idea_ids: newIdeas.map((i) => i.id),
    };
    saveSession(sessionRecord);

    setGeneratedIdeas(newIdeas);
    setLoading(false);

    // Trigger celebratory confetti
    try {
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#f59e0b', '#fbbf24', '#38bdf8', '#34d399'],
      });
    } catch {
      // ignore
    }

    setStatusMessage(
      language === 'ar'
        ? `تم توليد ${newIdeas.length} أفكار وحفظها تلقائياً في خزانتك!`
        : `Generated ${newIdeas.length} ideas and automatically preserved in your vault!`
    );
  };

  const handleToggleStar = (id: string) => {
    toggleStarIdea(id);
    setGeneratedIdeas((prev) =>
      prev.map((i) => (i.id === id ? { ...i, starred: !i.starred } : i))
    );
  };

  const handleUpdateStatus = (id: string, newStatus: IdeaStatus) => {
    updateIdeaStatus(id, newStatus);
    setGeneratedIdeas((prev) =>
      prev.map((i) => (i.id === id ? { ...i, status: newStatus } : i))
    );
  };

  const handleDelete = (id: string) => {
    deleteIdea(id);
    setGeneratedIdeas((prev) => prev.filter((i) => i.id !== id));
  };

  const handleDerivate = async (idea: Idea, mode: 'bolder' | 'safer' | 'pivot') => {
    try {
      const res = await fetch('/api/ideas/derivate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea, mode }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.idea) {
          saveMultipleIdeas([data.idea]);
          setGeneratedIdeas((prev) => [data.idea, ...prev]);
        }
      }
    } catch {
      // fallback
    }
  };

  return (
    <div className="space-y-10">
      {/* Hero Header */}
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-[#121826] to-[#0a0e17] p-6 sm:p-10 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 h-72 w-72 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-300">
            <Orbit className="h-3.5 w-3.5 text-amber-400" />
            <span>{t('hero_badge')}</span>
          </div>

          <h1 className="mt-4 text-2xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl leading-tight">
            {t('hero_title')}
          </h1>

          <p className="mt-3 text-sm text-slate-300 sm:text-base leading-relaxed">
            {t('hero_desc')}
          </p>
        </div>
      </section>

      {/* Main Generator Form & Display Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left / Input Control Panel (5 columns on large screens) */}
        <div className="lg:col-span-5 rounded-3xl border border-white/10 bg-[#0d121c] p-6 shadow-xl">
          <form onSubmit={handleGenerate} className="space-y-5">
            {/* Topic Input */}
            <div>
              <label htmlFor="topic-input" className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                {t('topic_label')}
              </label>
              <textarea
                id="topic-input"
                rows={3}
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder={t('topic_placeholder')}
                required
                className="w-full resize-none rounded-xl border border-white/15 bg-slate-900/90 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
              />

              {/* Quick Sparks */}
              <div className="mt-2.5">
                <span className="text-[11px] font-semibold text-amber-400/90 flex items-center gap-1 mb-1.5">
                  <Zap className="h-3 w-3" />
                  {t('quick_sparks')}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_PROMPTS.slice(0, 4).map((spark, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSparkClick(spark)}
                      className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-slate-300 hover:border-amber-500/40 hover:bg-amber-500/10 hover:text-amber-200 transition-all cursor-pointer"
                    >
                      {language === 'ar' ? spark.ar : spark.en}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Domain Dropdown */}
            <div>
              <label htmlFor="domain-select" className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                {t('domain_label')}
              </label>
              <div className="relative">
                <select
                  id="domain-select"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value as DomainKey)}
                  className="w-full appearance-none rounded-xl border border-white/15 bg-slate-900/90 px-4 py-2.5 text-sm text-white outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all cursor-pointer"
                >
                  {Object.values(DOMAINS).map((d) => (
                    <option key={d.key} value={d.key} className="bg-slate-900 text-white">
                      {language === 'ar' ? d.labelAr : d.labelEn}
                    </option>
                  ))}
                </select>
                <ChevronDown className={`pointer-events-none absolute top-3.5 h-4 w-4 text-slate-400 ${isRtl ? 'left-3' : 'right-3'}`} />
              </div>
              <p className="mt-1 text-[11px] text-slate-400">
                {language === 'ar' ? DOMAINS[domain]?.descAr : DOMAINS[domain]?.descEn}
              </p>
            </div>

            {/* Controls: Boldness & Count in 2 columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Boldness */}
              <div>
                <label htmlFor="boldness-select" className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                  {t('boldness_label')}
                </label>
                <div className="relative">
                  <select
                    id="boldness-select"
                    value={boldness}
                    onChange={(e) => setBoldness(e.target.value as BoldnessKey)}
                    className="w-full appearance-none rounded-xl border border-white/15 bg-slate-900/90 px-4 py-2.5 text-sm text-white outline-none focus:border-amber-500 transition-all cursor-pointer"
                  >
                    {Object.values(BOLDNESS_LEVELS).map((b) => (
                      <option key={b.key} value={b.key} className="bg-slate-900 text-white">
                        {language === 'ar' ? b.badgeAr : b.badgeEn}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className={`pointer-events-none absolute top-3.5 h-4 w-4 text-slate-400 ${isRtl ? 'left-3' : 'right-3'}`} />
                </div>
              </div>

              {/* Count */}
              <div>
                <label htmlFor="count-select" className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                  {t('count_label')}
                </label>
                <div className="relative">
                  <select
                    id="count-select"
                    value={count}
                    onChange={(e) => setCount(Number(e.target.value))}
                    className="w-full appearance-none rounded-xl border border-white/15 bg-slate-900/90 px-4 py-2.5 text-sm text-white outline-none focus:border-amber-500 transition-all cursor-pointer"
                  >
                    <option value={1} className="bg-slate-900 text-white">1 {language === 'ar' ? 'فكرة' : 'Idea'}</option>
                    <option value={3} className="bg-slate-900 text-white">3 {language === 'ar' ? 'أفكار' : 'Ideas'}</option>
                    <option value={5} className="bg-slate-900 text-white">5 {language === 'ar' ? 'أفكار' : 'Ideas'}</option>
                  </select>
                  <ChevronDown className={`pointer-events-none absolute top-3.5 h-4 w-4 text-slate-400 ${isRtl ? 'left-3' : 'right-3'}`} />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              data-testid="generator-submit-btn"
              disabled={loading || !topic.trim()}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 px-6 py-3.5 text-sm font-bold text-black shadow-[0_0_25px_rgba(245,158,11,0.35)] hover:shadow-[0_0_35px_rgba(245,158,11,0.5)] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              {loading ? (
                <>
                  <Orbit className="h-4 w-4 animate-spin text-black" />
                  <span>{t('generating_btn')}</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 text-black" />
                  <span>{t('generate_btn')}</span>
                </>
              )}
            </button>
          </form>

          {/* Feedback status banner */}
          {statusMessage && (
            <div className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-300">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
              <span>{statusMessage}</span>
            </div>
          )}
        </div>

        {/* Right / Generated Results View (7 columns on large screens) */}
        <div className="lg:col-span-7">
          {loading ? (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-amber-500/20 bg-slate-900/40 p-12 text-center">
              <div className="relative mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-amber-500/40 bg-amber-500/10 shadow-[0_0_30px_rgba(245,158,11,0.2)]">
                <Orbit className="h-8 w-8 text-amber-400 animate-spin" />
              </div>
              <h3 className="text-base font-bold text-white">
                {language === 'ar' ? 'المحرك يفكك الفكرة ويستخرج الفرص...' : 'Synthesizing market voids and unfair advantages...'}
              </h3>
              <p className="mt-1 text-xs text-slate-400 max-w-sm">
                {language === 'ar'
                  ? 'يتم استخدام محرك الذكاء الاصطناعي لاستكشاف الزوايا غير التقليدية وحساب التمايز ونقاط الضعف.'
                  : 'Employing deep reasoning to unlock contrarian angles and 48h executable prototypes.'}
              </p>
            </div>
          ) : generatedIdeas.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-amber-400" />
                  <span>{language === 'ar' ? 'الأفكار الناتجة في مدارك' : 'Ideas Crystallized in Your Orbit'}</span>
                  <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-xs text-amber-300">
                    {generatedIdeas.length}
                  </span>
                </h2>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {generatedIdeas.map((idea) => (
                  <IdeaCard
                    key={idea.id}
                    idea={idea}
                    onToggleStar={handleToggleStar}
                    onUpdateStatus={handleUpdateStatus}
                    onDelete={handleDelete}
                    onDerivate={handleDerivate}
                  />
                ))}
              </div>
            </div>
          ) : (
            /* Empty State */
            <div className="flex flex-col items-center justify-center rounded-3xl border border-white/10 bg-[#0d121c]/60 p-10 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-slate-900 text-amber-400">
                <Orbit className="h-8 w-8" />
              </div>
              <h2 className="text-lg font-bold text-white">
                {t('event_horizon_waiting')}
              </h2>
              <p className="mt-2 text-xs leading-relaxed text-slate-400 max-w-md">
                {t('event_horizon_hint')}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
