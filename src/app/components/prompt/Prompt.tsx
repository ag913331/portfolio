import styles from "./Prompt.module.css";

export const Prompt = () => {
    return (
      <span className={styles.prompt} aria-hidden="true">
        <span className={styles.promptUser}>alexandro</span>
        <span className={styles.promptAt}>@</span>
        <span className={styles.promptHost}>localhost</span>
        <span className={styles.promptColon}>:</span>
        <span className={styles.promptPath}>~</span>
        <span className={styles.promptSymbol}>$</span>
        <span>&nbsp;</span>
      </span>
    );
  }