export const transformResumeData = (data) => {
    // Create username from full name (firstname+lastname)
    const username = data.name
      ?.split(' ')
      .join('')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '');
  
    // Extract education details
    const educationMatch = data.education?.match(/([^in]+)\s+in\s+(.+)/);
    const degree = educationMatch ? educationMatch[1].trim() : '';
    const major = educationMatch ? educationMatch[2].trim() : '';
  
    // Extract company details
    const workMatch = data.work_experience?.match(/(.+?)\s+at\s+(.+)/);
    const position = workMatch ? workMatch[1].trim() : '';
    const companyName = workMatch ? workMatch[2].trim() : '';
  
    // Process skills
    const skillsArray = data.skills?.split(', ') || [];
  
    return {
      username,
      email: data.email || '',
      password: '', // Leave empty for security
      role: '', // User needs to select this
      profile: {
        college: {
          id: '', // User needs to select this
          name: 'Lakshmi Narain College of Technology', // Hardcoded based on your data
          graduationYear: 2026, // Extracted from your data
          degree,
          major
        },
        company: {
          name: companyName,
          position,
          startDate: new Date().toISOString().split('T')[0],
          current: true
        },
        location: 'Bhopal, Madhya Pradesh', // Extracted from your data
        bio: `${data.projects ? `Projects: ${data.projects}. ` : ''}${data.certifications ? `Certifications: ${data.certifications}` : ''}`.trim(),
        skills: skillsArray,
        phone: data.phone || '',
        github: data.github || '',
        linkedin: data.linkedin || ''
      }
    };
  };