import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider, useI18n } from './lib/i18n';
import { Navbar } from './components/Navbar';
import { Studio } from './pages/Studio';
import { BrainPage } from './pages/BrainPage';
import { Vault } from './pages/Vault';
import { Sessions } from './pages/Sessions';
import { Stats } from './pages/Stats';
import { IdeaDetail } from './pages/IdeaDetail';
import { QUICK_PROMPTS } from './lib/domains';
import { Sparkles, X, Orbit } from 'lucide-react';

function MainAppShell() {
  const { t, language, isRtl } = useI18n();
  const [inspireModal, setInspireModal] = useState(false);
  const [randomSpark, setRandomSpark] = useState<(typeof QUICK_PROMPTS)[0] | null>(null);

  const handleOpenInspire = () => {
    const spark = QUICK_PROMPTS[Math.floor(Math.random() * QUICK_PROMPTS.length)];
    setRandomSpark(spark);
    setInspireModal(true);
  };

  return (
    <div className="relative min-h-screen max-w-full overflow-x-hidden bg-[#07090e] text-slate-100 flex flex-col font-sans selection:bg-amber-500/30 selection:text-amber-200">
      {/* Background Cosmic Effects */}
      <div className="fixed inset-0 pointer-events-none -z-10 space-grid opacity-60" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] accretion-glow pointer-events-none -z-10" />

      {/* Navigation Header */}
      <Navbar onQuickInspire={handleOpenInspire} />

      {/* Main Page Content */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
        <Routes>
          <Route path="/" element={<Studio />} />
          <Route path="/brain" element={<BrainPage />} />
          <Route path="/vault" element={<Vault />} />
          <Route path="/sessions" element={<Sessions />} />
          <Route path="/stats" element={<Stats />} />
          <Route path="/idea/:id" element={<IdeaDetail />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-[#06080d] py-6 text-center text-xs text-slate-500">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Orbit className="h-4 w-4 text-amber-500" />
            <span className="font-bold text-slate-400">BLACK-HOLE</span>
            <span>·</span>
            <span>{t('app_subtitle')}</span>
          </div>
          <div className="flex items-center gap-4 text-slate-500">
            <span>{language === 'ar' ? 'فائق السرعة والموثوقية · حفظ دائم محلياً وسحابياً' : 'Zero-loss Persistence · High-Velocity AI'}</span>
          </div>
        </div>
      </footer>

      {/* Quick Inspire Modal */}
      {inspireModal && randomSpark && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md rounded-3xl border border-amber-500/30 bg-[#0f1523] p-6 shadow-2xl">
            <button
              onClick={() => setInspireModal(false)}
              className="absolute top-4 right-4 rtl:right-auto rtl:left-4 rounded-xl p-1.5 text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-2 text-xs font-bold text-amber-400 mb-3">
              <Sparkles className="h-4 w-4" />
              <span>{language === 'ar' ? 'شرارة إلهام خاطفة من الثقب الأسود' : 'Instant Spark from Black Hole'}</span>
            </div>

            <h3 className="text-lg font-black text-white">
              {language === 'ar' ? randomSpark.ar : randomSpark.en}
            </h3>

            <p className="mt-2 text-xs text-slate-300 leading-relaxed">
              {language === 'ar'
                ? 'فكرة جاهزة للانطلاق يمكنك استكشافها في المولّد أو فحصها في عقل الثقب الأسود المفكر.'
                : 'A high-impact idea waiting for discovery. Explore it in the studio or deconstruct it in the cognitive brain.'}
            </p>

            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                onClick={handleOpenInspire}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white cursor-pointer"
              >
                {language === 'ar' ? 'شرارة أخرى' : 'Another Spark'}
              </button>
              <a
                href={`/?topic=${encodeURIComponent(language === 'ar' ? randomSpark.ar : randomSpark.en)}&domain=${randomSpark.domain}`}
                onClick={() => setInspireModal(false)}
                className="rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-black hover:bg-amber-400 transition-all cursor-pointer shadow-[0_0_15px_rgba(245,158,11,0.3)]"
              >
                {language === 'ar' ? 'انطلق بهذه الفكرة' : 'Launch with this Idea'}
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <MainAppShell />
      </LanguageProvider>
    </BrowserRouter>
  );
}
