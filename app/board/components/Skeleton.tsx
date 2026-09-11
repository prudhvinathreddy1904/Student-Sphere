import styles from "../board.module.css";

export default function Skeleton() {
  return (
    <div className={styles.skeletonGrid} aria-label="Loading posts">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className={styles.skeletonCard}>
          <div className={`${styles.skeletonLine} ${styles.skeletonBadge}`} />
          <div className={`${styles.skeletonLine} ${styles.skeletonTitle}`} />
          <div className={`${styles.skeletonLine} ${styles.skeletonDesc1}`} />
          <div className={`${styles.skeletonLine} ${styles.skeletonDesc2}`} />
          <div className={styles.skeletonFooter}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div className={`${styles.skeletonLine} ${styles.skeletonAvatar}`} />
              <div className={`${styles.skeletonLine} ${styles.skeletonName}`} />
            </div>
            <div className={`${styles.skeletonLine} ${styles.skeletonVote}`} />
          </div>
        </div>
      ))}
    </div>
  );
}
