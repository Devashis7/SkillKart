import React from 'react';
import { Link } from 'react-router-dom';

const PrivacyPolicyPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Privacy Policy
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Last updated: November 2, 2025
          </p>
        </div>

        <div className="card p-8 space-y-8">
          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              1. Introduction
            </h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Welcome to SkillKart ("we," "our," or "us"). We are committed to protecting your personal information 
              and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard 
              your information when you visit our website and use our services.
            </p>
          </section>

          {/* Information We Collect */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              2. Information We Collect
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  2.1 Personal Information
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-2">
                  We collect personal information that you voluntarily provide to us when you:
                </p>
                <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-1 ml-4">
                  <li>Register for an account</li>
                  <li>Create or modify your profile</li>
                  <li>Post gigs or place orders</li>
                  <li>Contact us for support</li>
                  <li>Participate in user surveys</li>
                </ul>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed mt-2">
                  This information may include: name, email address, phone number, profile picture, payment information, 
                  and any other information you choose to provide.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  2.2 Automatically Collected Information
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  When you access our platform, we automatically collect certain information about your device, 
                  including IP address, browser type, operating system, access times, and pages viewed.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  2.3 Cookies and Tracking Technologies
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  We use cookies and similar tracking technologies to track activity on our platform and hold 
                  certain information to improve and analyze our service.
                </p>
              </div>
            </div>
          </section>

          {/* How We Use Your Information */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              3. How We Use Your Information
            </h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-2">
              We use the information we collect or receive:
            </p>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-2 ml-4">
              <li>To facilitate account creation and authentication</li>
              <li>To provide and maintain our services</li>
              <li>To process your transactions and manage orders</li>
              <li>To send administrative information and updates</li>
              <li>To respond to user inquiries and support requests</li>
              <li>To send marketing and promotional communications (with your consent)</li>
              <li>To protect against fraudulent or illegal activity</li>
              <li>To improve our platform and develop new features</li>
              <li>To comply with legal obligations</li>
            </ul>
          </section>

          {/* Information Sharing */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              4. Sharing Your Information
            </h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-2">
              We may share your information in the following situations:
            </p>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-2 ml-4">
              <li><strong>With Other Users:</strong> When you create a gig or place an order, certain information 
              (name, profile picture) is visible to other users</li>
              <li><strong>Service Providers:</strong> We may share your information with third-party service 
              providers who perform services on our behalf (payment processing, email delivery, hosting)</li>
              <li><strong>Business Transfers:</strong> If we are involved in a merger, acquisition, or asset sale</li>
              <li><strong>Legal Requirements:</strong> When required by law or to protect our rights and safety</li>
              <li><strong>With Your Consent:</strong> We may disclose your information for any other purpose with your consent</li>
            </ul>
          </section>

          {/* Data Security */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              5. Data Security
            </h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              We implement appropriate technical and organizational security measures to protect your personal 
              information. However, no method of transmission over the Internet or electronic storage is 100% 
              secure. While we strive to use commercially acceptable means to protect your information, we cannot 
              guarantee its absolute security.
            </p>
          </section>

          {/* Data Retention */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              6. Data Retention
            </h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              We will retain your personal information only for as long as necessary to fulfill the purposes 
              outlined in this Privacy Policy, unless a longer retention period is required or permitted by law. 
              When we no longer need your information, we will securely delete or anonymize it.
            </p>
          </section>

          {/* Your Privacy Rights */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              7. Your Privacy Rights
            </h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-2">
              Depending on your location, you may have the following rights:
            </p>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-2 ml-4">
              <li><strong>Access:</strong> Request access to your personal information</li>
              <li><strong>Correction:</strong> Request correction of inaccurate or incomplete information</li>
              <li><strong>Deletion:</strong> Request deletion of your personal information</li>
              <li><strong>Data Portability:</strong> Request a copy of your data in a structured format</li>
              <li><strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
              <li><strong>Withdraw Consent:</strong> Withdraw consent where we rely on it</li>
            </ul>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed mt-4">
              To exercise these rights, please contact us at{' '}
              <a href="mailto:d.devashiskumar@gmail.com" className="text-primary-600 dark:text-primary-400 hover:underline">
                d.devashiskumar@gmail.com
              </a>
            </p>
          </section>

          {/* Third-Party Services */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              8. Third-Party Services
            </h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-2">
              Our platform may contain links to third-party websites or integrate third-party services:
            </p>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-2 ml-4">
              <li><strong>Payment Processing:</strong> We use Stripe for secure payment processing</li>
              <li><strong>File Storage:</strong> We use Cloudinary for file uploads and storage</li>
              <li><strong>Authentication:</strong> We may offer Google Sign-In as an authentication option</li>
            </ul>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed mt-4">
              We are not responsible for the privacy practices of these third-party services. We encourage you 
              to review their privacy policies.
            </p>
          </section>

          {/* Children's Privacy */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              9. Children's Privacy
            </h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Our services are not intended for individuals under the age of 16. We do not knowingly collect 
              personal information from children under 16. If you become aware that a child has provided us with 
              personal information, please contact us, and we will take steps to delete such information.
            </p>
          </section>

          {/* Changes to Privacy Policy */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              10. Changes to This Privacy Policy
            </h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              We may update our Privacy Policy from time to time. We will notify you of any changes by posting 
              the new Privacy Policy on this page and updating the "Last updated" date. You are advised to review 
              this Privacy Policy periodically for any changes. Changes are effective when posted on this page.
            </p>
          </section>

          {/* Contact Information */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              11. Contact Us
            </h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
              If you have any questions or concerns about this Privacy Policy or our data practices, please contact us:
            </p>
            <div className="bg-primary-50 dark:bg-primary-900/20 p-4 rounded-lg">
              <p className="text-gray-900 dark:text-white font-semibold mb-2">SkillKart</p>
              <p className="text-gray-600 dark:text-gray-400">
                <strong>Email:</strong>{' '}
                <a href="mailto:d.devashiskumar@gmail.com" className="text-primary-600 dark:text-primary-400 hover:underline">
                  d.devashiskumar@gmail.com
                </a>
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                <strong>Phone:</strong>{' '}
                <a href="tel:+918102488131" className="text-primary-600 dark:text-primary-400 hover:underline">
                  +91 8102488131
                </a>
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                <strong>Location:</strong> Bokaro Steel City, Jharkhand, India
              </p>
            </div>
          </section>

          {/* Consent */}
          <section className="border-t border-gray-200 dark:border-gray-700 pt-8">
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              By using SkillKart, you consent to our Privacy Policy and agree to its terms.
            </p>
          </section>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-12">
          <Link to="/" className="text-primary-600 dark:text-primary-400 hover:underline">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
