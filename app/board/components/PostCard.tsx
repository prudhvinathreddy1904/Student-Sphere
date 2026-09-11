"use client";

import { useRouter } from "next/navigation";
import styles from "../board.module.css";

interface Post {
  id: number;
  title: string;
  category: string;
  description: string;
  creator: string;
  tags: string[];
  votes: number;
  createdAt: string;
  userId: number | null;
  username: string | null;
  displayName: string | null;
  avatarColor: string | null;
  commentCount: number;
  hasVoted?: boolean;
}

interface PostCardProps {
  post: Post;
  currentUserId: number | null;
  onVote: (id: number) => void;
  onDelete: (id: number) => void;
  delay?: number;
}

const CATEGORY_CLASSES: Record<string, string> = {
  idea: styles.catIdea,
  notice: styles.catNotice,
  event: styles.catEvent,
  lost: styles.catLost,
  study: styles.catStudy,
  general: styles.catGeneral,
};

const CATEGORY_LABELS: Record<string, string> = {
  idea: "💡 Idea",
  notice: "📢 Notice",
  event: "🎪 Event",
  lost: "🔍 Lost & Found",
  study: "📚 Study Group",
  general: "💬 General",
};

function formatTimeAgo(isoString: string): string {
  try {
    const date = new Date(isoString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "just now";
    const minutes = Math.floor(diffInSeconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  } catch {
    return "";
  }
}

export default function PostCard({
  post,
  currentUserId,
  onVote,
  onDelete,
  delay = 0,
}: PostCardProps) {
  const router = useRouter();
  const isOwner = currentUserId !== null && post.userId === currentUserId;
  const categoryClass = CATEGORY_CLASSES[post.category.toLowerCase()] || styles.catGeneral;
  const categoryLabel = CATEGORY_LABELS[post.category.toLowerCase()] || post.category;
  const authorName = post.displayName || post.creator || "Anonymous";
  const authorInitial = authorName.charAt(0).toUpperCase();

  const handleCardClick = () => {
    router.push(`/board/post/${post.id}`);
  };

  return (
    <article
      className={styles.postCard}
      onClick={handleCardClick}
      style={{ animationDelay: `${delay}ms` }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleCardClick();
        }
      }}
      aria-label={`Post: ${post.title}`}
    >
      <div className={styles.postCardTop}>
        <span className={`${styles.categoryBadge} ${categoryClass}`}>
          {categoryLabel}
        </span>
        {isOwner && (
          <button
            type="button"
            className={styles.deleteBtn}
            onClick={(e) => {
              e.stopPropagation();
              onDelete(post.id);
            }}
            title="Delete post"
            aria-label="Delete post"
          >
            🗑
          </button>
        )}
      </div>

      <h3 className={styles.postCardTitle}>{post.title}</h3>
      <p className={styles.postCardDesc}>{post.description}</p>

      {post.tags && post.tags.length > 0 && (
        <div className={styles.postCardTags}>
          {post.tags.map((tag) => (
            <span key={tag} className={styles.tag}>
              #{tag}
            </span>
          ))}
        </div>
      )}

      <div className={styles.postCardFooter}>
        <div className={styles.postAuthor}>
          <span
            className={styles.authorAvatar}
            style={{ backgroundColor: post.avatarColor || "#f4774e" }}
            aria-hidden="true"
          >
            {authorInitial}
          </span>
          <span>{authorName}</span>
          <span style={{ color: "var(--text-tertiary)" }}>•</span>
          <span>{formatTimeAgo(post.createdAt)}</span>
        </div>

        <div className={styles.postActions}>
          <span className={styles.commentCount} title={`${post.commentCount} comments`}>
            💬 {post.commentCount}
          </span>
          <button
            type="button"
            className={`${styles.voteBtn} ${post.hasVoted ? styles.voteBtnActive : ""}`}
            onClick={(e) => {
              e.stopPropagation();
              onVote(post.id);
            }}
            aria-label={post.hasVoted ? "Remove vote" : "Upvote"}
            title={post.hasVoted ? "Remove vote" : "Upvote"}
          >
            <span className={`${styles.voteIcon} ${post.hasVoted ? styles.voteIconBounce : ""}`}>
              ▲
            </span>
            <span>{post.votes}</span>
          </button>
        </div>
      </div>
    </article>
  );
}
