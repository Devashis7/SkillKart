import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FaRocket, 
  FaUsers, 
  FaGraduationCap, 
  FaLightbulb,
  FaChartLine,
  FaTrophy,
  FaHeart,
  FaGlobe,
  FaHandshake,
  FaShieldAlt,
  FaCode,
  FaLinkedin,
  FaGithub
} from 'react-icons/fa';

const AboutPage = () => {
  const stats = [
    { icon: FaUsers, value: "1000+", label: "Student Freelancers" },
    { icon: FaTrophy, value: "500+", label: "Projects Completed" },
    { icon: FaHeart, value: "98%", label: "Satisfaction Rate" },
    { icon: FaGlobe, value: "24/7", label: "Support Available" }
  ];

  const values = [
    {
      icon: FaGraduationCap,
      title: "Student Empowerment",
      description: "Providing students with opportunities to showcase their skills, gain real-world experience, and build their professional portfolios while earning."
    },
    {
      icon: FaHandshake,
      title: "Trust & Quality",
      description: "Ensuring quality service delivery through our gig approval system and review mechanism, building trust between students and clients."
    },
    {
      icon: FaLightbulb,
      title: "Innovation Focus",
      description: "Leveraging modern MERN stack technologies to create a seamless, responsive platform with real-time features and secure payment integration."
    },
    {
      icon: FaShieldAlt,
      title: "Secure Platform",
      description: "Protecting both freelancers and clients with secure authentication, encrypted payments through Stripe, and transparent order management."
    }
  ];

  const teamMembers = [
    {
      name: 'Devashis Kumar',
      role: 'Project Lead & Full Stack Developer',
      initials: 'DK',
      gradient: 'from-blue-500 to-indigo-500',
      description: 'Passionate about creating platforms that empower students and drive innovation. Leading the vision and technical architecture of SkillKart.',
      linkedin: 'https://www.linkedin.com/in/devashis-kumar-9a1b6b257/',
      github: 'https://github.com/Devashis7'
    },
    {
      name: 'Akshay Kumar',
      role: 'Backend Developer',
      initials: 'AK',
      gradient: 'from-blue-500 to-purple-500',
      description: 'Expert in building scalable APIs and managing complex database architectures. Ensures robust backend systems for seamless operations.',
      linkedin: 'https://www.linkedin.com/in/akshay-kumar7n?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app',
      github: '#'
    },
    {
      name: 'Rishikesh Kumar',
      role: 'Frontend Developer',
      initials: 'RK',
      gradient: 'from-cyan-500 to-teal-500',
      description: 'Specializes in crafting beautiful, responsive user interfaces and seamless experiences. Brings designs to life with modern React.',
      linkedin: '#',
      github: '#'
    }
  ];

  return (
    <div>
      {/* Hero Section */}
      <motion.section 
        className="pt-8 pb-20 px-4 relative overflow-hidden bg-gradient-to-br from-primary-50 to-blue-50 dark:from-gray-800 dark:to-gray-900"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <motion.h1 
              className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
            >
              About{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-blue-600">
                SkillKart
              </span>
            </motion.h1>
            <motion.p 
              className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Bridging the gap between talented student freelancers and clients who need quality services. 
              Empowering the next generation of professionals.
            </motion.p>
          </div>
        </div>
      </motion.section>

        {/* Mission & Vision Section */}
        <motion.section 
          className="py-20 px-4"
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <motion.div
                className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700"
                initial={{ x: -50, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              >
                <FaRocket className="text-5xl text-primary-500 mb-6" />
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Our Mission</h2>
                <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                  SkillKart is dedicated to bridging the gap between talented student freelancers and clients 
                  who need quality services. We provide a platform where students can showcase their skills, 
                  gain real-world experience, and earn while learning. Our mission is to create opportunities 
                  that transform student potential into professional success.
                </p>
              </motion.div>
              
              <motion.div
                className="bg-gradient-to-br from-primary-500/10 to-blue-500/10 dark:from-primary-500/20 dark:to-blue-500/20 p-8 rounded-2xl border border-primary-500/30"
                initial={{ x: 50, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              >
                <FaGlobe className="text-5xl text-primary-500 mb-6" />
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Our Vision</h2>
                <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                  To become the leading platform for student freelancing globally, empowering the next 
                  generation of professionals while providing clients with access to fresh talent and 
                  innovative solutions. We envision a world where every student can monetize their skills 
                  and build a successful career from day one.
                </p>
              </motion.div>
            </div>
          </div>
        </motion.section>

        {/* Story Section */}
        <motion.section 
          className="py-20 px-4 bg-white dark:bg-gray-800"
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <div className="max-w-4xl mx-auto text-center">
            <FaLightbulb className="text-6xl text-primary-500 mx-auto mb-6" />
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">Our Story</h2>
            <div className="bg-gray-50 dark:bg-gray-900 p-8 rounded-2xl shadow-md">
              <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
                Founded in 2025, SkillKart was born from a simple observation: students have valuable 
                skills but struggle to find legitimate opportunities to apply them, while clients often 
                overlook the untapped potential of student talent.
              </p>
              <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
                We're here to change that narrative. Built with the MERN stack and modern technologies 
                like Stripe for secure payments and Cloudinary for seamless file management, SkillKart 
                provides a comprehensive marketplace where students can create gigs, clients can browse 
                services, and both parties can collaborate with confidence.
              </p>
              <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                From gig approval workflows to order management with revision requests, review systems, 
                and admin moderation - every feature is designed to ensure quality, trust, and success 
                for both freelancers and clients.
              </p>
            </div>
          </div>
        </motion.section>

        {/* Stats Section */}
        <motion.section 
          className="py-20 px-4 bg-gradient-to-br from-primary-50 to-blue-50 dark:from-gray-900 dark:to-gray-800"
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Platform Impact</h2>
              <p className="text-gray-600 dark:text-gray-300 text-lg">Making a difference in the freelancing ecosystem</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <motion.div 
                  key={index}
                  className="text-center"
                  initial={{ scale: 0.8, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <stat.icon className="text-5xl text-primary-500 mx-auto mb-4" />
                  <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">{stat.value}</div>
                  <div className="text-gray-600 dark:text-gray-400 text-lg">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Values Section */}
        <motion.section 
          className="py-20 px-4 bg-white dark:bg-gray-800"
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Our Core Values</h2>
              <p className="text-gray-600 dark:text-gray-300 text-lg">The principles that drive everything we do</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value, index) => (
                <motion.div
                  key={index}
                  className="bg-gray-50 dark:bg-gray-900 p-8 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-primary-500/50 transition-all duration-300 text-center shadow-md hover:shadow-xl"
                  initial={{ y: 30, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -5 }}
                >
                  <value.icon className="text-4xl text-primary-500 mx-auto mb-6" />
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{value.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{value.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Team Section */}
        <motion.section 
          className="py-20 px-4 bg-gradient-to-br from-primary-50 to-blue-50 dark:from-gray-900 dark:to-gray-800"
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Meet Our Team</h2>
              <p className="text-gray-600 dark:text-gray-300 text-lg">The passionate minds building the future of student freelancing</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {teamMembers.map((member, index) => (
                <motion.div
                  key={index}
                  className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-2xl transition-all duration-300"
                  initial={{ y: 30, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -10 }}
                >
                  <div className="text-center">
                    <motion.div
                      className="relative inline-block mb-6"
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.3 }}
                    >
                      {index === 0 ? (
                        // Devashis Kumar - use actual photo
                        <div className="w-32 h-52 mx-auto rounded-full overflow-hidden shadow-lg border-4 border-primary-500/30">
                          <img 
                            src="/devashis.jpg" 
                            alt={member.name}
                            className="w-full h-full object-cover object-center"
                            style={{ objectPosition: 'center' }}
                          />
                        </div>
                      ) : index === 1 ? (
                        // Akshay Kumar - use actual photo
                        <div className="w-32 h-52 mx-auto rounded-full overflow-hidden shadow-lg border-4 border-purple-500/30">
                          <img 
                            src="/akshay.jpg" 
                            alt={member.name}
                            className="w-full h-full object-cover object-center"
                            style={{ objectPosition: 'center' }}
                          />
                        </div>
                      ) : index === 2 ? (
                        // Rishikesh Kumar - use actual photo
                        <div className="w-32 h-52 mx-auto rounded-full overflow-hidden shadow-lg border-4 border-teal-500/30">
                          <img 
                            src="/Rishikesh.jpg" 
                            alt={member.name}
                            className="w-full h-full object-cover object-center"
                            style={{ objectPosition: 'center' }}
                          />
                        </div>
                      ) : (
                        // Other team members - use gradient with initials
                        <div className={`w-32 h-32 mx-auto bg-gradient-to-r ${member.gradient} rounded-full flex items-center justify-center text-white text-4xl font-bold shadow-lg`}>
                          {member.initials}
                        </div>
                      )}
                    </motion.div>
                    
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      {member.name}
                    </h3>
                    <p className="text-primary-600 dark:text-primary-400 font-semibold mb-4">{member.role}</p>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-6 leading-relaxed">
                      {member.description}
                    </p>
                    
                    <div className="flex justify-center space-x-4">
                      <a 
                        href={member.linkedin} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-gray-600 dark:text-gray-400 hover:text-primary-500 transition-colors duration-200"
                      >
                        <FaLinkedin className="text-2xl" />
                      </a>
                      <a 
                        href={member.github} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-gray-600 dark:text-gray-400 hover:text-primary-500 transition-colors duration-200"
                      >
                        <FaGithub className="text-2xl" />
                      </a>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Technology Stack Section */}
        <motion.section 
          className="py-20 px-4 bg-white dark:bg-gray-800"
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Technology Stack</h2>
              <p className="text-gray-600 dark:text-gray-300 text-lg">Built with modern, scalable technologies</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <motion.div
                className="bg-gray-50 dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-700 text-center shadow-md hover:shadow-xl transition-all duration-300"
                whileHover={{ y: -5 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-4xl mb-4">⚛️</div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">React.js</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Modern frontend library for building interactive UIs</p>
              </motion.div>
              
              <motion.div
                className="bg-gray-50 dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-700 text-center shadow-md hover:shadow-xl transition-all duration-300"
                whileHover={{ y: -5 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-4xl mb-4">🟢</div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Node.js</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">JavaScript runtime for scalable backend services</p>
              </motion.div>
              
              <motion.div
                className="bg-gray-50 dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-700 text-center shadow-md hover:shadow-xl transition-all duration-300"
                whileHover={{ y: -5 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-4xl mb-4">🚀</div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Express.js</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Web framework for robust APIs and server logic</p>
              </motion.div>
              
              <motion.div
                className="bg-gray-50 dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-700 text-center shadow-md hover:shadow-xl transition-all duration-300"
                whileHover={{ y: -5 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-4xl mb-4">🍃</div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">MongoDB</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">NoSQL database for flexible data storage</p>
              </motion.div>

              <motion.div
                className="bg-gray-50 dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-700 text-center shadow-md hover:shadow-xl transition-all duration-300"
                whileHover={{ y: -5 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-4xl mb-4">💳</div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Stripe</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Secure payment processing for transactions</p>
              </motion.div>

              <motion.div
                className="bg-gray-50 dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-700 text-center shadow-md hover:shadow-xl transition-all duration-300"
                whileHover={{ y: -5 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-4xl mb-4">☁️</div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Cloudinary</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Cloud-based file storage and management</p>
              </motion.div>

              <motion.div
                className="bg-gray-50 dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-700 text-center shadow-md hover:shadow-xl transition-all duration-300"
                whileHover={{ y: -5 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-4xl mb-4">🔐</div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">JWT Auth</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Secure authentication and authorization</p>
              </motion.div>

              <motion.div
                className="bg-gray-50 dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-700 text-center shadow-md hover:shadow-xl transition-all duration-300"
                whileHover={{ y: -5 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-4xl mb-4">🎨</div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Tailwind CSS</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Utility-first CSS for rapid UI development</p>
              </motion.div>
            </div>
          </div>
        </motion.section>

        {/* Call to Action */}
        <motion.section 
          className="py-20 px-4 bg-gradient-to-br from-primary-50 to-blue-50 dark:from-gray-900 dark:to-gray-800"
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              className="bg-white dark:bg-gray-800 p-12 rounded-2xl border border-primary-500/30 shadow-xl"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <FaCode className="text-5xl text-primary-500 mx-auto mb-6" />
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Join Our Journey</h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
                Whether you're a student looking to showcase your skills or a client seeking fresh talent, 
                SkillKart is your platform for success. Join thousands of users already transforming the 
                freelancing landscape.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link 
                  to="/register" 
                  className="px-8 py-3 bg-gradient-to-r from-primary-500 to-blue-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-300 hover:scale-105"
                >
                  Get Started Today
                </Link>
                <Link 
                  to="/browse-gigs" 
                  className="px-8 py-3 bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-semibold rounded-lg border-2 border-primary-500 hover:bg-primary-50 dark:hover:bg-gray-700 transition-all duration-300 hover:scale-105"
                >
                  Browse Gigs
                </Link>
              </div>
            </motion.div>
          </div>
        </motion.section>
    </div>
  );
};

export default AboutPage;
