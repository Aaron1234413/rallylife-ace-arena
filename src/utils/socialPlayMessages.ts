
export const socialPlayMessages = [
  "Ready to rally with friends? 🎾",
  "Time to serve up some fun! 🏆",
  "Let's make every point count! ⚡",
  "Social tennis is the best tennis! 🤝",
  "Challenge your friends today! 🔥",
  "Game, set, friendship! 💪",
  "doubles the fun, doubles the excitement! 🎯",
  "Your next great match awaits! ⭐",
  "Connect, compete, conquer! 🎾",
  "Social play makes champions! 🏅"
];

export function getRandomSocialPlayMessage(): string {
  return socialPlayMessages[Math.floor(Math.random() * socialPlayMessages.length)];
}
