'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { getAiInsightsAction, type AiInsightsPayload, type InsightRecommendation } from '@/app/actions/aiInsights';
import MainLayout from '@/components/Layout/MainLayout';
import styles from './page.module.css';

interface ChatMessage {
  role: 'ai' | 'user';
  content: string;
}

export default function AiAnalysisPage() {
  const [selectedAccountId, setSelectedAccountId] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [payload, setPayload] = useState<AiInsightsPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'ai',
      content:
        'Toi la AI Insights assistant. Bam Quet toan bo tai khoan de lay campaign data, sau do hoi toi campaign nao nen scale hoac can tat.',
    },
  ]);

  const loadInsights = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const result = await getAiInsightsAction(selectedAccountId);
    if (result.success && result.data) {
      const data = result.data;
      setPayload(data);
      setMessages((prev) => [
        ...prev,
        {
          role: 'ai',
          content: `Da tao ${data.recommendations.length} insight tu nguon du lieu ${data.summary.source}. ROAS hien tai: ${data.summary.roas}x.`,
        },
      ]);
    } else {
      setError(result.error || 'Khong the tao AI insights');
    }
    setIsLoading(false);
  }, [selectedAccountId]);

  useEffect(() => {
    queueMicrotask(() => {
      void loadInsights();
    });
  }, [loadInsights]);

  const recommendedScale = useMemo(
    () => payload?.recommendations.find((item) => item.id === 'scale-candidate'),
    [payload]
  );

  const handleSendMessage = () => {
    const question = chatInput.trim();
    if (!question) return;

    const reply = buildChatReply(question, payload, recommendedScale);
    setMessages((prev) => [...prev, { role: 'user', content: question }, { role: 'ai', content: reply }]);
    setChatInput('');
  };

  return (
    <MainLayout
      title="AI Insights"
      showRightSidebar={false}
      onRefresh={loadInsights}
      isRefreshing={isLoading}
      accounts={payload?.accounts || []}
      selectedAccountId={selectedAccountId}
      onAccountChange={(accountId) => {
        setSelectedAccountId(accountId);
        setPayload(null);
      }}
    >
      <div className={styles.shell}>
        <main className={styles.feed}>
          <div className={styles.toolbar}>
            <div>
              <h2>Tro ly Phan Tich AI</h2>
              <p>Doc du lieu campaign, phat hien rui ro va co hoi hanh dong nhanh.</p>
            </div>
            <button className="btn btn-primary" onClick={loadInsights} disabled={isLoading}>
              {isLoading ? 'Dang quet...' : 'Quet toan bo tai khoan'}
            </button>
          </div>

          {error && <div className={styles.errorBox}>{error}</div>}

          {payload && (
            <section className={styles.summaryGrid}>
              <SummaryCard label="Spend" value={formatMoney(payload.summary.spend)} />
              <SummaryCard label="Revenue" value={formatMoney(payload.summary.revenue)} />
              <SummaryCard label="ROAS" value={`${payload.summary.roas}x`} />
              <SummaryCard label="CTR" value={`${payload.summary.ctr}%`} />
            </section>
          )}

          {isLoading && !payload ? (
            <div className={styles.loadingState}>Dang phan tich du lieu...</div>
          ) : (
            <section className={styles.recommendationList}>
              {(payload?.recommendations || []).map((item) => (
                <RecommendationCard key={item.id} item={item} />
              ))}
            </section>
          )}
        </main>

        <aside className={styles.chatPanel}>
          <div className={styles.chatHeader}>
            <div className={styles.chatTitle}>AI Campaign Assistant</div>
            <span>{payload ? payload.summary.source : 'waiting'}</span>
          </div>
          <div className={styles.messageList}>
            {messages.map((message, index) => (
              <div key={`${message.role}-${index}`} className={`${styles.message} ${styles[message.role]}`}>
                {message.content}
              </div>
            ))}
          </div>
          <div className={styles.chatInputArea}>
            <input
              className={styles.chatInput}
              value={chatInput}
              placeholder="Hoi AI ve scale, CPA, ROAS..."
              onChange={(event) => setChatInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') handleSendMessage();
              }}
            />
            <button className={styles.sendButton} onClick={handleSendMessage}>Send</button>
          </div>
        </aside>
      </div>
    </MainLayout>
  );
}

function RecommendationCard({ item }: { item: InsightRecommendation }) {
  return (
    <article className={`${styles.card} ${styles[item.severity]}`}>
      <div className={styles.cardHeader}>
        <span className={styles.category}>{item.category}</span>
        <span className={styles.impact}>{item.impact}</span>
      </div>
      <h3>{item.title}</h3>
      <p>{item.description}</p>
      <div className={styles.metrics}>
        {item.metrics.map((metric) => (
          <div key={metric.label} className={styles.metric}>
            <span>{metric.label}</span>
            <strong className={metric.tone ? styles[metric.tone] : ''}>{metric.value}</strong>
          </div>
        ))}
      </div>
      <div className={styles.cardFooter}>
        <span>{item.actionHint}</span>
        <button className="btn">{item.actionLabel}</button>
      </div>
    </article>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className={styles.summaryCard}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function buildChatReply(question: string, payload: AiInsightsPayload | null, scaleCandidate?: InsightRecommendation) {
  if (!payload) return 'Chua co du lieu. Hay bam Quet toan bo tai khoan truoc.';

  const lower = question.toLowerCase();
  const risk = payload.recommendations.find((item) => item.severity === 'danger');

  if (lower.includes('scale') || lower.includes('vit') || lower.includes('tang')) {
    return scaleCandidate
      ? `${scaleCandidate.title}. De xuat: ${scaleCandidate.actionHint}`
      : 'Chua thay campaign du dieu kien scale ro rang. Nen uu tien on dinh CPA/ROAS truoc.';
  }

  if (lower.includes('tat') || lower.includes('kill') || lower.includes('rui ro') || lower.includes('cpa')) {
    return risk ? `${risk.title}. Ly do: ${risk.description}` : 'Chua co canh bao CPA nghiem trong trong tap du lieu hien tai.';
  }

  if (lower.includes('roas') || lower.includes('loi') || lower.includes('lai')) {
    return `ROAS hien tai la ${payload.summary.roas}x, spend ${formatMoney(payload.summary.spend)}, revenue uoc tinh ${formatMoney(payload.summary.revenue)}.`;
  }

  return `Toi dang thay ${payload.recommendations.length} insight. Uu tien hien tai: ${payload.recommendations[0]?.title || 'sync them du lieu campaign'}.`;
}

function formatMoney(value: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(value || 0);
}
