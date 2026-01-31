import styles from "./page.module.css";
import { Terminal } from "@/components/terminal/Terminal";

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <Terminal />
      </main>
    </div>
  );
}
