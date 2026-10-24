import React, { useState, useEffect, useMemo } from 'react';
import { Search, Download, Star, Filter, Sparkles, FolderDown } from 'lucide-react';
import { useI18n } from '../lib/i18n';
import { Idea, DomainKey, BoldnessKey, IdeaStatus } from '../lib/types';
import { DOMAINS, BOLDNESS_LEVELS } from '../lib/domains';
import { getStoredIdeas, toggleStarIdea, updateIdeaStatus, deleteIdea, saveMultipleIdeas } from '../lib/storage';
import { IdeaCard } from '../components/IdeaCard';

export const Vault: React.FC = () => {
  const { t, language, isRtl } = useI18n();

  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [search, setSearch] = useState('');
  const [selectedDomain, setSelectedDomain] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [onlyStarred, setOnlyStarred] = useState(false);

  useEffect(() => {
    setIdeas(getStoredIdeas());
  }, []);

  const handleToggleStar = (id: string) => {
    toggleStarIdea(id);
    setIdeas(getStoredIdeas());
  };

  const handleUpdateStatus = (id: string, status: IdeaStatus) => {
    updateIdeaStatus(id, status);
    setIdeas(getStoredIdeas());
  };

  const handleDelete = (id: string) => {
    deleteIdea(id);
    setIdeas(getStoredIdeas());
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
          setIdeas(getStoredIdeas());
        }
      }
    } catch {
      // fallback
    }
  };

  const filteredIdeas = useMemo(() => {
    return ideas.filter((idea) => {
      if (onlyStarred && !idea.starred) return false;
      if (selectedDomain !== 'all' && idea.domain !== selectedDomain) return false;
      if (selectedStatus !== 'all' && idea.status !== selectedStatus) return false;
      if (search.trim()) {
        const query = search.toLowerCase();
        const matchTitle = idea.title.toLowerCase().includes(query);
        const matchDesc = idea.description.toLowerCase().includes(query);
        const matchTopic = idea.topic?.toLowerCase().includes(query);
        const matchTags = idea.tags?.some((tag) => tag.toLowerCase().includes(query));
        if (!matchTitle && !matchDesc && !matchTopic && !matchTags) return false;
      }
      return true;
    });
  }, [ideas, search, selectedDomain, selectedStatus, onlyStarred]);

  const exportToJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(ideas, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `black-hole-vault-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const exportToMarkdown = () => {
    let md = `# خزانة أفكار الثقب الأسود - Black Hole Idea Vault\n\n`;
    md += `*تاريخ التصدير: ${new Date().toLocaleString()}* — إجمالي الأفكار: ${ideas.length}\n\n---\n\n`;

    ideas.forEach((idea, idx) => {
      md += `### ${idx + 1}. ${idea.title}\n`;
      md += `- **المجال / Domain:** ${idea.domain} | **درجة الجرأة:** ${idea.boldness} | **الحالة:** ${idea.status}\n`;
      md += `- **الوصف:** ${idea.description}\n`;
      md += `- **لماذا الآن؟** ${idea.why_now}\n`;
      md += `- **أول خطوة في 48 ساعة:** ${idea.first_step}\n`;
      if (idea.tags && idea.tags.length > 0) {
        md += `- **الوسوم:** ${idea.tags.join(' ')}\n`;
      }
      if (idea.notes) {
        md += `- **ملاحظات شخصية:** ${idea.notes}\n`;
      }
      md += `\n---\n\n`;
    });

    const dataStr = 'data:text/markdown;charset=utf-8,' + encodeURIComponent(md);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `black-hole-vault-${new Date().toISOString().slice(0, 10)}.md`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6">
      {/* Header with Title & Export Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white sm:text-3xl">
            {t('vault_title')}
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-300">
            {t('vault_desc')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportToJson}
            className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-200 hover:border-amber-500/40 hover:text-white transition-all cursor-pointer"
          >
            <Download className="h-3.5 w-3.5 text-amber-400" />
            <span>JSON</span>
          </button>
          <button
            onClick={exportToMarkdown}
            className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-200 hover:border-amber-500/40 hover:text-white transition-all cursor-pointer"
          >
            <FolderDown className="h-3.5 w-3.5 text-amber-400" />
            <span>Markdown</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-2xl border border-white/10 bg-[#0d121c] p-4 shadow-lg space-y-3">
        <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center">
          {/* Search input */}
          <div className="relative flex-1">
            <Search className={`pointer-events-none absolute top-3 h-4 w-4 text-slate-400 ${isRtl ? 'right-3.5' : 'left-3.5'}`} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('search_placeholder')}
              className={`w-full rounded-xl border border-white/15 bg-slate-900 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-amber-500 ${
                isRtl ? 'pr-10 pl-4' : 'pl-10 pr-4'
              }`}
            />
          </div>

          {/* Domain Filter */}
          <select
            value={selectedDomain}
            onChange={(e) => setSelectedDomain(e.target.value)}
            className="rounded-xl border border-white/15 bg-slate-900 px-3 py-2.5 text-xs text-white outline-none focus:border-amber-500 cursor-pointer"
          >
            <option value="all">{t('all_domains')}</option>
            {Object.values(DOMAINS).map((d) => (
              <option key={d.key} value={d.key}>
                {language === 'ar' ? d.labelAr : d.labelEn}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="rounded-xl border border-white/15 bg-slate-900 px-3 py-2.5 text-xs text-white outline-none focus:border-amber-500 cursor-pointer"
          >
            <option value="all">{t('all_statuses')}</option>
            <option value="seed">{t('status_seed')}</option>
            <option value="in_progress">{t('status_in_progress')}</option>
            <option value="developed">{t('status_developed')}</option>
            <option value="archived">{t('status_archived')}</option>
          </select>

          {/* Starred filter toggle */}
          <button
            onClick={() => setOnlyStarred(!onlyStarred)}
            className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition-all cursor-pointer ${
              onlyStarred
                ? 'border-amber-500/40 bg-amber-500/15 text-amber-300'
                : 'border-white/15 bg-slate-900 text-slate-300 hover:text-white'
            }`}
          >
            <Star className={`h-3.5 w-3.5 ${onlyStarred ? 'fill-amber-400 text-amber-400' : ''}`} />
            <span>{t('starred_only')}</span>
          </button>
        </div>

        {/* Counts summary */}
        <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-white/5">
          <span>
            {language === 'ar'
              ? `عرض ${filteredIdeas.length} من أصل ${ideas.length} فكرة محفوظة`
              : `Showing ${filteredIdeas.length} of ${ideas.length} stored ideas`}
          </span>
          {onlyStarred && (
            <span className="text-amber-400 font-semibold">
              ★ {language === 'ar' ? 'تصفية حسب المميزة' : 'Filtered by Starred'}
            </span>
          )}
        </div>
      </div>

      {/* Ideas Grid */}
      {filteredIdeas.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredIdeas.map((idea) => (
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
      ) : (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-white/10 bg-[#0d121c] p-12 text-center">
          <Sparkles className="h-10 w-10 text-slate-500 mb-3" />
          <h3 className="text-base font-bold text-white">
            {language === 'ar' ? 'لم يتم العثور على أفكار تطابق هذا البحث' : 'No ideas match your current filter'}
          </h3>
          <p className="mt-1 text-xs text-slate-400">
            {language === 'ar'
              ? 'جرّب تعديل الكلمات المفتاحية أو إزالة عوامل التصفية لاستعراض باقي الخزانة.'
              : 'Try adjusting your search terms or clearing filters to reveal more ideas.'}
          </p>
          <button
            onClick={() => {
              setSearch('');
              setSelectedDomain('all');
              setSelectedStatus('all');
              setOnlyStarred(false);
            }}
            className="mt-4 rounded-xl border border-white/15 bg-slate-800 px-4 py-2 text-xs font-semibold text-white hover:border-amber-500 cursor-pointer"
          >
            {language === 'ar' ? 'إعادة ضبط كل الفلاتر' : 'Reset All Filters'}
          </button>
        </div>
      )}
    </div>
  );
};
