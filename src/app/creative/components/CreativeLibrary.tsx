import { combineCreativeText } from '../creative-utils';
import type { SavedCreative } from '../types';
import styles from '../creative.module.css';

interface CreativeLibraryProps {
  items: SavedCreative[];
  onCopy: (text: string) => void;
  onRemove: (id: string) => void;
}

export function CreativeLibrary({ items, onCopy, onRemove }: CreativeLibraryProps) {
  if (!items.length) return null;

  return (
    <section className={styles.libraryPanel}>
      <div className={styles.libraryHeader}>
        <h3 className={styles.sectionTitle}>Thu vien da luu</h3>
        <span>{items.length} mau</span>
      </div>
      <div className={styles.libraryGrid}>
        {items.map((item) => (
          <article key={item.id} className={styles.libraryItem}>
            <div className={styles.aiBadge}>{item.source === 'counter-ad' ? 'Counter-ad' : item.badge}</div>
            <h4>{item.title}</h4>
            <p>{item.body}</p>
            <div className={styles.aiActions}>
              <button className="btn" onClick={() => onCopy(combineCreativeText(item))}>Copy</button>
              <button className="btn" onClick={() => onCopy(item.imagePrompt || '')} disabled={!item.imagePrompt}>Copy anh</button>
              <button className="btn" onClick={() => onRemove(item.id)}>Xoa</button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
