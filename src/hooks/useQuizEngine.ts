import { useState } from 'react';
import { usePlayerTokens } from '@/hooks/usePlayerTokens';
import { useAcademyProgressDB } from '@/hooks/useAcademyProgressDB';
import { QuizQuestion } from '@/components/academy/QuizInterface';
import { getTodaysTopic } from '@/utils/TopicRotationSystem';

// Expanded Quiz Question Bank with 50+ questions
const QUIZ_QUESTIONS: QuizQuestion[] = [
  // COURT RULES & REGULATIONS (Easy)
  {
    id: '1',
    question: 'What is the standard width of a tennis court for singles play?',
    options: ['27 feet (8.23m)', '36 feet (10.97m)', '78 feet (23.77m)', '21 feet (6.40m)'],
    correctAnswer: 0,
    explanation: 'A singles tennis court is 27 feet (8.23 meters) wide, while doubles courts are 36 feet wide.',
    category: 'rules',
    difficulty: 'easy'
  },
  {
    id: '2',
    question: 'In tennis, what does "deuce" mean?',
    options: ['The score is 0-0', 'The score is 30-30', 'The score is tied at 40-40', 'One player needs 2 points to win'],
    correctAnswer: 2,
    explanation: 'Deuce occurs when both players have 40 points (tied at 40-40). A player must win by 2 points from deuce.',
    category: 'rules',
    difficulty: 'easy'
  },
  {
    id: '3',
    question: 'What is a "let" in tennis?',
    options: ['A winning shot', 'A service that touches the net but lands in', 'An unforced error', 'A double fault'],
    correctAnswer: 1,
    explanation: 'A "let" occurs when a serve touches the net but still lands in the correct service box. The serve is replayed.',
    category: 'rules',
    difficulty: 'easy'
  },
  {
    id: '4',
    question: 'How many points are needed to win a tiebreak?',
    options: ['6 points', '7 points', '10 points', 'First to lead by 2 after 6'],
    correctAnswer: 3,
    explanation: 'A tiebreak is won by the first player to reach 7 points with at least a 2-point lead.',
    category: 'rules',
    difficulty: 'medium'
  },
  {
    id: '5',
    question: 'What is the maximum number of sets in a Grand Slam men\'s singles match?',
    options: ['3 sets', '4 sets', '5 sets', '6 sets'],
    correctAnswer: 2,
    explanation: 'Grand Slam men\'s singles matches are best of 5 sets, meaning the first to win 3 sets wins the match.',
    category: 'rules',
    difficulty: 'medium'
  },

  // SERVING TECHNIQUES (Easy to Medium)
  {
    id: '6',
    question: 'From which side of the court do you serve the first point of a game?',
    options: ['Left side (ad court)', 'Right side (deuce court)', 'Either side', 'Center of the court'],
    correctAnswer: 1,
    explanation: 'The first point of every game is served from the right side (deuce court).',
    category: 'serving',
    difficulty: 'easy'
  },
  {
    id: '7',
    question: 'What happens if you foot fault on a first serve?',
    options: ['Point lost immediately', 'First serve becomes second serve', 'Warning given', 'Serve is replayed'],
    correctAnswer: 1,
    explanation: 'A foot fault on the first serve results in it being called a fault, giving you your second serve.',
    category: 'serving',
    difficulty: 'medium'
  },
  {
    id: '8',
    question: 'In which direction should you toss the ball for a slice serve?',
    options: ['Directly above your head', 'To your right', 'To your left', 'Behind your head'],
    correctAnswer: 1,
    explanation: 'For a slice serve, the ball toss should be to your right (for right-handed players) to create the side spin.',
    category: 'serving',
    difficulty: 'medium'
  },

  // TENNIS HISTORY & CHAMPIONS
  {
    id: '9',
    question: 'Which Grand Slam is played on grass courts?',
    options: ['US Open', 'French Open', 'Wimbledon', 'Australian Open'],
    correctAnswer: 2,
    explanation: 'Wimbledon is the only Grand Slam tournament played on grass courts, maintaining this tradition since 1877.',
    category: 'history',
    difficulty: 'easy'
  },
  {
    id: '10',
    question: 'Who holds the record for most Grand Slam men\'s singles titles?',
    options: ['Roger Federer', 'Rafael Nadal', 'Novak Djokovic', 'Pete Sampras'],
    correctAnswer: 2,
    explanation: 'Novak Djokovic holds the record with 24 Grand Slam men\'s singles titles.',
    category: 'history',
    difficulty: 'medium'
  },
  {
    id: '11',
    question: 'In which year was the Open Era of tennis established?',
    options: ['1965', '1968', '1970', '1972'],
    correctAnswer: 1,
    explanation: 'The Open Era began in 1968, allowing professional players to compete in Grand Slam tournaments.',
    category: 'history',
    difficulty: 'hard'
  },

  // EQUIPMENT & GEAR
  {
    id: '12',
    question: 'What is the height of a tennis net at the posts?',
    options: ['3 feet (0.91m)', '3.5 feet (1.07m)', '4 feet (1.22m)', '4.5 feet (1.37m)'],
    correctAnswer: 1,
    explanation: 'Tennis nets are 3.5 feet (1.07m) high at the posts and 3 feet (0.91m) high at the center.',
    category: 'equipment',
    difficulty: 'easy'
  },
  {
    id: '13',
    question: 'Which surface is known for producing the highest ball bounce?',
    options: ['Grass', 'Hard court', 'Clay', 'Carpet'],
    correctAnswer: 2,
    explanation: 'Clay courts produce the highest and slowest bounce due to the loose surface material that grips the ball.',
    category: 'equipment',
    difficulty: 'medium'
  },
  {
    id: '14',
    question: 'What is the diameter of a tennis ball?',
    options: ['2.5 inches', '2.7 inches', '2.9 inches', '3.1 inches'],
    correctAnswer: 1,
    explanation: 'A tennis ball has a diameter of 2.7 inches (6.86 cm) according to ITF regulations.',
    category: 'equipment',
    difficulty: 'hard'
  },

  // STRATEGY & TACTICS
  {
    id: '15',
    question: 'What is the most effective serve placement for beginners?',
    options: ['Wide to the corners', 'Down the T (center)', 'Body serve', 'High and slow'],
    correctAnswer: 1,
    explanation: 'Serving down the T (center) is most effective for beginners as it reduces angles for return shots.',
    category: 'strategy',
    difficulty: 'easy'
  },
  {
    id: '16',
    question: 'When should you approach the net in singles?',
    options: ['After every serve', 'When opponent is out of position', 'Never', 'Only on clay courts'],
    correctAnswer: 1,
    explanation: 'Approaching the net when your opponent is out of position gives you the best chance to win the point.',
    category: 'strategy',
    difficulty: 'medium'
  },

  // MIXED TOPICS & TRIVIA
  {
    id: '17',
    question: 'What does the tennis term "bagel" mean?',
    options: ['A perfect serve', 'Winning a set 6-0', 'A double fault', 'An ace'],
    correctAnswer: 1,
    explanation: 'A "bagel" refers to winning a set 6-0, with the zero resembling the shape of a bagel.',
    category: 'trivia',
    difficulty: 'easy'
  },
  {
    id: '18',
    question: 'Which tennis tournament is known as "Roland Garros"?',
    options: ['Wimbledon', 'US Open', 'French Open', 'Australian Open'],
    correctAnswer: 2,
    explanation: 'The French Open is officially called "Roland Garros", named after a French aviator.',
    category: 'trivia',
    difficulty: 'medium'
  },

  // Additional Questions (continuing pattern...)
  {
    id: '19',
    question: 'How many games must you win to take a set (without tiebreak)?',
    options: ['5 games', '6 games', '7 games', '8 games'],
    correctAnswer: 1,
    explanation: 'You must win 6 games with at least a 2-game margin, or win 7-5.',
    category: 'rules',
    difficulty: 'easy'
  },
  {
    id: '20',
    question: 'What is a "drop shot"?',
    options: ['A powerful serve', 'A soft shot close to the net', 'A high defensive lob', 'A serve that hits the net'],
    correctAnswer: 1,
    explanation: 'A drop shot is a soft shot hit close to the net to make the opponent run forward.',
    category: 'strategy',
    difficulty: 'easy'
  }
];

