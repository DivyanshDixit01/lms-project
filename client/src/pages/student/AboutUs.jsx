import { Link } from "react-router-dom";
import {
  ArrowRight,
  Lightbulb,
  Users,
  Target,
  Heart,
  Zap,
  Globe,
  Award,
} from "lucide-react";

const AboutUs = () => {
  const values = [
    {
      icon: Lightbulb,
      title: "Innovation",
      description:
        "Continuously improving our platform and teaching methods to provide the best learning experience.",
    },
    {
      icon: Users,
      title: "Community",
      description:
        "Building a supportive community of learners and educators who help each other grow.",
    },
    {
      icon: Target,
      title: "Excellence",
      description:
        "Delivering high-quality content and learning experiences that exceed expectations.",
    },
    {
      icon: Heart,
      title: "Accessibility",
      description:
        "Making quality education available to everyone, regardless of background or location.",
    },
    {
      icon: Zap,
      title: "Empowerment",
      description:
        "Enabling learners to achieve their goals and transform their careers through education.",
    },
    {
      icon: Globe,
      title: "Global Impact",
      description:
        "Creating opportunities for learners worldwide to access world-class education.",
    },
  ];

  const stats = [
    { number: "50K+", label: "Active Learners" },
    { number: "500+", label: "Expert Courses" },
    { number: "95%", label: "Satisfaction Rate" },
    { number: "150+", label: "Countries" },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-[#0A0A0A]">
      {/* Hero Section */}
      <section className="relative pt-6 overflow-hidden">
        {/* Background accents */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-100/30 dark:bg-indigo-900/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-100/20 dark:bg-purple-900/10 rounded-full blur-3xl"></div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-full border border-indigo-200 dark:border-indigo-800 mb-6">
              <Award className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span className="text-sm font-semibold text-indigo-700 dark:text-indigo-300">
                About EduLearn
              </span>
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 dark:text-white mb-6">
              Transforming Education
              <span className="block bg-linear-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Through Technology
              </span>
            </h1>

            {/* Description */}
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-8 leading-relaxed">
              We believe that quality education should be accessible to everyone,
              everywhere. Our mission is to empower learners worldwide by
              providing expert-led courses and hands-on learning experiences.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-6 bg-linear-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/10 dark:to-purple-900/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, idx) => (
              <div key={idx} className="text-center">
                <p className="text-3xl md:text-4xl font-bold bg-linear-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                  {stat.number}
                </p>
                <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                Our Mission
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                To provide accessible, high-quality online education to learners
                worldwide, empowering them to achieve their goals and transform
                their careers.
              </p>
              <p className="text-base text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                We partner with industry experts and experienced educators to
                create courses that are not just informative, but transformative.
                Every course is designed with real-world applications in mind,
                ensuring that learners can immediately apply what they've learned.
              </p>
              <Link
                to="/courses"
                className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-all shadow-md hover:shadow-lg"
              >
                Explore Courses
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Right Image */}
            <div className="relative">
              <div className="rounded-xl overflow-hidden shadow-xl">
                <img
                  src="https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                  alt="Our mission"
                  className="w-full h-auto object-cover rounded-xl"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent rounded-xl"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-6 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Our Core Values
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              These principles guide everything we do and shape our commitment to
              our learners.
            </p>
          </div>

          {/* Values Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {values.map((value, idx) => (
              <div
                key={idx}
                className="p-8 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                    <value.icon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    {value.title}
                  </h3>
                </div>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Vision Section */}
      <section className="py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* Left Image */}
            <div className="relative order-2 md:order-1">
              <div className="rounded-xl overflow-hidden shadow-xl">
                <img
                  src="https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                  alt="Our vision"
                  className="w-full h-auto object-cover rounded-xl"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent rounded-xl"></div>
              </div>
            </div>

            {/* Right Content */}
            <div className="order-1 md:order-2">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                Our Vision
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                We envision a world where anyone, anywhere can access world-class
                education and develop the skills they need to succeed in their
                chosen field.
              </p>
              <p className="text-base text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                By leveraging technology and bringing together the best educators,
                we're breaking down barriers to education and creating opportunities
                for millions of learners to transform their lives.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/courses"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-all shadow-md hover:shadow-lg"
                >
                  Start Learning
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <a
                  href="#contact"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
                >
                  Get in Touch
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-6 bg-linear-to-r from-indigo-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Start Your Learning Journey?
          </h2>
          <p className="text-lg text-indigo-100 mb-8 max-w-2xl mx-auto">
            Join thousands of learners who are already transforming their careers
            with EduLearn.
          </p>
          <Link
            to="/courses"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-indigo-600 font-bold rounded-lg hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl"
          >
            Explore All Courses
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;
