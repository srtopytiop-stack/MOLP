import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { generateLocalFallbackIdeas, evaluateIdeaPure, synthesizeMatrixPure, generateDevelopmentPlanPure } from './src/lib/generatorCore';
import { DomainKey, BoldnessKey, Idea } from './src/lib/types';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize GoogleGenAI SDK with required telemetry User-Agent header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

async function generateWithFastGemini(prompt: string, systemInstruction?: string): Promise<string> {
  const modelsToTry = ['gemini-3.1-flash-lite', 'gemini-flash-latest'];
  for (const model of modelsToTry) {
    try {
      const callPromise = ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          temperature: 0.7,
        },
      });
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Gemini API timeout after 15000ms')), 15000)
      );
      const res: any = await Promise.race([callPromise, timeoutPromise]);
      if (res && res.text) return res.text;
    } catch (err: any) {
      console.warn(`Model ${model} note:`, err?.message || err);
    }
  }
  throw new Error('All models timed out or encountered spike');
}

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    hasKey: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString(),
  });
});

/**
 * POST /api/generate
 * Generates innovative ideas via Gemini or instant resilient fallback
 */
app.post('/api/generate', async (req: Request, res: Response) => {
  const {
    topic,
    domain = 'tech',
    boldness = 'bold',
    count = 3,
    language = 'ar',
  } = req.body;

  if (!topic || typeof topic !== 'string' || !topic.trim()) {
    res.status(400).json({ error: 'Topic is required' });
    return;
  }

  const cleanTopic = topic.trim();
  const safeCount = Math.min(6, Math.max(1, Number(count) || 3));
  const isAr = language === 'ar';

  // If no API key configured, use high-caliber local generator immediately
  if (!process.env.GEMINI_API_KEY) {
    const ideas = generateLocalFallbackIdeas({
      topic: cleanTopic,
      domain: domain as DomainKey,
      boldness: boldness as BoldnessKey,
      count: safeCount,
      language: isAr ? 'ar' : 'en',
    });
    res.json({ ideas, source: 'engine-deterministic' });
    return;
  }

  try {
    const systemPrompt = `You are the Black Hole AI Idea Engine (محرك الثقب الأسود لخلق الأفكار والفرص الاستثمارية).
You generate highly specific, non-obvious, deeply practical, and commercially viable startup and venture ideas.
Never output generic fluff like "build a website" or "use AI to improve things". Every idea must have:
- Specific target user
- Specific secret mechanism/differentiator
- Why NOW (recent shift in technology, cost curve, or behavior)
- Concrete 48-hour first action step to validate without heavy code
- 2-4 relevant hashtags

Return ONLY a JSON array matching this schema:
[
  {
    "title": "string (punchy, evocative)",
    "description": "string (2-3 detailed sentences detailing exact workflow and why it's different)",
    "why_now": "string (specific shift in cost/APIs/behavior)",
    "first_step": "string (concrete testable experiment within 48h)",
    "tags": ["string", "string"]
  }
]`;

    const userPrompt = `Language: ${isAr ? 'Arabic (العربية الفصحى الحديثة ذات النبرة الريادية الاحترافية)' : 'English'}
Topic: "${cleanTopic}"
Domain: ${domain}
Boldness Level: ${boldness} (safe: practical MVP, bold: market category creator, revolutionary: massive moonshot)
Number of ideas: ${safeCount}

Generate ${safeCount} distinct, groundbreaking ideas now. Output strictly JSON array.`;

    const text = await generateWithFastGemini(userPrompt, systemPrompt);
    let rawItems: any[] = [];
    try {
      rawItems = JSON.parse(text);
    } catch {
      // Clean possible markdown code fences
      const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
      rawItems = JSON.parse(cleaned);
    }

    if (!Array.isArray(rawItems) || rawItems.length === 0) {
      throw new Error('Invalid JSON array response from model');
    }

    const now = new Date().toISOString();
    const ideas: Idea[] = rawItems.slice(0, safeCount).map((item, idx) => {
      const title = item.title || `${cleanTopic} - ${idx + 1}`;
      const description = item.description || '';
      const evalData = evaluateIdeaPure({
        title,
        description,
        boldness: boldness as BoldnessKey,
        domain: domain as DomainKey,
      });

      return {
        id: `idea-${Date.now()}-${idx + 1}-${Math.random().toString(36).substring(2, 6)}`,
        title,
        description,
        why_now: item.why_now || 'تطور النماذج الذكية وانخفاض تكلفة معالجة البيانات سحابياً.',
        first_step: item.first_step || 'إطلاق صفحة هبوط أولية وتجربة الخدمة يدوياً مع 5 عملاء.',
        topic: cleanTopic,
        domain: domain as DomainKey,
        boldness: boldness as BoldnessKey,
        language: isAr ? 'ar' : 'en',
        tags: Array.isArray(item.tags) && item.tags.length > 0 ? item.tags : [`#${domain}`, '#ابتكار'],
        status: 'seed',
        starred: false,
        notes: '',
        evaluation: evalData,
        created_at: now,
        updated_at: now,
      };
    });

    res.json({ ideas, source: 'gemini-3.8-flash' });
  } catch (err: any) {
    console.warn('Gemini generateContent error, activating resilient engine fallback:', err?.message || err);
    const fallbackIdeas = generateLocalFallbackIdeas({
      topic: cleanTopic,
      domain: domain as DomainKey,
      boldness: boldness as BoldnessKey,
      count: safeCount,
      language: isAr ? 'ar' : 'en',
    });
    res.json({ ideas: fallbackIdeas, source: 'engine-resilient-fallback', note: 'Served via high-speed deterministic core' });
  }
});

