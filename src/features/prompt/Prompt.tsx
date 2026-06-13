import { HOST, USER } from "@/content/constants";
import styles from "./Prompt.module.css";

export const Prompt = ({ path = "~" }: { path?: string }) => {
  return (
    <span className={styles.prompt} aria-hidden="true">
      <span className={styles.promptUser}>{USER}</span>
      <span className={styles.promptAt}>@</span>
      <span className={styles.promptHost}>{HOST}</span>
      <span className={styles.promptColon}>:</span>
      <span className={styles.promptPath}>{path}</span>
      <span className={styles.promptSymbol}>$</span>
    </span>
  );
};
