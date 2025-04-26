export const moderationConfig = {
    // Severity levels for different types of content
    severityLevels: {
      HIGH: 'high',
      MEDIUM: 'medium',
      LOW: 'low'
    },
  
    // Keywords to filter with their severity levels
    keywords: {
      // Profanity and offensive language
      offensive: {
        severity: 'high',
        words: [
          'fuck',
          'motherfucker',
          'bitch',
          'ass',
          'dick',
          'penis',
          // Add more offensive words
        ]
      },
  
      // Spam patterns
      spam: {
        severity: 'medium',
        patterns: [
          /\b(buy|sell|discount|offer)\b.*\b(now|click|here|www|http)\b/i,
          /\b(free|earn|money|cash|prize|winner)\b.*\b(now|click|here|www|http)\b/i,
          // Add more spam patterns
        ]
      },
  
      // Potentially unsafe content
      unsafe: {
        severity: 'low',
        words: [
          'password',
          'credit card',
          'ssn',
          'social security',
          // Add more sensitive terms
        ]
      }
    },
  
    // Action rules based on severity
    actions: {
      high: {
        action: 'block',
        message: 'This message was blocked due to inappropriate content.'
      },
      medium: {
        action: 'warn',
        message: 'Please be mindful of our community guidelines.'
      },
      low: {
        action: 'flag',
        message: 'This message has been flagged for review.'
      }
    }
  };
  
  // Moderation helper functions
  export const contentModerator = {
    // Check content against moderation rules
    checkContent(content) {
      const results = {
        isClean: true,
        violations: [],
        severityLevel: null,
        action: null
      };
  
      // Convert content to lowercase for case-insensitive matching
      const lowerContent = content.toLowerCase();
  
      // Check offensive words
      moderationConfig.keywords.offensive.words.forEach(word => {
        if (lowerContent.includes(word.toLowerCase())) {
          results.violations.push({
            type: 'offensive',
            word: word,
            severity: moderationConfig.keywords.offensive.severity
          });
        }
      });
  
      // Check spam patterns
      moderationConfig.keywords.spam.patterns.forEach(pattern => {
        if (pattern.test(content)) {
          results.violations.push({
            type: 'spam',
            pattern: pattern.toString(),
            severity: moderationConfig.keywords.spam.severity
          });
        }
      });
  
      // Check unsafe content
      moderationConfig.keywords.unsafe.words.forEach(term => {
        if (lowerContent.includes(term.toLowerCase())) {
          results.violations.push({
            type: 'unsafe',
            term: term,
            severity: moderationConfig.keywords.unsafe.severity
          });
        }
      });
  
      // Determine highest severity level
      if (results.violations.length > 0) {
        results.isClean = false;
        const severities = results.violations.map(v => v.severity);
        if (severities.includes('high')) results.severityLevel = 'high';
        else if (severities.includes('medium')) results.severityLevel = 'medium';
        else results.severityLevel = 'low';
  
        // Get corresponding action
        results.action = moderationConfig.actions[results.severityLevel];
      }
  
      return results;
    },
  
    // Clean content by replacing offensive words
    cleanContent(content) {
      let cleanedContent = content;
      
      // Replace offensive words with asterisks
      moderationConfig.keywords.offensive.words.forEach(word => {
        const regex = new RegExp(word, 'gi');
        cleanedContent = cleanedContent.replace(regex, '*'.repeat(word.length));
      });
  
      return cleanedContent;
    }
  };