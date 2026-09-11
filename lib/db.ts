import fs from "fs";
import path from "path";
import Database from "better-sqlite3";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type User = {
  id: number;
  username: string;
  displayName: string;
  email: string;
  avatarColor: string;
  createdAt: string;
};

export type Post = {
  id: number;
  title: string;
  category: string;
  description: string;
  creator: string;
  email: string | null;
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

export type Comment = {
  id: number;
  postId: number;
  userId: number;
  content: string;
  createdAt: string;
  username: string;
  displayName: string;
  avatarColor: string;
};

/* ------------------------------------------------------------------ */
/*  Database setup                                                     */
/* ------------------------------------------------------------------ */

const dbDirectory = path.join(process.cwd(), "data");
const dbPath = path.join(dbDirectory, "campusconnect.db");

fs.mkdirSync(dbDirectory, { recursive: true });

const db = new Database(dbPath);

db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

/* -- Users table --------------------------------------------------- */
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    displayName TEXT NOT NULL,
    email TEXT NOT NULL,
    passwordHash TEXT NOT NULL,
    avatarColor TEXT NOT NULL DEFAULT '#f4774e',
    createdAt TEXT NOT NULL
  );
`);

/* -- Sessions table ------------------------------------------------ */
db.exec(`
  CREATE TABLE IF NOT EXISTS sessions (
    token TEXT PRIMARY KEY,
    userId INTEGER NOT NULL,
    expiresAt TEXT NOT NULL,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
  );
`);

/* -- Posts table (add userId if missing) ---------------------------- */
db.exec(`
  CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    creator TEXT NOT NULL,
    email TEXT,
    tags TEXT NOT NULL DEFAULT '',
    votes INTEGER NOT NULL DEFAULT 0,
    createdAt TEXT NOT NULL,
    userId INTEGER,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE SET NULL
  );
`);

// Add userId column if it doesn't exist (migration for existing data)
try {
  db.exec(`ALTER TABLE posts ADD COLUMN userId INTEGER REFERENCES users(id) ON DELETE SET NULL`);
} catch {
  // Column already exists — ignore
}

/* -- Votes table --------------------------------------------------- */
db.exec(`
  CREATE TABLE IF NOT EXISTS votes (
    userId INTEGER NOT NULL,
    postId INTEGER NOT NULL,
    createdAt TEXT NOT NULL,
    PRIMARY KEY (userId, postId),
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (postId) REFERENCES posts(id) ON DELETE CASCADE
  );
`);

/* -- Comments table ------------------------------------------------ */
db.exec(`
  CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    postId INTEGER NOT NULL,
    userId INTEGER NOT NULL,
    content TEXT NOT NULL,
    createdAt TEXT NOT NULL,
    FOREIGN KEY (postId) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
  );
