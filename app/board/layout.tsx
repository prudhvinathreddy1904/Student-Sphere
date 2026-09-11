"use client";

import { useState, useEffect, useCallback, createContext, useContext } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "./board.module.css";

type User = {
  id: number;
  username: string;
  displayName: string;
  email: string;
  avatarColor: string;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  refresh: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export default function BoardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      setUser(data.user || null);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.push("/");
  }

  return (
    <AuthContext value={{ user, loading, refresh }}>
      <div className={styles.layout}>
        {/* Header */}
        <header className={styles.header}>
          <div className={styles.headerInner}>
            <Link href="/" className={styles.logo} aria-label="Student Sphere home">
              <span className={styles.logoMark}>S</span>
              <span className={styles.logoText}>studentsphere</span>
            </Link>

            <nav className={styles.headerNav} aria-label="Main navigation">
              <Link href="/board" className={styles.navLink}>
                <span className={styles.navIcon}>◎</span>
                Board
              </Link>
            </nav>

            <div className={styles.headerRight}>
              {loading ? (
                <div className={styles.headerSkeleton} />
              ) : user ? (
                <div className={styles.userMenu}>
                  <div
                    className={styles.avatar}
                    style={{ background: user.avatarColor }}
                    title={user.displayName}
                  >
                    {user.displayName.charAt(0).toUpperCase()}
                  </div>
                  <span className={styles.userName}>{user.displayName}</span>
                  <button
                    onClick={handleLogout}
                    className={styles.logoutBtn}
                    title="Log out"
                  >
                    ↗
                  </button>
                </div>
              ) : (
                <div className={styles.authButtons}>
                  <Link href="/login" className={styles.loginBtn}>
                    Log in
                  </Link>
                  <Link href="/signup" className={styles.signupBtn}>
                    Sign up <span aria-hidden="true">→</span>
                  </Link>
                </div>
              )}

              <button
                className={styles.mobileToggle}
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle menu"
              >
                <span className={`${styles.hamburger} ${mobileMenuOpen ? styles.hamburgerOpen : ""}`} />
              </button>
            </div>
          </div>
        </header>

        {/* Mobile menu overlay */}
        {mobileMenuOpen && (
          <div className={styles.mobileOverlay} onClick={() => setMobileMenuOpen(false)}>
            <nav className={styles.mobileMenu} onClick={(e) => e.stopPropagation()}>
              <Link href="/board" onClick={() => setMobileMenuOpen(false)}>
                ◎ Board
              </Link>
              {user ? (
                <>
                  <div className={styles.mobileUser}>
                    <div
                      className={styles.avatar}
                      style={{ background: user.avatarColor }}
                    >
                      {user.displayName.charAt(0).toUpperCase()}
                    </div>
                    <span>{user.displayName}</span>
                  </div>
                  <button onClick={handleLogout} className={styles.mobileLogout}>
                    Log out
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                    Log in
                  </Link>
                  <Link href="/signup" onClick={() => setMobileMenuOpen(false)}>
                    Sign up
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}

        {/* Main content */}
        <main className={styles.main}>{children}</main>
      </div>
    </AuthContext>
  );
}
