'use server';

import type { CompetitorAd, CompetitorAnalysis, CounterAd, GeneratedCopy, GenerateCopyParams } from '@/app/creative/types';

interface ActionResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

interface AnalyzeCompetitorParams {
  pageUrl: string;
  savedCompetitor?: string;
  audience: string;
}

interface CounterAdParams {
  competitorName: string;
  competitorText: string;
  loophole: string;
  angleTitle: string;
  angleHook: string;
  ourProduct: string;
  ourUsps: string;
}

interface MetaAdArchiveItem {
  id?: string;
  ad_creation_time?: string;
  ad_delivery_start_time?: string;
  ad_snapshot_url?: string;
  page_id?: string;
  page_name?: string;
  publisher_platforms?: string[];
  ad_creative_bodies?: string[];
  ad_creative_link_titles?: string[];
  ad_creative_link_descriptions?: string[];
  ad_creative_link_captions?: string[];
  media_type?: string;
}

const GRAPH_API_VERSION = 'v24.0';
const META_AD_FIELDS = [
  'id',
  'ad_creation_time',
  'ad_delivery_start_time',
  'ad_snapshot_url',
  'page_id',
  'page_name',
  'publisher_platforms',
  'ad_creative_bodies',
  'ad_creative_link_titles',
  'ad_creative_link_descriptions',
  'ad_creative_link_captions',
  'media_type',
].join(',');

async function callGeminiJson<T>(prompt: string, validator: (value: unknown) => value is T): Promise<T | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY_HERE') return null;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      }
    );

    if (!response.ok) return null;
    const result = await response.json();
    const rawText = String(result.candidates?.[0]?.content?.parts?.[0]?.text || '');
    const parsed = JSON.parse(rawText.replace(/```json/g, '').replace(/```/g, '').trim());
    return validator(parsed) ? parsed : null;
  } catch (error) {
    console.error('Gemini call failed, using local fallback:', error);
    return null;
  }
}

export async function generateCopywritingAction(params: GenerateCopyParams): Promise<ActionResult<GeneratedCopy[]>> {
  try {
    const prompt = `Write exactly 3 Vietnamese Facebook ad copies as JSON only. Product: ${params.product}. USP: ${params.usps}. Audience: ${params.audience}. Tone: ${params.tone}. Framework: ${params.framework}. Each item must include badge, title, body, cta, imagePrompt.`;
    const data = await callGeminiJson<GeneratedCopy[]>(
      prompt,
      (value): value is GeneratedCopy[] => Array.isArray(value) && value.every((item) => !!item.title && !!item.body && !!item.cta)
    );

    return { success: true, data: data || buildFallbackCopies(params) };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : 'Tạo bài viết thất bại.' };
  }
}

export async function analyzeCompetitorAction(params: AnalyzeCompetitorParams): Promise<ActionResult<CompetitorAnalysis>> {
  try {
    const competitorName = extractCompetitorName(params.pageUrl, params.savedCompetitor);
    const metaToken = process.env.FB_AD_LIBRARY_ACCESS_TOKEN;

    if (metaToken && metaToken !== 'YOUR_FACEBOOK_ACCESS_TOKEN_HERE') {
      const metaAds = await fetchMetaAdLibraryAds({
        accessToken: metaToken,
        pageUrl: params.pageUrl,
        competitorName,
      });
      const analysis = await buildAnalysisFromMetaAds(competitorName, params.audience, metaAds);
      return { success: true, data: analysis };
    }

    return {
      success: false,
      error: 'Thiếu FB_AD_LIBRARY_ACCESS_TOKEN. Không thể lấy dữ liệu live từ Meta Ad Library.',
    };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : 'Phân tích đối thủ thất bại.' };
  }
}

