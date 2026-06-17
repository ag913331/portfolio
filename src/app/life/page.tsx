import Link from "next/link";
import styles from "./page.module.css";
import surface from "@/styles/surface.module.css";
import { Carousel } from "@/features/carousel/Carousel";
import { SLIDES } from "@/content/constants";

export default function LifePage() {
  return (
    <div className={styles.page}>
      <main className={surface.card}>
        <div className={surface.inner}>
          <p className={surface.kicker}>Life</p>
          <h1 className={surface.title}>Personal info</h1>

          <Carousel slides={SLIDES} />

          <p className={styles.notice}>
            Reminder: pictures/content shown here should not be downloaded or redistributed without permission.
          </p>

          <div className={surface.actions}>
            <Link className={surface.btn} href="/terminal">
              $: Back to terminal
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
