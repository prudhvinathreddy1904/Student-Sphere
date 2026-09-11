"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../layout";
import CommentSection from "./components/CommentSection";
import styles from "./post-detail.module.css";

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

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();

  const id = params?.id ? String(params.id) : "";
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editCategory, setEditCategory] = useState("idea");
  const [editDescription, setEditDescription] = useState("");
  const [editTags, setEditTags] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  const fetchPost = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError("");
      const res = await fetch(`/api/posts/${id}`);
      if (!res.ok) {
        if (res.status === 404) throw new Error("Post not found");
        throw new Error("Unable to load post");
      }
      const data = await res.json();
      setPost(data.post);
      setEditTitle(data.post.title);
      setEditCategory(data.post.category);
      setEditDescription(data.post.description);
      setEditTags((data.post.tags || []).join(", "));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load post");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchPost();
  }, [fetchPost]);

  async function handleVote() {
    if (!user || !post) return;

    setPost((prev) =>
      prev
        ? {
            ...prev,
            hasVoted: !prev.hasVoted,
            votes: prev.hasVoted ? prev.votes - 1 : prev.votes + 1,
          }
        : null,
    );

    try {
      const res = await fetch(`/api/posts/${post.id}/vote`, { method: "POST" });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setPost((prev) =>
        prev ? { ...prev, hasVoted: data.voted, votes: data.votes } : null,
      );
    } catch {
      fetchPost();
    }
  }

  async function handleDelete() {
    if (!post) return;
    if (!confirm("Are you sure you want to delete this post? This cannot be undone.")) return;

    try {
      const res = await fetch(`/api/posts/${post.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete post");
      router.push("/board");
    } catch {
      alert("Failed to delete post. Please try again.");
    }
  }

  async function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!post || savingEdit) return;

    setSavingEdit(true);
    try {
      const tags = editTags
        .split(",")
        .map((t) => t.trim().replace(/^#/, ""))
        .filter(Boolean)
        .slice(0, 5);

      const res = await fetch(`/api/posts/${post.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editTitle.trim(),
          category: editCategory,
          description: editDescription.trim(),
          tags,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to update post");
      }

      const data = await res.json();
      setPost(data.post);
      setIsEditing(false);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to update post");
    } finally {
      setSavingEdit(false);
    }
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <div style={{ textAlign: "center", padding: "80px 20px", color: "var(--text-secondary)" }}>
          Loading post details...
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className={styles.container}>
        <Link href="/board" className={styles.backBtn}>
          ← Back to Board
        </Link>
        <div style={{ textAlign: "center", padding: "60px 20px" }}>
          <h2 style={{ fontSize: 24, marginBottom: 12 }}>{error || "Post not found"}</h2>
          <p style={{ color: "var(--text-secondary)", marginBottom: 20 }}>
            The post you are looking for may have been removed or does not exist.
          </p>
          <Link href="/board" className={styles.actionBtn}>
            Return to Campus Board
          </Link>
        </div>
      </div>
    );
  }

  const isOwner = user !== null && post.userId === user.id;
  const categoryClass = CATEGORY_CLASSES[post.category.toLowerCase()] || styles.catGeneral;
  const categoryLabel = CATEGORY_LABELS[post.category.toLowerCase()] || post.category;
  const authorName = post.displayName || post.creator || "Anonymous";
  const formattedDate = new Date(post.createdAt).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className={styles.container}>
      <Link href="/board" className={styles.backBtn}>
        ← Back to Board
      </Link>

      <article className={styles.postCard}>
        <div className={styles.headerRow}>
          <span className={`${styles.categoryBadge} ${categoryClass}`}>
            {categoryLabel}
          </span>
          {isOwner && (
            <div className={styles.ownerActions}>
              <button
                type="button"
                className={styles.actionBtn}
                onClick={() => setIsEditing(true)}
              >
                ✏ Edit
              </button>
              <button
                type="button"
                className={`${styles.actionBtn} ${styles.deleteActionBtn}`}
                onClick={handleDelete}
              >
                🗑 Delete
              </button>
            </div>
          )}
        </div>

        <h1 className={styles.title}>{post.title}</h1>

        <div className={styles.authorBar}>
          <div
            className={styles.avatar}
            style={{ backgroundColor: post.avatarColor || "#f4774e" }}
          >
            {authorName.charAt(0).toUpperCase()}
          </div>
          <div className={styles.authorInfo}>
            <span className={styles.authorName}>{authorName}</span>
            <span className={styles.postDate}>Posted on {formattedDate}</span>
          </div>
        </div>

        <div className={styles.description}>{post.description}</div>

        {post.tags && post.tags.length > 0 && (
          <div className={styles.tagList}>
            {post.tags.map((tag) => (
              <span key={tag} className={styles.tag}>
                #{tag}
              </span>
            ))}
          </div>
        )}

        <div className={styles.actionBar}>
          <button
            type="button"
            className={`${styles.voteBtn} ${post.hasVoted ? styles.voteBtnActive : ""}`}
            onClick={handleVote}
            aria-label={post.hasVoted ? "Remove upvote" : "Upvote post"}
          >
            <span className={styles.voteIcon}>▲</span>
            <span>{post.votes} Upvotes</span>
          </button>
        </div>
      </article>

      {/* Inline Edit Modal */}
      {isEditing && (
        <div
          className={styles.editModalOverlay}
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsEditing(false);
          }}
        >
          <div className={styles.editModal}>
            <h2 style={{ fontSize: 22, marginBottom: 16 }}>Edit Post</h2>
            <form onSubmit={handleSaveEdit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
                  Title
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: 8,
                    border: "1px solid var(--border)",
                    background: "var(--cream)",
                  }}
                  required
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
                  Category
                </label>
                <select
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: 8,
                    border: "1px solid var(--border)",
                    background: "var(--cream)",
                  }}
                >
                  <option value="idea">Idea 💡</option>
                  <option value="notice">Notice 📢</option>
                  <option value="event">Event 🎪</option>
                  <option value="lost">Lost & Found 🔍</option>
                  <option value="study">Study Group 📚</option>
                  <option value="general">General 💬</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
                  Description
                </label>
                <textarea
                  rows={4}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: 8,
                    border: "1px solid var(--border)",
                    background: "var(--cream)",
                  }}
                  required
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={editTags}
                  onChange={(e) => setEditTags(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: 8,
                    border: "1px solid var(--border)",
                    background: "var(--cream)",
                  }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 10 }}>
                <button
                  type="button"
                  className={styles.actionBtn}
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={styles.commentSubmitBtn}
                  disabled={savingEdit}
                >
                  {savingEdit ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <CommentSection postId={Number(id)} currentUser={user} />
    </div>
  );
}
