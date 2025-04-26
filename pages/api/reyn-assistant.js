import { chatbotData, findBestMatch } from '../../data/chatbotData';
import { contentModerator } from '../../data/moderationData';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { userMessage } = req.body;

  try {
    // Get current time for logging
    const timestamp = new Date().toISOString();
    const userLogin = 'sr4jan'; // Get this from your auth system

    // Log incoming request
    console.log(`[${timestamp}] User ${userLogin}: ${userMessage}`);

    // Check content moderation
    const moderationResult = contentModerator.checkContent(userMessage);

    // Handle moderated content
    if (!moderationResult.isClean) {
      // Log moderation event
      console.log(`[${timestamp}] Moderation triggered for user ${userLogin}:`, moderationResult);

      // Handle based on severity
      switch (moderationResult.action.action) {
        case 'block':
          return res.status(400).json({
            error: moderationResult.action.message,
            moderated: true,
            severity: moderationResult.severityLevel
          });

        case 'warn':
          // Clean the content but add a warning
          const cleanedMessage = contentModerator.cleanContent(userMessage);
          const match = findBestMatch(cleanedMessage);
          return res.status(200).json({
            response: match.response,
            warning: moderationResult.action.message,
            moderated: true,
            severity: moderationResult.severityLevel
          });

        case 'flag':
          // Allow but log for review
          const flaggedMatch = findBestMatch(userMessage);
          // Log for review
          console.log(`[${timestamp}] Flagged content from user ${userLogin} for review:`, {
            content: userMessage,
            violations: moderationResult.violations
          });
          return res.status(200).json({
            response: flaggedMatch.response,
            note: moderationResult.action.message,
            moderated: true,
            severity: moderationResult.severityLevel
          });
      }
    }

    // Process clean content normally
    const match = findBestMatch(userMessage);

    // Add contextual greeting if it's a greeting
    let response = match.response;
    if (match.category === 'greeting') {
      const hour = new Date().getHours();
      let timeGreeting = '';
      if (hour < 12) timeGreeting = 'Good morning';
      else if (hour < 18) timeGreeting = 'Good afternoon';
      else timeGreeting = 'Good evening';
      
      response = `${timeGreeting}! ${response}`;
    }

    // Log response for analytics
    console.log(`[${timestamp}] Response to user ${userLogin}:`, {
      category: match.category,
      response: response
    });

    return res.status(200).json({ 
      response,
      category: match.category,
      moderated: false
    });

  } catch (err) {
    console.error('Error processing request:', err);
    return res.status(500).json({ 
      error: 'Sorry, I encountered an error. Please try again.'
    });
  }
}