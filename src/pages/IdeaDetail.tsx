import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Star,
  Zap,
  ShieldCheck,
  Tag,
  Plus,
  X,
  Trash2,
  Copy,
  Check,
  BarChart2,
  GitFork,
  Calendar,
  Layers,
  Sparkles,
  Award,
  AlertTriangle,
} from 'lucide-react';
import { useI18n } from '../lib/i18n';
import { Idea, IdeaStatus, IdeaEvaluation, IdeaDevelopmentPlan } from '../lib/types';
import { DOMAINS, BOLDNESS_LEVELS } from '../lib/domains';
import { getIdeaById, updateIdea, deleteIdea, toggleStarIdea, updateIdeaStatus } from '../lib/storage';
import { evaluateIdeaPure, generateDevelopmentPlanPure } from '../lib/generatorCore';

export const IdeaDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, language, isRtl } = useI18n();

  const [idea, setIdea] = useState<Idea | null>(null);
  const [notes, setNotes] = useState('');
  const [notesSaved, setNotesSaved] = useState(false);
  const [newTagInput, setNewTagInput] = useState('');
  const [copied, setCopied] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [planningLoading, setPlanningLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    const found = getIdeaById(id);
    if (found) {
      setIdea(found);
      setNotes(found.notes || '');
    }
  }, [id]);

  if (!idea) {
    return (
      <div className="rounded-3xl border border-white/10 bg-[#0d121c] p-12 text-center space-y-4">
        <h2 className="text-lg font-bold text-white">
          {language === 'ar' ? 'لم يتم العثور على الفكرة المطلوبة' : 'Idea Not Found'}
        </h2>
        <Link
          to="/vault"
          className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-black"
        >
          {isRtl ? <ArrowRight className="h-4 w-4" /> : <ArrowLeft className="h-4 w-4" />}
          <span>{t('back_to_vault')}</span>
        </Link>
      </div>
    );
  }

  const domain = DOMAINS[idea.domain] || DOMAINS.tech;
  const boldness = BOLDNESS_LEVELS[idea.boldness] || BOLDNESS_LEVELS.bold;

  const handleNotesChange = (val: string) => {
    setNotes(val);
    updateIdea(idea.id, { notes: val });
    setNotesSaved(true);
    setTimeout(() => setNotesSaved(false), 2000);
  };

  const handleToggleStar = () => {
    const next = toggleStarIdea(idea.id);
    setIdea({ ...idea, starred: next });
  };

  const handleStatusChange = (status: IdeaStatus) => {
    updateIdeaStatus(idea.id, status);
    setIdea({ ...idea, status });
  };

  const handleDelete = () => {
    deleteIdea(idea.id);
    navigate('/vault');
  };

  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    const tag = newTagInput.trim();
    if (!tag) return;
    const formatted = tag.startsWith('#') ? tag : `#${tag}`;
    if (!idea.tags.includes(formatted)) {
      const updatedTags = [...idea.tags, formatted];
      updateIdea(idea.id, { tags: updatedTags });
      setIdea({ ...idea, tags: updatedTags });
    }
    setNewTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const updatedTags = idea.tags.filter((t) => t !== tagToRemove);
    updateIdea(idea.id, { tags: updatedTags });
    setIdea({ ...idea, tags: updatedTags });
  };

  const handleRunEvaluation = () => {
    setEvaluating(true);
    setTimeout(() => {
      const evaluation = evaluateIdeaPure({
        title: idea.title,
        description: idea.description,
        boldness: idea.boldness,
        domain: idea.domain,
      });
      updateIdea(idea.id, { evaluation });
      setIdea({ ...idea, evaluation });
      setEvaluating(false);
    }, 400);
  };

  const handleGenerateDevelopmentPlan = () => {
    setPlanningLoading(true);
    setTimeout(() => {
      const development = generateDevelopmentPlanPure(idea);
      updateIdea(idea.id, { development, status: 'developed' });
      setIdea({ ...idea, development, status: 'developed' });
      setPlanningLoading(false);
    }, 400);
  };

  const handleCopyDossier = () => {
    const text = `📁 ملف الفكرة الاستثمارية: ${idea.title}
🏷️ المجال: ${language === 'ar' ? domain.labelAr : domain.labelEn} | الجرأة: ${language === 'ar' ? boldness.labelAr : boldness.labelEn}
💡 الوصف:
${idea.description}

⚡ لماذا الآن؟
${idea.why_now}

🚀 أول خطوة في 48 ساعة:
${idea.first_step}

${idea.notes ? `📝 ملاحظات خاصة:\n${idea.notes}\n` : ''}
🏷️ الوسوم: ${idea.tags.join(' ')}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Top Breadcrumb & Actions Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          to="/vault"
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-amber-400 transition-colors"
        >
          {isRtl ? <ArrowRight className="h-4 w-4" /> : <ArrowLeft className="h-4 w-4" />}
          <span>{t('back_to_vault')}</span>
        </Link>

        <div className="flex items-center gap-2">
          {/* Copy Dossier */}
          <button
            onClick={handleCopyDossier}
            className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white transition-all cursor-pointer"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5 text-amber-400" />}
            <span>{copied ? (language === 'ar' ? 'تم نسخ الملف' : 'Copied Dossier') : t('copy_dossier')}</span>
          </button>

          {/* Star button */}
          <button
            onClick={handleToggleStar}
            className="rounded-xl border border-white/10 bg-slate-900 p-2 text-slate-300 hover:text-amber-400 cursor-pointer"
          >
            <Star className={`h-4 w-4 ${idea.starred ? 'fill-amber-400 text-amber-400' : ''}`} />
          </button>

          {/* Delete button */}
          <button
            onClick={handleDelete}
            title={t('delete')}
            className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-2 text-rose-400 hover:bg-rose-500/20 cursor-pointer"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Main Idea Card Header */}
      <div className="rounded-3xl border border-white/10 bg-[#0d121c] p-6 sm:p-10 shadow-2xl space-y-6">
        <div className="flex flex-wrap items-center gap-2">
          {/* Status selector */}
          <select
            value={idea.status}
            onChange={(e) => handleStatusChange(e.target.value as IdeaStatus)}
            className="rounded-lg border border-amber-500/30 bg-amber-500/15 px-3 py-1 text-xs font-bold text-amber-300 outline-none cursor-pointer"
          >
            <option value="seed" className="bg-slate-900 text-white">● {t('status_seed')}</option>
            <option value="in_progress" className="bg-slate-900 text-white">● {t('status_in_progress')}</option>
            <option value="developed" className="bg-slate-900 text-white">● {t('status_developed')}</option>
            <option value="archived" className="bg-slate-900 text-white">● {t('status_archived')}</option>
          </select>

          {/* Domain */}
          <span className="rounded-lg border border-white/10 bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-300">
            {language === 'ar' ? domain.labelAr : domain.labelEn}
          </span>

          {/* Boldness */}
          <span className={`rounded-lg border px-3 py-1 text-xs font-semibold ${boldness.badgeClass}`}>
            {language === 'ar' ? boldness.badgeAr : boldness.badgeEn}
          </span>
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
          {idea.title}
        </h1>

        {/* Full description */}
        <p className="text-sm sm:text-base leading-relaxed text-slate-200">
          {idea.description}
        </p>

        {/* Strategic Cards: Why Now & First Step */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-5">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-300 mb-2">
              <Zap className="h-4 w-4 text-amber-400" />
              <span>{t('why_now')}</span>
            </div>
            <p className="text-xs sm:text-sm leading-relaxed text-slate-200">
              {idea.why_now}
            </p>
          </div>

          <div className="rounded-2xl border border-sky-500/30 bg-sky-500/5 p-5">
            <div className="flex items-center gap-2 text-xs font-bold text-sky-300 mb-2">
              <ShieldCheck className="h-4 w-4 text-sky-400" />
              <span>{t('first_step')}</span>
            </div>
            <p className="text-xs sm:text-sm leading-relaxed text-slate-200">
              {idea.first_step}
            </p>
          </div>
        </div>

        {/* Tags Section */}
        <div className="pt-4 border-t border-white/10 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
              <Tag className="h-3 w-3" />
              <span>{language === 'ar' ? 'الوسوم:' : 'Tags:'}</span>
            </span>
            {idea.tags.map((tag) => (
              <span
                key={tag}
                className="group inline-flex items-center gap-1 rounded-lg border border-white/10 bg-slate-800 px-2.5 py-1 text-xs text-slate-300"
              >
                <span>{tag}</span>
                <button
                  onClick={() => handleRemoveTag(tag)}
                  className="text-slate-400 hover:text-rose-400 cursor-pointer"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}

            {/* Add tag form */}
            <form onSubmit={handleAddTag} className="inline-flex items-center gap-1">
              <input
                type="text"
                value={newTagInput}
                onChange={(e) => setNewTagInput(e.target.value)}
                placeholder={language === 'ar' ? 'أضف وسماً...' : 'Add tag...'}
                className="rounded-lg border border-white/10 bg-slate-900 px-2.5 py-1 text-xs text-white placeholder-slate-500 outline-none focus:border-amber-500 w-28"
              />
              <button
                type="submit"
                className="rounded-lg bg-white/10 p-1 text-slate-300 hover:bg-white/20 cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Grid: Personal Notes & Evaluation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Notes (6 cols) */}
        <div className="lg:col-span-6 rounded-3xl border border-white/10 bg-[#0d121c] p-6 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>{t('notes_title')}</span>
            </h3>
            {notesSaved && (
              <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1">
                <Check className="h-3 w-3" />
                <span>{language === 'ar' ? 'تم الحفظ' : 'Saved'}</span>
              </span>
            )}
          </div>

          <textarea
            rows={5}
            value={notes}
            onChange={(e) => handleNotesChange(e.target.value)}
            placeholder={t('notes_placeholder')}
            className="w-full resize-none rounded-xl border border-white/15 bg-slate-900 p-3.5 text-xs text-white placeholder-slate-500 outline-none focus:border-amber-500 leading-relaxed"
          />
        </div>

        {/* Right: Feasibility & SWOT Evaluation (6 cols) */}
        <div className="lg:col-span-6 rounded-3xl border border-white/10 bg-[#0d121c] p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <BarChart2 className="h-4 w-4 text-amber-400" />
              <span>{t('evaluation_title')}</span>
            </h3>
            <button
              onClick={handleRunEvaluation}
              disabled={evaluating}
              className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-bold text-amber-300 hover:bg-amber-500 hover:text-black transition-all cursor-pointer"
            >
              {evaluating ? (language === 'ar' ? 'جارٍ التقييم...' : 'Evaluating...') : (language === 'ar' ? 'إعادة التقييم' : 'Re-evaluate')}
            </button>
          </div>

          {idea.evaluation ? (
            <div className="space-y-4">
              {/* Score Meters */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded-xl border border-white/5 bg-slate-900/60 p-2.5">
                  <span className="text-[10px] text-slate-400 block mb-1">
                    {language === 'ar' ? 'الجدوى' : 'Feasibility'}
                  </span>
                  <span className="text-lg font-black text-emerald-400">
                    {idea.evaluation.feasibilityScore}%
                  </span>
                </div>
                <div className="rounded-xl border border-white/5 bg-slate-900/60 p-2.5">
                  <span className="text-[10px] text-slate-400 block mb-1">
                    {language === 'ar' ? 'حجم السوق' : 'Market Size'}
                  </span>
                  <span className="text-lg font-black text-amber-400">
                    {idea.evaluation.marketPotentialScore}%
                  </span>
                </div>
                <div className="rounded-xl border border-white/5 bg-slate-900/60 p-2.5">
                  <span className="text-[10px] text-slate-400 block mb-1">
                    {language === 'ar' ? 'الابتكار' : 'Innovation'}
                  </span>
                  <span className="text-lg font-black text-sky-400">
                    {idea.evaluation.innovationScore}%
                  </span>
                </div>
              </div>

              {/* Summary */}
              <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/40 p-3 rounded-xl border border-white/5">
                {idea.evaluation.summary}
              </p>

              {/* Strengths & Risks */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3">
                  <span className="text-[11px] font-bold text-emerald-300 flex items-center gap-1 mb-1.5">
                    <Award className="h-3.5 w-3.5" />
                    <span>{language === 'ar' ? 'عوامل القوة والتمايز' : 'Core Strengths'}</span>
                  </span>
                  <ul className="text-[11px] text-slate-300 space-y-1 list-disc list-inside">
                    {idea.evaluation.strengths.slice(0, 2).map((s, idx) => (
                      <li key={idx}>{s}</li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-3">
                  <span className="text-[11px] font-bold text-rose-300 flex items-center gap-1 mb-1.5">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    <span>{language === 'ar' ? 'المخاطر والتحديات' : 'Key Risks'}</span>
                  </span>
                  <ul className="text-[11px] text-slate-300 space-y-1 list-disc list-inside">
                    {idea.evaluation.risks.slice(0, 2).map((r, idx) => (
                      <li key={idx}>{r}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Defensible Moat */}
              {idea.evaluation.moat && (
                <div className="text-[11px] text-amber-200/90 bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20">
                  <span className="font-bold block mb-0.5">
                    🛡️ {language === 'ar' ? 'الدرع التنافسي (Moat):' : 'Defensible Moat:'}
                  </span>
                  <span>{idea.evaluation.moat}</span>
                </div>
              )}
            </div>
          ) : (
            <div className="py-6 text-center text-xs text-slate-400 space-y-2">
              <p>{language === 'ar' ? 'لم يتم حساب التقييم المعمق لهذه الفكرة بعد.' : 'No evaluation computed yet.'}</p>
              <button
                onClick={handleRunEvaluation}
                className="rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-black hover:bg-amber-400 cursor-pointer"
              >
                {language === 'ar' ? 'شغّل التقييم الآن' : 'Run Evaluation'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 3-Phase Execution Roadmap */}
      <div className="rounded-3xl border border-white/10 bg-[#0d121c] p-6 sm:p-8 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="h-4 w-4 text-amber-400" />
              <span>{t('dev_plan_title')}</span>
            </h3>
            <p className="mt-1 text-xs text-slate-400">
              {language === 'ar'
                ? 'خطة تشغيلية دقيقة تبدأ من التحقق اليدوي في 14 يوماً وصولاً لتوسيع السوق.'
                : 'Actionable 3-stage roadmap from 14-day validation to scalable market leadership.'}
            </p>
          </div>

          {!idea.development && (
            <button
              onClick={handleGenerateDevelopmentPlan}
              disabled={planningLoading}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 px-5 py-2.5 text-xs font-bold text-black hover:opacity-90 transition-all cursor-pointer"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>{planningLoading ? (language === 'ar' ? 'جارٍ بناء الخطة...' : 'Building...') : (language === 'ar' ? 'أنشئ خارطة التنفيذ' : 'Generate Roadmap')}</span>
            </button>
          )}
        </div>

        {idea.development ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Stage 1 */}
              <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-amber-400 uppercase">
                    STAGE 01
                  </span>
                  <span className="rounded bg-amber-500/20 px-2 py-0.5 text-[10px] text-amber-300 font-bold">
                    {idea.development.stage1Prototype.timeline}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-white">
                  {idea.development.stage1Prototype.title}
                </h4>
                <ul className="text-[11px] text-slate-300 space-y-2 list-disc list-inside">
                  {idea.development.stage1Prototype.steps.map((st, i) => (
                    <li key={i}>{st}</li>
                  ))}
                </ul>
              </div>

              {/* Stage 2 */}
              <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-sky-400 uppercase">
                    STAGE 02
                  </span>
                  <span className="rounded bg-sky-500/20 px-2 py-0.5 text-[10px] text-sky-300 font-bold">
                    {idea.development.stage2Validation.timeline}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-white">
                  {idea.development.stage2Validation.title}
                </h4>
                <ul className="text-[11px] text-slate-300 space-y-2 list-disc list-inside">
                  {idea.development.stage2Validation.steps.map((st, i) => (
                    <li key={i}>{st}</li>
                  ))}
                </ul>
              </div>

              {/* Stage 3 */}
              <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase">
                    STAGE 03
                  </span>
                  <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] text-emerald-300 font-bold">
                    {idea.development.stage3Scale.timeline}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-white">
                  {idea.development.stage3Scale.title}
                </h4>
                <ul className="text-[11px] text-slate-300 space-y-2 list-disc list-inside">
                  {idea.development.stage3Scale.steps.map((st, i) => (
                    <li key={i}>{st}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Bottom Details: Monetization & Recommended Tech Stack */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="rounded-xl border border-white/5 bg-slate-900/40 p-4">
                <span className="text-xs font-bold text-slate-300 block mb-1">
                  💰 {language === 'ar' ? 'نموذج الإيرادات المقترح:' : 'Monetization Architecture:'}
                </span>
                <p className="text-xs text-slate-400">{idea.development.monetizationModel}</p>
              </div>

              <div className="rounded-xl border border-white/5 bg-slate-900/40 p-4">
                <span className="text-xs font-bold text-slate-300 block mb-1">
                  ⚙️ {language === 'ar' ? 'حزمة التقنيات الموصى بها للتنفيذ:' : 'Recommended Tech Stack:'}
                </span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {idea.development.techStackRecommendation.map((t) => (
                    <span key={t} className="rounded bg-white/5 px-2 py-0.5 text-[10px] text-slate-300 font-mono">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-slate-500">
            {language === 'ar'
              ? 'اضغط زر «أنشئ خارطة التنفيذ» أعلاه لتوليد مسار المراحل الثلاث ونموذج الربح الموصى به.'
              : 'Click "Generate Roadmap" above to build a detailed 3-phase execution blueprint.'}
          </div>
        )}
      </div>
    </div>
  );
};
