export const updateThemeColor = (colorKey, value) => {
    document.documentElement.style.setProperty(`--${colorKey}`, value);
  };
  
  export const setThemeColors = (colors) => {
    Object.entries(colors).forEach(([key, value]) => {
      updateThemeColor(key, value);
    });
  };
  
  export const generateColorPalette = (baseColor) => {
    // Function to generate a full color palette from a base color
    // You can implement color manipulation logic here
    return {
      50: lightenColor(baseColor, 0.9),
      100: lightenColor(baseColor, 0.7),
      200: lightenColor(baseColor, 0.5),
      300: lightenColor(baseColor, 0.3),
      400: lightenColor(baseColor, 0.1),
      500: baseColor,
      600: darkenColor(baseColor, 0.1),
      700: darkenColor(baseColor, 0.3),
      800: darkenColor(baseColor, 0.5),
      900: darkenColor(baseColor, 0.7),
    };
  };
  
  // Helper functions for color manipulation
  function lightenColor(hex, factor) {
    // Implement color lightening logic
    return hex; // Placeholder
  }
  
  function darkenColor(hex, factor) {
    // Implement color darkening logic
    return hex; // Placeholder
  }