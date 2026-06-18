import React from 'react';
import { RouteErrorBoundary } from '../../components/RouteErrorBoundary';
import { CourseGrid } from '../../components/Discovery/CourseGrid';

/**
 * Courses listing page.
 *
 * Wrapped in a RouteErrorBoundary so errors in the course grid or filters
 * are contained here and do not propagate to the app shell.
 */
const CoursesPage: React.FC = () => {
  return (
    <RouteErrorBoundary routeName="Courses">
      <div className="min-h-screen bg-gray-50">
        {/* Page header */}
        <div className="bg-white border-b shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <h1 className="text-2xl font-bold text-gray-900">Browse Courses</h1>
            <p className="mt-1 text-sm text-gray-600">
              Discover blockchain and Web3 education courses
            </p>
          </div>
        </div>

        {/* Main content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <CourseGrid />
        </main>
      </div>
    </RouteErrorBoundary>
  );
};

export default CoursesPage;
