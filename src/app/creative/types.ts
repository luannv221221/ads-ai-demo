export type CreativeTab = 'copywriting' | 'competitor';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  message: string;
  type: ToastType;
}

export interface FrameworkOption {
  id: string;
  name: string;
  desc: string;
}

export interface SavedCompetitorOption {
  label: string;
  url: string;
  isCustom?: boolean;
}

export interface GenerateCopyParams {
  product: string;
  usps: string;
  audience: string;
  tone: string;
  framework: string;
}

export interface GeneratedCopy {
  badge: string;
  title: string;
  body: string;
  cta: string;
  imagePrompt?: string;
}

export interface CompetitorAd {
  id: string;
  title: string;
  timeLabel: string;
  thumbnail: string;
  text: string;
  engagement: string;
  status: 'winning' | 'testing';
  statusLabel: string;
}

export interface CompetitorAngle {
  title: string;
  hook: string;
}

export interface CompetitorOverview {
  competitor: string;
  activeAds: number;
  imagePct: number;
  platforms: string;
  hooks: string[];
  loopholes: string[];
  angles: CompetitorAngle[];
}

export interface CompetitorAnalysis {
  adList: CompetitorAd[];
  overview: CompetitorOverview;
  source: 'meta-ad-library' | 'gemini-estimate' | 'demo-fallback';
  sourceLabel: string;
}

export interface CounterAd {
  badge: string;
  targetLoophole: string;
  hook: string;
  body: string;
  cta: string;
  strategyDescription: string;
}

export interface SavedCreative {
  id: string;
  createdAt: string;
  source: 'copywriting' | 'counter-ad';
  badge: string;
  title: string;
  body: string;
  cta: string;
  imagePrompt?: string;
}

export interface AdAccountSummary {
  id: string;
  name?: string;
  account_id?: string;
}
