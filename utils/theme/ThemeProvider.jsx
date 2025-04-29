'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { getCurrentDateTime } from '@/utils/dateFormat';

export const ThemeContext = createContext({
  theme: 'light',
  toggleTheme: () => {},
  currentTime: getCurrentDateTime(),
  currentUser: 'sr4jan',
  colors: {},
  updateColors: () => {}
});

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light');
  const [colors, setColors] = useState(getInitialColors());

  function getInitialColors() {
    return {
      primary: '#0062cc',
      secondary: '#2e8b57',
      accent: '#f59e0b',
      // Add more base colors as needed
    };
  }

  const updateColors = (newColors) => {
    setColors(prev => ({
      ...prev,
      ...newColors
    }));
    updateCSSVariables(newColors);
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const updateCSSVariables = (colors) => {
    const root = document.documentElement;
    Object.entries(colors).forEach(([key, value]) => {
      root.style.setProperty(`--${key}`, value);
    });
  };

  useEffect(() => {
    // Initialize theme from localStorage or system preference
    const savedTheme = localStorage.getItem('theme') || 
      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);

    // Apply initial colors
    updateCSSVariables(colors);
  }, []);

  return (
    <ThemeContext.Provider value={{
      theme,
      toggleTheme,
      currentTime: getCurrentDateTime(),
      currentUser: 'sr4jan',
      colors,
      updateColors
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);