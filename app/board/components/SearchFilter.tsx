import styles from "../board.module.css";

const CATEGORIES = [
  { id: "all", label: "All" },
  { id: "idea", label: "Ideas 💡" },
  { id: "notice", label: "Notices 📢" },
  { id: "event", label: "Events 🎪" },
  { id: "lost", label: "Lost & Found 🔍" },
  { id: "study", label: "Study Groups 📚" },
  { id: "general", label: "General 💬" },
];

interface SearchFilterProps {
  search: string;
  onSearchChange: (value: string) => void;
  category: string;
  onCategoryChange: (category: string) => void;
  sort: "newest" | "votes";
  onSortChange: (sort: "newest" | "votes") => void;
}

export default function SearchFilter({
  search,
  onSearchChange,
  category,
  onCategoryChange,
  sort,
  onSortChange,
}: SearchFilterProps) {
  return (
    <div className={styles.searchFilter}>
      <div className={styles.searchBar}>
        <span className={styles.searchIcon} aria-hidden="true">
          🔍
        </span>
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by title, description, or #tag..."
          className={styles.searchInput}
          aria-label="Search posts"
        />
      </div>

      <div className={styles.filterRow}>
        <div className={styles.categories} role="tablist" aria-label="Filter by category">
          {CATEGORIES.map((cat) => {
            const isActive = category === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => onCategoryChange(cat.id)}
                className={`${styles.catBtn} ${isActive ? styles.catBtnActive : ""}`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        <select
          value={sort}
          onChange={(e) => onSortChange(e.target.value as "newest" | "votes")}
          className={styles.sortSelect}
          aria-label="Sort posts by"
        >
          <option value="newest">Most Recent</option>
          <option value="votes">Highest Voted</option>
        </select>
      </div>
    </div>
  );
}
