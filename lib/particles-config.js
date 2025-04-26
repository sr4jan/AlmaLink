const particlesConfig = {
    background: {
      color: { value: "transparent" },
    },
    fpsLimit: 60,
    interactivity: {
      events: { onClick: { enable: false }, onHover: { enable: false }, resize: true },
    },
    particles: {
      color: { value: "#8ec5fc" },
      links: { enable: false },
      collisions: { enable: false },
      move: {
        direction: "none",
        enable: true,
        outModes: "bounce",
        random: true,
        speed: 0.2,
        straight: false,
      },
      number: {
        value: 50,
        density: { enable: true, area: 800 },
      },
      opacity: { value: 0.4 },
      shape: { type: "circle" },
      size: { value: { min: 1, max: 3 } },
    },
    detectRetina: true,
  };
  
  export default particlesConfig;
  