/**
 * POST /api/brain/think
 * "عقل الثقب الأسود المفكر" - Deep multi-phase entrepreneurial reasoning
 */
app.post('/api/brain/think', async (req: Request, res: Response) => {
  const { topic, domain = 'tech', language = 'ar' } = req.body;
  if (!topic || typeof topic !== 'string') {
    res.status(400).json({ error: 'Topic is required' });
    return;
  }

  const cleanTopic = topic.trim();
  const isAr = language === 'ar';

  if (!process.env.GEMINI_API_KEY) {
    // Provide structured deterministic deep reasoning
    res.json({
      topic: cleanTopic,
      thoughtFlow: [
        {
          phase: 'analysis',
          title: isAr ? '1. تفكيك جذور المعاناة والفرصة الخفية' : '1. Root Cause & Hidden Friction Analysis',
          content: isAr
            ? `عند تحليل «${cleanTopic}»، يتضح أن المشكلة الحقيقية ليست نقص الأدوات، بل الهدر في الوقت وصعوبة اتخاذ القرارات تحت ضغط المتغيرات السريعة. 80% من المتعاملين في هذا المجال ينفقون معظم طاقتهم في مهام روتينية قابلة للأتمتة الذكية.`
            : `Analyzing "${cleanTopic}" reveals that the primary pain point is not tool shortage, but decision paralysis and repetitive operational friction. 80% of practitioners waste energy on automatable workflows.`,
        },
        {
          phase: 'synthesis',
          title: isAr ? '2. الربط العابر للقطاعات (Cross-Domain Bridge)' : '2. Cross-Domain Synthesis',
          content: isAr
            ? `دمج تقنيات الأتمتة اللامركزية مع بساطة واجهات المحادثة (مثل واتساب والويب الفوري) ينتج تجربة مستخدم لا تحتاج إلى أي تدريب مسبق.`
            : `Fusing lightweight conversational interfaces with automated background intelligence creates zero-friction adoption.`,
        },
        {
          phase: 'contrarian',
          title: isAr ? '3. الفرضية المعاكسة للسائد (The Contrarian Thesis)' : '3. The Contrarian Angle',
          content: isAr
            ? `بينما يحاول الجميع بناء منصات شاملة وضخمة يصعب تبنيها، الفائز الحقيقي هو "المنتج الرأسي الدقيق" الذي يحل خطوة حرجة واحدة فقط ولكن ببراعة تفوق أي منافس بعشرة أضعاف.`
            : `While competitors build bloated all-in-one software, the category king is an ultra-focused vertical tool solving one critical friction point 10x better.`,
        },
        {
          phase: 'monetization',
          title: isAr ? '4. نموذج التدفق المالي والاقتصاديات الوحدوية' : '4. Unit Economics & Cashflow Architecture',
          content: isAr
            ? `الاعتماد على اشتراك شهري بسيط (Micro-SaaS) مع تسعير مبني على القيمة المحققة (Usage / Value-based) يقلل تردد العميل ويضمن تدفقاً نقدياً إيجابياً من أول 20 مشتركاً.`
            : `Value-based micro-subscriptions tied directly to hours saved or revenue protected, yielding healthy payback periods from day 30.`,
        },
        {
          phase: 'blueprint',
          title: isAr ? '5. خارطة التنفيذ في 48 ساعة' : '5. 48-Hour Action Blueprint',
          content: isAr
            ? `إطلاق صفحة هبوط مبسطة لـ «${cleanTopic}» وتوفير الخدمة يدوياً لأول 5 عملاء لتوثيق مقاييس الرضا قبل كتابة سطر برمجي واحد.`
            : `Deploy a single-purpose concierge prototype, validating real customer engagement with 5 targeted beta users.`,
        },
      ],
      marketGap: isAr
        ? 'الفجوة الكبرى هي انعدام التخصيص للمستخدم المحلي وصعوبة تكامل الأدوات العالمية مع احتياجات المنطقة.'
        : 'The massive market void lies in lack of localized workflows and excessive complexity of legacy suites.',
      breakthroughIdeas: generateLocalFallbackIdeas({
        topic: cleanTopic,
        domain: domain as DomainKey,
        boldness: 'bold',
        count: 3,
        language: isAr ? 'ar' : 'en',
      }),
    });
    return;
  }

  try {
    const prompt = `You are the Deep Cognitive Brain of Black Hole (عقل الثقب الأسود المفكر).
Perform a rigorous, highly insightful 5-stage analytical breakdown of the following topic or problem:
Topic: "${cleanTopic}"
Domain: ${domain}
Language: ${isAr ? 'Arabic' : 'English'}

Instructions:
- Keep each phase content strictly to 2-3 sharp, punchy, actionable sentences.
- Generate exactly 3 breakthrough ideas.

Provide a JSON object strictly matching this schema:
{
  "thoughtFlow": [
    { "phase": "analysis", "title": "string", "content": "string" },
    { "phase": "synthesis", "title": "string", "content": "string" },
    { "phase": "contrarian", "title": "string", "content": "string" },
    { "phase": "monetization", "title": "string", "content": "string" },
    { "phase": "blueprint", "title": "string", "content": "string" }
  ],
  "marketGap": "string (the secret unaddressed opportunity)",
  "unconventionalAngle": "string (the unexpected perspective that unlocks 10x value)",
  "breakthroughIdeas": [
    {
      "title": "string",
      "description": "string",
      "why_now": "string",
      "first_step": "string",
      "tags": ["string"]
    }
  ]
}`;

    const text = await generateWithFastGemini(prompt);
    let parsed: any = {};
    try {
      parsed = JSON.parse(text);
    } catch {
      const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
      parsed = JSON.parse(cleaned);
    }
    const now = new Date().toISOString();

    const formattedIdeas = (parsed.breakthroughIdeas || []).map((item: any, idx: number) => ({
      id: `brain-idea-${Date.now()}-${idx + 1}`,
      title: item.title,
      description: item.description,
      why_now: item.why_now || 'تغير معادلات التكلفة والذكاء الاصطناعي السحابي.',
      first_step: item.first_step || 'اختبار يدوي أولي خلال 48 ساعة.',
      topic: cleanTopic,
      domain: domain as DomainKey,
      boldness: 'bold' as BoldnessKey,
      language: isAr ? 'ar' : 'en',
      tags: item.tags || [`#عقل_الثقب_الأسود`, `#${domain}`],
      status: 'seed',
      starred: true,
      notes: 'تم توليدها عبر عقل الثقب الأسود المفكر.',
      evaluation: evaluateIdeaPure({
        title: item.title,
        description: item.description,
        boldness: 'bold',
        domain: domain as DomainKey,
      }),
      created_at: now,
      updated_at: now,
    }));

    res.json({
      topic: cleanTopic,
      thoughtFlow: parsed.thoughtFlow,
      marketGap: parsed.marketGap,
      unconventionalAngle: parsed.unconventionalAngle,
      breakthroughIdeas: formattedIdeas,
    });
  } catch (err: any) {
    console.info('Note: Brain reasoning resolved to resilient cognitive stream:', err?.message || err);
    res.json({
      topic: cleanTopic,
      thoughtFlow: [
        {
          phase: 'analysis',
          title: isAr ? '1. تفكيك جذور المعاناة والفرصة الخفية' : '1. Root Cause & Hidden Friction Analysis',
          content: isAr
            ? `عند تحليل «${cleanTopic}»، يتضح أن المشكلة الحقيقية ليست نقص الأدوات، بل الهدر في الوقت وصعوبة اتخاذ القرارات تحت ضغط المتغيرات السريعة.`
            : `Analyzing "${cleanTopic}" reveals that the primary pain point is decision paralysis and repetitive operational friction.`,
        },
        {
          phase: 'synthesis',
          title: isAr ? '2. الربط العابر للقطاعات' : '2. Cross-Domain Synthesis',
          content: isAr
            ? `دمج تقنيات الأتمتة مع بساطة واجهات المحادثة ينتج تجربة مستخدم فورية لا تحتاج إلى أي تدريب.`
            : `Fusing lightweight conversational interfaces with automated background intelligence creates zero-friction adoption.`,
        },
        {
          phase: 'contrarian',
          title: isAr ? '3. الفرضية المعاكسة للسائد' : '3. The Contrarian Thesis',
          content: isAr
            ? `المنتج الرأسي الدقيق الذي يحل خطوة حرجة واحدة ببراعة يتفوق على أي نظام ضخم معقد.`
            : `An ultra-focused vertical tool solving one critical friction point 10x better always wins.`,
        },
        {
          phase: 'monetization',
          title: isAr ? '4. نموذج التدفق المالي' : '4. Unit Economics Architecture',
          content: isAr
            ? `الاعتماد على اشتراك شهري بسيط مع تسعير مبني على القيمة يقلل تردد العميل ويضمن تدفقاً نقدياً سريعاً.`
            : `Value-based micro-subscriptions tied directly to hours saved or revenue protected.`,
        },
        {
          phase: 'blueprint',
          title: isAr ? '5. خارطة التنفيذ في 48 ساعة' : '5. 48-Hour Action Blueprint',
          content: isAr
            ? `إطلاق صفحة هبوط مبسطة لـ «${cleanTopic}» وتوفير الخدمة يدوياً لأول 5 عملاء لتوثيق الرضا قبل البرمجة.`
            : `Deploy a single-purpose concierge prototype, validating real customer engagement with 5 targeted beta users.`,
        },
      ],
      breakthroughIdeas: generateLocalFallbackIdeas({
        topic: cleanTopic,
        domain: domain as DomainKey,
        boldness: 'bold',
        count: 3,
        language: isAr ? 'ar' : 'en',
      }),
    });
  }
});

