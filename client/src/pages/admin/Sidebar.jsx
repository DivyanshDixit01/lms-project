// pages/admin/Sidebar.js
import React, { useState, useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  ChevronRight,
  LogOut,
  User,
  Menu,
  X,
  GraduationCap,
  Video,
  Users,
  Mail,
  DollarSign,
  Flag,
  BarChart3,
} from "lucide-react";

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUserData(JSON.parse(storedUser));
      } catch (e) {
        console.error("Error parsing user data:", e);
      }
    }
  }, []);

  const navigation = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Create Course", path: "/dashboard/create-course", icon: Video },
    { name: "Students", path: "/dashboard/students", icon: Users },
    { name: "Payments", path: "/dashboard/payments", icon: DollarSign },
    { name: "Moderation", path: "/dashboard/moderation", icon: Flag },
    { name: "Analytics", path: "/dashboard/analytics", icon: BarChart3 },
  ];

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const getUserInitials = () => {
    if (!userData?.name) return "I";
    return userData.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-indigo-600 text-white rounded-lg shadow-lg"
      >
        {isMobileMenuOpen ? (
          <X className="w-5 h-5" />
        ) : (
          <Menu className="w-5 h-5" />
        )}
      </button>

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:relative z-40 w-72 bg-gradient-to-b from-indigo-900 to-indigo-800 text-white shadow-xl transition-transform duration-300 ease-in-out
          ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          lg:block flex flex-col h-full
        `}
      >
        {/* Logo Section - Fixed at top */}
        <div className="p-6 border-b border-indigo-700/50 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-indigo-200" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">LMS Portal</h1>
              <p className="text-xs text-indigo-200/70">
                Learning Management System
              </p>
            </div>
          </div>
        </div>

        {/* Navigation - Scrollable area */}
        <nav className="flex-1 overflow-y-auto px-4 py-6">
          <p className="text-xs font-semibold text-indigo-200/60 uppercase tracking-wider mb-4 px-3">
            Main Menu
          </p>
          <div className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 group ${
                    active
                      ? "bg-white/20 text-white shadow-md"
                      : "text-indigo-100 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 ${active ? "text-white" : "text-indigo-200 group-hover:text-white"}`}
                  />
                  <span className="flex-1 text-sm font-medium">
                    {item.name}
                  </span>
                  {active && <ChevronRight className="w-4 h-4" />}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* User Info and Logout - Fixed at bottom */}
        <div className="p-4 border-t border-indigo-700/50 flex-shrink-0">
          {/* User Info */}
          <div className="flex items-center gap-3 mb-4 pb-4 border-b border-indigo-700/30">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 flex items-center justify-center shadow-lg flex-shrink-0">
              <span className="text-sm font-bold text-white">
                {getUserInitials()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">
                {userData?.name || "Instructor"}
              </p>
              <p className="text-xs text-indigo-200/70 truncate flex items-center gap-1 mt-0.5">
                <Mail className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">
                  {userData?.email || "instructor@example.com"}
                </span>
              </p>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-indigo-100 hover:bg-red-500/20 hover:text-red-200 transition-colors group"
          >
            <LogOut className="w-5 h-5" />
            <span className="flex-1 text-left text-sm font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Main Content - Scrollable */}
      <main className="flex-1 overflow-y-auto h-full">
        {/* Top Header for Mobile */}
        <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-6 h-6 text-indigo-600" />
              <span className="font-semibold text-gray-800">LMS Portal</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-indigo-600 flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm text-gray-600">
                {userData?.name?.split(" ")[0] || "User"}
              </span>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Sidebar;
