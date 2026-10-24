import { Idea, DomainKey, BoldnessKey, IdeaEvaluation, IdeaDevelopmentPlan, IdeaMatrixSynthesis } from './types';

export interface GenerationParams {
  topic: string;
  domain: DomainKey;
  boldness: BoldnessKey;
  count: number;
  language: 'ar' | 'en';
}

/**
 * Creates deterministic ideas based on domain templates and topic keywords
 * Ensures instantaneous, reliable results even with network hiccups or offline use
 */
export function generateLocalFallbackIdeas(params: GenerationParams): Idea[] {
  const { topic, domain, boldness, count, language } = params;
  const isAr = language === 'ar';
  const now = new Date().toISOString();

  const domainKeywords: Record<DomainKey, { ar: string[]; en: string[] }> = {
    tech: {
      ar: ['أتمتة الذكاء الاصطناعي', 'لوحة تحكم فورية', 'خوارزمية ذكية'],
      en: ['AI Automation', 'Real-time Dashboard', 'Smart Engine'],
    },
    business: {
      ar: ['اشتراك شهري متكرر', 'منصة B2B متخصصة', 'تجميع القوة الشرائية'],
      en: ['B2B SaaS Subscription', 'Marketplace Liquidity', 'Procurement Aggregator'],
    },
    sustainability: {
      ar: ['صفر هدر كربوني', 'إعادة تدوير ذكية', 'زراعة مغلقة فائقة الكفاءة'],
      en: ['Zero Waste Loop', 'Clean Energy Micro-grid', 'Indoor Smart Farming'],
    },
    health: {
      ar: ['وقاية استباقية', 'تحليل المؤشرات الحيوية', 'رعاية صحية مخصصة'],
      en: ['Preventive Wellness', 'Biometric Intelligence', 'Personalized Health AI'],
    },
    edtech: {
      ar: ['تعليم موجه حسب وتيرة الطالب', 'محاكاة واقعية للمهارات', 'توأم معرفي شخصي'],
      en: ['Adaptive Micro-learning', 'Skill Simulation Lab', 'Cognitive Learning Twin'],
    },
    creator: {
      ar: ['أصول صوتية وبصرية مرخصة', 'استوديو إنتاج فائق السرعة', 'أتمتة هوية العلامات'],
      en: ['Licensed Digital Assets', 'High-velocity Studio', 'Brand Voice Generator'],
    },
    ecommerce: {
      ar: ['توصيل فائق السرعة في الحي', 'تكامل نقاط البيع والمخزون', 'تجارة اجتماعية ذكية'],
      en: ['Hyperlocal Fulfillment', 'Unified Inventory Sync', 'Social Commerce Hub'],
    },
    social: {
      ar: ['شبكة تكافل وتبادل مجتمعي', 'حفظ التراث الرقمي', 'بنك المهارات التبادلية'],
      en: ['Civic Exchange Network', 'Digital Heritage Archive', 'Skill Time-Banking'],
    },
  };

  const templatesAr = [
    {
      titleSuffix: 'الذكي فائق التخصيص',
      descPattern: (t: string, k: string) =>
        `منصة موجهة لحل مشكلة «${t}» عبر ${k} وتوفير تجربة تشغيلية متكاملة تقلل التكاليف بنسبة 35% وتختصر زمن الإنجاز. تختلف عن البدائل التقليدية بتركيزها على التخصيص الفوري والتكامل مع واتساب والويب.`,
      whyNowPattern: (t: string) =>
        `لأن تكلفة الوصول إلى الجمهور في قطاع «${t}» ارتفعت بشكل كبير، بينما توفر نماذج الذكاء الاصطناعي الحديثة حلاً منخفض التكلفة وعالي الجودة.`,
      firstStepPattern: (t: string) =>
        `أجرِ مقابلة سريعة مع 5 عملاء مستهدفين يعانون من «${t}»، واصنع نموذجاً أولياً يدوياً (No-code / Concierge MVP) لاختبار استعدادهم للاشتراك خلال 48 ساعة.`,
      tag: 'ابتكار_سريع',
    },
    {
      titleSuffix: 'السحابي للمؤسسات والمستقلين',
      descPattern: (t: string, k: string) =>
        `نظام تشغيل سحابي متكامل يخدم رواد الأعمال في مجال «${t}» يعتمد على ${k} ويمنح المستخدم رؤية تنبؤية دقيقة مع توصيات يومية قابلة للتنفيذ المباشر.`,
      whyNowPattern: (t: string) =>
        `انتشار العمل عن بُعد وحاجة الشركات المتوسطة والصغيرة إلى أدوات متخصصة بدلاً من الأنظمة القديمة الضخمة والمعقدة في مجالات مثل «${t}».`,
      firstStepPattern: (t: string) =>
        `صمم صفحة هبوط ذات تحويل عالي (Landing page) تشرح القيمة الفريدة للمشروع في «${t}» واجمع أول 50 بريداً إلكترونياً لمهتمين بالقائمة التجريبية.`,
      tag: 'نموذج_B2B',
    },
    {
      titleSuffix: 'التشاركي بدون وسطاء',
      descPattern: (t: string, k: string) =>
        `شبكة نظير-إلى-نظير (P2P) تعيد هندسة «${t}» من خلال ${k}، مما يتيح للأطراف التبادل المباشر بشفافية وضمانات رقمية موثوقة دون رسوم وساطة باهظة.`,
      whyNowPattern: (t: string) =>
        `لأن عملاء «${t}» باتوا يبحثون عن حلول مرنة واقتصادية تحميهم من احتكار المنصات التقليدية وترفع دخل مقدمي الخدمة.`,
      firstStepPattern: (t: string) =>
        `أنشئ مجتمعاً تجريبياً مغلقاً يضم 20 مشتركاً في قطاع «${t}»، ودير أول 10 معاملات يدوياً بالكامل للتحقق من رضا الطرفين ونموذج التحصيل.`,
      tag: 'اقتصاد_تشاركي',
    },
    {
      titleSuffix: 'المستقبلي التنبؤي (Next-Gen)',
      descPattern: (t: string, k: string) =>
        `حل رائد يعتمد على تحليل البيانات الضخمة في «${t}» واستباق المشكلات قبل وقوعها عبر ${k}، مما يمنح المشتركين ميزة تنافسية حاسمة.`,
      whyNowPattern: (t: string) =>
        `التوفر المتسارع للواجهات البرمجية الرخيصة ومصادر البيانات المفتوحة جعل بناء محركات التنبؤ لـ «${t}» متاحاً للشركات الناشئة وليس حكراً على عمالقة التقنية.`,
      firstStepPattern: (t: string) =>
        `اجمع عينة بيانات تاريخية لقطاع «${t}» وابنِ خوارزمية تنبؤ بسيطة على جدول بيانات أو سكريبت بايثون وقس دقتها بنسبة تفوق 80%.`,
      tag: 'تنبؤ_بيانات',
    },
    {
      titleSuffix: 'فائق السرعة للهواتف الذكية',
      descPattern: (t: string, k: string) =>
        `تطبيق خفيف وسريع جداً مخصص لتسهيل مهام «${t}» عبر نقرة واحدة مع واجهة تفاعلية ذكية تفهم السياق المحلي وتوفر توصيات دقيقة.`,
      whyNowPattern: (t: string) =>
        `أكثر من 85% من المعاملات في منطقتنا لخدمات «${t}» تتم عبر أجهزة الجوال، والمستخدم لم يعد يطيق النماذج الطويلة والمعقدة.`,
      firstStepPattern: (t: string) =>
        `اصنع نموذج واجهة تفاعلي (Figma prototype) لمشكلة «${t}» بمسار واحد ينتهي بحلها في أقل من 30 ثانية واختبره مع 10 مستخدمين.`,
      tag: 'جوال_مخصص',
    },
  ];

  const templatesEn = [
    {
      titleSuffix: 'AI Copilot & Autonomous Engine',
      descPattern: (t: string, k: string) =>
        `An intelligent workflow engine engineered for "${t}" leveraging ${k} to eliminate 80% of repetitive operational overhead with seamless cross-platform integration.`,
      whyNowPattern: (t: string) =>
        `Because current alternatives in "${t}" are fragmented, clunky, and too costly for agile teams.`,
      firstStepPattern: (t: string) =>
        `Launch a 48-hour prototype with a focused landing page for "${t}" and test value proposition with 10 early adopters.`,
      tag: 'AI_Engine',
    },
    {
      titleSuffix: 'Hyper-focused B2B Micro-SaaS',
      descPattern: (t: string, k: string) =>
        `Vertical SaaS tailored specifically for "${t}" businesses, powered by ${k} to optimize conversion and cashflow.`,
      whyNowPattern: (t: string) =>
        `Unprecedented API accessibility makes specialized vertical solutions in "${t}" outperform bloated horizontal legacy software.`,
      firstStepPattern: (t: string) =>
        `Interview 5 decision makers currently struggling with "${t}" and collect upfront pre-commitments.`,
      tag: 'B2B_SaaS',
    },
    {
      titleSuffix: 'Decentralized P2P Exchange',
      descPattern: (t: string, k: string) =>
        `A zero-middleman collaborative protocol reshaping "${t}" through ${k}, rewarding participants directly.`,
      whyNowPattern: (t: string) =>
        `Rising intermediary fees in "${t}" are driving power users toward direct, transparent community ecosystems.`,
      firstStepPattern: (t: string) =>
        `Set up a private test collective of 25 power participants in "${t}" and validate manual transactions first.`,
      tag: 'PeerToPeer',
    },
  ];

  const result: Idea[] = [];
  const templates = isAr ? templatesAr : templatesEn;
  const kwList = domainKeywords[domain] ? domainKeywords[domain][language] : domainKeywords.tech[language];

  for (let i = 0; i < count; i++) {
    const tpl = templates[i % templates.length];
    const kw = kwList[i % kwList.length];
    const cleanTopic = topic.trim();
    const title = isAr
      ? `${cleanTopic}: ${tpl.titleSuffix}`
      : `${cleanTopic}: ${tpl.titleSuffix}`;

    const id = `idea-${Date.now()}-${i + 1}-${Math.random().toString(36).substring(2, 6)}`;
    const description = tpl.descPattern(cleanTopic, kw);
    const whyNow = tpl.whyNowPattern(cleanTopic);
    const firstStep = tpl.firstStepPattern(cleanTopic);

    // Calculate deterministic evaluation
    const evalData: IdeaEvaluation = evaluateIdeaPure({
      title,
      description,
      boldness,
      domain,
    });

    result.push({
      id,
      title,
      description,
      why_now: whyNow,
      first_step: firstStep,
      topic: cleanTopic,
      domain,
      boldness,
      language,
      tags: [`#${tpl.tag}`, `#${domain}`, `#${boldness}`],
      status: 'seed',
      starred: false,
      notes: '',
      evaluation: evalData,
      created_at: now,
      updated_at: now,
    });
  }

  return result;
}

