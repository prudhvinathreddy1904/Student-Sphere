"use client";

import { useState, useEffect } from "react";
import styles from "../board.module.css";

interface CreatePostModalProps {
  onClose: () => void;
  onCreated: () => void;
}

const CATEGORY_OPTIONS = [
  { value: "idea", label: "Idea 💡" },
  { value: "notice", label: "Notice 📢" },
  { value: "event", label: "Event 🎪" },
  { value: "lost", label: "Lost & Found 🔍" },
  { value: "study", label: "Study Group 📚" },
  { value: "general", label: "General 💬" },
];

export default function CreatePostModal({ onClose, onCreated }: CreatePostModalProps) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("idea");
  const [description, setDescription] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{
    title?: string;
    description?: string;
  }>({});

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  function validate() {
    const errors: { title?: string; description?: string } = {};
    if (!title.trim()) {
      errors.title = "Title is required";
    } else if (title.trim().length < 3) {
      errors.title = "Title must be at least 3 characters";
    }

    if (!description.trim()) {
      errors.description = "Description is required";
    } else if (description.trim().length < 10) {
      errors.description = "Description must be at least 10 characters";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setError("");

    const tags = tagsInput
      .split(",")
      .map((t) => t.trim().replace(/^#/, ""))
      .filter(Boolean)
      .slice(0, 5);

    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          category,
          description: description.trim(),
          tags,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to create post. Please try again.");
      }

      onCreated();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className={styles.modalOverlay}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h2 id="modal-title">Create New Post</h2>
          <button
            type="button"
            className={styles.modalClose}
            onClick={onClose}
            aria-label="Close dialog"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.modalForm}>
          {error && (
            <div className={styles.modalError} role="alert">
              <span>⚠</span> {error}
            </div>
          )}

          <div className={`${styles.modalField} ${fieldErrors.title ? styles.modalFieldError : ""}`}>
            <label htmlFor="post-title">Title *</label>
            <input
              id="post-title"
              type="text"
              placeholder="e.g. Looking for ML study group partners"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (fieldErrors.title) {
                  setFieldErrors((prev) => ({ ...prev, title: undefined }));
                }
              }}
              maxLength={120}
              required
            />
            {fieldErrors.title && <span className={styles.modalFieldMsg}>{fieldErrors.title}</span>}
          </div>

          <div className={styles.modalField}>
            <label htmlFor="post-category">Category</label>
            <select
              id="post-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {CATEGORY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div
            className={`${styles.modalField} ${fieldErrors.description ? styles.modalFieldError : ""}`}
          >
            <label htmlFor="post-desc">Description *</label>
            <textarea
              id="post-desc"
              rows={4}
              placeholder="Provide details, timing, location, or contact info..."
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                if (fieldErrors.description) {
                  setFieldErrors((prev) => ({ ...prev, description: undefined }));
                }
              }}
              required
            />
            {fieldErrors.description && (
              <span className={styles.modalFieldMsg}>{fieldErrors.description}</span>
            )}
          </div>

          <div className={styles.modalField}>
            <label htmlFor="post-tags">Tags (optional)</label>
            <input
              id="post-tags"
              type="text"
              placeholder="ai, python, library, weekend (comma separated)"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
            />
            <span className={styles.modalFieldHint}>Max 5 tags, separated by commas</span>
          </div>

          <div className={styles.modalActions}>
            <button
              type="button"
              className={styles.modalCancelBtn}
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button type="submit" className={styles.modalSubmitBtn} disabled={loading}>
              {loading ? (
                <>
                  <span className={styles.modalSpinner} aria-hidden="true" />
                  Publishing...
                </>
              ) : (
                "Publish Post"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