export async function generateCounterAdAction(params: CounterAdParams): Promise<ActionResult<CounterAd>> {
  try {
    const prompt = `Write one Vietnamese counter-ad as JSON only. Competitor: ${params.competitorName}. Competitor ad: ${params.competitorText}. Loophole: ${params.loophole}. Angle: ${params.angleTitle}. Hook: ${params.angleHook}. Our product: ${params.ourProduct}. Our USP: ${params.ourUsps}. Include badge, targetLoophole, hook, body, cta, strategyDescription.`;
    const data = await callGeminiJson<CounterAd>(
      prompt,
      (value): value is CounterAd => {
        const data = value as CounterAd;
        return !!data?.hook && !!data?.body && !!data?.cta;
      }
    );

    return { success: true, data: data || buildFallbackCounterAd(params) };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : 'Tạo bài phản đòn thất bại.' };
  }
}

function extractCompetitorName(pageUrl: string, savedCompetitor?: string) {
  if (savedCompetitor) return savedCompetitor.split(' (')[0];

  const cleaned = pageUrl
      .replace('https://facebook.com/', '')
      .replace('https://www.facebook.com/', '')
      .replace('https://m.facebook.com/', '')
    .replace('http://facebook.com/', '')
    .replace('http://www.facebook.com/', '')
    .replace(/\?.*$/, '')
    .replace(/\/$/, '')
    .split('/')[0];

  return cleaned || 'Đối thủ';
}

async function fetchMetaAdLibraryAds({
  accessToken,
  pageUrl,
  competitorName,
}: {
  accessToken: string;
  pageUrl: string;
  competitorName: string;
}): Promise<MetaAdArchiveItem[]> {
  const pageId = await resolveFacebookPageId(pageUrl, accessToken);
  const params = new URLSearchParams({
    access_token: accessToken,
    ad_active_status: 'ACTIVE',
    ad_reached_countries: JSON.stringify(['VN']),
    ad_type: 'ALL',
    fields: META_AD_FIELDS,
    limit: '20',
  });

  if (pageId) {
    params.set('search_page_ids', JSON.stringify([pageId]));
  } else {
    params.set('search_terms', competitorName);
  }

  const url = `https://graph.facebook.com/${GRAPH_API_VERSION}/ads_archive?${params.toString()}`;
  const response = await fetch(url, { cache: 'no-store' });
  const payload = await response.json();

  if (!response.ok) {
    const message = payload?.error?.message || `Meta Ad Library request failed with status ${response.status}`;
    throw new Error(message);
  }

  return Array.isArray(payload.data) ? payload.data : [];
}

async function resolveFacebookPageId(pageUrl: string, accessToken: string): Promise<string | null> {
  if (!pageUrl || !pageUrl.includes('facebook.com')) return null;

  try {
    const params = new URLSearchParams({
      id: pageUrl,
      access_token: accessToken,
      fields: 'id',
    });
    const response = await fetch(`https://graph.facebook.com/${GRAPH_API_VERSION}/?${params.toString()}`, { cache: 'no-store' });
    const payload = await response.json();
    return response.ok && payload?.id ? String(payload.id) : null;
  } catch {
    return null;
  }
}

async function buildAnalysisFromMetaAds(
  competitorName: string,
  audience: string,
  metaAds: MetaAdArchiveItem[]
): Promise<CompetitorAnalysis> {
  const adList = metaAds.slice(0, 10).map((ad, index) => mapMetaAdToCompetitorAd(ad, index));
  const pageName = metaAds.find((ad) => ad.page_name)?.page_name || competitorName;
  const platforms = Array.from(new Set(metaAds.flatMap((ad) => ad.publisher_platforms || [])));
  const imageCount = metaAds.filter((ad) => (ad.media_type || '').toUpperCase().includes('IMAGE')).length;
  const sampleTexts = adList.map((ad) => ad.text).filter(Boolean).slice(0, 6);
  const aiOverview = await analyzeRealAdTexts(pageName, audience, sampleTexts);
  const fallbackOverview = buildRuleBasedOverview(pageName, sampleTexts);

  return {
    adList,
    overview: {
      competitor: pageName,
      activeAds: metaAds.length,
      imagePct: metaAds.length ? Math.round((imageCount / metaAds.length) * 100) : 0,
      platforms: platforms.length ? platforms.join(', ') : 'Facebook',
      hooks: aiOverview?.hooks?.length ? aiOverview.hooks : fallbackOverview.hooks,
      loopholes: aiOverview?.loopholes?.length ? aiOverview.loopholes : fallbackOverview.loopholes,
      angles: aiOverview?.angles?.length ? aiOverview.angles : fallbackOverview.angles,
    },
    source: 'meta-ad-library',
    sourceLabel: `Live Meta Ad Library: đã lấy ${metaAds.length} quảng cáo đang hoạt động`,
  };
}

