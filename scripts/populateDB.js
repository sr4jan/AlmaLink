const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

module.exports = function(mongoUri, colleges, skillsData) {
  // Random Indian names data
  const firstNames = [
    'Aarav', 'Arjun', 'Advait', 'Vihaan', 'Reyansh',
    'Aanya', 'Diya', 'Saanvi', 'Ananya', 'Ishita',
    'Kabir', 'Vivaan', 'Aditya', 'Rishi', 'Dhruv',
    'Zara', 'Aarohi', 'Kiara', 'Myra', 'Ira'
  ];

  const lastNames = [
    'Patel', 'Sharma', 'Kumar', 'Singh', 'Verma',
    'Gupta', 'Shah', 'Mehta', 'Reddy', 'Joshi',
    'Malik', 'Kapoor', 'Malhotra', 'Rao', 'Chopra'
  ];

  // Degree programs
  const degrees = {
    engineering: [
      'B.Tech', 'B.E.', 'M.Tech', 'M.E.',
      'Integrated B.Tech + M.Tech'
    ],
    majors: [
      'Computer Science', 'Electronics', 'Mechanical',
      'Civil', 'Chemical', 'Electrical', 'Aerospace',
      'Information Technology', 'Data Science'
    ]
  };

  // Company data
  const companies = [
    { name: 'Google', positions: ['Software Engineer', 'Product Manager', 'Data Scientist'] },
    { name: 'Microsoft', positions: ['Software Developer', 'Program Manager', 'Cloud Architect'] },
    { name: 'Amazon', positions: ['SDE', 'Technical Program Manager', 'Solutions Architect'] },
    { name: 'Apple', positions: ['iOS Developer', 'Machine Learning Engineer', 'UX Engineer'] },
    { name: 'Meta', positions: ['Frontend Engineer', 'Research Scientist', 'DevOps Engineer'] },
    { name: 'Intel', positions: ['Hardware Engineer', 'Validation Engineer', 'Design Engineer'] },
    { name: 'IBM', positions: ['Systems Engineer', 'Consultant', 'Cloud Developer'] },
    { name: 'Infosys', positions: ['Technology Analyst', 'Senior Systems Engineer', 'Technical Lead'] },
    { name: 'TCS', positions: ['Software Engineer', 'Business Analyst', 'Project Lead'] },
    { name: 'Wipro', positions: ['Project Engineer', 'Technical Specialist', 'Team Lead'] }
  ];

  // Locations
  const indianLocations = [
    'Mumbai, Maharashtra',
    'Bangalore, Karnataka',
    'Delhi, NCR',
    'Hyderabad, Telangana',
    'Pune, Maharashtra',
    'Chennai, Tamil Nadu',
    'Kolkata, West Bengal',
    'Ahmedabad, Gujarat',
    'Noida, Uttar Pradesh',
    'Gurgaon, Haryana'
  ];

  // Helper functions
  function getRandomElement(array) {
    return array[Math.floor(Math.random() * array.length)];
  }

  function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function generateRandomSkills(count) {
    const allSkills = [
      ...skillsData.technical.skills,
      ...skillsData.business.skills,
      ...skillsData.softSkills.skills
    ];
    
    const skills = new Set();
    while(skills.size < count) {
      skills.add(getRandomElement(allSkills));
    }
    return Array.from(skills);
  }

  // Schema definitions
  const collegeSchema = new mongoose.Schema({
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    domain: { type: String, required: true, unique: true },
    type: String,
    location: {
      city: String,
      state: String,
      country: String
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'pending'],
      default: 'active'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  });

  const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { 
      type: String, 
      required: true,
      enum: ['student', 'alumni', 'admin', 'superadmin'] 
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    profile: {
      firstName: String,
      lastName: String,
      avatar: String,
      college: {
        id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'College'
        },
        name: String,
        graduationYear: Number,
        degree: String,
        major: String
      },
      company: {
        name: String,
        position: String,
        startDate: Date,
        endDate: Date,
        current: Boolean
      },
      location: String,
      bio: String,
      skills: [String],
      experience: [{
        title: String,
        company: String,
        startDate: Date,
        endDate: Date,
        description: String,
        current: Boolean
      }],
      socialLinks: {
        linkedin: String,
        github: String,
        portfolio: String
      }
    },
    collegeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'College',
      required: true
    },
    connections: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
  }, { timestamps: true });

  const College = mongoose.models.College || mongoose.model('College', collegeSchema);
  const User = mongoose.models.User || mongoose.model('User', userSchema);

  // Continue in next message...
    // Cleanup function
    async function cleanup() {
        console.log('Starting cleanup...');
        try {
          // Delete all users except superadmin
          await User.deleteMany({ role: { $ne: 'superadmin' } });
          // Delete all colleges
          await College.deleteMany({});
          console.log('Cleanup completed successfully');
        } catch (error) {
          console.error('Cleanup error:', error);
          process.exit(1);
        }
      }
    
      // Create colleges
      async function createColleges() {
        console.log('Creating colleges...');
        const createdColleges = [];
    
        for (const college of colleges) {
          try {
            const newCollege = await College.create({
              name: college.name,
              code: college.code,
              domain: `${college.code.toLowerCase()}.edu.in`,
              type: college.type,
              location: {
                city: college.location.city,
                state: college.location.state,
                country: 'India'
              },
              status: 'active'
            });
            createdColleges.push(newCollege);
            console.log(`Created college: ${college.name}`);
          } catch (error) {
            console.error(`Error creating college ${college.name}:`, error);
          }
        }
    
        return createdColleges;
      }
    
      // Generate social links
      function generateSocialLinks(firstName, lastName, graduationYear) {
        const normalizeName = `${firstName.toLowerCase()}${lastName.toLowerCase()}`;
        return {
          linkedin: `https://linkedin.com/in/${normalizeName}${graduationYear}`,
          github: `https://github.com/${firstName.toLowerCase()}${graduationYear}`,
          portfolio: `https://${firstName.toLowerCase()}.dev`
        };
      }
    
      // Generate profile data
      function generateProfileData(role, collegeData, firstName, lastName) {
        const currentYear = 2025;
        const graduationYear = role === 'student' 
          ? getRandomInt(currentYear, currentYear + 4)
          : getRandomInt(currentYear - 10, currentYear - 1);
    
        const profile = {
          firstName,
          lastName,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${firstName}${lastName}`,
          location: getRandomElement(indianLocations),
          bio: `${role === 'student' ? 'Student' : 'Graduate'} at ${collegeData.name}`,
          skills: generateRandomSkills(getRandomInt(5, 10)),
          college: {
            id: collegeData._id,
            name: collegeData.name,
            graduationYear,
            degree: getRandomElement(degrees.engineering),
            major: getRandomElement(degrees.majors)
          },
          socialLinks: generateSocialLinks(firstName, lastName, graduationYear)
        };
    
        if (role === 'alumni') {
          const company = getRandomElement(companies);
          const position = getRandomElement(company.positions);
          const startDate = new Date(graduationYear, 5); // June of graduation year
    
          profile.company = {
            name: company.name,
            position,
            startDate,
            current: true
          };
    
          profile.experience = [{
            title: position,
            company: company.name,
            startDate,
            description: `Working as ${position} at ${company.name}`,
            current: true
          }];
    
          // Add previous experience for some alumni
          if (Math.random() > 0.5) {
            const prevCompany = getRandomElement(companies.filter(c => c.name !== company.name));
            const prevPosition = getRandomElement(prevCompany.positions);
            const prevStartDate = new Date(graduationYear, 6);
            const prevEndDate = new Date(graduationYear + getRandomInt(1, 3), getRandomInt(0, 11));
    
            profile.experience.unshift({
              title: prevPosition,
              company: prevCompany.name,
              startDate: prevStartDate,
              endDate: prevEndDate,
              description: `Worked as ${prevPosition} at ${prevCompany.name}`,
              current: false
            });
          }
        }
    
        return profile;
      }
    
      // Create users
      async function createUsers(college) {
        console.log(`Creating users for ${college.name}...`);
        const users = [];
    
        try {
          // Create admin
          const adminFirstName = getRandomElement(firstNames);
          const adminLastName = getRandomElement(lastNames);
          const adminEmail = `admin@${college.code.toLowerCase()}.edu.in`;
          const adminPassword = await bcrypt.hash('Admin@123', 12);
    
          const admin = await User.create({
            username: `admin_${college.code.toLowerCase()}`,
            email: adminEmail,
            password: adminPassword,
            role: 'admin',
            isVerified: true,
            collegeId: college._id,
            profile: {
              firstName: adminFirstName,
              lastName: adminLastName,
              avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${adminFirstName}${adminLastName}`,
              location: college.location.city + ', ' + college.location.state,
              bio: `College Administrator at ${college.name}`
            }
          });
          users.push(admin);
          console.log(`Created admin: ${adminEmail}`);
    
          // Create 5 students and 5 alumni
          for (let i = 0; i < 5; i++) {
            // Create student
            const studentFirstName = getRandomElement(firstNames);
            const studentLastName = getRandomElement(lastNames);
            const studentGradYear = getRandomInt(2026, 2028);
            const studentEmail = `${studentFirstName.toLowerCase()}${studentGradYear}@${college.code.toLowerCase()}.edu.in`;
            const studentPassword = await bcrypt.hash(`${studentFirstName}${studentGradYear}`, 12);
    
            const studentProfile = generateProfileData('student', college, studentFirstName, studentLastName);
            
            const student = await User.create({
              username: `${studentFirstName.toLowerCase()}${studentGradYear}`,
              email: studentEmail,
              password: studentPassword,
              role: 'student',
              isVerified: true,
              collegeId: college._id,
              profile: studentProfile
            });
            users.push(student);
            console.log(`Created student: ${studentEmail}`);
    
            // Create alumni
            const alumniFirstName = getRandomElement(firstNames);
            const alumniLastName = getRandomElement(lastNames);
            const alumniGradYear = getRandomInt(2020, 2024);
            const alumniEmail = `${alumniFirstName.toLowerCase()}${alumniGradYear}@${college.code.toLowerCase()}.edu.in`;
            const alumniPassword = await bcrypt.hash(`${alumniFirstName}${alumniGradYear}`, 12);
    
            const alumniProfile = generateProfileData('alumni', college, alumniFirstName, alumniLastName);
    
            const alumni = await User.create({
              username: `${alumniFirstName.toLowerCase()}${alumniGradYear}`,
              email: alumniEmail,
              password: alumniPassword,
              role: 'alumni',
              isVerified: true,
              collegeId: college._id,
              profile: alumniProfile
            });
            users.push(alumni);
            console.log(`Created alumni: ${alumniEmail}`);
          }
    
        } catch (error) {
          console.error(`Error creating users for ${college.name}:`, error);
        }
    
        return users;
      }
    
      // Main execution function
      async function populateDatabase() {
        try {
          // Connect to MongoDB
          await mongoose.connect(mongoUri);
          console.log('Connected to MongoDB');
    
          // Cleanup existing data
          await cleanup();
    
          // Create colleges
          const createdColleges = await createColleges();
          console.log(`Created ${createdColleges.length} colleges`);
    
          // Create users for each college
          for (const college of createdColleges) {
            const users = await createUsers(college);
            console.log(`Created ${users.length} users for ${college.name}`);
          }
    
          console.log('Database population completed successfully');
        } catch (error) {
          console.error('Error populating database:', error);
        } finally {
          await mongoose.connection.close();
          console.log('MongoDB connection closed');
        }
      }
    
      // Run the script
      populateDatabase().then(() => {
        console.log('Script finished');
        process.exit(0);
      }).catch(error => {
        console.error('Script failed:', error);
        process.exit(1);
      });
    };