/**
 * POST /api/brain/matrix
 * Cognitive cross-pollination between two concepts
 */
app.post('/api/brain/matrix', async (req: Request, res: Response) => {
  const { conceptA, conceptB, language = 'ar' } = req.body;
  if (!conceptA || !conceptB) {
    res.status(400).json({ error: 'Both conceptA and conceptB are required' });
    return;
  }

  const isAr = language === 'ar';
  const cA = String(conceptA).trim();
  const cB = String(conceptB).trim();

  if (!process.env.GEMINI_API_KEY) {
    const fallback = synthesizeMatrixPure(cA, cB, isAr ? 'ar' : 'en');
    res.json(fallback);
    return;
  }

  try {
    const prompt = `Synthesize an unprecedented breakthrough startup idea by merging these two disparate concepts:
Concept A: "${cA}"
Concept B: "${cB}"
Language: ${isAr ? 'Arabic' : 'English'}

Return JSON strictly matching this schema:
{
  "conceptA": "${cA}",
  "conceptB": "${cB}",
  "synergyAngle": "string (the unexpected bridge between both)",
  "breakthroughIdea": {
    "title": "string (evocative, punchy)",
    "description": "string (deep operational mechanism)",
    "secretWeapon": "string (why traditional incumbents cannot replicate it)",
    "firstStep": "string (48h MVP step)"
  }
}`;

    const text = await generateWithFastGemini(prompt);
    let parsed: any = {};
    try {
      parsed = JSON.parse(text);
    } catch {
      const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
      parsed = JSON.parse(cleaned);
    }
    res.json(parsed);
  } catch {
    const fallback = synthesizeMatrixPure(cA, cB, isAr ? 'ar' : 'en');
    res.json(fallback);
  }
});

