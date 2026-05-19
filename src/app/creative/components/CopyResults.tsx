import { combineCreativeText } from '../creative-utils';
import type { GeneratedCopy } from '../types';
import styles from '../creative.module.css';

interface CopyResultsProps {
  framework: string;
  copies: GeneratedCopy[] | null;
  isGenerating: boolean;
  onCopy: (text: string) => void;
  onDelete: (index: number) => void;
  onSave: (copy: GeneratedCopy) => void;
  onUpdate: (index: number, copy: GeneratedCopy) => void;
}

export function CopyResults({ framework, copies, isGenerating, onCopy, onDelete, onSave, onUpdate }: CopyResultsProps) {
  if (isGenerating) {
    return (
      <div className={styles.loadingState}>
        <div className={styles.spinner} />
        <span>AI dang tao noi dung quang cao...</span>
      </div>
    );
  }

  if (!copies?.length) {
    return (
      <div className={styles.emptyState}>
        <svg className={styles.emptyIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
        <div className={styles.emptyTitle}>AI san sang sang tao</div>
        <div className={styles.emptyText}>Dien brief ben trai va tao cac bien the quang cao de test nhanh.</div>
      </div>
    );
  }

  return (
    <div className={styles.outputStack}>
      <h3 className={styles.sectionTitle}>Ket qua ({copies.length} bien the {framework})</h3>

      {copies.map((copy, index) => (
        <article key={`${copy.badge}-${index}`} className={styles.aiCard}>
          <div className={styles.aiCardHeader}>
            <div className={styles.aiBadge}>{copy.badge}</div>
            <button className="btn-icon" title="Xoa" onClick={() => onDelete(index)}>
              x
            </button>
          </div>

          <EditableField label="Tieu de / Hook" value={copy.title} isStrong onChange={(value) => onUpdate(index, { ...copy, title: value })} />
          <EditableField label="Noi dung chinh" value={copy.body} onChange={(value) => onUpdate(index, { ...copy, body: value })} />
          <EditableField label="CTA" value={copy.cta} onChange={(value) => onUpdate(index, { ...copy, cta: value })} />
          <EditableField
            label="Image Prompt"
            value={copy.imagePrompt || ''}
            onChange={(value) => onUpdate(index, { ...copy, imagePrompt: value })}
          />

          <div className={styles.aiActions}>
            <button className="btn" onClick={() => onCopy(combineCreativeText(copy))}>Sao chep toan bo</button>
            <button className="btn" onClick={() => onCopy(copy.imagePrompt || '')} disabled={!copy.imagePrompt}>
              Sao chep Image Prompt
            </button>
            <button className="btn" onClick={() => onSave(copy)}>Luu vao thu vien</button>
          </div>
        </article>
      ))}
    </div>
  );
}

interface EditableFieldProps {
  label: string;
  value: string;
  isStrong?: boolean;
  onChange: (value: string) => void;
}

function EditableField({ label, value, isStrong, onChange }: EditableFieldProps) {
  return (
    <label className={styles.editableBlock}>
      <span className={styles.fieldCaption}>{label}</span>
      <textarea
        className={`${styles.copyContent} ${styles.editableTextarea} ${isStrong ? styles.strongText : ''}`}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}
