"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "./login.module.css";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!username.trim() || !password) {
      setError("Please enter your username and password.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.errors?.general || "Login failed. Please try again.");
        return;
      }

      router.push("/board");
    } catch {
      setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <Link href="/" className={styles.logo} aria-label="Back to home">
          <span className={styles.logoMark}>S</span>
          <span>studentsphere</span>
        </Link>

        <div className={styles.card}>
          <h1>Welcome back</h1>
          <p className={styles.subtitle}>
            Log in to continue sharing with your campus community.
          </p>

          <form onSubmit={handleSubmit} className={styles.form} noValidate>
            {error && (
              <div className={styles.errorBanner} role="alert">
                <span className={styles.errorIcon}>!</span>
                {error}
              </div>
            )}

            <div className={styles.field}>
              <label htmlFor="login-username">Username</label>
              <input
                id="login-username"
                type="text"
                placeholder="your_username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                autoFocus
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="login-password">Password</label>
              <input
                id="login-password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              className={styles.submitBtn}
              disabled={loading}
            >
              {loading ? (
                <span className={styles.spinner} />
              ) : (
                <>Log in <span aria-hidden="true">→</span></>
              )}
            </button>
          </form>

          <p className={styles.switchLink}>
            Don&apos;t have an account?{" "}
            <Link href="/signup">Create one</Link>
          </p>
        </div>
      </div>

      <div className={styles.decoration} aria-hidden="true">
        <div className={styles.circle1} />
        <div className={styles.circle2} />
        <div className={styles.circle3} />
      </div>
    </main>
  );
}
