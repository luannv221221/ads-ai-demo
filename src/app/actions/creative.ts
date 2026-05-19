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
    return { success: false, error: error instanceof Error ? error.message : 'Tao bai viet that bai.' };
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
      error: 'Missing FB_AD_LIBRARY_ACCESS_TOKEN. Can not fetch live Meta Ad Library data.',
    };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : 'Phan tich doi thu that bai.' };
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
    return { success: false, error: error instanceof Error ? error.message : 'Tao bai phan don that bai.' };
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

  return cleaned || 'Doi thu';
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
    sourceLabel: `Live Meta Ad Library: ${metaAds.length} active ads fetched`,
  };
}

function mapMetaAdToCompetitorAd(ad: MetaAdArchiveItem, index: number): CompetitorAd {
  const body = ad.ad_creative_bodies?.[0] || ad.ad_creative_link_descriptions?.[0] || ad.ad_creative_link_titles?.[0] || 'No primary text returned by Meta.';
  const startLabel = ad.ad_delivery_start_time ? `Start ${ad.ad_delivery_start_time.slice(0, 10)}` : 'Active ad';
  const media = ad.media_type ? `[${ad.media_type}]` : '[Meta Ad Library creative]';

  return {
    id: ad.id || `meta_ad_${index + 1}`,
    title: ad.ad_creative_link_titles?.[0] || `Meta active ad ${index + 1}`,
    timeLabel: startLabel,
    thumbnail: ad.ad_snapshot_url ? `${media} Snapshot available` : media,
    text: body,
    engagement: 'Public metrics unavailable',
    status: index < 2 ? 'winning' : 'testing',
    statusLabel: index < 2 ? 'Active Ad' : 'Active/Test',
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
  const discountFocus = /sale|discount|uu dai|giam|free|mien phi|hoc thu/.test(joined);
  const proofFocus = /review|cam nhan|hoc vien|testimonial|case study/.test(joined);

  return {
    hooks: [
      discountFocus
        ? `${competitorName} is using promotion/free-trial hooks to reduce signup friction.`
        : `${competitorName} is using benefit-led hooks around outcome and convenience.`,
      proofFocus
        ? 'They also lean on social proof from learners/reviews to build trust.'
        : 'The ads do not show much verifiable proof in the text returned by Meta.',
    ],
    loopholes: [
      'Public ad text does not expose private metrics like CPM, CPA or ROAS, so performance ranking is only directional.',
      'The message can be countered by making guarantees, proof and differentiation more specific.',
      'If the creative is promotion-heavy, a quality and credibility angle can separate your offer.',
    ],
    angles: [
      {
        title: 'Angle 1: Stronger proof',
        hook: 'Do not choose only by discount. Ask for proof, learning path and measurable progress before you enroll.',
      },
      {
        title: 'Angle 2: Clear guarantee',
        hook: 'A serious program should show what happens if you do not reach the promised outcome.',
      },
      {
        title: 'Angle 3: Personal path',
        hook: 'Generic classes create generic results. A 1-on-1 path should start from your actual weakness.',
      },
    ],
  };
}

function buildFallbackCopies({ product, usps, audience, tone, framework }: GenerateCopyParams): GeneratedCopy[] {
  const uspList = usps.split(/[,;\n]+/).map((item) => item.trim()).filter(Boolean);
  const mainUsp = uspList[0] || 'giai phap chat luong cao';
  const urgentPrefix = tone.includes('Cap bach') ? 'Chi hom nay: ' : '';
  const playfulPrefix = tone.includes('Hai huoc') ? 'Tin vui cho nguoi ban ron: ' : '';

  return [1, 2, 3].map((index) => ({
    badge: `Bien the ${index} (${framework})`,
    title: `${urgentPrefix}${playfulPrefix}${product} giup ${audience} co lo trinh ro rang hon.`,
    body: `Neu ban dang can mot cach tiep can thuc te, ${product} tap trung vao dung van de can giai quyet.\n\nDiem noi bat:\n${uspList.map((item) => `- ${item}`).join('\n')}\n\nNoi dung nay nhan manh ${mainUsp} va loi ich co the cam nhan ngay trong qua trinh hoc.`,
    cta: 'Nhan tin ngay de nhan tu van lo trinh va uu dai trai nghiem trong hom nay.',
    imagePrompt: `Facebook ad image for ${product}, target audience ${audience}, clean modern layout, realistic people, highlight ${mainUsp}.`,
  }));
}

function buildFallbackCompetitorAnalysis(competitorName: string): CompetitorAnalysis {
  const isIelts = competitorName.includes('IELTS');
  const seed = competitorName.split('').reduce((total, char) => total + char.charCodeAt(0), 0);
  const activeAds = isIelts ? 42 : 10 + (seed % 37);
  const imagePct = isIelts ? 60 : 45 + (seed % 41);
  const primaryHook = competitorName === 'Doi thu' ? 'doi thu nay' : competitorName;

  return {
    adList: [
      {
        id: 'ad_001',
        title: 'Mau QC 1 (Winning Ad)',
        timeLabel: 'Chay tu 12/05',
        thumbnail: '[Banner uu dai 50%]',
        text: `${primaryHook} dang dung thong diep uu dai hoc thu, giao vien ban ngu va cam ket cai thien phan xa de keo lead nhanh.`,
        engagement: `${900 + (seed % 900)} tuong tac`,
        status: 'winning',
        statusLabel: 'Winning Ad',
      },
      {
        id: 'ad_002',
        title: 'Mau QC 2 (Winning Ad)',
        timeLabel: 'Chay tu 15/05',
        thumbnail: '[Giao vien va hoc vien]',
        text: `${primaryHook} khai thac noi dau hoc truoc quen sau va dua ra lich hoc linh hoat nhu mot loi hua chinh.`,
        engagement: `${520 + (seed % 600)} tuong tac`,
        status: 'winning',
        statusLabel: 'Winning Ad',
      },
      {
        id: 'ad_003',
        title: 'Mau QC 3 (Testing Ad)',
        timeLabel: 'Video Ad',
        thumbnail: '[Video review hoc vien]',
        text: `${primaryHook} co xu huong dung video review hoc vien de tao social proof va giam nghi ngo truoc khi inbox.`,
        engagement: `${1 + (seed % 4)}.${seed % 10}K luot xem`,
        status: 'testing',
        statusLabel: 'Dang test',
      },
    ],
    overview: {
      competitor: competitorName,
      activeAds,
      imagePct,
      platforms: isIelts ? 'Facebook, Instagram, Audience Network' : 'Facebook, Instagram',
      hooks: [
        `${primaryHook} tap trung vao uu dai, cam ket nhanh va loi ich de hieu de keo nguoi xem inbox.`,
        'Dung yeu to giao vien ban ngu de tao niem tin nhanh, nhung it chung minh nang luc bang chung chi cu the.',
      ],
      loopholes: [
        'Cam ket dau ra chua duoc trinh bay ro bang van ban hoac dieu kien hoan tien cu the.',
        'Hinh anh quang cao con generic, chua cho thay trai nghiem 1 kem 1 that su ca nhan hoa.',
        'It bang chung ve chung chi su pham quoc te hoac quy trinh danh gia tien bo cua hoc vien.',
      ],
      angles: [
        {
          title: 'Angle 1: Chat luong giao vien co chung chi',
          hook: 'Hoc voi giao vien ban ngu la chua du. Hay chon giao vien co chung chi giang day va lo trinh sua loi tung buoi.',
        },
        {
          title: 'Angle 2: Cam ket dau ra ro rang',
          hook: 'Neu mot khoa hoc khong dam cam ket ket qua bang van ban, ban dang tu chiu toan bo rui ro.',
        },
        {
          title: 'Angle 3: Lich hoc cho nguoi cuc ban',
          hook: 'Khong can ep minh theo lich co dinh. Lo trinh 1 kem 1 linh hoat giup ban hoc deu ngay ca khi lich lam viec thay doi.',
        },
      ],
    },
    source: 'demo-fallback',
    sourceLabel: 'Demo fallback: no live Meta Ad Library fetch was performed',
  };
}

function buildFallbackCounterAd(params: CounterAdParams): CounterAd {
  return {
    badge: `Phan don: ${params.angleTitle}`,
    targetLoophole: params.loophole || 'Doi thu chua chung minh ro cam ket chat luong va ket qua dau ra.',
    hook: params.angleHook || 'Dung danh cuoc thoi gian vao mot khoa hoc thieu cam ket ro rang.',
    body: `Nhieu nguoi chon khoa hoc vi uu dai re, nhung sau do lai mat them thoi gian vi khong co lo trinh phu hop.\n\nVoi ${params.ourProduct}, chung toi tap trung vao su an tam ngay tu dau:\n${params.ourUsps
      .split(/[,;\n]+/)
      .map((item) => `- ${item.trim()}`)
      .join('\n')}\n\nBan can mot lo trinh ro rang, nguoi huong dan du nang luc va cach do tien bo minh bach.`,
    cta: 'Nhan tin ngay de nhan tu van lo trinh va suat trai nghiem mien phi trong hom nay.',
    strategyDescription:
      'Bai viet dung loss aversion de nhan manh rui ro khi chon giai phap mo ho, sau do giam lo ngai bang cam ket va bang chung chat luong.',
  };
}
