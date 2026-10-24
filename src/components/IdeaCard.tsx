import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, ArrowRight, ArrowLeft, Copy, Check, Trash2, GitFork, ShieldCheck, Zap } from 'lucide-react';
import { Idea, IdeaStatus } from '../lib/types';
import { DOMAINS, BOLDNESS_LEVELS } from '../lib/domains';
import { useI18n } from '../lib/i18n';

interface IdeaCardProps {
  idea: Idea;
  onToggleStar?: (id: string) => void;
  onUpdateStatus?: (id: string, status: IdeaStatus) => void;
  onDelete?: (id: string) => void;
  onDerivate?: (idea: Idea, mode: 'bolder' | 'safer' | 'pivot') => void;
}

export const IdeaCard: React.FC<IdeaCardProps> = ({
  idea,
  onToggleStar,
  onUpdateStatus,
  onDelete,
  onDerivate,
}) => {
  const { t, isRtl, language } = useI18n();
  const [copied, setCopied] = useState(false);
  const [showDerivateMenu, setShowDerivateMenu] = useState(false);

  const domain = DOMAINS[idea.domain] || DOMAINS.tech;
  const boldness = BOLDNESS_LEVELS[idea.boldness] || BOLDNESS_LEVELS.bold;

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    const text = `🌟 ${idea.title}
📁 ${language === 'ar' ? domain.labelAr : domain.labelEn} | 🔥 ${language === 'ar' ? boldness.labelAr : boldness.labelEn}
💡 ${idea.description}
⚡ ${language === 'ar' ? 'لماذا الآن؟' : 'Why Now:'} ${idea.why_now}
🚀 ${language === 'ar' ? 'أول خطوة في 48 ساعة:' : 'First 48h Step:'} ${idea.first_step}
🏷️ ${idea.tags.join(' ')}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const statusLabels: Record<IdeaStatus, { ar: string; en: string; color: string }> = {
    seed: { ar: 'بذرة', en: 'Seed', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
    in_progress: { ar: 'قيد التطوير', en: 'In Progress', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
    developed: { ar: 'مكتملة التخطيط', en: 'Developed', color: 'bg-sky-500/20 text-sky-300 border-sky-500/30' },
    archived: { ar: 'مؤرشفة', en: 'Archived', color: 'bg-slate-700/40 text-slate-400 border-slate-600/30' },
  };

  return (
    <div
      data-testid="idea-card"
      className="glass-card glass-card-hover group relative flex flex-col justify-between rounded-2xl p-5 transition-all duration-300"
    >
      <div>
        {/* Top bar: Status, Badges & Star */}
        <div className="mb-3.5 flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            {/* Status Dropdown */}
            <select
              value={idea.status}
              onChange={(e) => onUpdateStatus?.(idea.id, e.target.value as IdeaStatus)}
              className={`rounded-lg border px-2 py-0.5 text-xs font-semibold outline-none cursor-pointer ${
                statusLabels[idea.status]?.color || 'bg-slate-800 text-slate-300 border-slate-700'
              }`}
            >
              <option value="seed" className="bg-slate-900 text-white">
                ● {language === 'ar' ? statusLabels.seed.ar : statusLabels.seed.en}
              </option>
              <option value="in_progress" className="bg-slate-900 text-white">
                ● {language === 'ar' ? statusLabels.in_progress.ar : statusLabels.in_progress.en}
              </option>
              <option value="developed" className="bg-slate-900 text-white">
                ● {language === 'ar' ? statusLabels.developed.ar : statusLabels.developed.en}
              </option>
              <option value="archived" className="bg-slate-900 text-white">
                ● {language === 'ar' ? statusLabels.archived.ar : statusLabels.archived.en}
              </option>
            </select>

            {/* Domain Badge */}
            <span
              className="rounded-lg border border-white/10 bg-slate-800/80 px-2 py-0.5 text-[11px] font-medium text-slate-300"
              style={{ borderColor: `${domain.color}33` }}
            >
              {language === 'ar' ? domain.labelAr : domain.labelEn}
            </span>

            {/* Boldness Badge */}
            <span className={`rounded-lg border px-2 py-0.5 text-[11px] font-medium ${boldness.badgeClass}`}>
              {language === 'ar' ? boldness.badgeAr : boldness.badgeEn}
            </span>
          </div>

          {/* Star button */}
          <button
            onClick={() => onToggleStar?.(idea.id)}
            aria-label={idea.starred ? 'Remove star' : 'Star idea'}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-amber-400 transition-colors cursor-pointer"
          >
            <Star
              className={`h-4 w-4 ${
                idea.starred ? 'fill-amber-400 text-amber-400' : 'text-slate-400'
              }`}
            />
          </button>
        </div>

        {/* Title */}
        <Link to={`/idea/${idea.id}`} className="block group-hover:text-amber-300 transition-colors">
          <h3 className="text-base font-bold tracking-tight text-white line-clamp-2">
            {idea.title}
          </h3>
        </Link>

        {/* Description */}
        <p className="mt-2 text-xs leading-relaxed text-slate-300 line-clamp-3">
          {idea.description}
        </p>

        {/* Strategic Cards: Why Now & First Step */}
        <div className="mt-3.5 space-y-2">
          {idea.why_now && (
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-2.5">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-300">
                <Zap className="h-3 w-3 text-amber-400" />
                <span>{t('why_now')}</span>
              </div>
              <p className="mt-1 text-[11px] leading-relaxed text-slate-300 line-clamp-2">
                {idea.why_now}
              </p>
            </div>
          )}

          {idea.first_step && (
            <div className="rounded-xl border border-sky-500/20 bg-sky-500/5 p-2.5">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-sky-300">
                <ShieldCheck className="h-3 w-3 text-sky-400" />
                <span>{t('first_step')}</span>
              </div>
              <p className="mt-1 text-[11px] leading-relaxed text-slate-300 line-clamp-2">
                {idea.first_step}
              </p>
            </div>
          )}
        </div>

        {/* Tags */}
        {idea.tags && idea.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {idea.tags.slice(0, 4).map((tag, idx) => (
              <span
                key={idx}
                className="rounded-md bg-white/5 px-1.5 py-0.5 text-[10px] font-medium text-slate-400"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Footer Action Bar */}
      <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          {/* Copy summary */}
          <button
            onClick={handleCopy}
            title={t('copy_dossier')}
            className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs text-slate-300 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            <span className="text-[11px] hidden sm:inline">{copied ? (language === 'ar' ? 'تم النسخ' : 'Copied') : (language === 'ar' ? 'نسخ' : 'Copy')}</span>
          </button>

          {/* Derivate variations dropdown */}
          {onDerivate && (
            <div className="relative">
              <button
                onClick={() => setShowDerivateMenu(!showDerivateMenu)}
                title={t('derivate_title')}
                className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs text-slate-300 hover:border-amber-500/40 hover:text-amber-300 transition-colors cursor-pointer"
              >
                <GitFork className="h-3.5 w-3.5" />
                <span className="text-[11px] hidden sm:inline">{language === 'ar' ? 'اشتقاق' : 'Fork'}</span>
              </button>

              {showDerivateMenu && (
                <div
                  className={`absolute bottom-full mb-1 z-30 w-44 rounded-xl border border-white/15 bg-slate-900 p-1.5 shadow-xl backdrop-blur-xl ${
                    isRtl ? 'right-0' : 'left-0'
                  }`}
                >
                  <button
                    onClick={() => {
                      onDerivate(idea, 'bolder');
                      setShowDerivateMenu(false);
                    }}
                    className="w-full text-right rtl:text-right ltr:text-left rounded-lg px-2.5 py-1.5 text-xs text-amber-200 hover:bg-amber-500/20 cursor-pointer"
                  >
                    🚀 {t('derivate_bolder')}
                  </button>
                  <button
                    onClick={() => {
                      onDerivate(idea, 'safer');
                      setShowDerivateMenu(false);
                    }}
                    className="w-full text-right rtl:text-right ltr:text-left rounded-lg px-2.5 py-1.5 text-xs text-emerald-200 hover:bg-emerald-500/20 cursor-pointer"
                  >
                    🛡️ {t('derivate_safer')}
                  </button>
                  <button
                    onClick={() => {
                      onDerivate(idea, 'pivot');
                      setShowDerivateMenu(false);
                    }}
                    className="w-full text-right rtl:text-right ltr:text-left rounded-lg px-2.5 py-1.5 text-xs text-sky-200 hover:bg-sky-500/20 cursor-pointer"
                  >
                    🔄 {t('derivate_saas')}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Delete button */}
          {onDelete && (
            <button
              onClick={() => onDelete(idea.id)}
              title={t('delete')}
              className="rounded-lg p-1.5 text-slate-500 hover:bg-rose-500/10 hover:text-rose-400 transition-colors cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Open details link */}
        <Link
          to={`/idea/${idea.id}`}
          className="flex items-center gap-1 text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors cursor-pointer"
        >
          <span>{t('open_idea')}</span>
          {isRtl ? <ArrowLeft className="h-3.5 w-3.5" /> : <ArrowRight className="h-3.5 w-3.5" />}
        </Link>
      </div>
    </div>
  );
};
