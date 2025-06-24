
import { TennisAnalysis } from './tennisScoreAnalyzer';
import { MomentumState } from './momentumTracker';
import { RewardCalculation } from '../utils/rewardCalculator';

export interface MotivationalPrompt {
  title: string;
  message: string;
  tone: 'encouraging' | 'motivating' | 'celebratory' | 'supportive';
  urgency: 'low' | 'medium' | 'high';
  emoji: string;
}

export const generateMatchPrompt = (
  tennisAnalysis: TennisAnalysis,
  momentum: MomentumState,
  rewards: RewardCalculation,
  context: 'start' | 'between-sets' | 'clutch' | 'comeback'
): MotivationalPrompt => {
  
  switch (context) {
    case 'start':
      return generateStartPrompt(rewards, tennisAnalysis);
    case 'between-sets':
      return generateBetweenSetsPrompt(momentum, rewards, tennisAnalysis);
    case 'clutch':
      return generateClutchPrompt(rewards, tennisAnalysis);
    case 'comeback':
      return generateComebackPrompt(rewards, momentum);
    default:
      return generateDefaultPrompt(rewards);
  }
};

const generateStartPrompt = (rewards: RewardCalculation, analysis: TennisAnalysis): MotivationalPrompt => {
  const baseXP = rewards.winXP;
  
  if (rewards.difficultyMultiplier > 1.5) {
    return {
      title: 'High Stakes Challenge!',
      message: `This is a tough opponent! Win for ${baseXP} XP and prove your skills. You've got this! 💪`,
      tone: 'motivating',
      urgency: 'high',
      emoji: '🔥'
    };
  }
  
  if (rewards.difficultyMultiplier < 0.8) {
    return {
      title: 'Stay Focused',
      message: `Good warm-up match! Win for ${baseXP} XP and build your confidence. Every match counts! 🎯`,
      tone: 'encouraging',
      urgency: 'low',
      emoji: '🎾'
    };
  }
  
  return {
    title: 'Game Time!',
    message: `Perfect matchup! Win for ${baseXP} XP. Time to show what you're made of! 🚀`,
    tone: 'motivating',
    urgency: 'medium',
    emoji: '⚡'
  };
};

const generateBetweenSetsPrompt = (
  momentum: MomentumState, 
  rewards: RewardCalculation, 
  analysis: TennisAnalysis
): MotivationalPrompt => {
  
  if (analysis.comebackBonus) {
    return {
      title: 'Comeback Mode!',
      message: `This is your comeback moment! Next set win: ${rewards.winXP} XP with 30% comeback bonus! 🌟`,
      tone: 'motivating',
      urgency: 'high',
      emoji: '🔄'
    };
  }
  
  if (analysis.doubleBreakBonus) {
    return {
      title: 'Break Master!',
      message: `You're breaking serve like a pro! Keep it up for ${rewards.winXP} XP with double break bonus! 🎯`,
      tone: 'celebratory',
      urgency: 'medium',
      emoji: '🏆'
    };
  }
  
  if (momentum.score > 50) {
    return {
      title: 'Momentum Building!',
      message: `You're ${momentum.description.toLowerCase()}! Close it out for ${rewards.winXP} XP! 💪`,
      tone: 'encouraging',
      urgency: 'medium',
      emoji: '📈'
    };
  }
  
  if (momentum.score < -30) {
    return {
      title: 'Fight Back!',
      message: `Time to turn this around! Win the next set for ${rewards.winXP} XP and shift momentum! 💥`,
      tone: 'motivating',
      urgency: 'high',
      emoji: '⚔️'
    };
  }
  
  return {
    title: 'Keep Going!',
    message: `${momentum.description}. Next set: ${rewards.winXP} XP. Stay focused! 🎾`,
    tone: 'encouraging',
    urgency: 'medium',
    emoji: '🎯'
  };
};

const generateClutchPrompt = (rewards: RewardCalculation, analysis: TennisAnalysis): MotivationalPrompt => {
  const clutchXP = Math.round(rewards.winXP * 2); // 2x multiplier for clutch
  
  return {
    title: 'CLUTCH TIME!',
    message: `This is it! Final set for ${clutchXP} XP (2x CLUTCH BONUS)! Champions are made in moments like this! 🏆`,
    tone: 'motivating',
    urgency: 'high',
    emoji: '💎'
  };
};

const generateComebackPrompt = (rewards: RewardCalculation, momentum: MomentumState): MotivationalPrompt => {
  const comebackXP = Math.round(rewards.winXP * 1.3); // 30% comeback bonus
  
  return {
    title: 'COMEBACK STORY!',
    message: `Down but not out! Win for ${comebackXP} XP comeback bonus! This is where legends are born! 🌟`,
    tone: 'motivating',
    urgency: 'high',
    emoji: '🔥'
  };
};

const generateDefaultPrompt = (rewards: RewardCalculation): MotivationalPrompt => {
  return {
    title: 'You Got This!',
    message: `Win for ${rewards.winXP} XP! Every point matters, every game counts! 🎾`,
    tone: 'encouraging',
    urgency: 'medium',
    emoji: '💪'
  };
};

export const generateQuickMotivation = (
  momentum: MomentumState,
  bonusActive: boolean = false
): string => {
  const motivations = {
    high_positive: [
      "You're on fire! 🔥",
      "Unstoppable! 💪", 
      "Crushing it! 🚀",
      "In the zone! ⚡"
    ],
    medium_positive: [
      "Great momentum! 📈",
      "Keep it rolling! 🎯",
      "Looking good! 👍",
      "Nice rhythm! 🎾"
    ],
    neutral: [
      "Stay focused! 🎯",
      "Point by point! 💪",
      "You got this! ⚡",
      "Keep fighting! 🔥"
    ],
    medium_negative: [
      "Fight back! ⚔️",
      "Turn it around! 🔄",
      "Stay strong! 💪",
      "Never give up! 🔥"
    ],
    high_negative: [
      "Comeback time! 🌟",
      "Dig deep! 💎",
      "Champions respond! 🏆",
      "Your moment! ⚡"
    ]
  };
  
  let category: keyof typeof motivations;
  
  if (momentum.score > 50) category = 'high_positive';
  else if (momentum.score > 20) category = 'medium_positive';
  else if (momentum.score > -20) category = 'neutral';
  else if (momentum.score > -50) category = 'medium_negative';
  else category = 'high_negative';
  
  const options = motivations[category];
  const randomMsg = options[Math.floor(Math.random() * options.length)];
  
  return bonusActive ? `${randomMsg} BONUS ACTIVE!` : randomMsg;
};
