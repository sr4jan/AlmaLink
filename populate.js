require('dotenv').config();

const MONGODB_URI = "mongodb+srv://admin:admin123@cluster0.4grubx3.mongodb.net/AlmaLinkDB?retryWrites=true&w=majority&appName=Cluster0";

// Import the colleges and skills data
const colleges = [
  // IITs
  { name: 'Indian Institute of Technology Bombay', code: 'IITB', type: 'IIT', location: { city: 'Mumbai', state: 'Maharashtra' } },
  { name: 'Indian Institute of Technology Delhi', code: 'IITD', type: 'IIT', location: { city: 'New Delhi', state: 'Delhi' } },
  { name: 'Indian Institute of Technology Madras', code: 'IITM', type: 'IIT', location: { city: 'Chennai', state: 'Tamil Nadu' } },
  { name: 'Indian Institute of Technology Kanpur', code: 'IITK', type: 'IIT', location: { city: 'Kanpur', state: 'Uttar Pradesh' } },
  { name: 'Indian Institute of Technology Kharagpur', code: 'IITKGP', type: 'IIT', location: { city: 'Kharagpur', state: 'West Bengal' } },

  // NITs
  { name: 'National Institute of Technology Trichy', code: 'NITT', type: 'NIT', location: { city: 'Tiruchirappalli', state: 'Tamil Nadu' } },
  { name: 'National Institute of Technology Surathkal', code: 'NITK', type: 'NIT', location: { city: 'Surathkal', state: 'Karnataka' } },
  { name: 'National Institute of Technology Warangal', code: 'NITW', type: 'NIT', location: { city: 'Warangal', state: 'Telangana' } },

  // IIITs
  { name: 'Indian Institute of Information Technology Allahabad', code: 'IIITA', type: 'IIIT', location: { city: 'Allahabad', state: 'Uttar Pradesh' } },
  { name: 'Indian Institute of Information Technology Hyderabad', code: 'IITH', type: 'IIIT', location: { city: 'Hyderabad', state: 'Telangana' } },

  // State Universities
  { name: 'Delhi Technological University', code: 'DTU', type: 'State', location: { city: 'Delhi', state: 'Delhi' } },
  { name: 'College of Engineering, Pune', code: 'COEP', type: 'State', location: { city: 'Pune', state: 'Maharashtra' } },

  // Private Universities
  { name: 'Birla Institute of Technology and Science, Pilani', code: 'BITS', type: 'Private', location: { city: 'Pilani', state: 'Rajasthan' } },
  { name: 'Vellore Institute of Technology', code: 'VIT', type: 'Private', location: { city: 'Vellore', state: 'Tamil Nadu' } },
  { name: 'Lakshmi Narain College of Technology', code: 'LNCT', type: 'Private', location: { city: 'Bhopal', state: 'Madhya Pradesh' } }
];

const skillsData = {
  technical: {
    title: "Technical Skills",
    skills: [
      // Programming Languages
      "JavaScript", "Python", "Java", "C++", "C#", "Ruby", "PHP", "Swift", "Kotlin", "Go",
      "TypeScript", "Rust", "Scala", "R", "MATLAB",

      // Web Development
      "HTML5", "CSS3", "React", "Angular", "Vue.js", "Node.js", "Express.js", "Django",
      "Flask", "Ruby on Rails", "Spring Boot", "ASP.NET", "Laravel",

      // Database
      "MySQL", "PostgreSQL", "MongoDB", "Redis", "Cassandra", "Oracle", "SQL Server",
      "ElasticSearch", "Firebase",

      // Cloud & DevOps
      "AWS", "Azure", "Google Cloud", "Docker", "Kubernetes", "Jenkins", "Git", "GitHub Actions",
      "CircleCI", "Terraform", "Ansible"
    ]
  },
  business: {
    title: "Business Skills",
    skills: [
      // Management
      "Project Management", "Team Leadership", "Agile", "Scrum", "Strategic Planning",
      "Risk Management", "Budgeting", "Resource Management",

      // Analysis
      "Business Analysis", "Data Analysis", "Market Research", "Financial Analysis",
      "Requirements Gathering", "Process Improvement"
    ]
  },
  softSkills: {
    title: "Soft Skills",
    skills: [
      // Communication
      "Communication", "Public Speaking", "Presentation", "Technical Writing",
      "Documentation", "Interpersonal Skills",

      // Leadership
      "Leadership", "Team Management", "Mentoring", "Coaching", "Decision Making",
      "Problem Solving", "Conflict Resolution"
    ]
  }
};

// Start the population script
require('./scripts/populateDB')(MONGODB_URI, colleges, skillsData);