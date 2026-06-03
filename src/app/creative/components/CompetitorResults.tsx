import type { CompetitorAd, CompetitorAnalysis, CounterAd } from '../types';
import styles from '../creative.module.css';

interface CompetitorResultsProps {
  data: CompetitorAnalysis | null;
  counterAd: CounterAd | null;
  isAnalyzing: boolean;
  isGeneratingCounterAd: boolean;
  activeCounterAngleIdx: number | null;
  onPreviewAd: (ad: CompetitorAd) => void;
  onWriteFromHook: (hook: string) => void;
  onGenerateCounterAd: (index: number) => void;
  onCopy: (text: string) => void;
  onSaveCounterAd: (counterAd: CounterAd) => void;
}

export function CompetitorResults({
  data,
  counterAd,
  isAnalyzing,
  isGeneratingCounterAd,
  activeCounterAngleIdx,
  onPreviewAd,
  onWriteFromHook,
  onGenerateCounterAd,
  onCopy,
  onSaveCounterAd,
}: CompetitorResultsProps) {
  if (isAnalyzing) {
    return (
      <div className={styles.loadingState}>
        <div className={styles.spinner} />
        <span>AI đang phân tích quảng cáo đối thủ...</span>
      </div>
    );
  }

  if (!data) {
    return (
      <div className={styles.emptyState}>
        <svg className={styles.emptyIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <div className={styles.emptyTitle}>Quét thư viện quảng cáo</div>
        <div className={styles.emptyText}>Nhập Fanpage đối thủ để lấy hook, kẽ hở và angle phản công.</div>
      </div>
    );
  }

  return (
    <div className={styles.outputStack}>
      <div className={styles.resultHeader}>
        <h3 className={styles.sectionTitle}>Dữ liệu quét từ Facebook Ad Library</h3>
        <span>{data.sourceLabel}</span>
      </div>

      <div className={styles.metricGrid}>
        <Metric value={String(data.overview.activeAds)} label="Quảng cáo đang chạy" />
        <Metric value={`${data.overview.imagePct}%`} label="Tỷ lệ hình ảnh" />
        <Metric value={data.overview.platforms} label="Nền tảng chính" />
      </div>

      <section>
        <div className={styles.fieldCaption}>Top active ads</div>
        <div className={styles.adScroller}>
          {data.adList.map((ad) => (
            <button key={ad.id} type="button" className={styles.adSnippet} onClick={() => onPreviewAd(ad)}>
              <div className={styles.adThumb}>
                <span>{ad.thumbnail}</span>
                <small>{ad.timeLabel}</small>
              </div>
              <p>{ad.text}</p>
              <div className={styles.adMeta}>
                <span>{ad.engagement}</span>
                <strong className={ad.status === 'winning' ? styles.statusWinning : styles.statusTesting}>{ad.statusLabel}</strong>
              </div>
            </button>
          ))}
        </div>
      </section>

      <article className={styles.aiCard}>
        <div className={styles.aiCardHeader}>
          <div className={`${styles.aiBadge} ${styles.warningBadge}`}>Phân tích AI: {data.overview.competitor}</div>
        </div>
        <TextList title="Hook trọng tâm" items={data.overview.hooks} />
        <TextList title="Kẽ hở có thể khai thác" items={data.overview.loopholes} />
      </article>

      <h3 className={styles.sectionTitle}>Gợi ý 3 góc tiếp cận mới</h3>
      {data.overview.angles.map((angle, index) => (
        <article key={angle.title} className={styles.aiCard}>
          <div className={styles.aiCardHeader}>
            <div className={`${styles.aiBadge} ${styles.successBadge}`}>{angle.title}</div>
          </div>
          <div className={styles.fieldCaption}>Hook gợi ý tối ưu CTR</div>
          <div className={`${styles.copyContent} ${styles.strongText}`}>{angle.hook}</div>
          <div className={styles.aiActions}>
            <button className="btn btn-primary" onClick={() => onWriteFromHook(angle.hook)}>Viết bài từ hook này</button>
            <button className="btn" onClick={() => onGenerateCounterAd(index)} disabled={isGeneratingCounterAd && activeCounterAngleIdx === index}>
              {isGeneratingCounterAd && activeCounterAngleIdx === index ? 'Đang tạo phản đòn...' : 'Tạo bài phản đòn'}
            </button>
          </div>

          {counterAd && activeCounterAngleIdx === index && (
            <div className={styles.comparisonGrid}>
              <div className={styles.aiCard}>
                <div className={styles.comparisonHeader}>Quảng cáo đối thủ</div>
                <div className={styles.copyContent}>{data.adList[0]?.text || 'Không có dữ liệu'}</div>
                <div className={styles.strategyBlock}><strong>Kẽ hở:</strong> {counterAd.targetLoophole}</div>
              </div>
              <div className={styles.aiCard}>
                <div className={styles.comparisonHeader}>Bài phản đòn của bạn</div>
                <div className={styles.counterAdBadge}>{counterAd.badge}</div>
                <div className={styles.copyContent}>{counterAd.hook}</div>
                <div className={styles.copyContent}>{counterAd.body}</div>
                <div className={styles.copyContent}>{counterAd.cta}</div>
                <div className={styles.strategyBlock}><strong>Chiến thuật:</strong> {counterAd.strategyDescription}</div>
                <div className={styles.aiActions}>
                  <button className="btn btn-primary" onClick={() => onCopy(`${counterAd.hook}\n\n${counterAd.body}\n\n${counterAd.cta}`)}>
                    Sao chép
                  </button>
                  <button className="btn" onClick={() => onSaveCounterAd(counterAd)}>Lưu vào thư viện</button>
                </div>
              </div>
            </div>
          )}
        </article>
      ))}
    </div>
  );
}

function Metric({ value, label }: { value: string; label: string }) {
  return (
    <div className={styles.metricCard}>
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

function TextList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className={styles.textListBlock}>
      <div className={styles.fieldCaption}>{title}</div>
      <div className={styles.copyContent}>
        {items.map((item) => (
          <div key={item}>- {item}</div>
        ))}
      </div>
    </div>
  );
}