function mapMetaAdToCompetitorAd(ad: MetaAdArchiveItem, index: number): CompetitorAd {
  const body = ad.ad_creative_bodies?.[0] || ad.ad_creative_link_descriptions?.[0] || ad.ad_creative_link_titles?.[0] || 'Meta không trả về primary text.';
  const startLabel = ad.ad_delivery_start_time ? `Chạy từ ${ad.ad_delivery_start_time.slice(0, 10)}` : 'Quảng cáo đang hoạt động';
  const media = ad.media_type ? `[${ad.media_type}]` : '[Meta Ad Library creative]';

  return {
    id: ad.id || `meta_ad_${index + 1}`,
    title: ad.ad_creative_link_titles?.[0] || `Quảng cáo Meta ${index + 1}`,
    timeLabel: startLabel,
    thumbnail: ad.ad_snapshot_url ? `${media} Có snapshot` : media,
    text: body,
    engagement: 'Meta không công khai chỉ số',
    status: index < 2 ? 'winning' : 'testing',
    statusLabel: index < 2 ? 'Đang chạy' : 'Đang test',
  };
}

async function analyzeRealAdTexts(competitorName: string, audience: string, sampleTexts: string[]) {
  if (!sampleTexts.length) return null;

  return callGeminiJson<Pick<CompetitorAnalysis['overview'], 'hooks' | 'loopholes' | 'angles'>>(
    `Analyze these real Meta Ad Library ads for ${competitorName}. Audience: ${audience}. Return JSON only with hooks:string[2], loopholes:string[3], angles:{title:string,hook:string}[3]. Ads:\n${sampleTexts.join('\n---\n')}`,
    (value): value is Pick<CompetitorAnalysis['overview'], 'hooks' | 'loopholes' | 'angles'> => {
      const data = value as Pick<CompetitorAnalysis['overview'], 'hooks' | 'loopholes' | 'angles'>;
      return Array.isArray(data?.hooks) && Array.isArray(data?.loopholes) && Array.isArray(data?.angles);
    }
  );
}

function buildRuleBasedOverview(competitorName: string, sampleTexts: string[]) {
  const joined = sampleTexts.join(' ').toLowerCase();
  const discountFocus = /sale|discount|uu dai|ưu đãi|giam|giảm|free|mien phi|miễn phí|hoc thu|học thử/.test(joined);
  const proofFocus = /review|cam nhan|cảm nhận|hoc vien|học viên|testimonial|case study/.test(joined);

  return {
    hooks: [
      discountFocus
        ? `${competitorName} đang dùng hook ưu đãi/học thử miễn phí để giảm ma sát đăng ký.`
        : `${competitorName} đang dùng hook xoay quanh kết quả và sự tiện lợi.`,
      proofFocus
        ? 'Đối thủ cũng dựa vào social proof từ học viên/review để xây dựng niềm tin.'
        : 'Text Meta trả về chưa cho thấy nhiều bằng chứng có thể kiểm chứng.',
    ],
    loopholes: [
      'Public ad text không có chỉ số riêng như CPM, CPA hoặc ROAS, nên xếp hạng performance chỉ mang tính định hướng.',
      'Có thể phản đòn bằng cam kết, bằng chứng và điểm khác biệt cụ thể hơn.',
      'Nếu creative của đối thủ nặng ưu đãi, angle về chất lượng và độ tin cậy có thể giúp offer của bạn nổi bật.',
    ],
    angles: [
      {
        title: 'Angle 1: Bằng chứng mạnh hơn',
        hook: 'Đừng chọn chỉ vì ưu đãi. Hãy hỏi bằng chứng, lộ trình học và cách đo tiến bộ trước khi đăng ký.',
      },
      {
        title: 'Angle 2: Cam kết rõ ràng',
        hook: 'Một chương trình nghiêm túc phải nói rõ điều gì xảy ra nếu bạn không đạt kết quả đã hứa.',
      },
      {
        title: 'Angle 3: Lộ trình cá nhân',
        hook: 'Lớp học đại trà thường tạo kết quả đại trà. Lộ trình 1 kèm 1 nên bắt đầu từ điểm yếu thật của bạn.',
      },
    ],
  };
}

