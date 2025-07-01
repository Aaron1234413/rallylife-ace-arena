import { useState } from 'react';
import { usePlayerTokens } from '@/hooks/usePlayerTokens';
import { useAcademyProgress } from '@/hooks/useAcademyProgress';
import { QuizQuestion } from '@/components/academy/QuizInterface';

// Sample quiz questions for Phase 1
const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: '1',
    question: 'What is the standard width of a tennis court for singles play?',
    options: ['27 feet (8.23m)', '36 feet (10.97m)', '78 feet (23.77m)', '21 feet (6.40m)'],
    correctAnswer: 0,
    explanation: 'A singles tennis court is 27 feet (8.23 meters) wide, while doubles courts are 36 feet wide.',
    category: 'Court Basics',
    difficulty: 'easy'
  },
  {
    id: '2',
    question: 'In tennis, what does "deuce" mean?',
    options: ['The score is 0-0', 'The score is 30-30', 'The score is tied at 40-40', 'One player needs 2 points to win'],
    correctAnswer: 2,
    explanation: 'Deuce occurs when both players have 40 points (tied at 40-40). A player must win by 2 points from deuce.',
    category: 'Scoring',
    difficulty: 'easy'
  },
  {
    id: '3',
    question: 'What is the maximum number of sets in a Grand Slam men\'s singles match?',
    options: ['3 sets', '4 sets', '5 sets', '6 sets'],
    correctAnswer: 2,
    explanation: 'Grand Slam men\'s singles matches are best of 5 sets, meaning the first to win 3 sets wins the match.',
    category: 'Rules',
    difficulty: 'medium'
  },
  {
    id: '4',
    question: 'Which surface is known for producing the highest ball bounce?',
    options: ['Grass', 'Hard court', 'Clay', 'Carpet'],
    correctAnswer: 2,
    explanation: 'Clay courts produce the highest and slowest bounce due to the loose surface material that grips the ball.',
    category: 'Court Surfaces',
    difficulty: 'medium'
  },
  {
    id: '5',
    question: 'What is a "let" in tennis?',
    options: ['A winning shot', 'A service that touches the net but lands in', 'An unforced error', 'A double fault'],
    correctAnswer: 1,
    explanation: 'A "let" occurs when a serve touches the net but still lands in the correct service box. The serve is replayed.',
    category: 'Rules',
    difficulty: 'easy'
  },
  {
    id: '6',
    question: 'How many points are needed to win a tiebreak?',
    options: ['6 points', '7 points', '10 points', 'First to lead by 2 after 6'],
    correctAnswer: 3,
    explanation: 'A tiebreak is won by the first player to reach 7 points with at least a 2-point lead.',
    category: 'Scoring',
    difficulty: 'medium'
  },
  {
    id: '7',
    question: 'What is the height of a tennis net at the posts?',
    options: ['3 feet (0.91m)', '3.5 feet (1.07m)', '4 feet (1.22m)', '4.5 feet (1.37m)'],
    correctAnswer: 1,
    explanation: 'Tennis nets are 3.5 feet (1.07m) high at the posts and 3 feet (0.91m) high at the center.',
    category: 'Court Basics',
    difficulty: 'easy'
  },
  {
    id: '8',
    question: 'Which Grand Slam is played on grass courts?',
    options: ['US Open', 'French Open', 'Wimbledon', 'Australian Open'],
    correctAnswer: 2,
    explanation: 'Wimbledon is the only Grand Slam tournament played on grass courts, maintaining this tradition since 1877.',
    category: 'Tournaments',
    difficulty: 'easy'
  }
];

export function useQuizEngine() {
  const { addTokens } = usePlayerTokens();
  const { completeQuiz } = useAcademyProgress();
  
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [isQuizComplete, setIsQuizComplete] = useState(false);
  const [score, setScore] = useState(0);
  const [tokensEarned, setTokensEarned] = useState(0);

  const currentQuestion = quizQuestions[currentQuestionIndex] || null;

  const startQuiz = (type: 'daily' | 'practice') => {
    // Randomly select 5 questions for the quiz
    const shuffled = [...QUIZ_QUESTIONS].sort(() => 0.5 - Math.random());
    const selectedQuestions = shuffled.slice(0, 5);
    
    setQuizQuestions(selectedQuestions);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setAnswers([]);
    setIsQuizComplete(false);
    setScore(0);
    setTokensEarned(0);
  };

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
  };

  const handleNextQuestion = async () => {
    if (selectedAnswer === null) return;

    const newAnswers = [...answers, selectedAnswer];
    setAnswers(newAnswers);

    // Calculate current score
    const newScore = newAnswers.reduce((total, answer, index) => {
      const question = quizQuestions[index];
      return total + (answer === question.correctAnswer ? 1 : 0);
    }, 0);

    setScore(newScore);

    if (currentQuestionIndex + 1 < quizQuestions.length) {
      // Move to next question
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
    } else {
      // Quiz complete
      setIsQuizComplete(true);
      
      // Calculate rewards based on score and quiz type
      const baseTokens = quizQuestions.length === 5 ? 3 : 1; // Daily drill vs practice
      const bonusTokens = Math.floor(newScore / quizQuestions.length * 2); // Bonus for accuracy
      const totalTokens = baseTokens + bonusTokens;
      const xpEarned = newScore * 10; // 10 XP per correct answer

      setTokensEarned(totalTokens);

      // Award tokens through the game's token system
      try {
        await addTokens(totalTokens, 'regular', 'academy_quiz', `Quiz completed: ${newScore}/${quizQuestions.length} correct`);
        
        // Update academy progress
        completeQuiz(totalTokens, xpEarned);
      } catch (error) {
        console.error('Error awarding quiz rewards:', error);
      }
    }
  };

  const resetQuiz = () => {
    setQuizQuestions([]);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setAnswers([]);
    setIsQuizComplete(false);
    setScore(0);
    setTokensEarned(0);
  };

  return {
    currentQuestion,
    currentQuestionIndex,
    quizQuestions,
    selectedAnswer,
    isQuizComplete,
    score,
    tokensEarned,
    handleAnswerSelect,
    handleNextQuestion,
    startQuiz,
    resetQuiz
  };
}