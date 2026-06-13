import Link from "next/link";
import type { Metadata } from "next";
import { toHref } from "@/lib/helpers";
import {
  CERTIFICATIONS,
  CONTACTS,
  EDUCATION,
  EXPERIENCE,
  LANGUAGES,
  PRIVATE_PROJECTS,
  PROFILE,
  PUBLIC_PROJECTS,
  SKILLS,
  WHOAMI,
} from "@/content/resume";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: `${PROFILE.name} — ${PROFILE.role}`,
  description: WHOAMI.intro[0],
};

function ContactLinks({ className }: { className?: string }) {
  return (
    <div className={`${styles.contactRow} ${className ?? ""}`}>
      {CONTACTS.map((c) => {
        const href = toHref(c.value) ?? c.value;
        const external = !href.startsWith("mailto:");
        return (
          <a
            key={c.label}
            href={href}
            className={styles.chipLink}
            target={external ? "_blank" : undefined}
            rel={external ? "noopener noreferrer" : undefined}
          >
            {c.label}
          </a>
        );
      })}
    </div>
  );
}

export default function PortfolioPage() {
  return (
    <div className={styles.page}>
      <header className={styles.nav}>
        <span className={styles.navName}>{PROFILE.name}</span>
        <div className={styles.navLinks}>
          <a href="/cv.pdf" download className={styles.navLink}>
            Download CV
          </a>
          <Link href="/" className={styles.navTerminal}>
            $ Terminal view
          </Link>
        </div>
      </header>

      <main className={styles.main}>
        <section className={styles.hero}>
          <p className={styles.kicker}>Hello, I&rsquo;m</p>
          <h1 className={styles.name}>{PROFILE.name}</h1>
          <p className={styles.role}>{PROFILE.role}</p>
          <p className={styles.tagline}>{WHOAMI.outro}</p>
          <ContactLinks />
        </section>

        <section className={styles.section}>
          <h2 className={styles.h2}>About</h2>
          {WHOAMI.intro.map((p) => (
            <p key={p} className={styles.body}>
              {p}
            </p>
          ))}
          <div className={styles.cards}>
            {WHOAMI.groups.map((g) => (
              <div key={g.title} className={styles.card}>
                <h3 className={styles.cardTitle}>{g.title}</h3>
                <ul className={styles.list}>
                  {g.bullets.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.h2}>Experience</h2>
          <div className={styles.timeline}>
            {EXPERIENCE.map((j) => (
              <article key={`${j.company}-${j.period}`} className={styles.tlItem}>
                <div className={styles.tlHead}>
                  <h3 className={styles.tlRole}>{j.role}</h3>
                  <span className={`${styles.period} ${j.current ? styles.periodCurrent : ""}`}>{j.period}</span>
                </div>
                <p className={styles.tlMeta}>
                  {j.company} · {j.location} · {j.type}
                </p>
                <ul className={styles.list}>
                  {j.description.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.h2}>Skills</h2>
          <div className={styles.cards}>
            {SKILLS.map((g) => (
              <div key={g.title} className={styles.card}>
                <h3 className={styles.cardTitle}>{g.title}</h3>
                <div className={styles.chips}>
                  {g.items.map((s) => (
                    <span key={s} className={styles.chip}>
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.h2}>Projects</h2>
          <div className={styles.cards}>
            {PUBLIC_PROJECTS.map((p) => (
              <a
                key={p.name}
                href={p.repo}
                target="_blank"
                rel="noopener noreferrer"
                className={`${styles.card} ${styles.projectCard}`}
              >
                <h3 className={styles.cardTitle}>{p.name}</h3>
                <p className={styles.body}>{p.description}</p>
                <span className={styles.repoLink}>View repository →</span>
              </a>
            ))}
          </div>
          <p className={styles.note}>
            Additional large-scale work is under NDA: {PRIVATE_PROJECTS.map((p) => p.title).join(", ")}. Happy to
            discuss high-level responsibilities and outcomes in private.
          </p>
        </section>

        <div className={styles.split}>
          <section className={styles.section}>
            <h2 className={styles.h2}>Education</h2>
            <div className={styles.stack}>
              {EDUCATION.map((e) => (
                <div key={`${e.institution}-${e.period}`} className={styles.card}>
                  <h3 className={styles.cardTitle}>{e.degree}</h3>
                  <p className={styles.body}>{e.fieldOfStudy}</p>
                  <p className={styles.tlMeta}>
                    {e.institution} · {e.period}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className={styles.section}>
            <h2 className={styles.h2}>Languages</h2>
            <div className={styles.chips}>
              {LANGUAGES.map((l) => (
                <span key={l.name} className={styles.chip}>
                  {l.name} — {l.level}
                </span>
              ))}
            </div>
          </section>
        </div>

        <section className={styles.section}>
          <h2 className={styles.h2}>Certifications</h2>
          <ul className={styles.certList}>
            {CERTIFICATIONS.map((c) => {
              const href = toHref(c.credential);
              const isUrl = href != null && !href.startsWith("mailto:");
              return (
                <li key={c.title} className={styles.certItem}>
                  <div>
                    <span className={styles.certTitle}>{c.title}</span>
                    <span className={styles.certMeta}>
                      {" "}
                      — {c.issuedBy}, {c.date}
                    </span>
                  </div>
                  {isUrl ? (
                    <a href={href} target="_blank" rel="noopener noreferrer" className={styles.repoLink}>
                      Credential →
                    </a>
                  ) : (
                    <span className={styles.certMeta}>{c.credential}</span>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      </main>

      <footer className={styles.footer}>
        <h2 className={styles.h2}>Let&rsquo;s talk</h2>
        <ContactLinks />
        <Link href="/" className={styles.navTerminal}>
          $ Back to terminal view
        </Link>
      </footer>
    </div>
  );
}
