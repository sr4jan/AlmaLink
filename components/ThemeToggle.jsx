'use client';
import { useTheme } from '@/contexts/ThemeContext';
import { Sun, Moon } from 'lucide-react';
import styles from './ThemeToggle.module.css';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button 
      onClick={toggleTheme}
      className={styles.themeToggle}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      <div className={styles.iconWrapper}>
        <Sun 
          className={`${styles.icon} ${styles.sunIcon} ${
            theme === 'light' ? styles.active : ''
          }`} 
          size={18} 
        />
        <Moon 
          className={`${styles.icon} ${styles.moonIcon} ${
            theme === 'dark' ? styles.active : ''
          }`} 
          size={18} 
        />
      </div>
    </button>
  );
}