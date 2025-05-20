import styles from '@/styles/LearnMore.module.css';
import { SiNextdotjs, SiReact, SiTypescript, SiJavascript, SiFastapi, 
         SiMongodb, SiPython, SiScikitlearn, SiPandas, SiNpm } from 'react-icons/si';

export function TechStack() {
  const stacks = [
    {
      title: "Frontend",
      items: [
        { name: "Next.js v15", icon: <SiNextdotjs />, category: "Framework" },
        { name: "React v19", icon: <SiReact />, category: "Core" },
        { name: "TypeScript/JavaScript", icon: <SiTypescript />, category: "Language" },
        { name: "NextAuth.js", icon: <SiNpm />, category: "Authentication" },
      ]
    },
    {
      title: "Backend",
      items: [
        { name: "FastAPI", icon: <SiFastapi />, category: "Framework" },
        { name: "Python ML Stack", icon: <SiPython />, category: "Core" },
        { name: "scikit-learn", icon: <SiScikitlearn />, category: "ML Stack" },
        { name: "pandas", icon: <SiPandas />, category: "Data Processing" },
      ]
    },
    {
      title: "Database",
      items: [
        { name: "MongoDB Atlas", icon: <SiMongodb />, category: "Platform" }
      ]
    }
  ];

  return (
    <section id="tech-stack" className={styles.section}>
      <h2>Tech Stack</h2>
      <div className={styles.stackContainer}>
        {stacks.map((stack) => (
          <div key={stack.title} className={styles.stackCategory}>
            <h3 className={styles.stackTitle}>{stack.title}</h3>
            <div className={styles.stackGrid}>
              {stack.items.map((item) => (
                <div key={item.name} className={styles.stackItem}>
                  <div className={styles.stackIcon}>
                    {item.icon}
                  </div>
                  <div className={styles.stackInfo}>
                    <h4>{item.name}</h4>
                    <span>{item.category}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}