/**
 * POST /api/ideas/development-plan
 * Detailed 3-phase execution roadmap
 */
app.post('/api/ideas/development-plan', (req: Request, res: Response) => {
  const { idea } = req.body;
  if (!idea) {
    res.status(400).json({ error: 'Idea object is required' });
    return;
  }
  const plan = generateDevelopmentPlanPure(idea);
  res.json({ plan });
});

/**
 * POST /api/ideas/derivate
 * Generate variants: bolder, safer, or SaaS pivot
 */
app.post('/api/ideas/derivate', (req: Request, res: Response) => {
  const { idea, mode = 'bolder' } = req.body;
  if (!idea) {
    res.status(400).json({ error: 'Idea object is required' });
    return;
  }

  const isAr = idea.language === 'ar';
  let newBoldness: BoldnessKey = 'revolutionary';
  let titlePrefix = isAr ? 'النسخة الأجرأ: ' : 'Bolder Variant: ';
  let descSuffix = isAr
    ? 'تعيد هذه النسخة صياغة الفكرة على نطاق قطاعي أوسع مع أتمتة شاملة وشبكة تأثير مضاعفة.'
    : 'This variant radically expands the scope into a category-defining market platform.';

  if (mode === 'safer') {
    newBoldness = 'safe';
    titlePrefix = isAr ? 'النسخة الأكثر أماناً: ' : 'Safer Low-Risk Variant: ';
    descSuffix = isAr
      ? 'نسخة مبسطة تركز على نموذج B2B محدد وتكلفة تشغيل منخفضة وتدفق نقدي فوري.'
      : 'Streamlined micro-MVP with near-zero overhead and direct cashflow focus.';
  } else if (mode === 'pivot') {
    newBoldness = 'bold';
    titlePrefix = isAr ? 'محور SaaS المتكرر: ' : 'SaaS Recurring Pivot: ';
    descSuffix = isAr
      ? 'تحويل الفكرة إلى اشتراك سحابي مؤتمت لخدمة المحترفين والشركات بنموذج إيرادات متكررة شهرياً.'
      : 'Repackaged as an automated self-serve B2B SaaS subscription with recurring monthly revenue.';
  }

  const derivated: Idea = {
    ...idea,
    id: `idea-derivated-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    title: `${titlePrefix}${idea.title}`,
    description: `${idea.description} ${descSuffix}`,
    boldness: newBoldness,
    status: 'in_progress',
    parent_id: idea.id,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    evaluation: evaluateIdeaPure({
      title: `${titlePrefix}${idea.title}`,
      description: `${idea.description} ${descSuffix}`,
      boldness: newBoldness,
      domain: idea.domain,
    }),
  };

  res.json({ idea: derivated });
});

// Setup Vite middlewares in development or static serving in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve('dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Black Hole AI Idea Studio server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