function buildFallbackCopies({ product, usps, audience, tone, framework }: GenerateCopyParams): GeneratedCopy[] {
  const uspList = usps.split(/[,;\n]+/).map((item) => item.trim()).filter(Boolean);
  const mainUsp = uspList[0] || 'giải pháp chất lượng cao';
  const urgentPrefix = tone.includes('Cấp bách') ? 'Chỉ hôm nay: ' : '';
  const playfulPrefix = tone.includes('hài hước') ? 'Tin vui cho người bận rộn: ' : '';

  return [1, 2, 3].map((index) => ({
    badge: `Biến thể ${index} (${framework})`,
    title: `${urgentPrefix}${playfulPrefix}${product} giúp ${audience} có lộ trình rõ ràng hơn.`,
    body: `Nếu bạn đang cần một cách tiếp cận thực tế, ${product} tập trung vào đúng vấn đề cần giải quyết.\n\nĐiểm nổi bật:\n${uspList.map((item) => `- ${item}`).join('\n')}\n\nNội dung này nhấn mạnh ${mainUsp} và lợi ích có thể cảm nhận ngay trong quá trình học.`,
    cta: 'Nhắn tin ngay để nhận tư vấn lộ trình và ưu đãi trải nghiệm trong hôm nay.',
    imagePrompt: `Facebook ad image for ${product}, target audience ${audience}, clean modern layout, realistic people, highlight ${mainUsp}.`,
  }));
}