`);

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const AVATAR_COLORS = [
  "#f4774e", "#7e9c98", "#b79ac6", "#c18d6e",
  "#6e9581", "#e4a26e", "#9ec6bf", "#e46443",
  "#2f5e61", "#e6be54", "#d5739d", "#5b8abf",
];

function randomAvatarColor(): string {
  return AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
}

function normalizeTags(value: string): string[] {
  if (!value) return [];
  return value
    .split(",")
    .map((tag) => tag.trim().toLowerCase())
    .filter(Boolean)
    .slice(0, 5);
}

/* ------------------------------------------------------------------ */
/*  User queries                                                       */
/* ------------------------------------------------------------------ */

export function createUser(input: {
  username: string;
  displayName: string;
  email: string;
  passwordHash: string;
}): User {
  const createdAt = new Date().toISOString();
  const avatarColor = randomAvatarColor();

  const result = db
    .prepare(
      `INSERT INTO users (username, displayName, email, passwordHash, avatarColor, createdAt)
       VALUES (?, ?, ?, ?, ?, ?)`,
    )
    .run(
      input.username.toLowerCase(),
      input.displayName,
      input.email.toLowerCase(),
      input.passwordHash,
      avatarColor,
      createdAt,
    );

  return {
    id: Number(result.lastInsertRowid),
    username: input.username.toLowerCase(),
    displayName: input.displayName,
    email: input.email.toLowerCase(),
    avatarColor,
    createdAt,
  };
}

export function getUserByUsername(username: string): (User & { passwordHash: string }) | undefined {
  return db
    .prepare(
      `SELECT id, username, displayName, email, passwordHash, avatarColor, createdAt
       FROM users WHERE username = ?`,
    )
    .get(username.toLowerCase()) as (User & { passwordHash: string }) | undefined;
}

export function getUserById(id: number): User | undefined {
  return db
    .prepare(
      `SELECT id, username, displayName, email, avatarColor, createdAt
       FROM users WHERE id = ?`,
    )
    .get(id) as User | undefined;
}

export function usernameExists(username: string): boolean {
  const row = db
    .prepare(`SELECT 1 FROM users WHERE username = ?`)
    .get(username.toLowerCase());
  return !!row;
}

/* ------------------------------------------------------------------ */
/*  Session queries                                                    */
/* ------------------------------------------------------------------ */

export function createSession(token: string, userId: number, expiresAt: string): void {
  db.prepare(
    `INSERT INTO sessions (token, userId, expiresAt) VALUES (?, ?, ?)`,
  ).run(token, userId, expiresAt);
}

export function getSessionUser(token: string): User | undefined {
  const row = db
    .prepare(
      `SELECT u.id, u.username, u.displayName, u.email, u.avatarColor, u.createdAt
       FROM sessions s
       JOIN users u ON u.id = s.userId
       WHERE s.token = ? AND s.expiresAt > ?`,
    )
    .get(token, new Date().toISOString()) as User | undefined;
  return row;
}

export function deleteSession(token: string): void {
  db.prepare(`DELETE FROM sessions WHERE token = ?`).run(token);
}

export function cleanExpiredSessions(): void {
  db.prepare(`DELETE FROM sessions WHERE expiresAt <= ?`).run(
    new Date().toISOString(),
  );
}

/* ------------------------------------------------------------------ */
/*  Post queries                                                       */
/* ------------------------------------------------------------------ */

type RawPost = {
  id: number;
  title: string;
  category: string;
  description: string;
  creator: string;
  email: string | null;
  tags: string;
  votes: number;
  createdAt: string;
  userId: number | null;
  username: string | null;
  displayName: string | null;
  avatarColor: string | null;
  commentCount: number;
};

function mapRawPost(row: RawPost, currentUserId?: number): Post {
  const post: Post = {
    ...row,
    tags: normalizeTags(row.tags),
  };

  if (currentUserId) {
    const voted = db
      .prepare(`SELECT 1 FROM votes WHERE userId = ? AND postId = ?`)
      .get(currentUserId, row.id);
    post.hasVoted = !!voted;
  }

  return post;
}

export function getAllPosts(options?: {
  search?: string;
  category?: string;
  sort?: "newest" | "votes";
  currentUserId?: number;
}): Post[] {
  const conditions: string[] = [];
  const params: (string | number)[] = [];

  if (options?.search) {
    conditions.push(`(p.title LIKE ? OR p.description LIKE ? OR p.tags LIKE ?)`);
    const term = `%${options.search}%`;
    params.push(term, term, term);
  }

  if (options?.category && options.category !== "all") {
    conditions.push(`p.category = ?`);
    params.push(options.category);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  const orderBy = options?.sort === "votes" ? "p.votes DESC, p.createdAt DESC" : "p.createdAt DESC";

  const rows = db
    .prepare(
      `SELECT p.id, p.title, p.category, p.description, p.creator, p.email,
              p.tags, p.votes, p.createdAt, p.userId,
              u.username, u.displayName, u.avatarColor,
              (SELECT COUNT(*) FROM comments c WHERE c.postId = p.id) AS commentCount
       FROM posts p
       LEFT JOIN users u ON u.id = p.userId
       ${where}
       ORDER BY ${orderBy}`,
    )
    .all(...params) as RawPost[];

  return rows.map((row) => mapRawPost(row, options?.currentUserId));
}

export function getPostById(id: number, currentUserId?: number): Post | undefined {
  const row = db
    .prepare(
      `SELECT p.id, p.title, p.category, p.description, p.creator, p.email,
              p.tags, p.votes, p.createdAt, p.userId,
              u.username, u.displayName, u.avatarColor,
              (SELECT COUNT(*) FROM comments c WHERE c.postId = p.id) AS commentCount
       FROM posts p
       LEFT JOIN users u ON u.id = p.userId
       WHERE p.id = ?`,
    )
    .get(id) as RawPost | undefined;

  if (!row) return undefined;
  return mapRawPost(row, currentUserId);
}

export function createPost(input: {
  title: string;
  category: string;
  description: string;
  creator: string;
  email?: string | null;
  tags: string[];
  userId?: number;
}): Post {
  const createdAt = new Date().toISOString();
  const tags = input.tags.map((tag) => tag.trim().toLowerCase()).filter(Boolean).slice(0, 5);

  const result = db
    .prepare(
      `INSERT INTO posts (title, category, description, creator, email, tags, votes, createdAt, userId)
       VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?)`,
    )
    .run(
      input.title.trim(),
      input.category,
      input.description.trim(),
      input.creator.trim(),
      input.email?.trim() || null,
      tags.join(","),
      createdAt,
      input.userId ?? null,
    );

  const post = getPostById(Number(result.lastInsertRowid), input.userId);

  if (!post) {
    throw new Error("Unable to load created post.");
  }

  return post;
}

export function updatePost(
  id: number,
  input: { title: string; category: string; description: string; tags: string[] },
): Post {
  const tags = input.tags.map((tag) => tag.trim().toLowerCase()).filter(Boolean).slice(0, 5);

  const result = db
    .prepare(
      `UPDATE posts SET title = ?, category = ?, description = ?, tags = ?
       WHERE id = ?`,
    )
    .run(input.title.trim(), input.category, input.description.trim(), tags.join(","), id);

  if (result.changes === 0) {
    throw new Error("Post not found.");
  }

  const post = getPostById(id);
  if (!post) throw new Error("Unable to load updated post.");
  return post;
}

export function deletePostById(id: number): void {
  const result = db.prepare(`DELETE FROM posts WHERE id = ?`).run(id);

  if (result.changes === 0) {
    throw new Error("Post not found.");
  }
}

/* ------------------------------------------------------------------ */
/*  Vote queries                                                       */
/* ------------------------------------------------------------------ */

export function toggleVote(userId: number, postId: number): { voted: boolean; votes: number } {
  const existing = db
    .prepare(`SELECT 1 FROM votes WHERE userId = ? AND postId = ?`)
    .get(userId, postId);

  if (existing) {
    // Remove vote
    db.prepare(`DELETE FROM votes WHERE userId = ? AND postId = ?`).run(userId, postId);
    db.prepare(`UPDATE posts SET votes = votes - 1 WHERE id = ?`).run(postId);
  } else {
    // Add vote
    db.prepare(
      `INSERT INTO votes (userId, postId, createdAt) VALUES (?, ?, ?)`,
    ).run(userId, postId, new Date().toISOString());
    db.prepare(`UPDATE posts SET votes = votes + 1 WHERE id = ?`).run(postId);
  }

  const post = db.prepare(`SELECT votes FROM posts WHERE id = ?`).get(postId) as
    | { votes: number }
    | undefined;

  return { voted: !existing, votes: post?.votes ?? 0 };
}

/* ------------------------------------------------------------------ */
/*  Comment queries                                                    */
/* ------------------------------------------------------------------ */

export function getCommentsByPostId(postId: number): Comment[] {
  return db
    .prepare(
      `SELECT c.id, c.postId, c.userId, c.content, c.createdAt,
              u.username, u.displayName, u.avatarColor
       FROM comments c
       JOIN users u ON u.id = c.userId
       WHERE c.postId = ?
       ORDER BY c.createdAt ASC`,
    )
    .all(postId) as Comment[];
}

export function createComment(input: {
  postId: number;
  userId: number;
  content: string;
}): Comment {
  const createdAt = new Date().toISOString();

  const result = db
    .prepare(
      `INSERT INTO comments (postId, userId, content, createdAt)
       VALUES (?, ?, ?, ?)`,
    )
    .run(input.postId, input.userId, input.content.trim(), createdAt);

  const comment = db
    .prepare(
      `SELECT c.id, c.postId, c.userId, c.content, c.createdAt,
              u.username, u.displayName, u.avatarColor
       FROM comments c
       JOIN users u ON u.id = c.userId
       WHERE c.id = ?`,
    )
    .get(Number(result.lastInsertRowid)) as Comment;

  return comment;
}

export function deleteComment(id: number): void {
  db.prepare(`DELETE FROM comments WHERE id = ?`).run(id);
}
