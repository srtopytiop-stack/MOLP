import { DomainKey, BoldnessKey } from './types';

export interface DomainMeta {
  key: DomainKey;
  labelAr: string;
  labelEn: string;
  descAr: string;
  descEn: string;
  color: string;
  gradient: string;
}

export const DOMAINS: Record<DomainKey, DomainMeta> = {
  tech: {
    key: 'tech',
    labelAr: 'تقنية وذكاء اصطناعي',
    labelEn: 'Tech & AI',
    descAr: 'برمجيات ذكية، أتمتة، خوارزميات ومنصات سحابية',
    descEn: 'AI agents, automation, SaaS, and cloud platforms',
    color: '#38bdf8',
    gradient: 'from-sky-500/20 to-blue-600/10',
  },
  business: {
    key: 'business',
    labelAr: 'أعمال ونماذج ربح',
    labelEn: 'Business & SaaS',
    descAr: 'خدمات B2B، تسعير اشتراكات، منصات وساطة وإيرادات متكررة',
    descEn: 'B2B services, subscriptions, marketplaces, recurring revenue',
    color: '#fbbf24',
    gradient: 'from-amber-500/20 to-yellow-600/10',
  },
  sustainability: {
    key: 'sustainability',
    labelAr: 'استدامة وطاقة خضراء',
    labelEn: 'Sustainability & GreenTech',
    descAr: 'إعادة تدوير، طاقة متجددة، تقليل الهدر وزراعة ذكية',
    descEn: 'Circular economy, cleantech, waste reduction, agri-tech',
    color: '#34d399',
    gradient: 'from-emerald-500/20 to-teal-600/10',
  },
  health: {
    key: 'health',
    labelAr: 'صحة ورعاية حيوية',
    labelEn: 'Health & BioTech',
    descAr: 'صحة نفسية، لياقة، تشخيص مبكر ورعاية وقائية',
    descEn: 'Mental wellness, telemedicine, diagnostics, longevity',
    color: '#f43f5e',
    gradient: 'from-rose-500/20 to-pink-600/10',
  },
  edtech: {
    key: 'edtech',
    labelAr: 'تعليم وتأهيل مهني',
    labelEn: 'EdTech & Skills',
    descAr: 'تخصيص التعلم، محاكاة المهارات والتدريب التفاعلي',
    descEn: 'Personalized micro-learning, gamification, skill labs',
    color: '#a855f7',
    gradient: 'from-purple-500/20 to-indigo-600/10',
  },
  creator: {
    key: 'creator',
    labelAr: 'إعلام واقتصاد المبدعين',
    labelEn: 'Creator Economy & Media',
    descAr: 'أدوات الإنتاج الرقمي، التوزيع، المنصات الصوتية والمحتوى',
    descEn: 'Monetization, interactive audio, video tooling, newsletters',
    color: '#ec4899',
    gradient: 'from-pink-500/20 to-rose-600/10',
  },
  ecommerce: {
    key: 'ecommerce',
    labelAr: 'تجارة وسلاسل إمداد',
    labelEn: 'E-Commerce & Supply',
    descAr: 'لوجستيات فائقة السرعة، تجارة مجتمعية وتكامل نقاط البيع',
    descEn: 'Hyperlocal delivery, social commerce, inventory intelligence',
    color: '#f97316',
    gradient: 'from-orange-500/20 to-amber-600/10',
  },
  social: {
    key: 'social',
    labelAr: 'ابتكار مجتمعي وثقافي',
    labelEn: 'Social & Cultural',
    descAr: 'حلول الإسكان، التكافل، حفظ التراث وتواصل المجتمعات',
    descEn: 'Civic tech, heritage preservation, community networks',
    color: '#06b6d4',
    gradient: 'from-cyan-500/20 to-sky-600/10',
  },
};

export interface BoldnessMeta {
  key: BoldnessKey;
  labelAr: string;
  labelEn: string;
  badgeAr: string;
  badgeEn: string;
  descAr: string;
  descEn: string;
  badgeClass: string;
}

