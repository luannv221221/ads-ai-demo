import type { FrameworkOption, SavedCompetitorOption } from './types';

export const CREATIVE_LIBRARY_KEY = 'ads-manager:creative-library';

export const DEFAULT_COPY_FORM = {
  product: 'Khoa hoc Tieng Anh Giao Tiep 1 kem 1',
  usps: 'Giao vien ban ngu co chung chi, Lo trinh ca nhan hoa, Cam ket dau ra bang van ban, Hoc truc tuyen linh hoat.',
  audience: 'Nguoi di lam, sinh vien nam cuoi, 22-35 tuoi',
  tone: 'Chuyen nghiep, Dang tin cay',
  framework: 'AIDA',
};

export const DEFAULT_COMPETITOR_FORM = {
  competitorUrl: 'https://facebook.com/trungtamanhngu.example',
  savedCompetitor: 'EnglishCenter ABC (Dang chay 15 Ads)',
  competitorAudience: DEFAULT_COPY_FORM.audience,
};

export const CUSTOM_COMPETITOR_LABEL = 'Custom URL';

export const TONE_OPTIONS = [
  'Chuyen nghiep, Dang tin cay',
  'Nang dong, Hai huoc',
  'Cap bach (FOMO), Danh vao noi dau',
  'Gan gui, Ke chuyen (Storytelling)',
];

export const FRAMEWORK_OPTIONS: FrameworkOption[] = [
  { id: 'AIDA', name: 'AIDA', desc: 'Attention, Interest, Desire, Action. Chuan muc, an toan.' },
  { id: 'PAS', name: 'PAS', desc: 'Problem, Agitate, Solve. Danh manh vao noi dau.' },
  { id: 'FAB', name: 'FAB', desc: 'Features, Advantages, Benefits. Nhan manh tinh nang san pham.' },
  { id: 'Storytelling', name: 'Storytelling', desc: 'Ke chuyen, review thuc te tu nguoi dung.' },
];

export const SAVED_COMPETITORS: SavedCompetitorOption[] = [
  {
    label: CUSTOM_COMPETITOR_LABEL,
    url: '',
    isCustom: true,
  },
  {
    label: 'EnglishCenter ABC (Dang chay 15 Ads)',
    url: 'https://facebook.com/trungtamanhngu.example',
  },
  {
    label: 'IELTS DefMaster (Dang chay 42 Ads)',
    url: 'https://facebook.com/ielts.master.example',
  },
];
