"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "./signup.module.css";

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    username: "",
    displayName: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  function updateField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    // Clear field error on change
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  }

  function validateClient(): Record<string, string> {
    const errs: Record<string, string> = {};

    if (!form.username.trim() || form.username.trim().length < 3) {
      errs.username = "Username must be at least 3 characters.";
    } else if (!/^[a-zA-Z0-9_]+$/.test(form.username.trim())) {
      errs.username = "Only letters, numbers, and underscores.";
    }

    if (!form.displayName.trim() || form.displayName.trim().length < 2) {
      errs.displayName = "Display name must be at least 2 characters.";
    }

    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      errs.email = "Please enter a valid email address.";
    }

    if (!form.password || form.password.length < 6) {
      errs.password = "Password must be at least 6 characters.";
    }

    return errs;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const clientErrors = validateClient();
    if (Object.keys(clientErrors).length > 0) {
      setErrors(clientErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: form.username.trim(),
          displayName: form.displayName.trim(),
          email: form.email.trim(),
          password: form.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrors(data.errors || { general: "Signup failed. Please try again." });
        return;
      }

      router.push("/board");
    } catch {
      setErrors({ general: "Network error. Please check your connection." });
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
          <h1>Join the community</h1>
          <p className={styles.subtitle}>
            Create your account and start sharing with your campus.
          </p>

          <form onSubmit={handleSubmit} className={styles.form} noValidate>
            {errors.general && (
              <div className={styles.errorBanner} role="alert">
                <span className={styles.errorIcon}>!</span>
                {errors.general}
              </div>
            )}

            <div className={`${styles.field} ${errors.username ? styles.fieldError : ""}`}>
              <label htmlFor="signup-username">Username</label>
              <input
                id="signup-username"
                type="text"
                placeholder="cool_student"
                value={form.username}
                onChange={(e) => updateField("username", e.target.value)}
                autoComplete="username"
                autoFocus
              />
              {errors.username && <span className={styles.fieldMsg}>{errors.username}</span>}
            </div>

            <div className={`${styles.field} ${errors.displayName ? styles.fieldError : ""}`}>
              <label htmlFor="signup-displayName">Display name</label>
              <input
                id="signup-displayName"
                type="text"
                placeholder="Alex Johnson"
                value={form.displayName}
                onChange={(e) => updateField("displayName", e.target.value)}
                autoComplete="name"
              />
              {errors.displayName && <span className={styles.fieldMsg}>{errors.displayName}</span>}
            </div>

            <div className={`${styles.field} ${errors.email ? styles.fieldError : ""}`}>
              <label htmlFor="signup-email">Email</label>
              <input
                id="signup-email"
                type="email"
                placeholder="alex@university.edu"
                value={form.email}
                onChange={(e) => updateField("email", e.target.value)}
                autoComplete="email"
              />
              {errors.email && <span className={styles.fieldMsg}>{errors.email}</span>}
            </div>

            <div className={`${styles.field} ${errors.password ? styles.fieldError : ""}`}>
              <label htmlFor="signup-password">Password</label>
              <input
                id="signup-password"
                type="password"
                placeholder="6+ characters"
                value={form.password}
                onChange={(e) => updateField("password", e.target.value)}
                autoComplete="new-password"
              />
              {errors.password && <span className={styles.fieldMsg}>{errors.password}</span>}
            </div>

            <button
              type="submit"
              className={styles.submitBtn}
              disabled={loading}
            >
              {loading ? (
                <span className={styles.spinner} />
              ) : (
                <>Create account <span aria-hidden="true">→</span></>
              )}
            </button>
          </form>

          <p className={styles.switchLink}>
            Already have an account?{" "}
            <Link href="/login">Log in</Link>
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