export const BOLDNESS_LEVELS: Record<BoldnessKey, BoldnessMeta> = {
  safe: {
    key: 'safe',
    labelAr: 'آمنة وقابلة للتنفيذ الفوري',
    labelEn: 'Safe & Immediate Execution',
    badgeAr: 'آمنة',
    badgeEn: 'Safe',
    descAr: 'مخاطرة منخفضة، نموذج عمل مجرب، تكلفة بدء ضئيلة',
    descEn: 'Low risk, proven market, minimal startup capital',
    badgeClass: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
  },
  realistic: {
    key: 'realistic',
    labelAr: 'واقعية ذات ميزة تنافسية',
    labelEn: 'Realistic with Edge',
    badgeAr: 'واقعية',
    badgeEn: 'Realistic',
    descAr: 'توازن ذكي بين الجدوى والابتكار العملي',
    descEn: 'Solid feasibility with clear market differentiation',
    badgeClass: 'bg-blue-500/10 text-blue-300 border-blue-500/30',
  },
  bold: {
    key: 'bold',
    labelAr: 'جريئة وتغير قواعد اللعبة',
    labelEn: 'Bold & Game-changing',
    badgeAr: 'جريئة',
    badgeEn: 'Bold',
    descAr: 'تتحدى الوضع الراهن وتخلق فئات جديدة في السوق',
    descEn: 'Challenges incumbents and carves new market categories',
    badgeClass: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
  },
  revolutionary: {
    key: 'revolutionary',
    labelAr: 'ثورية ذات أثر هائل',
    labelEn: 'Revolutionary & Moonshot',
    badgeAr: 'ثورية',
    badgeEn: 'Revolutionary',
    descAr: 'طموح استثنائي، تعيد هندسة قطاع كامل بالكامل',
    descEn: 'Radical ambition re-engineering an entire industry',
    badgeClass: 'bg-purple-500/10 text-purple-300 border-purple-500/30',
  },
  scifi: {
    key: 'scifi',
    labelAr: 'مستقبلية خيالية',
    labelEn: 'Sci-Fi & Future Horizons',
    badgeAr: 'مستقبلية',
    badgeEn: 'Sci-Fi',
    descAr: 'رؤية لعام 2035 تعتمد على تقنيات ناشئة وأفكار غير مسبوقة',
    descEn: '2035 vision pushing technological and scientific boundaries',
    badgeClass: 'bg-rose-500/10 text-rose-300 border-rose-500/30',
  },
};

export const QUICK_PROMPTS = [
  { ar: 'تعليم بالذكاء الاصطناعي', en: 'AI-Powered Education', domain: 'edtech' as DomainKey },
  { ar: 'حلول الاستدامة للمطاعم', en: 'Restaurant Sustainability Tech', domain: 'sustainability' as DomainKey },
  { ar: 'أدوات للمستقلين العرب', en: 'SaaS for Freelancers & Solopreneurs', domain: 'business' as DomainKey },
  { ar: 'منصة ذكاء اصطناعي لتمويل سلاسل الإمداد', en: 'AI Supply Chain Financing', domain: 'tech' as DomainKey },
  { ar: 'طبيب نفسي ذكي للوقاية المبكرة', en: 'Preventive AI Mental Wellness', domain: 'health' as DomainKey },
  { ar: 'سوق تداول الهوية السمعية والمؤثرات', en: 'Sonic Branding & Audio Asset Hub', domain: 'creator' as DomainKey },
  { ar: 'مزارع عمودية ذكية داخل الأحياء', en: 'Hyperlocal Vertical Urban Farming', domain: 'sustainability' as DomainKey },
  { ar: 'بنك تبادل المهارات والخبرات النادرة', en: 'Time-bank for Rare Skills', domain: 'social' as DomainKey },
];

export const MATRIX_PRESETS = [
  { conceptA: 'المقاهي المختصة', conceptB: 'الذكاء الاصطناعي التوليدي' },
  { conceptA: 'زراعة النخيل والمزارع العائلية', conceptB: 'إنترنت الأشياء وأسواق الكربون' },
  { conceptA: 'الصحة النفسية للمراهقين', conceptB: 'ألعاب الفيديو التعاونية' },
  { conceptA: 'العقود القانونية للمستقلين', conceptB: 'العقود الذكية المؤتمتة باللغة الطبيعية' },
  { conceptA: 'إعادة تدوير مخلفات البناء', conceptB: 'الطباعة ثلاثية الأبعاد للمباني الاقتصادية' },
];
