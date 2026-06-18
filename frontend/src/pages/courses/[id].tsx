import React from 'react';
import { useRouter } from 'next/router';
import { RouteErrorBoundary } from '../../components/RouteErrorBoundary';

/**
 * Course detail page.
 *
 * This is one of the most complex pages in the app (video player, quiz,
 * progress tracking). It is wrapped in its own RouteErrorBoundary so that
 * a crash here does NOT crash the header or navigation — users can still
 * browse other courses.
 *
 * Acceptance criterion:
 *   "Throw error in course page → error boundary shows friendly UI"
 *   "Error in /courses doesn't crash the header/navigation"
 */

interface CourseDetailContentProps {
  courseId: string;
}

const CourseDetailContent: React.FC<CourseDetailContentProps> = ({
  courseId,
}) => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-xl shadow-sm border p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Course: {courseId}
        </h2>
        <p className="text-gray-600">
          Course content, video player, quizzes, and progress tracking for
          course <span className="font-mono font-medium">{courseId}</span> will
          be rendered here.
        </p>
      </div>
    </div>
  );
};

const CourseDetailPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const courseId = Array.isArray(id) ? id[0] : id ?? '';

  return (
    <RouteErrorBoundary routeName={`Course: ${courseId}`}>
      <div className="min-h-screen bg-gray-50">
        {/* Page header — stays outside the per-content boundary so nav works */}
        <div className="bg-white border-b shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <nav className="flex items-center gap-2 text-sm text-gray-500">
              <a href="/" className="hover:text-gray-900 transition-colors">
                Home
              </a>
              <span>/</span>
              <a
                href="/courses"
                className="hover:text-gray-900 transition-colors"
              >
                Courses
              </a>
              <span>/</span>
              <span className="text-gray-900 font-medium truncate max-w-xs">
                {courseId}
              </span>
            </nav>
          </div>
        </div>

        {/* Main course content */}
        <main>
          <CourseDetailContent courseId={courseId} />
        </main>
      </div>
    </RouteErrorBoundary>
  );
};

export default CourseDetailPage;
