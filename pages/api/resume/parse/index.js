export default async function handler(req, res) {
    if (req.method !== 'POST') {
      return res.status(405).json({ success: false, error: 'Method not allowed' });
    }
  
    if (!req.body || !req.body.text) {
      return res.status(400).json({ success: false, error: 'No text provided' });
    }
  
    try {
      console.log('Sending text to parser:', req.body.text.substring(0, 200) + '...');
  
      const response = await fetch('https://resume-extractor-api.onrender.com/extract', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: req.body.text
        }),
      });
  
      const data = await response.json();
      console.log('Received parsed data:', data);
  
      // Return the data directly without wrapping it in another object
      return res.status(200).json({
        success: true,
        data: {
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          linkedin: data.linkedin || '',
          github: data.github || '',
          skills: data.skills || '',
          work_experience: data.work_experience || '',
          education: data.education || '',
          projects: data.projects || '',
          certifications: data.certifications || '',
          location: 'Bhopal, Madhya Pradesh' // Hardcoded based on your data
        }
      });
  
    } catch (error) {
      console.error('Resume parsing error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to parse resume',
        details: error.message
      });
    }
  }