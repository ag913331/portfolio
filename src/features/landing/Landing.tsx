import Link from "next/link";
import { Button } from "@/components/Button/Button";
import styles from "./Landing.module.css";

export function Landing({ onOpenTerminal }: { onOpenTerminal: () => void }) {
  return (
    <section className={styles.landing} aria-label="Welcome">
      <div className={styles.landingInner}>
        <p className={styles.kicker}>Hello, my name is Alexandro.</p>
        <h1 className={styles.title}>Welcome to my terminal portfolio.</h1>
        <p className={styles.subtitle}>
          Explore my work and experience through a Linux-style command line interface.
        </p>

        <div className={styles.actions}>
          <Button variant="solid" className={styles.openBtn} onClick={onOpenTerminal}>
            $: Open terminal
          </Button>

          <Link className={styles.cvBtn} href="/cv.pdf" download>
            $: Download CV
          </Link>
        </div>
      </div>
    </section>
  );
}
