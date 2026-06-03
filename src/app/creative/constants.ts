import type { FrameworkOption, SavedCompetitorOption } from './types';

export const CREATIVE_LIBRARY_KEY = 'ads-manager:creative-library';

export const DEFAULT_COPY_FORM = {
  product: 'Khóa học Tiếng Anh Giao Tiếp 1 kèm 1',
  usps: 'Giáo viên bản ngữ có chứng chỉ, lộ trình cá nhân hóa, cam kết đầu ra bằng văn bản, học trực tuyến linh hoạt.',
  audience: 'Người đi làm, sinh viên năm cuối, 22-35 tuổi',
  tone: 'Chuyên nghiệp, đáng tin cậy',
  framework: 'AIDA',
};

export const DEFAULT_COMPETITOR_FORM = {
  competitorUrl: 'https://facebook.com/trungtamanhngu.example',
  savedCompetitor: 'EnglishCenter ABC (đang chạy 15 Ads)',
  competitorAudience: DEFAULT_COPY_FORM.audience,
};

export const CUSTOM_COMPETITOR_LABEL = 'Custom URL';

export const TONE_OPTIONS = [
  'Chuyên nghiệp, đáng tin cậy',
  'Năng động, hài hước',
  'Cấp bách (FOMO), đánh vào nỗi đau',
  'Gần gũi, kể chuyện (Storytelling)',
];

export const FRAMEWORK_OPTIONS: FrameworkOption[] = [
  { id: 'AIDA', name: 'AIDA', desc: 'Attention, Interest, Desire, Action. Chuẩn mực, an toàn.' },
  { id: 'PAS', name: 'PAS', desc: 'Problem, Agitate, Solve. Đánh mạnh vào nỗi đau.' },
  { id: 'FAB', name: 'FAB', desc: 'Features, Advantages, Benefits. Nhấn mạnh tính năng sản phẩm.' },
  { id: 'Storytelling', name: 'Storytelling', desc: 'Kể chuyện, review thực tế từ người dùng.' },
];

export const SAVED_COMPETITORS: SavedCompetitorOption[] = [
  {
    label: CUSTOM_COMPETITOR_LABEL,
    url: '',
    isCustom: true,
  },
  {
    label: 'EnglishCenter ABC (đang chạy 15 Ads)',
    url: 'https://facebook.com/trungtamanhngu.example',
  },
  {
    label: 'IELTS DefMaster (đang chạy 42 Ads)',
    url: 'https://facebook.com/ielts.master.example',
  },
];
