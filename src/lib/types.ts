export type DomainKey =
  | 'tech'
  | 'business'
  | 'sustainability'
  | 'health'
  | 'edtech'
  | 'creator'
  | 'ecommerce'
  | 'social';

export type BoldnessKey = 'safe' | 'realistic' | 'bold' | 'revolutionary' | 'scifi';

export type IdeaStatus = 'seed' | 'in_progress' | 'developed' | 'archived';

export interface IdeaEvaluation {
  feasibilityScore: number; // 1-100
  marketPotentialScore: number; // 1-100
  innovationScore: number; // 1-100
  overallVerdict: 'promising' | 'revolutionary' | 'challenging' | 'niche';
  summary: string;
  strengths: string[];
  risks: string[];
  moat: string;
}

export interface IdeaDevelopmentPlan {
  stage1Prototype: { title: string; timeline: string; steps: string[] };
  stage2Validation: { title: string; timeline: string; steps: string[] };
  stage3Scale: { title: string; timeline: string; steps: string[] };
  monetizationModel: string;
  targetAudience: string;
  techStackRecommendation: string[];
}

export interface IdeaMatrixSynthesis {
  conceptA: string;
  conceptB: string;
  synergyAngle: string;
  breakthroughIdea: {
    title: string;
    description: string;
    secretWeapon: string;
    firstStep: string;
  };
}

export interface Idea {
  id: string;
  title: string;
  description: string;
  why_now: string;
  first_step: string;
  topic: string;
  domain: DomainKey;
  boldness: BoldnessKey;
  language: 'ar' | 'en';
  tags: string[];
  status: IdeaStatus;
  starred: boolean;
  notes: string;
  parent_id?: string | null;
  session_id?: string | null;
  evaluation?: IdeaEvaluation | null;
  development?: IdeaDevelopmentPlan | null;
  created_at: string;
  updated_at: string;
}

export interface SessionRecord {
  id: string;
  topic: string;
  domain: DomainKey;
  boldness: BoldnessKey;
  ideas_count: number;
  created_at: string;
  idea_ids: string[];
}

export interface BrainThoughtStep {
  phase: 'analysis' | 'synthesis' | 'contrarian' | 'monetization' | 'blueprint';
  title: string;
  content: string;
  icon?: string;
}

export interface BrainAnalysisResult {
  topic: string;
  thoughtFlow: BrainThoughtStep[];
  breakthroughIdeas: Partial<Idea>[];
  unconventionalAngle: string;
  marketGap: string;
}
