import Link from "next/link";
import styles from "./page.module.css";
import { Carousel } from "@/features/carousel/Carousel";
import { SLIDES } from "@/content/constants";

export default function LifePage() {
  return (
    <div className={styles.page}>
      <main className={styles.card}>
        <div className={styles.inner}>
          <p className={styles.kicker}>Life</p>
          <h1 className={styles.title}>Personal info</h1>
          
          <Carousel slides={SLIDES} />

          <p className={styles.notice}>
            Reminder: pictures/content shown here should not be downloaded or redistributed without permission.
          </p>

          <div className={styles.actions}>
            <Link className={styles.btn} href="/">
              $: Back to terminal
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}