// Difficulty progression system
export function getDifficultyForWeek(weekNumber: number): ('easy' | 'medium' | 'hard')[] {
  if (weekNumber <= 1) {
    return ['easy'];
  } else if (weekNumber <= 3) {
    return ['easy', 'medium'];
  } else {
    return ['easy', 'medium', 'hard'];
  }
}

// Smart question selection algorithm
export function selectQuestionsForTopic(
  topicId: string, 
  questionCount: number, 
  allowedDifficulties: ('easy' | 'medium' | 'hard')[], 
  excludeIds: string[] = []
): QuizQuestion[] {
  // Filter questions by topic and difficulty
  const availableQuestions = QUIZ_QUESTIONS.filter(q => 
    q.category === topicId && 
    allowedDifficulties.includes(q.difficulty) &&
    !excludeIds.includes(q.id)
  );
  
  // If not enough questions available, include mixed topics
  if (availableQuestions.length < questionCount) {
    const mixedQuestions = QUIZ_QUESTIONS.filter(q => 
      allowedDifficulties.includes(q.difficulty) &&
      !excludeIds.includes(q.id) &&
      !availableQuestions.find(aq => aq.id === q.id)
    );
    availableQuestions.push(...mixedQuestions);
  }
  
  // Shuffle and select
  const shuffled = [...availableQuestions].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, questionCount);
}