function buildFallbackCompetitorAnalysis(competitorName: string): CompetitorAnalysis {
  const isIelts = competitorName.includes('IELTS');
  const seed = competitorName.split('').reduce((total, char) => total + char.charCodeAt(0), 0);
  const activeAds = isIelts ? 42 : 10 + (seed % 37);
  const imagePct = isIelts ? 60 : 45 + (seed % 41);
  const primaryHook = competitorName === 'Đối thủ' ? 'đối thủ này' : competitorName;

  return {
    adList: [
      {
        id: 'ad_001',
        title: 'Mẫu QC 1 (Winning Ad)',
        timeLabel: 'Chạy từ 12/05',
        thumbnail: '[Banner ưu đãi 50%]',
        text: `${primaryHook} đang dùng thông điệp ưu đãi học thử, giáo viên bản ngữ và cam kết cải thiện phản xạ để kéo lead nhanh.`,
        engagement: `${900 + (seed % 900)} tương tác`,
        status: 'winning',
        statusLabel: 'Winning Ad',
      },
      {
        id: 'ad_002',
        title: 'Mẫu QC 2 (Winning Ad)',
        timeLabel: 'Chạy từ 15/05',
        thumbnail: '[Giáo viên và học viên]',
        text: `${primaryHook} khai thác nỗi đau học trước quên sau và đưa ra lịch học linh hoạt như một lời hứa chính.`,
        engagement: `${520 + (seed % 600)} tương tác`,
        status: 'winning',
        statusLabel: 'Winning Ad',
      },
      {
        id: 'ad_003',
        title: 'Mẫu QC 3 (Testing Ad)',
        timeLabel: 'Video Ad',
        thumbnail: '[Video review học viên]',
        text: `${primaryHook} có xu hướng dùng video review học viên để tạo social proof và giảm nghi ngờ trước khi inbox.`,
        engagement: `${1 + (seed % 4)}.${seed % 10}K lượt xem`,
        status: 'testing',
        statusLabel: 'Đang test',
      },
    ],
    overview: {
      competitor: competitorName,
      activeAds,
      imagePct,
      platforms: isIelts ? 'Facebook, Instagram, Audience Network' : 'Facebook, Instagram',
      hooks: [
        `${primaryHook} tập trung vào ưu đãi, cam kết nhanh và lợi ích dễ hiểu để kéo người xem inbox.`,
        'Dùng yếu tố giáo viên bản ngữ để tạo niềm tin nhanh, nhưng ít chứng minh năng lực bằng chứng chỉ cụ thể.',
      ],
      loopholes: [
        'Cam kết đầu ra chưa được trình bày rõ bằng văn bản hoặc điều kiện hoàn tiền cụ thể.',
        'Hình ảnh quảng cáo còn generic, chưa cho thấy trải nghiệm 1 kèm 1 thật sự cá nhân hóa.',
        'Ít bằng chứng về chứng chỉ sư phạm quốc tế hoặc quy trình đánh giá tiến bộ của học viên.',
      ],
      angles: [
        {
          title: 'Angle 1: Chất lượng giáo viên có chứng chỉ',
          hook: 'Học với giáo viên bản ngữ là chưa đủ. Hãy chọn giáo viên có chứng chỉ giảng dạy và lộ trình sửa lỗi từng buổi.',
        },
        {
          title: 'Angle 2: Cam kết đầu ra rõ ràng',
          hook: 'Nếu một khóa học không dám cam kết kết quả bằng văn bản, bạn đang tự chịu toàn bộ rủi ro.',
        },
        {
          title: 'Angle 3: Lịch học cho người cực bận',
          hook: 'Không cần ép mình theo lịch cố định. Lộ trình 1 kèm 1 linh hoạt giúp bạn học đều ngay cả khi lịch làm việc thay đổi.',
        },
      ],
    },
    source: 'demo-fallback',
    sourceLabel: 'Demo fallback: chưa gọi dữ liệu live từ Meta Ad Library',
  };
}

function buildFallbackCounterAd(params: CounterAdParams): CounterAd {
  return {
    badge: `Phản đòn: ${params.angleTitle}`,
    targetLoophole: params.loophole || 'Đối thủ chưa chứng minh rõ cam kết chất lượng và kết quả đầu ra.',
    hook: params.angleHook || 'Đừng đánh cược thời gian vào một khóa học thiếu cam kết rõ ràng.',
    body: `Nhiều người chọn khóa học vì ưu đãi rẻ, nhưng sau đó lại mất thêm thời gian vì không có lộ trình phù hợp.\n\nVới ${params.ourProduct}, chúng tôi tập trung vào sự an tâm ngay từ đầu:\n${params.ourUsps
      .split(/[,;\n]+/)
      .map((item) => `- ${item.trim()}`)
      .join('\n')}\n\nBạn cần một lộ trình rõ ràng, người hướng dẫn đủ năng lực và cách đo tiến bộ minh bạch.`,
    cta: 'Nhắn tin ngay để nhận tư vấn lộ trình và suất trải nghiệm miễn phí trong hôm nay.',
    strategyDescription:
      'Bài viết dùng loss aversion để nhấn mạnh rủi ro khi chọn giải pháp mơ hồ, sau đó giảm lo ngại bằng cam kết và bằng chứng chất lượng.',
  };
}
