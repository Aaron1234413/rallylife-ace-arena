
// Motivational message pools for different contexts
export const motivationalMessages = {
  startMatch: [
    "🎾 May the best player win!",
    "Let the match begin!",
    "Time to bring your A-game!",
    "🔥 Ready to dominate the court?",
    "Show them what you're made of!",
    "🏆 Champions are made in moments like this!",
    "Game time! Let's see what you've got!",
    "🎯 Focus, determination, victory!",
    "Every match is a chance to improve!",
    "🚀 Unleash your tennis potential!"
  ],
  
  endMatch: [
    "🏁 Match complete! Log the win, lessons, and grind.",
    "🎾 Great match! Time to capture the highlights.",
    "🔥 Another one in the books! How did it go?",
    "🏆 Match finished! Let's get those details logged.",
    "⚡ Game, set, match! Time to reflect and record.",
    "🎯 Every match teaches us something new!",
    "💪 Win or learn - both are victories!",
    "🌟 Another step in your tennis journey!",
    "📈 Progress through every point played!",
    "🎪 The show must go on - log your performance!"
  ],
  
  successSubmission: [
    "🎉 Match logged successfully! Your journey continues!",
    "✨ Another chapter in your tennis story!",
    "🚀 Progress saved! Keep climbing those ranks!",
    "🏅 Well done! Your dedication is showing!",
    "⭐ Match recorded! Every game makes you stronger!",
    "🎯 Success! Your improvement is undeniable!",
    "💫 Great job! Another step toward mastery!",
    "🔥 Locked in! Your progress is impressive!"
  ],
  
  midMatchCheckIn: [
    "💭 How's it going out there?",
    "🎾 Quick check-in - how are you feeling?",
    "⚡ Halfway through - what's your vibe?",
    "🎯 Time for a mental reset - how's the match?",
    "🔥 Checking in - stay focused!",
    "💪 Quick pulse check - you've got this!"
  ]
};

export const getRandomMessage = (context: keyof typeof motivationalMessages): string => {
  const messages = motivationalMessages[context];
  return messages[Math.floor(Math.random() * messages.length)];
};