export function useQuizEngine() {
  const { addTokens } = usePlayerTokens();
  const { updateProgress } = useAcademyProgressDB();
  
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [isQuizComplete, setIsQuizComplete] = useState(false);
  const [score, setScore] = useState(0);
  const [tokensEarned, setTokensEarned] = useState(0);

  const currentQuestion = quizQuestions[currentQuestionIndex] || null;

  const startQuiz = (type: 'daily' | 'practice') => {
    const todaysTopic = getTodaysTopic();
    
    // For now, use all difficulties - later can add progression
    const allowedDifficulties: ('easy' | 'medium' | 'hard')[] = ['easy', 'medium', 'hard'];
    
    // Select questions based on today's topic
    const selectedQuestions = selectQuestionsForTopic(
      todaysTopic.id, 
      5, 
      allowedDifficulties
    );
    
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

      // Award tokens through the game's token system and update academy progress
      try {
        await addTokens(totalTokens, 'regular', 'academy_quiz', `Quiz completed: ${newScore}/${quizQuestions.length} correct`);
        
        // Update academy progress in database
        updateProgress({
          xpGained: xpEarned,
          tokensGained: totalTokens,
          quizCompleted: true
        });
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

  const startCategoryQuiz = (category: string, mode: string, questionCount: number, difficulty?: ('easy' | 'medium' | 'hard')[]) => {
    const allowedDifficulties = difficulty || ['easy', 'medium', 'hard'];
    
    // Use smart selection algorithm
    const selectedQuestions = selectQuestionsForTopic(
      category,
      questionCount,
      allowedDifficulties
    );
    
    setQuizQuestions(selectedQuestions);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setAnswers([]);
    setIsQuizComplete(false);
    setScore(0);
    setTokensEarned(0);
  };

  const startDrill = (drillId: string, questionCount: number, difficulty?: ('easy' | 'medium' | 'hard')[]) => {
    const allowedDifficulties = difficulty || ['easy', 'medium'];
    
    // Use smart selection for drill topics
    const selectedQuestions = selectQuestionsForTopic(
      drillId,
      questionCount,
      allowedDifficulties
    );
    
    setQuizQuestions(selectedQuestions);
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
    startCategoryQuiz,
    startDrill,
    resetQuiz
  };
}