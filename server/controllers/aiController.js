// @route   POST /api/ai/prompts
// @desc    Get AI writing prompts
exports.getPrompts = async (req, res, next) => {
  try {
    const { context, mood } = req.body;

    // Groq API integration
    const apiKey = process.env.GROQ_API_KEY;
    
    if (!apiKey || apiKey === 'your_groq_api_key_here') {
      // Return default prompts if no API key
      return res.json({
        success: true,
        data: {
          prompts: getDefaultPrompts(mood),
          source: 'default',
        },
      });
    }

    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.1-70b-versatile',
          messages: [
            {
              role: 'system',
              content: `You are a thoughtful writing assistant helping someone write a heartfelt letter to a loved one. 
                        Generate 3 unique writing prompts that are emotionally resonant and personal.
                        Return ONLY a JSON array of 3 strings, no other text.
                        Example: ["Prompt 1", "Prompt 2", "Prompt 3"]`,
            },
            {
              role: 'user',
              content: `Generate writing prompts for a ${mood || 'heartfelt'} letter. 
                        ${context ? `Context: ${context}` : ''}`,
            },
          ],
          temperature: 0.8,
          max_tokens: 500,
        }),
      });

      if (!response.ok) {
        throw new Error('Groq API error');
      }

      const data = await response.json();
      const content = data.choices[0].message.content;
      
      // Parse JSON from response
      const prompts = JSON.parse(content);

      res.json({
        success: true,
        data: {
          prompts,
          source: 'ai',
        },
      });
    } catch (aiError) {
      // Fallback to defaults on AI error
      res.json({
        success: true,
        data: {
          prompts: getDefaultPrompts(mood),
          source: 'default',
        },
      });
    }
  } catch (error) {
    next(error);
  }
};

// Default prompts by mood
function getDefaultPrompts(mood) {
  const prompts = {
    romantic: [
      'What moment made you realize you were in love?',
      'Describe a small detail about them that always makes you smile.',
      'What dreams do you hold for your future together?',
    ],
    grateful: [
      'What sacrifice have they made that you never properly thanked them for?',
      'How has knowing them changed who you are?',
      'What would your life look like without them?',
    ],
    apologetic: [
      'What do you wish you could take back?',
      'How did your actions affect them, truly?',
      'What will you do differently going forward?',
    ],
    hopeful: [
      'What future moment are you most excited to share with them?',
      'What do you believe in about your relationship?',
      'What obstacle have you overcome together that gives you hope?',
    ],
    nostalgic: [
      'Describe your favorite memory together in vivid detail.',
      'What inside joke still makes you laugh?',
      'What would you tell your past self about this relationship?',
    ],
    default: [
      'What have you always wanted to tell them but never found the words?',
      'What moment with them would you relive forever?',
      'What do you want them to know when they read this?',
    ],
  };

  return prompts[mood] || prompts.default;
}
