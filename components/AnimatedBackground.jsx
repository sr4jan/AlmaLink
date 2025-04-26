import styles from '@/styles/Home.module.css';

export const AnimatedBackground = () => {
  return (
    <div className={styles.backgroundAnimation} aria-hidden="true">
      {/* Animation is handled by CSS */}
    </div>
  );
};

export default AnimatedBackground;