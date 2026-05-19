'use client';

import { useCallback, useEffect, useState } from 'react';
import { generateCopywritingAction, analyzeCompetitorAction, generateCounterAdAction } from '@/app/actions/creative';
import { getAdAccounts } from '@/app/actions/dashboard';
import { syncAllAccounts } from '@/app/actions/facebook';
import MainLayout from '@/components/Layout/MainLayout';
import { AdPreviewModal } from './components/AdPreviewModal';
import { CompetitorForm } from './components/CompetitorForm';
import { CompetitorResults } from './components/CompetitorResults';
import { CopyResults } from './components/CopyResults';
import { CopywritingForm } from './components/CopywritingForm';
import { CreativeLibrary } from './components/CreativeLibrary';
import { Toast } from './components/Toast';
import { CUSTOM_COMPETITOR_LABEL, DEFAULT_COMPETITOR_FORM, DEFAULT_COPY_FORM } from './constants';
import { createImagePrompt, createSavedCreative, readCreativeLibrary, writeCreativeLibrary } from './creative-utils';
import type {
  AdAccountSummary,
  CompetitorAd,
  CompetitorAnalysis,
  CounterAd,
  CreativeTab,
  GeneratedCopy,
  SavedCreative,
  ToastMessage,
  ToastType,
} from './types';
import styles from './creative.module.css';

