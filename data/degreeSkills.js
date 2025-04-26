export const getRecommendedSkills = (degree, major) => {
    const skillMappings = {
      "B.Tech": {
        "Computer Science": {
          primary: [
            "JavaScript", "Python", "Java", "C++",
            "Data Structures", "Algorithms", "Web Development",
            "Database Management", "Software Engineering"
          ],
          suggested: [
            "React", "Node.js", "Cloud Computing", "Machine Learning",
            "DevOps", "System Design"
          ]
        },
        "Information Technology": {
          primary: [
            "Network Security", "Cloud Computing", "System Administration",
            "Database Management", "IT Infrastructure", "Python"
          ],
          suggested: [
            "DevOps", "AWS", "Azure", "Docker", "Linux",
            "Network Protocols"
          ]
        },
        "Electronics": {
          primary: [
            "Circuit Design", "Embedded Systems", "Digital Electronics",
            "Microcontrollers", "PCB Design", "VLSI"
          ],
          suggested: [
            "IoT", "Python", "C++", "Arduino", "Signal Processing",
            "Control Systems"
          ]
        }
      },
      "BCA": {
        "default": {
          primary: [
            "Web Development", "JavaScript", "Python", "Java",
            "Database Management", "Software Development"
          ],
          suggested: [
            "React", "Node.js", "Angular", "Cloud Computing",
            "Mobile App Development"
          ]
        }
      },
      "MCA": {
        "default": {
          primary: [
            "Advanced Programming", "System Design", "Database Architecture",
            "Cloud Computing", "Software Engineering"
          ],
          suggested: [
            "AI/ML", "Big Data", "DevOps", "Microservices",
            "Project Management"
          ]
        }
      }
    };
  
    const degreeMap = skillMappings[degree];
    if (!degreeMap) {
      return {
        primary: [],
        suggested: []
      };
    }
  
    const majorMap = degreeMap[major] || degreeMap.default;
    if (!majorMap) {
      return {
        primary: [],
        suggested: []
      };
    }
  
    return majorMap;
  };