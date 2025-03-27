import styles from "./LoadingSpinner.module.css";

const LoadingSpinner = () => {
  return (
      <div className={styles.spinner}>
        <div className={styles.dot}></div>
        <div className={styles.dot}></div>
        <div className={styles.dot}></div>
      </div>
  );
};

export default LoadingSpinner;