/**
 * Pure evaluation calculation algorithm
 */
export function evaluateIdeaPure(data: {
  title: string;
  description: string;
  boldness: BoldnessKey;
  domain: DomainKey;
}): IdeaEvaluation {
  const { boldness, domain, description } = data;

  // Base scores by boldness
  let baseFeasibility = 85;
  let baseMarket = 80;
  let baseInnovation = 75;

  if (boldness === 'safe') {
    baseFeasibility = 95;
    baseMarket = 75;
    baseInnovation = 70;
  } else if (boldness === 'realistic') {
    baseFeasibility = 88;
    baseMarket = 85;
    baseInnovation = 82;
  } else if (boldness === 'bold') {
    baseFeasibility = 80;
    baseMarket = 92;
    baseInnovation = 90;
  } else if (boldness === 'revolutionary') {
    baseFeasibility = 68;
    baseMarket = 97;
    baseInnovation = 98;
  } else if (boldness === 'scifi') {
    baseFeasibility = 50;
    baseMarket = 99;
    baseInnovation = 99;
  }

  // Adjust slightly by description length / quality
  const lengthBoost = Math.min(5, Math.floor(description.length / 40));
  const feasibilityScore = Math.min(99, Math.max(30, baseFeasibility - (boldness === 'revolutionary' ? 5 : 0) + lengthBoost));
  const marketPotentialScore = Math.min(99, Math.max(40, baseMarket + lengthBoost));
  const innovationScore = Math.min(99, Math.max(50, baseInnovation + lengthBoost));

  let overallVerdict: IdeaEvaluation['overallVerdict'] = 'promising';
  if (innovationScore > 90 && marketPotentialScore > 90) {
    overallVerdict = 'revolutionary';
  } else if (feasibilityScore < 60) {
    overallVerdict = 'challenging';
  } else if (marketPotentialScore < 75) {
    overallVerdict = 'niche';
  }

  return {
    feasibilityScore,
    marketPotentialScore,
    innovationScore,
    overallVerdict,
    summary:
      overallVerdict === 'revolutionary'
        ? 'فرصة ابتكارية خارقة ذات أثر سوقي عملاق إذا تم تنفيذ المرحلة الأولى بحذر.'
        : 'فكرة متماسكة ذات جدوى عالية وإمكانية إطلاق سريع مع عائد استثماري مرن.',
    strengths: [
      'وضوح المشكلة التي يعاني منها العميل الفعلي',
      'إمكانية البدء بنسخة تجريبية مبسطة وسريعة خلال أيام',
      'فرصة لبناء ميزة تنافسية مبنية على البيانات وتجربة المستخدم',
    ],
    risks: [
      'احتمال دخول منافسين كبار حال إثبات جدوى السوق',
      'الحاجة لتثقيف الشريحة المستهدفة وتبسيط إجراءات التفعيل',
    ],
    moat: 'بناء شبكة عملاء نشطة وأصول برمجية متخصصة يصعب استنساخها بسهولة.',
  };
}

