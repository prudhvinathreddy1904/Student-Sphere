import Link from "next/link";
import styles from "./page.module.css";

const features = [
  {
    icon: "◎",
    title: "Campus Notice Board",
    description:
      "Share ideas, post notices, report lost & found items, and spark spontaneous campus activities.",
    accent: "peach",
  },
  {
    icon: "✦",
    title: "Community Upvoting",
    description:
      "Crowdsource the best initiatives and discover what's trending across campus in real time.",
    accent: "lavender",
  },
  {
    icon: "↗",
    title: "Study Groups & Circles",
    description:
      "Form study pods, collaborate on projects, and build a collegiate network that lasts.",
    accent: "mint",
  },
];

export default function Home() {
  return (
    <main className={styles.page}>
      <nav className={styles.nav} aria-label="Main navigation">
        <Link className={styles.logo} href="/" aria-label="StudentSphere home">
          <span className={styles.logoMark}>S</span>
          <span>studentsphere</span>
        </Link>
        <div className={styles.navLinks}>
          <Link href="/board">Campus Board</Link>
          <a href="#why-us">Why StudentSphere</a>
          <a href="#how-it-works">How it works</a>
        </div>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <Link
            href="/login"
            style={{
              fontSize: "13px",
              fontWeight: 600,
              color: "var(--text-secondary)",
              padding: "8px 14px",
            }}
          >
            Log in
          </Link>
          <Link className={styles.navCta} href="/signup">
            Join the community <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </nav>

      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}><span /> The student social space</p>
          <h1>
            College is better
            <em> together.</em>
          </h1>
          <p className={styles.heroText}>
            StudentSphere is the collaborative hub to share ideas, find study groups,
            discover campus events, and connect with fellow students in real-time.
          </p>
          <div className={styles.heroActions}>
            <Link className={styles.primaryButton} href="/board">
              Explore Campus Board <span aria-hidden="true">↗</span>
            </Link>
            <Link className={styles.textButton} href="/signup">
              Sign up free <span aria-hidden="true">→</span>
            </Link>
          </div>
          <div className={styles.trustRow}>
            <div className={styles.avatarStack} aria-hidden="true">
              <span className={styles.avatarOne}>A</span>
              <span className={styles.avatarTwo}>J</span>
              <span className={styles.avatarThree}>M</span>
              <span className={styles.avatarFour}>+</span>
            </div>
            <p><strong>12,000+</strong> students already finding their circle</p>
          </div>
        </div>
        <div className={styles.heroVisual} aria-label="Students connecting on campus">
          <div className={styles.sunShape} />
          <div className={styles.visualCardTop}>
            <span className={styles.liveDot} /> live on campus
          </div>
          <div className={styles.photoCard}>
            <div className={styles.photoSun} />
            <div className={`${styles.student} ${styles.studentLeft}`}>
              <span className={styles.hair} />
              <span className={styles.head} />
              <span className={styles.body} />
            </div>
            <div className={`${styles.student} ${styles.studentMiddle}`}>
              <span className={styles.hair} />
              <span className={styles.head} />
              <span className={styles.body} />
            </div>
            <div className={`${styles.student} ${styles.studentRight}`}>
              <span className={styles.hair} />
              <span className={styles.head} />
              <span className={styles.body} />
            </div>
            <div className={styles.photoGround} />
          </div>
          <div className={styles.floatCard}>
            <span className={styles.floatIcon}>✦</span>
            <div><strong>New faces,</strong><small>same wavelength</small></div>
          </div>
          <span className={`${styles.sparkle} ${styles.sparkleOne}`}>✦</span>
          <span className={`${styles.sparkle} ${styles.sparkleTwo}`}>✦</span>
        </div>
      </section>

      <section className={styles.marquee} aria-label="StudentSphere values">
        <span>MEET</span><i>✳</i><span>DISCOVER</span><i>✳</i><span>BELONG</span><i>✳</i><span>GROW</span><i>✳</i><span>MEET</span>
      </section>

      <section className={styles.featuresSection} id="why-us">
        <div className={styles.sectionHeading}>
          <p className={styles.eyebrow}><span /> More than a campus app</p>
          <h2>Your world is waiting.</h2>
          <p>From your first hello to your last late-night study session, StudentSphere helps you find the moments that matter.</p>
        </div>
        <div className={styles.featureGrid}>
          {features.map((feature) => (
            <article className={`${styles.featureCard} ${styles[feature.accent]}`} key={feature.title}>
              <div className={styles.featureIcon}>{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
              <Link href="/board" aria-label={`Explore ${feature.title}`}>Explore board <span>↗</span></Link>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.stepsSection} id="how-it-works">
        <div className={styles.stepsVisual}>
          <div className={styles.noteCard}><span>☀</span><strong>today&apos;s vibe</strong><p>creative<br />curious<br />connected</p></div>
          <div className={styles.circleLine} />
          <div className={styles.bigNumber}>03</div>
        </div>
        <div className={styles.stepsCopy}>
          <p className={styles.eyebrow}><span /> Easy from day one</p>
          <h2>Show up as you are.</h2>
          <div className={styles.step}><b>01</b><div><h3>Create your profile</h3><p>Sign up in seconds and choose your custom campus avatar color.</p></div></div>
          <div className={styles.step}><b>02</b><div><h3>Explore the board</h3><p>Browse posts, vote for campus initiatives, and filter by topic.</p></div></div>
          <div className={styles.step}><b>03</b><div><h3>Start collaborating</h3><p>Post your own study groups, events, and notices for everyone to see.</p></div></div>
        </div>
      </section>

      <section className={styles.quoteSection} id="community">
        <span className={styles.quoteMark}>“</span>
        <blockquote>StudentSphere made a huge campus feel like a small town. I found my study group before midterms even started!</blockquote>
        <p className={styles.quoteAuthor}><strong>Amara Williams</strong> · Design student, NYU</p>
      </section>

      <section className={styles.joinSection} id="join">
        <div><p className={styles.eyebrow}><span /> Your next chapter starts here</p><h2>Ready to find<br /><em>your people?</em></h2></div>
        <Link className={styles.primaryButton} href="/board">Visit Campus Board <span aria-hidden="true">↗</span></Link>
      </section>

      <footer className={styles.footer}>
        <Link className={styles.logo} href="/"><span className={styles.logoMark}>S</span><span>studentsphere</span></Link>
        <p>Made for students, by students.</p>
        <div>
          <Link href="/board">Board</Link>
          <Link href="/login">Login</Link>
          <Link href="/signup">Signup</Link>
        </div>
      </footer>
    </main>
  );
}