export default function CreativePage() {
  const [activeTab, setActiveTab] = useState<CreativeTab>('copywriting');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [accounts, setAccounts] = useState<AdAccountSummary[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState('all');
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const [product, setProduct] = useState(DEFAULT_COPY_FORM.product);
  const [usps, setUsps] = useState(DEFAULT_COPY_FORM.usps);
  const [audience, setAudience] = useState(DEFAULT_COPY_FORM.audience);
  const [tone, setTone] = useState(DEFAULT_COPY_FORM.tone);
  const [framework, setFramework] = useState(DEFAULT_COPY_FORM.framework);

  const [competitorUrl, setCompetitorUrl] = useState(DEFAULT_COMPETITOR_FORM.competitorUrl);
  const [savedCompetitor, setSavedCompetitor] = useState(DEFAULT_COMPETITOR_FORM.savedCompetitor);
  const [competitorAudience, setCompetitorAudience] = useState(DEFAULT_COMPETITOR_FORM.competitorAudience);

  const [isGenerating, setIsGenerating] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [generatedCopies, setGeneratedCopies] = useState<GeneratedCopy[] | null>(null);
  const [competitorData, setCompetitorData] = useState<CompetitorAnalysis | null>(null);
  const [selectedAdForDetail, setSelectedAdForDetail] = useState<CompetitorAd | null>(null);
  const [counterAdData, setCounterAdData] = useState<CounterAd | null>(null);
  const [isGeneratingCounterAd, setIsGeneratingCounterAd] = useState(false);
  const [activeCounterAngleIdx, setActiveCounterAngleIdx] = useState<number | null>(null);
  const [savedCreatives, setSavedCreatives] = useState<SavedCreative[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    setToast({ message, type });
    window.setTimeout(() => setToast(null), 3500);
  }, []);

  useEffect(() => {
    async function loadAccounts() {
      const result = await getAdAccounts();
      if (result.success && result.data) {
        setAccounts(result.data);
      }
    }

    loadAccounts();
  }, [refreshKey]);

  useEffect(() => {
    queueMicrotask(() => setSavedCreatives(readCreativeLibrary()));
  }, []);

  const persistSavedCreatives = useCallback((items: SavedCreative[]) => {
    setSavedCreatives(items);
    writeCreativeLibrary(items);
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const result = await syncAllAccounts();
      if (result.success) {
        setRefreshKey((prev) => prev + 1);
        showToast('Dong bo tai khoan quang cao thanh cong');
      } else {
        showToast(`Dong bo that bai: ${result.error}`, 'error');
      }
    } catch (error) {
      console.error(error);
      showToast('Co loi khi dong bo tai khoan', 'error');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleCopyToClipboard = async (text: string) => {
    if (!text.trim()) {
      showToast('Khong co noi dung de sao chep', 'error');
      return;
    }

    await navigator.clipboard.writeText(text);
    showToast('Da sao chep noi dung vao Clipboard');
  };

  const enrichCopies = useCallback(
    (items: GeneratedCopy[]) =>
      items.map((item) => ({
        ...item,
        imagePrompt: item.imagePrompt || createImagePrompt(item, product, audience),
      })),
    [audience, product]
  );

  const handleGenerateCopy = useCallback(async () => {
    setIsGenerating(true);
    setGeneratedCopies(null);
    try {
      const res = await generateCopywritingAction({ product, usps, audience, tone, framework });
      if (res.success && res.data) {
        setGeneratedCopies(enrichCopies(res.data));
        showToast('Da tao thanh cong cac mau quang cao');
      } else {
        showToast(res.error || 'Tao bai viet that bai', 'error');
      }
    } catch (error) {
      console.error(error);
      showToast('Co loi he thong xay ra', 'error');
    } finally {
      setIsGenerating(false);
    }
  }, [audience, enrichCopies, framework, product, showToast, tone, usps]);

  const handleAnalyzeCompetitor = useCallback(async () => {
    setIsAnalyzing(true);
    setCompetitorData(null);
    try {
      const res = await analyzeCompetitorAction({
        pageUrl: competitorUrl,
        savedCompetitor: savedCompetitor === CUSTOM_COMPETITOR_LABEL ? undefined : savedCompetitor,
        audience: competitorAudience,
      });
      if (res.success && res.data) {
        setCompetitorData(res.data);
        showToast('Phan tich doi thu hoan tat');
      } else {
        showToast(res.error || 'Phan tich doi thu that bai', 'error');
      }
    } catch (error) {
      console.error(error);
      showToast('Co loi khi quet du lieu', 'error');
    } finally {
      setIsAnalyzing(false);
    }
  }, [competitorAudience, competitorUrl, savedCompetitor, showToast]);

  const handleGenerateCounterAd = async (angleIndex: number) => {
    if (!competitorData) return;

    setIsGeneratingCounterAd(true);
    setActiveCounterAngleIdx(angleIndex);
    setCounterAdData(null);

    const angle = competitorData.overview.angles[angleIndex];
    const bestAd = competitorData.adList[0];

    try {
      const res = await generateCounterAdAction({
        competitorName: competitorData.overview.competitor,
        competitorText: bestAd?.text || '',
        loophole: competitorData.overview.loopholes[0] || '',
        angleTitle: angle.title,
        angleHook: angle.hook,
        ourProduct: product,
        ourUsps: usps,
      });
      if (res.success && res.data) {
        setCounterAdData(res.data);
        showToast('Da tao bai phan don');
      } else {
        showToast(res.error || 'Tao bai phan don that bai', 'error');
      }
    } catch (error) {
      console.error(error);
      showToast('Co loi khi tao bai phan don', 'error');
    } finally {
      setIsGeneratingCounterAd(false);
    }
  };

  const handleWriteFromHook = (hookText: string) => {
    setUsps((prev) => `Khai thac hook: "${hookText}"\n\n${prev}`);
    setActiveTab('copywriting');
    showToast('Da chuyen hook sang tab tao noi dung', 'info');
  };

  const handleSaveCreative = (copy: GeneratedCopy, source: SavedCreative['source'] = 'copywriting') => {
    const fallbackImagePrompt = createImagePrompt(copy, product, audience);
    const nextItems = [createSavedCreative(copy, source, fallbackImagePrompt), ...savedCreatives].slice(0, 24);
    persistSavedCreatives(nextItems);
    showToast('Da luu vao thu vien');
  };

  const handleSaveCounterAd = (counterAd: CounterAd) => {
    handleSaveCreative(
      {
        badge: counterAd.badge,
        title: counterAd.hook,
        body: counterAd.body,
        cta: counterAd.cta,
        imagePrompt: createImagePrompt({ title: counterAd.hook, body: counterAd.body, cta: counterAd.cta }, product, audience),
      },
      'counter-ad'
    );
  };

  return (
    <MainLayout
      title="Tro Ly Creative AI"
      onRefresh={handleRefresh}
      isRefreshing={isRefreshing}
      accounts={accounts}
      selectedAccountId={selectedAccountId}
      onAccountChange={setSelectedAccountId}
      showRightSidebar={false}
    >
      <div className={styles.container}>
        <Toast toast={toast} />

        <div className={styles.workspace}>
          <aside className={styles.paneInput}>
            <div className={styles.tabs}>
              <button
                className={`${styles.tab} ${activeTab === 'copywriting' ? styles.tabActive : ''}`}
                onClick={() => setActiveTab('copywriting')}
              >
                Tao Copywriting
              </button>
              <button
                className={`${styles.tab} ${activeTab === 'competitor' ? styles.tabActive : ''}`}
                onClick={() => {
                  setActiveTab('competitor');
                  if (!competitorData && !isAnalyzing) {
                    void handleAnalyzeCompetitor();
                  }
                }}
              >
                Phan tich Doi thu
              </button>
            </div>

            {activeTab === 'copywriting' ? (
              <CopywritingForm
                product={product}
                usps={usps}
                audience={audience}
                tone={tone}
                framework={framework}
                isGenerating={isGenerating}
                onProductChange={setProduct}
                onUspsChange={setUsps}
                onAudienceChange={setAudience}
                onToneChange={setTone}
                onFrameworkChange={setFramework}
                onGenerate={handleGenerateCopy}
              />
            ) : (
              <CompetitorForm
                competitorUrl={competitorUrl}
                savedCompetitor={savedCompetitor}
                audience={competitorAudience}
                isAnalyzing={isAnalyzing}
                onCompetitorUrlChange={(value) => {
                  setCompetitorUrl(value);
                  setSavedCompetitor(CUSTOM_COMPETITOR_LABEL);
                  setCompetitorData(null);
                }}
                onSavedCompetitorChange={(label, url) => {
                  setSavedCompetitor(label);
                  setCompetitorUrl(url);
                  setCompetitorData(null);
                }}
                onAudienceChange={setCompetitorAudience}
                onAnalyze={handleAnalyzeCompetitor}
              />
            )}
          </aside>

          <main className={styles.paneOutput}>
            {activeTab === 'copywriting' ? (
              <>
                <CopyResults
                  framework={framework}
                  copies={generatedCopies}
                  isGenerating={isGenerating}
                  onCopy={handleCopyToClipboard}
                  onDelete={(index) => setGeneratedCopies((prev) => (prev ? prev.filter((_, itemIndex) => itemIndex !== index) : prev))}
                  onSave={(copy) => handleSaveCreative(copy)}
                  onUpdate={(index, copy) =>
                    setGeneratedCopies((prev) => (prev ? prev.map((item, itemIndex) => (itemIndex === index ? copy : item)) : prev))
                  }
                />
                <CreativeLibrary
                  items={savedCreatives}
                  onCopy={handleCopyToClipboard}
                  onRemove={(id) => persistSavedCreatives(savedCreatives.filter((item) => item.id !== id))}
                />
              </>
            ) : (
              <CompetitorResults
                data={competitorData}
                counterAd={counterAdData}
                isAnalyzing={isAnalyzing}
                isGeneratingCounterAd={isGeneratingCounterAd}
                activeCounterAngleIdx={activeCounterAngleIdx}
                onPreviewAd={setSelectedAdForDetail}
                onWriteFromHook={handleWriteFromHook}
                onGenerateCounterAd={handleGenerateCounterAd}
                onCopy={handleCopyToClipboard}
                onSaveCounterAd={handleSaveCounterAd}
              />
            )}
          </main>
        </div>

        <AdPreviewModal
          ad={selectedAdForDetail}
          competitorData={competitorData}
          onClose={() => setSelectedAdForDetail(null)}
          onCopy={handleCopyToClipboard}
        />
      </div>
    </MainLayout>
  );
}
