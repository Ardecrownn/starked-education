import React from 'react';
import { useRouter } from 'next/router';
import { RouteErrorBoundary } from '../../components/RouteErrorBoundary';
import QuizPlayer from '../../components/Quiz/QuizPlayer';
import type { Question } from '../../components/Quiz/QuestionCard';

/**
 * Quiz page.
 *
 * Wrapped in RouteErrorBoundary — a crash in the quiz engine (timer,
 * question rendering, scoring) will show a friendly recovery UI without
 * taking down the rest of the app.
 */

const DEMO_QUESTIONS: Question[] = [
  {
    id: '1',
    text: 'What is a smart contract?',
    options: [
      'A legal document stored on paper',
      'Self-executing code deployed on a blockchain',
      'A type of cryptocurrency wallet',
      'A cloud storage solution',
    ],
    correctAnswer: 1,
  },
  {
    id: '2',
    text: 'Which consensus mechanism does Stellar use?',
    options: [
      'Proof of Work',
      'Proof of Stake',
      'Stellar Consensus Protocol (SCP)',
      'Delegated Proof of Stake',
    ],
    correctAnswer: 2,
  },
];

const QuizPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const quizId = Array.isArray(id) ? id[0] : id ?? '';

  const handleComplete = (score: number) => {
    console.log(`Quiz ${quizId} completed with score: ${score}`);
  };

  return (
    <RouteErrorBoundary routeName={`Quiz: ${quizId}`}>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-lg font-semibold text-gray-900">
                StarkEd — Quiz
              </h1>
              <a
                href="/courses"
                className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
              >
                ← Back to Courses
              </a>
            </div>
          </div>
        </div>

        {/* Quiz content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <QuizPlayer questions={DEMO_QUESTIONS} onComplete={handleComplete} />
        </main>
      </div>
    </RouteErrorBoundary>
  );
};

export default QuizPage;
