import type { CompetitorAd, CompetitorAnalysis } from '../types';
import styles from '../creative.module.css';

interface AdPreviewModalProps {
  ad: CompetitorAd | null;
  competitorData: CompetitorAnalysis | null;
  onClose: () => void;
  onCopy: (text: string) => void;
}

export function AdPreviewModal({ ad, competitorData, onClose, onCopy }: AdPreviewModalProps) {
  if (!ad) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalCard} onClick={(event) => event.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div className={styles.modalTitle}>Xem truoc Facebook Post - {ad.title}</div>
          <button className={styles.modalCloseBtn} onClick={onClose}>x</button>
        </div>
        <div className={styles.modalBody}>
          <div className={styles.fbFeedCard}>
            <div className={styles.fbHeader}>
              <div className={styles.fbAvatar}>{competitorData?.overview.competitor.charAt(0) || 'C'}</div>
              <div className={styles.fbMeta}>
                <div className={styles.fbPageName}>{competitorData?.overview.competitor || 'Doi thu'}</div>
                <div className={styles.fbSubtext}>{ad.timeLabel} - Duoc tai tro</div>
              </div>
            </div>
            <div className={styles.fbText}>{ad.text}</div>
            <div className={styles.fbMediaPlaceholder}>{ad.thumbnail}</div>
            <div className={styles.fbActionContainer}>
              <div className={styles.fbActionLeft}>
                <div className={styles.fbActionHeadline}>Tim hieu them</div>
                <div className={styles.fbActionDesc}>{competitorData?.overview.competitor || 'Doi thu'}</div>
              </div>
              <button className={styles.fbActionButton}>Dang ky</button>
            </div>
            <div className={styles.fbEngagementRow}>
              <span>{ad.engagement}</span>
              <span>24 binh luan - 8 chia se</span>
            </div>
          </div>

          <div className={styles.aiAnalysisPanel}>
            <section>
              <div className={styles.aiSectionTitle}>Trang thai quang cao</div>
              <span className={styles.psychologicalTriggerBadge}>{ad.statusLabel}</span>
            </section>
            <section>
              <div className={styles.aiSectionTitle}>Phan tich tam ly quang cao</div>
              <div className={styles.aiSectionContent}>
                <p><strong>Trigger chinh:</strong> Tap trung vao uu dai, noi so bo lo va bang chung xa hoi.</p>
                <p><strong>Mo hinh thuyet phuc:</strong> Ket hop PAS voi CTA truc tiep de day nguoi xem nhan tin nhanh.</p>
                <p><strong>Diem yeu:</strong> Can kiem chung cam ket, chat luong giao vien va tinh ca nhan hoa.</p>
              </div>
            </section>
            <section>
              <div className={styles.aiSectionTitle}>De xuat phan don</div>
              <div className={styles.aiSectionContent}>
                {competitorData?.overview.angles.slice(0, 2).map((angle) => (
                  <p key={angle.title}><strong>{angle.title}:</strong> {angle.hook.slice(0, 90)}...</p>
                ))}
              </div>
            </section>
            <div className={styles.aiActions}>
              <button className="btn btn-primary" onClick={() => onCopy(ad.text)}>Sao chep noi dung QC</button>
              <button className="btn" onClick={onClose}>Dong</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
