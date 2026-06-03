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
        'Tôi là AI Insights assistant. Bấm Quét toàn bộ tài khoản để lấy campaign data, sau đó hỏi tôi campaign nào nên scale hoặc cần tắt.',
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
          content: `Đã tạo ${data.recommendations.length} insight từ nguồn dữ liệu ${data.summary.source}. ROAS hiện tại: ${data.summary.roas}x.`,
        },
      ]);
    } else {
      setError(result.error || 'Không thể tạo AI insights');
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
      contentMode="fullHeight"
      showRightSidebar={false}
      onRefresh={loadInsights}
      isRefreshing={isLoading}
      accounts={payload?.accounts || []}
      selectedAccountId={selectedAccountId}
      showDateRange={false}
      showAccountSelect
      dataStatus={payload ? payload.summary.source === 'mock' ? 'demo' : 'synced' : 'idle'}
      onAccountChange={(accountId) => {
        setSelectedAccountId(accountId);
        setPayload(null);
      }}
    >
      <div className={styles.shell}>
        <main className={styles.feed}>
          <div className={styles.toolbar}>
            <div>
              <h2>Trợ lý phân tích AI</h2>
              <p>Đọc dữ liệu campaign, phát hiện rủi ro và cơ hội hành động nhanh.</p>
            </div>
            <button className="btn btn-primary" onClick={loadInsights} disabled={isLoading}>
              {isLoading ? 'Đang quét...' : 'Quét toàn bộ tài khoản'}
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
            <div className={styles.loadingState}>Đang phân tích dữ liệu...</div>
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
            <span>{payload ? payload.summary.source : 'đang chờ'}</span>
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
              placeholder="Hỏi AI về scale, CPA, ROAS..."
              onChange={(event) => setChatInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') handleSendMessage();
              }}
            />
            <button className={styles.sendButton} onClick={handleSendMessage}>Gửi</button>
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
  if (!payload) return 'Chưa có dữ liệu. Hãy bấm Quét toàn bộ tài khoản trước.';

  const lower = question.toLowerCase();
  const risk = payload.recommendations.find((item) => item.severity === 'danger');

  if (lower.includes('scale') || lower.includes('vit') || lower.includes('tang')) {
    return scaleCandidate
      ? `${scaleCandidate.title}. Đề xuất: ${scaleCandidate.actionHint}`
      : 'Chưa thấy campaign đủ điều kiện scale rõ ràng. Nên ưu tiên ổn định CPA/ROAS trước.';
  }

  if (lower.includes('tat') || lower.includes('kill') || lower.includes('rui ro') || lower.includes('cpa')) {
    return risk ? `${risk.title}. Lý do: ${risk.description}` : 'Chưa có cảnh báo CPA nghiêm trọng trong tập dữ liệu hiện tại.';
  }

  if (lower.includes('roas') || lower.includes('loi') || lower.includes('lai')) {
    return `ROAS hiện tại là ${payload.summary.roas}x, spend ${formatMoney(payload.summary.spend)}, revenue ước tính ${formatMoney(payload.summary.revenue)}.`;
  }

  return `Tôi đang thấy ${payload.recommendations.length} insight. Ưu tiên hiện tại: ${payload.recommendations[0]?.title || 'sync thêm dữ liệu campaign'}.`;
}

function formatMoney(value: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(value || 0);
}
