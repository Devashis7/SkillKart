import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getDashboardRoute, getWelcomeMessage } from '../utils/navigation';

const HomePage = () => {
  const { user, isAuthenticated } = useAuth();

  // If user is authenticated, show personalized message
  if (isAuthenticated && user) {
    return (
      <div className="min-h-screen">
        {/* Authenticated User Hero Section */}
        <section className="relative bg-gradient-to-br from-primary-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
            <div className="text-center">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white leading-tight">
                {getWelcomeMessage(user)}
              </h1>
              
              {user.role === 'student' && (
                <>
                  <p className="mt-6 text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                    Ready to showcase your skills? Create gigs, complete orders, and build your reputation!
                  </p>
                  <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                    <Link to="/gigs/create" className="btn-primary text-center">
                      Create New Gig
                    </Link>
                    <Link to="/student-dashboard" className="btn-outline text-center">
                      View Dashboard
                    </Link>
                  </div>
                </>
              )}
              
              {user.role === 'client' && (
                <>
                  <p className="mt-6 text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                    Find talented student freelancers for your projects. Browse gigs and get started!
                  </p>
                  <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                    <Link to="/gigs" className="btn-primary text-center">
                      Browse Gigs
                    </Link>
                    <Link to="/client-dashboard" className="btn-outline text-center">
                      View Dashboard
                    </Link>
                  </div>
                </>
              )}
              
              {user.role === 'admin' && (
                <>
                  <p className="mt-6 text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                    Manage the SkillKart platform. Review pending gigs and oversee user activities.
                  </p>
                  <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                    <Link to="/admin-dashboard" className="btn-primary text-center">
                      Admin Dashboard
                    </Link>
                    <Link to="/gigs" className="btn-outline text-center">
                      View All Gigs
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
        </section>

        {/* Quick Stats Section for authenticated users */}
        <section className="py-12 bg-white dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-500">500+</div>
                <div className="text-gray-600 dark:text-gray-300">Active Gigs</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-500">1000+</div>
                <div className="text-gray-600 dark:text-gray-300">Happy Clients</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-500">250+</div>
                <div className="text-gray-600 dark:text-gray-300">Student Freelancers</div>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  // Default homepage for non-authenticated users
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Content */}
            <div className="text-center lg:text-left">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white leading-tight">
                Find Talented{' '}
                <span className="text-primary-500">Students</span>{' '}
                for Your Projects
              </h1>
              <p className="mt-6 text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-2xl">
                Connect with skilled student freelancers who are eager to help with your projects. 
                From web development to graphic design, find the perfect match for your needs.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link
                  to="/register"
                  className="btn-primary text-center inline-block"
                >
                  Get Started Today
                </Link>
                <Link
                  to="/gigs"
                  className="btn-outline text-center inline-block"
                >
                  Browse Gigs
                </Link>
              </div>
              
              {/* Stats */}
              <div className="mt-12 grid grid-cols-3 gap-4 lg:gap-8">
                <div className="text-center lg:text-left">
                  <div className="text-2xl lg:text-3xl font-bold text-primary-500">1000+</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Active Students</div>
                </div>
                <div className="text-center lg:text-left">
                  <div className="text-2xl lg:text-3xl font-bold text-primary-500">500+</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Projects Completed</div>
                </div>
                <div className="text-center lg:text-left">
                  <div className="text-2xl lg:text-3xl font-bold text-primary-500">98%</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Satisfaction Rate</div>
                </div>
              </div>
            </div>

            {/* Hero Image/Illustration */}
            <div className="relative">
              <div className="w-full max-w-lg mx-auto">
                <div className="relative">
                  {/* Hero Image */}
                  <div className="aspect-square rounded-2xl shadow-2xl overflow-hidden">
                    <img 
                      src="/Gemini_Generated_Image_lb47ylb47ylb47yl.png" 
                      alt="SkillKart - Student Freelancing Platform" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  {/* Floating cards */}
                  <div className="absolute -top-4 -left-4 w-20 h-16 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 hidden sm:block">
                    <div className="w-full h-2 bg-primary-200 rounded mb-2"></div>
                    <div className="w-3/4 h-2 bg-gray-200 dark:bg-gray-600 rounded"></div>
                  </div>
                  
                  <div className="absolute -bottom-4 -right-4 w-24 h-20 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 hidden sm:block">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                      <div className="w-8 h-2 bg-gray-200 dark:bg-gray-600 rounded"></div>
                    </div>
                    <div className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded mb-1"></div>
                    <div className="w-2/3 h-2 bg-gray-200 dark:bg-gray-600 rounded"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 lg:py-24 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Why Choose SkillKart?
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              We make it easy to connect with talented students and get your projects done quickly and efficiently.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="card p-6 text-center hover:shadow-lg transition-shadow duration-300">
              <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Fast Delivery
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Get your projects completed quickly with our efficient student freelancers.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="card p-6 text-center hover:shadow-lg transition-shadow duration-300">
              <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Quality Assured
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                All our student freelancers are vetted and reviewed for quality work.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="card p-6 text-center hover:shadow-lg transition-shadow duration-300">
              <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Affordable Prices
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Get professional quality work at student-friendly prices.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-24 bg-primary-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
            Join thousands of satisfied clients who have found success with SkillKart.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="btn-primary text-center inline-block"
            >
              Start Your Project
            </Link>
            <Link
              to="/how-it-works"
              className="btn-secondary text-center inline-block"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;