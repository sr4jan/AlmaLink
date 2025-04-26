export const themeStyles = {
    // Text styles
    heading: {
      color: 'var(--text-primary)',
      marginBottom: '1.5rem',
    },
    text: {
      color: 'var(--text-secondary)',
      fontSize: '1rem',
      lineHeight: '1.6',
    },
  
    // Card styles
    card: {
      background: 'var(--card-bg)',
      border: '1px solid var(--border-color)',
      borderRadius: '12px',
      padding: '1.5rem',
      transition: 'all 0.3s ease',
    },
    cardHover: {
      transform: 'translateY(-2px)',
      boxShadow: '0 8px 24px var(--shadow-color)',
    },
  
    // Button styles
    button: {
      primary: {
        background: 'var(--primary-gradient)',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        padding: '0.5rem 1rem',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
      },
      secondary: {
        background: 'var(--card-bg)',
        color: 'var(--text-primary)',
        border: '1px solid var(--border-color)',
        borderRadius: '8px',
        padding: '0.5rem 1rem',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
      },
    },
  
    // Input styles
    input: {
      background: 'var(--input-bg)',
      border: '1px solid var(--border-color)',
      color: 'var(--text-primary)',
      borderRadius: '8px',
      padding: '0.5rem 1rem',
    },
  
    // Table styles
    table: {
      header: {
        background: 'var(--bg-secondary)',
        color: 'var(--text-primary)',
      },
      cell: {
        borderColor: 'var(--border-color)',
        color: 'var(--text-secondary)',
      },
    },
  };
  
  export const useThemeStyles = () => {
    return themeStyles;
  };