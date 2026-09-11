"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import styles from "../post-detail.module.css";

interface Comment {
  id: number;
  postId: number;
  userId: number;
  content: string;
  createdAt: string;
  username: string;
  displayName: string;
  avatarColor: string;
}

interface CommentSectionProps {
  postId: number;
  currentUser: {
    id: number;
    username: string;
    displayName: string;
    avatarColor?: string;
  } | null;
}

function formatCommentDate(iso: string): string {
  try {
    const d = new Date(iso);
    const now = new Date();
    const diffMin = Math.floor((now.getTime() - d.getTime()) / 60000);
    if (diffMin < 1) return "just now";
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  } catch {
    return "";
  }
}

export default function CommentSection({ postId, currentUser }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const fetchComments = useCallback(async () => {
    try {
      const res = await fetch(`/api/posts/${postId}/comments`);
      if (!res.ok) throw new Error("Failed to load comments");
      const data = await res.json();
      setComments(data.comments || []);
    } catch {
      setError("Unable to load comments.");
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim() || submitting) return;

    setSubmitting(true);
    setError("");

    try {
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: content.trim() }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to post comment");
      }

      const data = await res.json();
      setComments((prev) => [...prev, data.comment]);
      setContent("");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to post comment");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className={styles.commentsSection} aria-labelledby="comments-heading">
      <h2 id="comments-heading" className={styles.commentsHeading}>
        Comments ({comments.length})
      </h2>

      {currentUser ? (
        <form onSubmit={handleSubmit} className={styles.commentForm}>
          <textarea
            className={styles.commentInput}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write a comment or share your thoughts..."
            maxLength={500}
            required
            rows={3}
            aria-label="Write a comment"
          />
          <div className={styles.commentFormFooter}>
            <span className={styles.charCount}>{content.length}/500</span>
            <button
              type="submit"
              className={styles.commentSubmitBtn}
              disabled={submitting || !content.trim()}
            >
              {submitting ? "Posting..." : "Post Comment"}
            </button>
          </div>
          {error && (
            <p style={{ color: "var(--error)", fontSize: 13, marginTop: 8 }}>{error}</p>
          )}
        </form>
      ) : (
        <div className={styles.loginPrompt}>
          <Link href="/login">Log in</Link> or <Link href="/signup">Sign up</Link> to join the
          conversation!
        </div>
      )}

      {loading ? (
        <p style={{ color: "var(--text-tertiary)", textAlign: "center", padding: 20 }}>
          Loading comments...
        </p>
      ) : comments.length === 0 ? (
        <div className={styles.noComments}>
          <p>No comments yet. Be the first to share your thoughts!</p>
        </div>
      ) : (
        <div className={styles.commentList}>
          {comments.map((comment) => (
            <div key={comment.id} className={styles.commentCard}>
              <div className={styles.commentHeader}>
                <span
                  className={styles.commentAvatar}
                  style={{ backgroundColor: comment.avatarColor || "#7e9c98" }}
                >
                  {(comment.displayName || comment.username || "A").charAt(0).toUpperCase()}
                </span>
                <span className={styles.commentAuthor}>
                  {comment.displayName || comment.username}
                </span>
                <span className={styles.commentTime}>
                  {formatCommentDate(comment.createdAt)}
                </span>
              </div>
              <p className={styles.commentContent}>{comment.content}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
