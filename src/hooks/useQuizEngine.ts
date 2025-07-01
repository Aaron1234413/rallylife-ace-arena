
import { useState, useEffect } from 'react';
import { useAcademyProgress } from './useAcademyProgress';
import { usePlayerTokens } from './usePlayerTokens';

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface QuizSession {
  score: number;
  totalQuestions: number;
  tokensEarned: number;
  accuracy: number;
  learningTip: string;
}

const sampleQuestions: QuizQuestion[] = [
  {
    id: '1',
    question: 'What is the maximum number of sets in a professional men\'s tennis match?',
    options: ['3 sets', '4 sets', '5 sets', '6 sets'],
    correctAnswer: '5 sets',
    explanation: 'Professional men\'s tennis matches are typically best of 5 sets, except in some tournaments where they play best of 3.',
    category: 'Rules',
    difficulty: 'easy'
  },
  {
    id: '2',
    question: 'Which surface is Wimbledon played on?',
    options: ['Clay', 'Hard court', 'Grass', 'Carpet'],
    correctAnswer: 'Grass',
    explanation: 'Wimbledon is the only Grand Slam tournament played on grass courts, making it unique among the four major tournaments.',
    category: 'History',
    difficulty: 'easy'
  },
  {
    id: '3',
    question: 'What does "deuce" mean in tennis scoring?',
    options: ['0-0', '15-15', '30-30', '40-40'],
    correctAnswer: '40-40',
    explanation: 'Deuce occurs when both players have 40 points. A player must win by 2 points from deuce to win the game.',
    category: 'Rules',
    difficulty: 'medium'
  },
  {
    id: '4',
    question: 'Who holds the record for most Grand Slam singles titles in men\'s tennis?',
    options: ['Roger Federer', 'Rafael Nadal', 'Novak Djokovic', 'Pete Sampras'],
    correctAnswer: 'Novak Djokovic',
    explanation: 'As of 2024, Novak Djokovic holds the record with 24 Grand Slam singles titles.',
    category: 'History',
    difficulty: 'medium'
  },
  {
    id: '5',
    question: 'What is the term for winning a set 6-0?',
    options: ['Bagel', 'Breadstick', 'Perfect set', 'Shutout'],
    correctAnswer: 'Bagel',
    explanation: 'A "bagel" refers to winning a set 6-0, named after the shape of the zero resembling a bagel.',
    category: 'Terminology',
    difficulty: 'hard'
  }
];

export function useQuizEngine(category = 'random') {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [sessionSummary, setSessionSummary] = useState<QuizSession | null>(null);
  
  const { addXP } = useAcademyProgress();
  const { addTokens } = usePlayerTokens();

  useEffect(() => {
    // Initialize quiz with 5 random questions
    const shuffled = [...sampleQuestions].sort(() => Math.random() - 0.5);
    setQuestions(shuffled.slice(0, 5));
    setCurrentQuestionIndex(0);
    setScore(0);
    setAnswers([]);
    setIsComplete(false);
    setSessionSummary(null);
  }, [category]);

  const currentQuestion = questions[currentQuestionIndex];
  
  const answerQuestion = (answer: string): boolean => {
    const isCorrect = answer === currentQuestion.correctAnswer;
    setAnswers([...answers, answer]);
    
    if (isCorrect) {
      setScore(score + 1);
    }
    
    return isCorrect;
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      completeQuiz();
    }
  };

  const completeQuiz = () => {
    const finalScore = score + (answers[answers.length - 1] === currentQuestion.correctAnswer ? 1 : 0);
    const accuracy = Math.round((finalScore / questions.length) * 100);
    
    // Calculate rewards
    let tokensEarned = finalScore; // 1 token per correct answer
    let xpEarned = finalScore * 10; // 10 XP per correct answer
    
    // Bonus for perfect score
    if (finalScore === questions.length) {
      tokensEarned += 2;
      xpEarned += 20;
    }
    
    // Award tokens and XP
    if (addTokens) {
      addTokens(tokensEarned, 'regular', 'academy_quiz', 'Academy quiz completion');
    }
    
    if (addXP) {
      addXP(xpEarned);
    }
    
    const summary: QuizSession = {
      score: finalScore,
      totalQuestions: questions.length,
      tokensEarned,
      accuracy,
      learningTip: getLearningTip(accuracy)
    };
    
    setSessionSummary(summary);
    setIsComplete(true);
  };

  const getLearningTip = (accuracy: number): string => {
    if (accuracy >= 80) {
      return "Excellent work! You have a strong grasp of tennis fundamentals. Keep challenging yourself with harder questions.";
    } else if (accuracy >= 60) {
      return "Good effort! Focus on reviewing the areas where you missed questions to improve your tennis knowledge.";
    } else {
      return "Keep practicing! Tennis has many rules and nuances. Regular study will help you master the fundamentals.";
    }
  };

  return {
    currentQuestion,
    questionIndex: currentQuestionIndex,
    totalQuestions: questions.length,
    score,
    isComplete,
    sessionSummary,
    answerQuestion,
    nextQuestion
  };
}
