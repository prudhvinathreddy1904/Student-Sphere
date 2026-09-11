"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "./layout";
import PostCard from "./components/PostCard";
import SearchFilter from "./components/SearchFilter";
import CreatePostModal from "./components/CreatePostModal";
import Skeleton from "./components/Skeleton";
import EmptyState from "./components/EmptyState";
import styles from "./board.module.css";

type Post = {
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
};

export default function BoardPage() {
  const { user, loading: authLoading } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState<"newest" | "votes">("newest");
  const [showCreateModal, setShowCreateModal] = useState(false);

  const fetchPosts = useCallback(async () => {
    try {
      setError("");
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (category !== "all") params.set("category", category);
      params.set("sort", sort);

      const res = await fetch(`/api/posts?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch");

      const data = await res.json();
      setPosts(data.posts || []);
    } catch {
      setError("Unable to load posts. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [search, category, sort]);

  useEffect(() => {
    setLoading(true);
    const timeout = setTimeout(fetchPosts, 300); // debounce search
    return () => clearTimeout(timeout);
  }, [fetchPosts]);

  async function handleVote(postId: number) {
    if (!user) return;

    // Optimistic update
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? {
              ...p,
              hasVoted: !p.hasVoted,
              votes: p.hasVoted ? p.votes - 1 : p.votes + 1,
            }
          : p,
      ),
    );

    try {
      const res = await fetch(`/api/posts/${postId}/vote`, { method: "POST" });
      if (!res.ok) throw new Error();
      const data = await res.json();

      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? { ...p, hasVoted: data.voted, votes: data.votes }
            : p,
        ),
      );
    } catch {
      // Revert on error
      fetchPosts();
    }
  }

  async function handleDelete(postId: number) {
    if (!confirm("Delete this post? This cannot be undone.")) return;

    setPosts((prev) => prev.filter((p) => p.id !== postId));

    try {
      const res = await fetch(`/api/posts/${postId}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
    } catch {
      fetchPosts();
    }
  }

  function handlePostCreated() {
    setShowCreateModal(false);
    fetchPosts();
  }

  return (
    <>
      <div className={styles.boardHeader}>
        <div>
          <h1 className={styles.boardTitle}>Campus Board</h1>
          <p className={styles.boardSubtitle}>
            Share ideas, post notices, and connect with your campus community.
          </p>
        </div>
        {!authLoading && user && (
          <button
            className={styles.createBtn}
            onClick={() => setShowCreateModal(true)}
          >
            <span className={styles.createIcon}>+</span>
            New Post
          </button>
        )}
      </div>

      <SearchFilter
        search={search}
        onSearchChange={setSearch}
        category={category}
        onCategoryChange={setCategory}
        sort={sort}
        onSortChange={setSort}
      />

      {error && (
        <div className={styles.errorBar} role="alert">
          <span>⚠</span> {error}
          <button onClick={fetchPosts} className={styles.retryBtn}>
            Retry
          </button>
        </div>
      )}

      {loading ? (
        <Skeleton />
      ) : posts.length === 0 ? (
        <EmptyState
          search={search}
          category={category}
          onClear={() => {
            setSearch("");
            setCategory("all");
          }}
          showCreate={!!user}
          onCreateClick={() => setShowCreateModal(true)}
        />
      ) : (
        <div className={styles.postsGrid}>
          {posts.map((post, index) => (
            <PostCard
              key={post.id}
              post={post}
              currentUserId={user?.id ?? null}
              onVote={handleVote}
              onDelete={handleDelete}
              delay={index * 50}
            />
          ))}
        </div>
      )}

      {showCreateModal && (
        <CreatePostModal
          onClose={() => setShowCreateModal(false)}
          onCreated={handlePostCreated}
        />
      )}
    </>
  );
}
