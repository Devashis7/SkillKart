import React from 'react';
import Header from './Header';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Company */}
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">S</span>
                </div>
                <span className="text-xl font-bold text-gray-900 dark:text-white">
                  SkillKart
                </span>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-4 max-w-md">
                Connecting talented students with clients who need their skills. 
                The ultimate freelancing platform for the next generation.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                Quick Links
              </h3>
              <ul className="space-y-2">
                <li>
                  <a href="/" className="text-gray-600 dark:text-gray-400 hover:text-primary-500 transition-colors duration-200">
                    Home
                  </a>
                </li>
                <li>
                  <a href="/gigs" className="text-gray-600 dark:text-gray-400 hover:text-primary-500 transition-colors duration-200">
                    Browse Gigs
                  </a>
                </li>
                <li>
                  <a href="/how-it-works" className="text-gray-600 dark:text-gray-400 hover:text-primary-500 transition-colors duration-200">
                    How It Works
                  </a>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                Support
              </h3>
              <ul className="space-y-2">
                <li>
                  <a href="/contact" className="text-gray-600 dark:text-gray-400 hover:text-primary-500 transition-colors duration-200">
                    Contact Us
                  </a>
                </li>
                <li>
                  <a href="/help" className="text-gray-600 dark:text-gray-400 hover:text-primary-500 transition-colors duration-200">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="/privacy" className="text-gray-600 dark:text-gray-400 hover:text-primary-500 transition-colors duration-200">
                    Privacy Policy
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 mt-8 pt-8 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              © 2025 SkillKart. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;