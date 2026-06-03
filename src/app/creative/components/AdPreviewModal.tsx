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
          <div className={styles.modalTitle}>Xem trước Facebook Post - {ad.title}</div>
          <button className={styles.modalCloseBtn} onClick={onClose}>x</button>
        </div>
        <div className={styles.modalBody}>
          <div className={styles.fbFeedCard}>
            <div className={styles.fbHeader}>
              <div className={styles.fbAvatar}>{competitorData?.overview.competitor.charAt(0) || 'C'}</div>
              <div className={styles.fbMeta}>
                <div className={styles.fbPageName}>{competitorData?.overview.competitor || 'Đối thủ'}</div>
                <div className={styles.fbSubtext}>{ad.timeLabel} - Được tài trợ</div>
              </div>
            </div>
            <div className={styles.fbText}>{ad.text}</div>
            <div className={styles.fbMediaPlaceholder}>{ad.thumbnail}</div>
            <div className={styles.fbActionContainer}>
              <div className={styles.fbActionLeft}>
                <div className={styles.fbActionHeadline}>Tìm hiểu thêm</div>
                <div className={styles.fbActionDesc}>{competitorData?.overview.competitor || 'Đối thủ'}</div>
              </div>
              <button className={styles.fbActionButton}>Đăng ký</button>
            </div>
            <div className={styles.fbEngagementRow}>
              <span>{ad.engagement}</span>
              <span>24 bình luận - 8 chia sẻ</span>
            </div>
          </div>

          <div className={styles.aiAnalysisPanel}>
            <section>
              <div className={styles.aiSectionTitle}>Trạng thái quảng cáo</div>
              <span className={styles.psychologicalTriggerBadge}>{ad.statusLabel}</span>
            </section>
            <section>
              <div className={styles.aiSectionTitle}>Phân tích tâm lý quảng cáo</div>
              <div className={styles.aiSectionContent}>
                <p><strong>Trigger chính:</strong> Tập trung vào ưu đãi, nỗi sợ bỏ lỡ và bằng chứng xã hội.</p>
                <p><strong>Mô hình thuyết phục:</strong> Kết hợp PAS với CTA trực tiếp để đẩy người xem nhắn tin nhanh.</p>
                <p><strong>Điểm yếu:</strong> Cần kiểm chứng cam kết, chất lượng giáo viên và tính cá nhân hóa.</p>
              </div>
            </section>
            <section>
              <div className={styles.aiSectionTitle}>Đề xuất phản đòn</div>
              <div className={styles.aiSectionContent}>
                {competitorData?.overview.angles.slice(0, 2).map((angle) => (
                  <p key={angle.title}><strong>{angle.title}:</strong> {angle.hook.slice(0, 90)}...</p>
                ))}
              </div>
            </section>
            <div className={styles.aiActions}>
              <button className="btn btn-primary" onClick={() => onCopy(ad.text)}>Sao chép nội dung QC</button>
              <button className="btn" onClick={onClose}>Đóng</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
