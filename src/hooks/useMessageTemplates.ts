import React from 'react';
import { Calendar, MapPin, Trophy, Zap, Users, Clock } from 'lucide-react';

interface MessageTemplate {
  category: string;
  text: string;
  icon?: React.ReactNode;
}

export function useMessageTemplates() {
  const getMatchTemplates = (): MessageTemplate[] => [
    {
      category: 'Match Invites',
      text: "Hey! Want to play tennis today? I'm free this afternoon at the local courts.",
      icon: React.createElement(Calendar, { className: "h-4 w-4" })
    },
    {
      category: 'Match Invites', 
      text: "Looking for a match this weekend! Are you available Saturday morning?",
      icon: React.createElement(Calendar, { className: "h-4 w-4" })
    },
    {
      category: 'Match Invites',
      text: "Free for a quick set after work today? The courts are open until 8pm.",
      icon: React.createElement(Clock, { className: "h-4 w-4" })
    },
    {
      category: 'Location',
      text: "I'm at Central Park tennis courts, court 3. See you there!",
      icon: React.createElement(MapPin, { className: "h-4 w-4" })
    },
    {
      category: 'Location',
      text: "Meet at the tennis club entrance in 10 minutes?",
      icon: React.createElement(MapPin, { className: "h-4 w-4" })
    },
    {
      category: 'Status Updates',
      text: "Running 15 minutes late, sorry! Traffic is crazy. Start warming up without me.",
      icon: React.createElement(Clock, { className: "h-4 w-4" })
    },
    {
      category: 'Status Updates',
      text: "Just finished warming up, ready when you are!",
      icon: React.createElement(Trophy, { className: "h-4 w-4" })
    },
    {
      category: 'Post-Match',
      text: "Great match! Thanks for the game. Same time next week?",
      icon: React.createElement(Trophy, { className: "h-4 w-4" })
    },
    {
      category: 'Post-Match',
      text: "Good game! You really improved your backhand since last time.",
      icon: React.createElement(Trophy, { className: "h-4 w-4" })
    }
  ];

  const getChallengeTemplates = (): MessageTemplate[] => [
    {
      category: 'Challenges',
      text: "Challenge accepted! Let's make it interesting - loser buys coffee? ☕",
      icon: React.createElement(Zap, { className: "h-4 w-4" })
    },
    {
      category: 'Challenges',
      text: "I challenge you to a best of 3 sets match. Are you ready? 🎾",
      icon: React.createElement(Zap, { className: "h-4 w-4" })
    },
    {
      category: 'Challenges',
      text: "How about we play for some tokens? Winner takes 50 tokens!",
      icon: React.createElement(Zap, { className: "h-4 w-4" })
    }
  ];

  const getGroupTemplates = (): MessageTemplate[] => [
    {
      category: 'Group Play',
      text: "Who's up for doubles this Saturday? Need 2 more players!",
      icon: React.createElement(Users, { className: "h-4 w-4" })
    },
    {
      category: 'Group Play',
      text: "Tournament practice session tomorrow at 6pm. Who's in?",
      icon: React.createElement(Users, { className: "h-4 w-4" })
    }
  ];

  const getCoachingTemplates = (): MessageTemplate[] => [
    {
      category: 'Coaching',
      text: "Your serve looked much better today! Keep practicing that toss height.",
      icon: React.createElement(Trophy, { className: "h-4 w-4" })
    },
    {
      category: 'Coaching',
      text: "Focus on your footwork next session. Remember to split step!",
      icon: React.createElement(Trophy, { className: "h-4 w-4" })
    }
  ];

  return {
    getMatchTemplates,
    getChallengeTemplates,
    getGroupTemplates,
    getCoachingTemplates
  };
}