/**
 * Generates an actionable 3-phase execution roadmap
 */
export function generateDevelopmentPlanPure(idea: Idea): IdeaDevelopmentPlan {
  const isAr = idea.language === 'ar';
  if (isAr) {
    return {
      stage1Prototype: {
        title: 'المرحلة 1: النموذج المصغر والتحقق السريع (الأسبوع 1 - 2)',
        timeline: '14 يوماً',
        steps: [
          `بناء صفحة هبوط تفاعلية لـ «${idea.title}» تشرح الحل في 3 أسطر مع نموذج تسجيل مهتمين.`,
          `اختبار القيمة مع 10 عملاء محتملين وجهاً لوجه أو عبر زوم وملاحظة ردود الفعل الدقيقة.`,
          `تنفيذ الخدمة لعميلين يدوياً بالكامل للتأكد من القيمة قبل برمجة أي خوارزمية معقدة.`,
        ],
      },
      stage2Validation: {
        title: 'المرحلة 2: إطلاق النسخة الأولية MVP (الشهر 1 - 2)',
        timeline: '60 يوماً',
        steps: [
          'برمجة الواجهة الأساسية وأتمتة مسار القيمة الأهم (Core Value Path).',
          'دمج بوابة الدفع التجريبية والبدء بجمع اشتراكات مدفوعة من 20 عميلاً رائداً.',
          'قياس معدل الاستبقاء وملاحظات المستخدمين وتكرار التعديلات أسبوعياً.',
        ],
      },
      stage3Scale: {
        title: 'المرحلة 3: النمو وتوسيع السوق (الشهر 3 - 6)',
        timeline: '90 يوماً',
        steps: [
          'إطلاق برنامج إحالة وشراكات مع المؤثرين والمجتمعات المتخصصة.',
          'أتمتة الدعم الفني وتوسيع البنية السحابية لاستيعاب آلاف المشتركين.',
          'الاستعداد لجولة استثمارية تمويلية مبكرة بعد إثبات التدفق النقدي الإيجابي.',
        ],
      },
      monetizationModel: 'اشتراك برمجيات كخدمة (SaaS) شهري/سنوي متدرج + نسبة عمولة من العمليات الناجحة.',
      targetAudience: 'الشركات الناشئة، رواد الأعمال، وأصحاب المتاجر والمشاريع المستقلة.',
      techStackRecommendation: ['React + TypeScript', 'Vite + Node/Express', 'Tailwind CSS', 'Gemini AI API', 'PostgreSQL / Supabase'],
    };
  }

  return {
    stage1Prototype: {
      title: 'Stage 1: Validation & Concierge Prototype (Days 1 - 14)',
      timeline: '14 Days',
      steps: [
        `Publish a high-converting landing page explaining "${idea.title}" with early access form.`,
        `Conduct 10 discovery calls with direct target users to validate true willingness to pay.`,
        `Fulfill the initial service manually for 2 customers to document friction points.`,
      ],
    },
    stage2Validation: {
      title: 'Stage 2: Core MVP Launch (Months 1 - 2)',
      timeline: '60 Days',
      steps: [
        'Build the core self-service workflow with automated data processing.',
        'Integrate payment processing and onboard first 25 paying subscribers.',
        'Track weekly retention metrics and iterate based on feature requests.',
      ],
    },
    stage3Scale: {
      title: 'Stage 3: Growth & Market Expansion (Months 3 - 6)',
      timeline: '90 Days',
      steps: [
        'Roll out referral loops and strategic partnerships with industry communities.',
        'Automate customer onboarding and scale cloud infrastructure.',
        'Prepare early-stage fundraising dossier backed by proven unit economics.',
      ],
    },
    monetizationModel: 'Tiered monthly/annual B2B SaaS subscription with usage-based volume pricing.',
    targetAudience: 'Agile businesses, solo founders, and modern professional service providers.',
    techStackRecommendation: ['React + TypeScript', 'Tailwind CSS', 'Gemini AI API', 'Express/Node', 'PostgreSQL'],
  };
}

