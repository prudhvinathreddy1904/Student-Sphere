import styles from "../board.module.css";

interface EmptyStateProps {
  search: string;
  category: string;
  onClear: () => void;
  showCreate: boolean;
  onCreateClick: () => void;
}

export default function EmptyState({
  search,
  category,
  onClear,
  showCreate,
  onCreateClick,
}: EmptyStateProps) {
  const isFiltered = Boolean(search || (category && category !== "all"));

  return (
    <div className={styles.emptyState}>
      <div className={styles.emptyIllustration} aria-hidden="true">
        {isFiltered ? "🔍" : "📌"}
      </div>
      <h2>{isFiltered ? "No matching posts found" : "No posts yet"}</h2>
      <p>
        {isFiltered
          ? "Try adjusting your search keywords or switching category filters to see more results."
          : "Be the first to share an idea, campus notice, or study group invite with fellow students!"}
      </p>
      <div className={styles.emptyActions}>
        {isFiltered && (
          <button type="button" onClick={onClear} className={styles.emptySecondaryBtn}>
            Clear filters
          </button>
        )}
        {showCreate && (
          <button type="button" onClick={onCreateClick} className={styles.emptyPrimaryBtn}>
            Create first post
          </button>
        )}
      </div>
    </div>
  );
}
