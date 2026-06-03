import { SAVED_COMPETITORS } from '../constants';
import styles from '../creative.module.css';

interface CompetitorFormProps {
  competitorUrl: string;
  savedCompetitor: string;
  audience: string;
  isAnalyzing: boolean;
  onCompetitorUrlChange: (value: string) => void;
  onSavedCompetitorChange: (label: string, url: string) => void;
  onAudienceChange: (value: string) => void;
  onAnalyze: () => void;
}

export function CompetitorForm({
  competitorUrl,
  savedCompetitor,
  audience,
  isAnalyzing,
  onCompetitorUrlChange,
  onSavedCompetitorChange,
  onAudienceChange,
  onAnalyze,
}: CompetitorFormProps) {
  return (
    <div className={styles.formStack}>
      <div className={styles.infoBox}>
        <strong>Tính năng mới:</strong> Nhập Fanpage đối thủ. AI sẽ phân tích các quảng cáo đang chạy để tìm hook,
        điểm yếu và góc tiếp cận có thể khai thác.
      </div>

      <div className={styles.formGroup}>
        <label className={styles.formLabel}>Link Fanpage đối thủ (Facebook)</label>
        <input
          className={styles.formControl}
          value={competitorUrl}
          onChange={(event) => onCompetitorUrlChange(event.target.value)}
        />
      </div>

      <div className={styles.formGroup}>
        <label className={styles.formLabel}>Hoặc chọn đối thủ đã lưu</label>
        <select
          className={styles.formControl}
          value={savedCompetitor}
          onChange={(event) => {
            const selected = SAVED_COMPETITORS.find((item) => item.label === event.target.value);
            onSavedCompetitorChange(event.target.value, selected?.isCustom ? competitorUrl : selected?.url || competitorUrl);
          }}
        >
          {SAVED_COMPETITORS.map((item) => (
            <option key={item.label} value={item.label}>
              {item.label}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.formGroup}>
        <label className={styles.formLabel}>Khách hàng mục tiêu</label>
        <input className={styles.formControl} value={audience} onChange={(event) => onAudienceChange(event.target.value)} />
      </div>

      <button className="btn btn-primary w-full" onClick={onAnalyze} disabled={isAnalyzing}>
        {isAnalyzing ? 'Đang phân tích...' : 'Quét Ad Library & phân tích'}
      </button>
    </div>
  );
}