/**
 * Synthesizes cross-pollinated ideas for the Idea Matrix
 */
export function synthesizeMatrixPure(conceptA: string, conceptB: string, language: 'ar' | 'en'): IdeaMatrixSynthesis {
  const isAr = language === 'ar';
  const cA = conceptA.trim();
  const cB = conceptB.trim();

  if (isAr) {
    return {
      conceptA: cA,
      conceptB: cB,
      synergyAngle: `دمج البعد التجريبي والتشغيلي لـ (${cA}) مع القوة التحليلية والشبكية لـ (${cB}) لخلق فئة سوقية هجينة غير مسبوقة.`,
      breakthroughIdea: {
        title: `منصة الجيل القادم: ${cA} المعززة بـ ${cB}`,
        description: `مشروع ابتكاري يحل المعضلة الكبرى في «${cA}» عبر استخدام آليات «${cB}»، مما يوفر شفافية وسرعة فائقة ويخفض التكلفة التشغيلية للطرفين بنسبة تفوق 40%.`,
        secretWeapon: `الملكية الحصرية لبيانات التقاطع بين المجالين، مما يصعب على عمالقة أي من القطاعين منافسته بمفردهم.`,
        firstStep: `اجمع خبيراً واحداً من قطاع «${cA}» وخبيراً من «${cB}» في جلسة عمل لمدة ساعة واحدة لصياغة أول سيناريو استخدام متكامل واختباره.`,
      },
    };
  }

  return {
    conceptA: cA,
    conceptB: cB,
    synergyAngle: `Cross-pollinating the core operational strengths of (${cA}) with the exponential leverage of (${cB}) to build a hybrid category leader.`,
    breakthroughIdea: {
      title: `Hybrid Fusion: ${cA} meets ${cB}`,
      description: `A breakthrough venture solving the primary friction point in "${cA}" by introducing the transformative mechanisms of "${cB}".`,
      secretWeapon: `Unmatched proprietary domain-crossing data graphs that neither vertical incumbent can replicate.`,
      firstStep: `Host a 60-minute joint workshop between a practitioner from "${cA}" and a specialist in "${cB}" to define the MVP user journey.`,
    },
  };
}
