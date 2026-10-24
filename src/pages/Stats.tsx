import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, Star, Zap, History, Archive, ArrowRight, ArrowLeft } from 'lucide-react';
import { useI18n } from '../lib/i18n';
import { getVaultStats, getStoredIdeas } from '../lib/storage';
import { DOMAINS, BOLDNESS_LEVELS } from '../lib/domains';
import { DomainKey, Idea } from '../lib/types';

export const Stats: React.FC = () => {
  const { t, language, isRtl } = useI18n();

  const [stats, setStats] = useState(getVaultStats());
  const [ideas, setIdeas] = useState<Idea[]>([]);

  useEffect(() => {
    setStats(getVaultStats());
    setIdeas(getStoredIdeas());
  }, []);

  const starredIdeas = ideas.filter((i) => i.starred);

  // Find max count for domain bar scaling
  const maxDomainCount = Math.max(1, ...Object.values(stats.domainCounts));

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-black text-white sm:text-3xl">
          {t('stats_title')}
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-300">
          {language === 'ar'
            ? 'نظرة خاطفة على مدار أفكارك — مقاييس النمو، توزيع القطاعات، ومؤشرات الجاهزية.'
            : 'Bird’s-eye perspective on your idea orbit — growth metrics, sector breakdown, and readiness.'}
        </p>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-white/10 bg-[#0d121c] p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">{t('total_ideas')}</span>
            <Archive className="h-4 w-4 text-amber-400" />
          </div>
          <p className="mt-3 text-3xl font-black text-white">{stats.totalIdeas}</p>
          <span className="text-[11px] text-slate-500 mt-1 block">
            {language === 'ar' ? 'محفوظة في الخزانة' : 'Stored in vault'}
          </span>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#0d121c] p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">{t('starred_ideas')}</span>
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
          </div>
          <p className="mt-3 text-3xl font-black text-amber-300">{stats.starredIdeas}</p>
          <span className="text-[11px] text-slate-500 mt-1 block">
            {language === 'ar' ? 'مرشحة للأولوية' : 'High priority candidates'}
          </span>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#0d121c] p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">{t('total_sessions')}</span>
            <History className="h-4 w-4 text-sky-400" />
          </div>
          <p className="mt-3 text-3xl font-black text-sky-300">{stats.totalSessions}</p>
          <span className="text-[11px] text-slate-500 mt-1 block">
            {language === 'ar' ? 'جلسات عصف مكتملة' : 'Exploration runs'}
          </span>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#0d121c] p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">{t('developed_ideas')}</span>
            <Zap className="h-4 w-4 text-emerald-400" />
          </div>
          <p className="mt-3 text-3xl font-black text-emerald-300">{stats.developedIdeas}</p>
          <span className="text-[11px] text-slate-500 mt-1 block">
            {language === 'ar' ? 'ذات خطة تنفيذ' : 'Execution blueprints'}
          </span>
        </div>
      </div>

      {/* Grid: Domain Activity & Starred Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Domain Distribution Chart (7 cols) */}
        <div className="lg:col-span-7 rounded-3xl border border-white/10 bg-[#0d121c] p-6 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-amber-400" />
            <span>{t('most_active_domains')}</span>
          </h3>

          <div className="space-y-3 pt-2">
            {(Object.keys(DOMAINS) as DomainKey[]).map((key) => {
              const domainMeta = DOMAINS[key];
              const count = stats.domainCounts[key] || 0;
              const percentage = Math.round((count / (stats.totalIdeas || 1)) * 100);
              const barWidth = Math.max(4, Math.round((count / maxDomainCount) * 100));

              return (
                <div key={key} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-300">
                      {language === 'ar' ? domainMeta.labelAr : domainMeta.labelEn}
                    </span>
                    <span className="font-mono text-slate-400">
                      {count} ({percentage}%)
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${barWidth}%`,
                        backgroundColor: domainMeta.color,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Starred Ideas Showcase (5 cols) */}
        <div className="lg:col-span-5 rounded-3xl border border-white/10 bg-[#0d121c] p-6 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            <span>{language === 'ar' ? 'أبرز الأفكار المميزة في خزانتك' : 'Starred Showcase'}</span>
          </h3>

          {starredIdeas.length > 0 ? (
            <div className="space-y-3">
              {starredIdeas.slice(0, 5).map((idea) => {
                const domain = DOMAINS[idea.domain] || DOMAINS.tech;
                return (
                  <Link
                    key={idea.id}
                    to={`/idea/${idea.id}`}
                    className="group block rounded-2xl border border-white/5 bg-slate-900/60 p-3.5 hover:border-amber-500/40 hover:bg-slate-900 transition-all cursor-pointer"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors line-clamp-1">
                        {idea.title}
                      </h4>
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400 shrink-0" />
                    </div>
                    <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-400">
                      <span>{language === 'ar' ? domain.labelAr : domain.labelEn}</span>
                      <span className="flex items-center gap-1 text-amber-400 text-[10px]">
                        <span>{language === 'ar' ? 'عرض الفكرة' : 'View'}</span>
                        {isRtl ? <ArrowLeft className="h-2.5 w-2.5" /> : <ArrowRight className="h-2.5 w-2.5" />}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="py-10 text-center text-xs text-slate-400">
              {language === 'ar'
                ? 'اضغط على رمز النجمة في أي فكرة لإضافتها هنا إلى قائمتك المميزة.'
                : 'Star any idea to pin it here as a priority highlight.'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
