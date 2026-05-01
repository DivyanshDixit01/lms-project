import { Link } from "react-router-dom";
import { GraduationCap, Home, BookOpen, Info, Share2, Mail, ExternalLink } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const navigationLinks = [
    { label: "Home", path: "/", icon: Home },
    { label: "Courses", path: "/courses", icon: BookOpen },
    { label: "About Us", path: "/about", icon: Info },
  ];

  const socialMediaLinks = [
    {
      name: "Share",
      url: "https://github.com/edulearn",
      icon: Share2,
    },
    {
      name: "Connect",
      url: "https://linkedin.com/company/edulearn",
      icon: ExternalLink,
    },
    {
      name: "Email",
      url: "mailto:info@edulearn.com",
      icon: Mail,
    },
  ];

  const companyInfo = {
    name: "EduLearn",
    tagline: "Empowering learners worldwide",
    copyright: `© ${currentYear} EduLearn. All rights reserved.`,
  };

  return (
    <footer className="bg-white dark:bg-[#0A0A0A] border-t border-gray-200 dark:border-gray-800 ">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Company Info Section */}
          <div className="flex flex-col items-start">
            <Link to="/" className="flex items-center gap-3 group mb-4">
              <div className="relative">
                <div className="absolute inset-0 bg-linear-to-r from-indigo-600 to-purple-600 rounded-lg blur opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative bg-linear-to-r from-indigo-600 to-purple-600 p-2 rounded-lg">
                  <GraduationCap className="w-5 h-5 text-white" />
                </div>
              </div>
              <h2 className="text-lg font-bold bg-linear-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent dark:text-white">
                {companyInfo.name}
              </h2>
            </Link>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              {companyInfo.tagline}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500">
              {companyInfo.copyright}
            </p>
          </div>

          {/* Navigation Links Section */}
          <div className="flex flex-col items-start md:items-center">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 uppercase tracking-wider">
              Quick Links
            </h3>
            <nav className="space-y-2">
              {navigationLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-200 text-sm"
                >
                  <link.icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </Link>
              ))}
            </nav>
          </div>

          {/* Contact/Info Section */}
          <div className="flex flex-col items-start md:items-end">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 uppercase tracking-wider">
              Get in Touch
            </h3>
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <p>Email: info@edulearn.com</p>
              <p>Phone: +1 (555) 123-4567</p>
              <p>Address: 123 Learning St, Education City, EC 12345</p>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 dark:border-gray-800 pt-8">
          {/* Bottom Footer */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-gray-500 dark:text-gray-500 text-center md:text-left">
              Made with ❤️ by the EduLearn Team
            </p>
            <div className="flex gap-6 items-center">
              {/* Social Media Links */}
              <div className="flex gap-4">
                {socialMediaLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-500 dark:text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-200"
                    aria-label={social.name}
                  >
                    <social.icon className="w-5 h-5" />
                  </a>
                ))}
              </div>
              <div className="flex gap-6">
                <a
                  href="#privacy"
                  className="text-xs text-gray-500 dark:text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-200"
                >
                  Privacy Policy
                </a>
                <a
                  href="#terms"
                  className="text-xs text-gray-500 dark:text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-200"
                >
                  Terms of Service
                </a>
                <a
                  href="#contact"
                  className="text-xs text-gray-500 dark:text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-200"
                >
                  Contact Us
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
