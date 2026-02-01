"use client";

import { useState } from "react";
import styles from "./page.module.css";
import { Terminal } from "@/app/features/terminal/Terminal";

export default function Home() {
  const [isOpen, setIsOpen] = useState(true);
  const [terminalKey, setTerminalKey] = useState(1);

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        {isOpen ? (
          <Terminal
            key={terminalKey}
            onClose={() => {
              setIsOpen(false);
            }}
          />
        ) : (
          <section className={styles.landing} aria-label="Welcome">
            <div className={styles.landingInner}>
              <p className={styles.kicker}>Hello, my name is Alexandro.</p>
              <h1 className={styles.title}>Welcome to my terminal portfolio.</h1>
              <p className={styles.subtitle}>
                Explore my work and experience through a Linux-style command line interface.
              </p>

              <div className={styles.actions}>
                <button
                  type="button"
                  className={styles.openBtn}
                  onClick={() => {
                    setTerminalKey((k) => k + 1);
                    setIsOpen(true);
                  }}
                >
                  $: Open terminal
                </button>

                <a className={styles.cvBtn} href="/cv.pdf" download>
                  Download CV
                </a>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
