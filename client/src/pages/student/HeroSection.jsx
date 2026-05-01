import React from "react";
import {
  ArrowRight,
  Play,
  Star,
  Users,
  BookOpen,
  Award,
  Sparkles,
  TrendingUp,
  CheckCircle,
  Search,
  Filter,
  GraduationCap,
  MapPin,
  Clock,
} from "lucide-react";

const LmsHeroSection = () => {
  return (
    <div className="relative mt-4 w-full bg-gradient-to-br from-white via-slate-500 to-indigo-50/30 overflow-hidden">
      {/* Simple background accent */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-100/30 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-100/20 rounded-full blur-3xl"></div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-12 md:py-16">
        <div className="flex flex-col lg:flex-row items-center gap-10">
          {/* LEFT CONTENT */}
          <div className="flex-1 text-center lg:text-left">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-50 rounded-full border border-indigo-100 mb-5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span className="text-xs font-semibold text-indigo-700">
                Trusted by 50k+ learners
              </span>
            </div>

            {/* Heading */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-gray-900 mb-4">
              Master Skills That
              <span className="block bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Shape Your Future
              </span>
            </h1>

            {/* Description */}
            <p className="text-base text-gray-600 max-w-md mx-auto lg:mx-0 mb-6 leading-relaxed">
              Join 50,000+ learners mastering in-demand skills with expert-led
              courses and hands-on projects.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start mb-8">
              <button className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 text-sm">
                Start Free Trial
                <ArrowRight className="w-4 h-4" />
              </button>
              <button className="px-6 py-2.5 bg-white border border-gray-200 hover:border-indigo-300 text-gray-700 font-medium rounded-lg transition-all flex items-center justify-center gap-2 text-sm">
                <Play className="w-4 h-4 text-indigo-600" />
                Watch Demo
              </button>
            </div>

            {/* ATTRACTIVE SEARCH BAR */}
            <div className="max-w-md mx-auto lg:mx-0 mb-6">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl blur opacity-20 group-hover:opacity-30 transition-opacity"></div>
                <div className="relative bg-white rounded-xl shadow-lg border border-gray-200 group-hover:border-indigo-300 transition-all duration-300">
                  <div className="flex items-center p-1">
                    <div className="flex-1 flex items-center gap-2 px-3">
                      <Search className="w-5 h-5 text-gray-400 group-hover:text-indigo-500 transition-colors" />
                      <input
                        type="text"
                        placeholder="Search for courses, skills, or topics..."
                        className="w-full py-3 text-sm text-gray-700 bg-transparent outline-none placeholder:text-gray-400"
                      />
                    </div>
                    <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-all flex items-center gap-2">
                      <Filter className="w-4 h-4" />
                      Filter
                    </button>
                  </div>
                </div>
              </div>

              {/* Popular searches */}
              <div className="flex flex-wrap gap-2 mt-3 justify-center lg:justify-start">
                <span className="text-xs text-gray-500">Popular:</span>
                {["React", "Python", "UI/UX", "Data Science", "Marketing"].map(
                  (term) => (
                    <button
                      key={term}
                      className="text-xs px-2  bg-gray-100 hover:bg-indigo-100 text-gray-600 hover:text-indigo-600 rounded-full transition-colors"
                    >
                      {term}
                    </button>
                  ),
                )}
              </div>
            </div>
          </div>

          {/* RIGHT IMAGE */}
          <div className="flex-1 relative">
            <div className="relative rounded-xl overflow-hidden shadow-xl">
              <img
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                alt="Students learning"
                className="w-full h-auto object-cover rounded-xl"
              />
              {/* Simple overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-xl"></div>

              {/* Floating mini card */}
              <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg px-3 py-2 flex items-center gap-2 shadow-md">
                <div className="bg-green-100 p-1 rounded">
                  <TrendingUp className="w-3 h-3 text-green-600" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-800">
                    +42% completion rate
                  </p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Star className="w-2.5 h-2.5 fill-yellow-400 text-yellow-400" />
                    <span className="text-[10px] text-gray-600">
                      4.9 rating
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Simple floating testimonial */}
            <div className="absolute -bottom-4 -right-2 bg-white rounded-lg shadow-lg px-3 py-2 max-w-[180px] border border-gray-100">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-6 h-6 rounded-full bg-gradient-to-r from-indigo-400 to-purple-400"></div>
                <div>
                  <p className="text-xs font-semibold text-gray-800">
                    Sarah J.
                  </p>
                  <p className="text-[10px] text-gray-500">Software Engineer</p>
                </div>
              </div>
              <p className="text-[11px] text-gray-600 italic">
                "Transformed my career!"
              </p>
            </div>
          </div>
        </div>

        {/* Simple feature row */}
        <div className="mt-4 pt-3 border-t border-gray-100">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Users, text: "Expert Mentors" },
              { icon: BookOpen, text: "500+ Courses" },
              { icon: Award, text: "Certificates" },
              { icon: CheckCircle, text: "Lifetime Access" },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-2 justify-center">
                <item.icon className="w-4 h-4 text-indigo-500" />
                <span className="text-xs text-gray-600">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LmsHeroSection;
