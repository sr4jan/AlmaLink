export const chatbotData = {
    greetings: {
      patterns: ['hi', 'hello', 'hey', 'good morning', 'good afternoon', 'good evening'],
      responses: [
        'Hello! How can I help you today?',
        'Hi there! What can I do for you?',
        'Hey! How may I assist you?',
        'Welcome to AlmaLink! How can I help?'
      ]
    },
  
    // Core features and navigation
    features: [
      {
        category: 'Platform',
        patterns: ['what is almalink', 'about almalink', 'platform info', 'how does it work'],
        responses: [
          'AlmaLink is a platform connecting students with alumni for mentorship and collaboration. You can find mentors, join sessions, and get career guidance.',
          'AlmaLink helps bridge the gap between students and alumni through mentorship, knowledge sharing, and networking opportunities.'
        ]
      },
      {
        category: 'Navigation',
        patterns: ['how to use', 'where to find', 'navigate', 'menu', 'dashboard'],
        responses: [
          'Our main sections are:\n1. Dashboard - Overview and activities\n2. Mentors - Find and connect with mentors\n3. Events - Join or host sessions\n4. Community - Ask questions and discussions\n5. Resources - Learning materials',
          'You can navigate using the main menu on the left. Your dashboard shows personalized recommendations and recent activities.'
        ]
      }
    ],
  
    // Student-specific queries
    student: [
      {
        category: 'Mentorship',
        patterns: ['find mentor', 'get mentor', 'search mentor', 'connect with alumni'],
        responses: [
          'To find a mentor:\n1. Go to "Mentors" section\n2. Use filters (industry, expertise, location)\n3. View profiles and check availability\n4. Send connection request with your goals',
          'Finding a mentor is easy:\n• Browse mentor profiles\n• Filter by your interests\n• Read their experience\n• Send personalized requests'
        ]
      },
      {
        category: 'Questions',
        patterns: ['ask question', 'post question', 'need help', 'community help'],
        responses: [
          'To ask questions:\n1. Visit the "Community" section\n2. Click "New Question"\n3. Select relevant topic\n4. Write your question\n5. Add tags if needed',
          'Getting help is simple:\n• Go to Community tab\n• Post your question\n• Wait for responses\n• Engage in discussion'
        ]
      },
      {
        category: 'Events',
        patterns: ['join event', 'attend session', 'workshop registration', 'upcoming events'],
        responses: [
          'To join events:\n1. Check "Events" calendar\n2. Browse upcoming sessions\n3. Click on interesting events\n4. Register to attend\n5. Add to your calendar',
          'Finding events:\n• View Events section\n• Filter by topic/date\n• Click to register\n• Get reminder notifications'
        ]
      }
    ],
  
    // Alumni-specific queries
    alumni: [
      {
        category: 'Mentoring',
        patterns: ['become mentor', 'start mentoring', 'how to mentor', 'mentor profile'],
        responses: [
          'To become a mentor:\n1. Complete your profile\n2. Set mentoring preferences\n3. Define availability\n4. Add expertise areas\n5. Start accepting requests',
          'Setting up mentorship:\n• Update your profile\n• Choose mentoring topics\n• Set time availability\n• Accept mentee requests'
        ]
      },
      {
        category: 'Hosting',
        patterns: ['host session', 'create event', 'organize workshop', 'schedule session'],
        responses: [
          'To host a session:\n1. Go to "Events"\n2. Click "Host New Session"\n3. Set topic and description\n4. Choose date/time\n5. Publish event',
          'Creating an event:\n• Access Events section\n• Click "Host Session"\n• Fill event details\n• Set schedule\n• Publish and share'
        ]
      }
    ],
  
    // Admin-specific queries
    admin: [
      {
        category: 'Moderation',
        patterns: ['moderate content', 'manage posts', 'review content', 'content rules'],
        responses: [
          'Content moderation:\n1. Access Admin panel\n2. Review reported content\n3. Check against guidelines\n4. Take appropriate action\n5. Send notifications',
          'Moderation tools:\n• View reported items\n• Check user reports\n• Moderate content\n• Update status'
        ]
      },
      {
        category: 'Management',
        patterns: ['manage users', 'user roles', 'permissions', 'access control'],
        responses: [
          'User management:\n1. Go to Admin dashboard\n2. Access user management\n3. Review user list\n4. Modify roles/permissions\n5. Save changes',
          'Managing access:\n• View user list\n• Check roles\n• Update permissions\n• Monitor activity'
        ]
      }
    ],
  
    // Help and support
    help: [
      {
        category: 'Support',
        patterns: ['help', 'support', 'contact', 'assistance'],
        responses: [
          'Need help? Here are your options:\n1. Check FAQ section\n2. Post in Community\n3. Contact support team\n4. Submit feedback',
          'Getting support:\n• Browse help articles\n• Ask community\n• Contact support\n• Report issues'
        ]
      },
      {
        category: 'Technical',
        patterns: ['error', 'bug', 'problem', 'not working'],
        responses: [
          'For technical issues:\n1. Clear browser cache\n2. Try refreshing\n3. Check internet connection\n4. Contact technical support',
          'Fixing issues:\n• Refresh page\n• Clear cache\n• Check connection\n• Report problem'
        ]
      }
    ],
  
    // Default responses
    default: [
      "I'm not sure I understand. Could you rephrase that?",
      "I didn't quite catch that. Can you explain differently?",
      "Could you provide more details about your question?",
      "I'm here to help, but I need more specific information."
    ]
  };
  
  // Additional helper functions
  export const findBestMatch = (userInput) => {
    const input = userInput.toLowerCase();
    
    // Check greetings first
    if (chatbotData.greetings.patterns.some(pattern => input.includes(pattern))) {
      return {
        category: 'greeting',
        response: chatbotData.greetings.responses[Math.floor(Math.random() * chatbotData.greetings.responses.length)]
      };
    }
  
    // Search through all categories
    const categories = ['features', 'student', 'alumni', 'admin', 'help'];
    let bestMatch = {
      score: 0,
      response: null,
      category: null
    };
  
    categories.forEach(category => {
      chatbotData[category].forEach(item => {
        item.patterns.forEach(pattern => {
          const words = pattern.split(' ');
          const matchedWords = words.filter(word => input.includes(word));
          const score = matchedWords.length / words.length;
  
          if (score > bestMatch.score) {
            bestMatch = {
              score: score,
              response: item.responses[Math.floor(Math.random() * item.responses.length)],
              category: item.category
            };
          }
        });
      });
    });
  
    // Return default response if no good match found
    return bestMatch.score > 0.3 ? bestMatch : {
      category: 'default',
      response: chatbotData.default[Math.floor(Math.random() * chatbotData.default.length)]
    };
  };