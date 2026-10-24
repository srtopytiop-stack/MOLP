import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { History, Calendar, Sparkles, Trash2, ArrowLeft, ArrowRight, Orbit } from 'lucide-react';
import { useI18n } from '../lib/i18n';
import { SessionRecord, Idea } from '../lib/types';
import { DOMAINS, BOLDNESS_LEVELS } from '../lib/domains';
import { getStoredSessions, deleteSession, getStoredIdeas, toggleStarIdea, updateIdeaStatus, deleteIdea } from '../lib/storage';
import { IdeaCard } from '../components/IdeaCard';

export const Sessions: React.FC = () => {
  const { t, language, isRtl } = useI18n();

  const [sessions, setSessions] = useState<SessionRecord[]>([]);
  const [selectedSession, setSelectedSession] = useState<SessionRecord | null>(null);
  const [ideas, setIdeas] = useState<Idea[]>([]);

  useEffect(() => {
    const loadedSessions = getStoredSessions();
    setSessions(loadedSessions);
    if (loadedSessions.length > 0) {
      setSelectedSession(loadedSessions[0]);
    }
    setIdeas(getStoredIdeas());
  }, []);

  const handleDeleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteSession(id);
    const updated = getStoredSessions();
    setSessions(updated);
    if (selectedSession?.id === id) {
      setSelectedSession(updated[0] || null);
    }
  };

  const currentSessionIdeas = React.useMemo(() => {
    if (!selectedSession) return [];
    const allIdeas = getStoredIdeas();
    return allIdeas.filter((idea) =>
      selectedSession.idea_ids?.includes(idea.id) || idea.topic === selectedSession.topic
    );
  }, [selectedSession, ideas]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white sm:text-3xl">
          {t('nav_sessions')}
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-300">
          {language === 'ar'
            ? 'سجل جلسات التوليد السابقة — كل جلسة تحفظ مواضيعها وتسترجع أفكارها بدقة دون ضياع.'
            : 'History of idea exploration sessions — each run is permanently tracked and recoverable.'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Sessions list (4 columns on lg) */}
        <div className="lg:col-span-4 rounded-3xl border border-white/10 bg-[#0d121c] p-4 shadow-xl space-y-2.5">
          <div className="flex items-center justify-between pb-2 border-b border-white/10 px-2">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <History className="h-3.5 w-3.5 text-amber-400" />
              <span>{language === 'ar' ? 'الجلسات المسجلة' : 'Recorded Sessions'}</span>
            </span>
            <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] font-mono text-slate-300">
              {sessions.length}
            </span>
          </div>

          {sessions.length > 0 ? (
            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
              {sessions.map((session) => {
                const isSelected = selectedSession?.id === session.id;
                const domainMeta = DOMAINS[session.domain] || DOMAINS.tech;
                const dateStr = new Date(session.created_at).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', {
                  month: 'short',
                  day: 'numeric',
                });

                return (
                  <div
                    key={session.id}
                    onClick={() => setSelectedSession(session)}
                    className={`group relative rounded-2xl border p-3.5 transition-all cursor-pointer ${
                      isSelected
                        ? 'border-amber-500/50 bg-amber-500/10 shadow-[0_0_20px_rgba(245,158,11,0.15)]'
                        : 'border-white/5 bg-slate-900/60 hover:border-white/20 hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-xs font-bold text-white line-clamp-2">
                        {session.topic}
                      </h4>
                      <button
                        onClick={(e) => handleDeleteSession(session.id, e)}
                        title={t('delete')}
                        className="rounded-lg p-1 text-slate-500 hover:bg-rose-500/20 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>

                    <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-400">
                      <span className="rounded bg-white/5 px-1.5 py-0.5 text-[10px]">
                        {language === 'ar' ? domainMeta.labelAr : domainMeta.labelEn}
                      </span>
                      <span>
                        {session.ideas_count} {language === 'ar' ? 'أفكار' : 'ideas'} · {dateStr}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-slate-500">
              {language === 'ar' ? 'لا توجد جلسات مسجلة بعد.' : 'No sessions recorded yet.'}
            </div>
          )}
        </div>

        {/* Right: Selected Session Details & Ideas (8 columns on lg) */}
        <div className="lg:col-span-8">
          {selectedSession ? (
            <div className="space-y-6">
              {/* Session Overview Card */}
              <div className="rounded-3xl border border-white/10 bg-[#0d121c] p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider block mb-1">
                    SESSION #{selectedSession.id.slice(-6)}
                  </span>
                  <h2 className="text-lg font-bold text-white">
                    {selectedSession.topic}
                  </h2>
                  <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-300">
                    <span className="rounded-lg border border-white/10 bg-slate-900 px-2 py-0.5">
                      {language === 'ar' ? DOMAINS[selectedSession.domain]?.labelAr : DOMAINS[selectedSession.domain]?.labelEn}
                    </span>
                    <span className="rounded-lg border border-white/10 bg-slate-900 px-2 py-0.5">
                      {language === 'ar' ? BOLDNESS_LEVELS[selectedSession.boldness]?.badgeAr : BOLDNESS_LEVELS[selectedSession.boldness]?.badgeEn}
                    </span>
                    <span className="text-slate-400 flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(selectedSession.created_at).toLocaleString(language === 'ar' ? 'ar-SA' : 'en-US')}
                    </span>
                  </div>
                </div>

                <Link
                  to={`/?topic=${encodeURIComponent(selectedSession.topic)}&domain=${selectedSession.domain}`}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-2.5 text-xs font-bold text-amber-300 hover:bg-amber-500 hover:text-black transition-all cursor-pointer self-start sm:self-auto"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>{language === 'ar' ? 'أعد الاستكشاف في المولّد' : 'Re-explore in Studio'}</span>
                </Link>
              </div>

              {/* Ideas from this session */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Orbit className="h-4 w-4 text-amber-400" />
                  <span>
                    {language === 'ar' ? 'الأفكار المرتبطة بهذه الجلسة' : 'Ideas Spawned in This Session'}
                  </span>
                  <span className="rounded-full bg-slate-800 px-2 py-0.5 text-xs font-mono text-slate-300">
                    {currentSessionIdeas.length}
                  </span>
                </h3>

                {currentSessionIdeas.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {currentSessionIdeas.map((idea) => (
                      <IdeaCard
                        key={idea.id}
                        idea={idea}
                        onToggleStar={(id) => {
                          toggleStarIdea(id);
                          setIdeas(getStoredIdeas());
                        }}
                        onUpdateStatus={(id, s) => {
                          updateIdeaStatus(id, s);
                          setIdeas(getStoredIdeas());
                        }}
                        onDelete={(id) => {
                          deleteIdea(id);
                          setIdeas(getStoredIdeas());
                        }}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-white/5 bg-slate-900/30 p-8 text-center text-xs text-slate-400">
                    {language === 'ar'
                      ? 'تم حذف الأفكار الفردية لهذه الجلسة أو أصبحت غير متوفرة.'
                      : 'The specific ideas for this session were archived or deleted.'}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="rounded-3xl border border-white/10 bg-[#0d121c] p-12 text-center text-slate-400 text-xs">
              {language === 'ar' ? 'اختر جلسة من القائمة لعرض تفاصيلها' : 'Select a session to view details'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
