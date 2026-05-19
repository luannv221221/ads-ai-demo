import { FRAMEWORK_OPTIONS, TONE_OPTIONS } from '../constants';
import styles from '../creative.module.css';

interface CopywritingFormProps {
  product: string;
  usps: string;
  audience: string;
  tone: string;
  framework: string;
  isGenerating: boolean;
  onProductChange: (value: string) => void;
  onUspsChange: (value: string) => void;
  onAudienceChange: (value: string) => void;
  onToneChange: (value: string) => void;
  onFrameworkChange: (value: string) => void;
  onGenerate: () => void;
}

export function CopywritingForm({
  product,
  usps,
  audience,
  tone,
  framework,
  isGenerating,
  onProductChange,
  onUspsChange,
  onAudienceChange,
  onToneChange,
  onFrameworkChange,
  onGenerate,
}: CopywritingFormProps) {
  return (
    <div className={styles.formStack}>
      <div className={styles.formGroup}>
        <label className={styles.formLabel}>San pham / Dich vu</label>
        <input className={styles.formControl} value={product} onChange={(event) => onProductChange(event.target.value)} />
      </div>

      <div className={styles.formGroup}>
        <label className={styles.formLabel}>Diem noi bat (USPs)</label>
        <textarea className={styles.formControl} value={usps} onChange={(event) => onUspsChange(event.target.value)} />
      </div>

      <div className={styles.formGroup}>
        <label className={styles.formLabel}>Khach hang muc tieu</label>
        <input className={styles.formControl} value={audience} onChange={(event) => onAudienceChange(event.target.value)} />
      </div>

      <div className={styles.formGroup}>
        <label className={styles.formLabel}>Giong dieu</label>
        <select className={styles.formControl} value={tone} onChange={(event) => onToneChange(event.target.value)}>
          {TONE_OPTIONS.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
      </div>

      <div className={styles.formGroup}>
        <label className={styles.formLabel}>Framework cau truc bai viet</label>
        <div className={styles.frameworkGrid}>
          {FRAMEWORK_OPTIONS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`${styles.frameworkCard} ${framework === item.id ? styles.frameworkCardActive : ''}`}
              onClick={() => onFrameworkChange(item.id)}
            >
              <span className={styles.frameworkTitle}>{item.name}</span>
              <span className={styles.frameworkDesc}>{item.desc}</span>
            </button>
          ))}
        </div>
      </div>

      <button className="btn btn-primary w-full" onClick={onGenerate} disabled={isGenerating}>
        {isGenerating ? 'Dang tao noi dung...' : 'Tao noi dung ngay'}
      </button>
    </div>
  );
}
