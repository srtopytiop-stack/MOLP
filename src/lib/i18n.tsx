import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getStoredLanguage, setStoredLanguage } from './storage';

type Language = 'ar' | 'en';

interface Translations {
  [key: string]: {
    ar: string;
    en: string;
  };
}

const TRANSLATIONS: Translations = {
  app_title: {
    ar: 'الثقب الأسود',
    en: 'Black Hole',
  },
  app_subtitle: {
    ar: 'استوديو خلق الأفكار والعقل الاصطناعي',
    en: 'Idea Creation Studio & Cognitive AI',
  },
  nav_generator: {
    ar: 'المولّد',
    en: 'Generator',
  },
  nav_brain: {
    ar: 'عقل الثقب الأسود',
    en: 'Cognitive Brain',
  },
  nav_vault: {
    ar: 'خزانة الأفكار',
    en: 'Vault',
  },
  nav_sessions: {
    ar: 'جلسات الاستكشاف',
    en: 'Sessions',
  },
  nav_stats: {
    ar: 'الإحصاءات',
    en: 'Analytics',
  },
  hero_badge: {
    ar: 'محرك الجذب الفكري الفائق',
    en: 'Hyper-Velocity Idea Engine',
  },
  hero_title: {
    ar: 'ما الفكرة التي تبحث عنها؟',
    en: 'What Breakthrough Idea Are You Seeking?',
  },
  hero_desc: {
    ar: 'حوّل أي موضوع أو تحدٍ إلى أفكار استثمارية دقيقة جاهزة للتنفيذ، مدعومة بتفكير ريادي متقدم وحفظ فوري دائم.',
    en: 'Transform any topic or challenge into actionable venture ideas with real entrepreneurial depth and instant zero-loss persistence.',
  },
  topic_label: {
    ar: 'الموضوع أو التحدي',
    en: 'Topic or Challenge',
  },
  topic_placeholder: {
    ar: 'اكتب موضوعاً، مشكلة، أو قطاعاً... مثال: منصة ذكاء اصطناعي لتمويل سلاسل الإمداد',
    en: 'Type a topic, problem, or industry... e.g. AI-driven supply chain financing platform',
  },
  quick_sparks: {
    ar: 'إشعالات سريعة:',
    en: 'Quick Sparks:',
  },
  domain_label: {
    ar: 'القطاع والمجال',
    en: 'Domain & Industry',
  },
  boldness_label: {
    ar: 'درجة الجرأة',
    en: 'Boldness Level',
  },
  count_label: {
    ar: 'عدد الأفكار',
    en: 'Idea Count',
  },
  generate_btn: {
    ar: 'ولّد الأفكار الآن',
    en: 'Generate Ideas Now',
  },
  generating_btn: {
    ar: 'المحرك يفكر ويجذب الأفكار...',
    en: 'Synthesizing ideas from the event horizon...',
  },
  event_horizon_waiting: {
    ar: 'أفق الحدث بانتظار شرارتك الأولى',
    en: 'The Event Horizon Awaits Your Spark',
  },
  event_horizon_hint: {
    ar: 'اكتب موضوعاً واضغط «ولّد الأفكار» — ستتبلور الأفكار هنا لحظة بلحظة وتُحفظ تلقائياً في خزانتك دون أي فقدان.',
    en: 'Type a topic and click "Generate Ideas" — ideas will crystallize here in real-time and save to your vault instantly.',
  },
  vault_title: {
    ar: 'خزانة الأفكار',
    en: 'Idea Vault',
  },
  vault_desc: {
    ar: 'كل ما انجذب إلى مدارك — ابحث، فلتر، طوّر، ونفّذ.',
    en: 'All ideas pulled into your orbit — search, filter, develop, and execute.',
  },
  search_placeholder: {
    ar: 'ابحث في العناوين والوصف والوسوم...',
    en: 'Search in titles, descriptions, and tags...',
  },
  all_domains: {
    ar: 'كل المجالات',
    en: 'All Domains',
  },
  all_statuses: {
    ar: 'كل الحالات',
    en: 'All Statuses',
  },
  starred_only: {
    ar: 'المميزة فقط',
    en: 'Starred Only',
  },
  status_seed: {
    ar: 'بذرة',
    en: 'Seed',
  },
  status_in_progress: {
    ar: 'قيد التطوير',
    en: 'In Progress',
  },
  status_developed: {
    ar: 'مكتملة التخطيط',
    en: 'Developed',
  },
  status_archived: {
    ar: 'مؤرشفة',
    en: 'Archived',
  },
  why_now: {
    ar: 'لماذا الآن؟',
    en: 'Why Now?',
  },
  first_step: {
    ar: 'أول خطوة (48 ساعة)',
    en: 'First Step (48h)',
  },
  open_idea: {
    ar: 'افتح تفاصيل الفكرة',
    en: 'Open Idea Details',
  },
  back_to_vault: {
    ar: 'رجوع إلى الخزانة',
    en: 'Back to Vault',
  },
  delete: {
    ar: 'حذف',
    en: 'Delete',
  },
  copy_dossier: {
    ar: 'نسخ ملخص الفكرة',
    en: 'Copy Idea Dossier',
  },
  notes_title: {
    ar: 'ملاحظاتك وخطتك الشخصية',
    en: 'Personal Notes & Strategy',
  },
  notes_placeholder: {
    ar: 'اكتب أفكارك وملاحظاتك الإضافية هنا... تُحفظ تلقائياً فور كتابتها.',
    en: 'Add your strategic notes and next steps here... auto-saved instantly.',
  },
  evaluation_title: {
    ar: 'تقييم الجدوى والميزة التنافسية',
    en: 'Feasibility & Competitive Moat',
  },
  dev_plan_title: {
    ar: 'خارطة التنفيذ ثلاثية المراحل',
    en: '3-Phase Execution Roadmap',
  },
  derivate_title: {
    ar: 'توليد نسخ مشتقة ومحاور بديلة',
    en: 'Derive Alternate Variations',
  },
  derivate_bolder: {
    ar: 'نسخة أكثر جرأة',
    en: 'Bolder Variant',
  },
  derivate_safer: {
    ar: 'نسخة أكثر أماناً',
    en: 'Safer Variant',
  },
  derivate_saas: {
    ar: 'محور SaaS متكرر',
    en: 'SaaS Pivot',
  },
  brain_title: {
    ar: 'عقل الثقب الأسود المفكر',
    en: 'The Black Hole Cognitive Brain',
  },
  brain_subtitle: {
    ar: 'محرك تفكير تحليلي استراتيجي يفكك المشكلات، يعيد ربط القطاعات، ويكشف الفرص الاستثمارية غير المرئية.',
    en: 'Strategic deep reasoning engine: breaks down problems, cross-pollinates sectors, and discovers hidden market voids.',
  },
  brain_mode_reasoning: {
    ar: 'التفكير التحليلي العميق (5 مراحل)',
    en: 'Deep 5-Phase Reasoning',
  },
  brain_mode_matrix: {
    ar: 'مصفوفة دمج المفاهيم (Cross-Pollination)',
    en: 'Concept Fusion Matrix',
  },
  matrix_concept_a: {
    ar: 'المفهوم الأول (المجال أو التحدي)',
    en: 'Concept A (Industry / Challenge)',
  },
  matrix_concept_b: {
    ar: 'المفهوم الثاني (التقنية أو الآلية المحفزة)',
    en: 'Concept B (Catalyst Mechanism)',
  },
  matrix_fuse_btn: {
    ar: 'ادمج المفهومين واصنع فئة جديدة',
    en: 'Fuse Concepts & Carve New Category',
  },
  stats_title: {
    ar: 'إحصاءات الخزانة ونشاط الأفكار',
    en: 'Vault Analytics & Momentum',
  },
  total_ideas: {
    ar: 'إجمالي الأفكار',
    en: 'Total Ideas',
  },
  starred_ideas: {
    ar: 'الأفكار المميزة',
    en: 'Starred Ideas',
  },
  developed_ideas: {
    ar: 'أفكار قيد التنفيذ',
    en: 'Developed Plans',
  },
  total_sessions: {
    ar: 'جلسات التوليد',
    en: 'Exploration Sessions',
  },
  most_active_domains: {
    ar: 'أكثر المجالات نشاطاً في خزانتك',
    en: 'Most Active Domains',
  },
};

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string) => string;
  isRtl: boolean;
}

const I18nContext = createContext<I18nContextType | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLangState] = useState<Language>(() => getStoredLanguage());

  const setLanguage = (lang: Language) => {
    setLangState(lang);
    setStoredLanguage(lang);
  };

  const toggleLanguage = () => {
    const next = language === 'ar' ? 'en' : 'ar';
    setLanguage(next);
  };

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  }, [language]);

  const t = (key: string): string => {
    if (!TRANSLATIONS[key]) {
      return key;
    }
    return TRANSLATIONS[key][language] || TRANSLATIONS[key].ar || key;
  };

  return (
    <I18nContext.Provider
      value={{
        language,
        setLanguage,
        toggleLanguage,
        t,
        isRtl: language === 'ar',
      }}
    >
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within LanguageProvider');
  }
  return context;
}
