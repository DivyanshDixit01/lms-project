import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { toggleDarkMode } from "../features/themeSlice";
import {
  BookOpen,
  Moon,
  Sun,
  User,
  LogOut,
  ChevronDown,
  Home,
  GraduationCap,
  UserCircle,
  BookMarked,
  LayoutDashboard,
  Menu,
  X,
  Info,
} from "lucide-react";

const Navbar = () => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const dropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const isDarkMode = useSelector((state) => state.theme.isDarkMode);
  const { user, isAuthenticated } = useSelector(
    (state) => state.auth || { user: null, isAuthenticated: false },
  );

  // Default avatar image URLs (using reliable placeholder images)
  const defaultAvatar =
    "https://ui-avatars.com/api/?background=6366f1&color=fff&bold=true&size=32&name=" +
    (user?.name?.charAt(0).toUpperCase() || "U");

  // Default profile image for dropdown (larger size)
  const defaultProfileImage =
    "https://ui-avatars.com/api/?background=6366f1&color=fff&bold=true&size=48&name=" +
    (user?.name?.replace(" ", "+") || "User");

  // Check authentication status from localStorage on mount
  // useEffect(() => {
  //   const token = localStorage.getItem("token");
  //   const storedUser = localStorage.getItem("user");

  //   if (token && storedUser && !isAuthenticated) {
  //     try {
  //       const userData = JSON.parse(storedUser);

  //       // Dispatch login action if you have it
  //       // dispatch(userLoggedIn({ user: userData }));
  //     } catch (error) {
  //       console.error("Error parsing stored user:", error);
  //       localStorage.removeItem("token");
  //       localStorage.removeItem("user");
  //     }
  //   }
  // }, [dispatch, isAuthenticated]);

  // Check for saved theme preference on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else if (savedTheme === "light") {
      document.documentElement.classList.remove("dark");
    } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      document.documentElement.classList.add("dark");
    }
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target) &&
        !event.target.closest(".mobile-menu-button")
      ) {
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close mobile menu when screen size changes
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleToggleDarkMode = () => {
    console.log("Toggle dark mode clicked, current isDarkMode:", isDarkMode);
    dispatch(toggleDarkMode());
    console.log("After dispatch");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie =
      "refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    sessionStorage.clear();
    setIsProfileOpen(false);
    setIsMobileMenuOpen(false);
    navigate("/login");
    console.log("Logged out successfully");
  };

  const handleAvatarError = () => {
    setAvatarError(true);
  };

  const navLinks = [
    { to: "/", icon: Home, label: "Home" },
    { to: "/courses", icon: BookOpen, label: "Courses" },
    { to: "/about", icon: Info, label: "About Us" },
    // Dashboard for instructors and students
    ...(isAuthenticated && user?.role === "instructor"
      ? [{ to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" }]
      : []),
  ];

  // Don't render navbar on login/register pages
  if (location.pathname === "/login" || location.pathname === "/register") {
    return null;
  }

  return (
    <>
      <nav className="h-16 dark:bg-[#0A0A0A] bg-white border-b dark:border-b-gray-800 border-b-gray-200 fixed top-0 left-0 right-0 duration-300 z-50">
        <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-full">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-linear-to-r from-indigo-600 to-purple-600 rounded-lg blur opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative bg-linear-to-r from-indigo-600 to-purple-600 p-2 rounded-lg">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
              </div>
              <h1 className="text-xl font-bold bg-linear-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent dark:text-white">
                LearnMaster
              </h1>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-200 font-medium"
                >
                  <link.icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </Link>
              ))}
            </div>

            {/* Right side buttons */}
            <div className="flex items-center gap-3">
              {/* Dark Mode Toggle */}
              <button
                onClick={handleToggleDarkMode}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
                aria-label="Toggle dark mode"
              >
                {isDarkMode ? (
                  <Sun className="w-5 h-5 text-yellow-500" />
                ) : (
                  <Moon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                )}
              </button>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200 mobile-menu-button"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? (
                  <X className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                ) : (
                  <Menu className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                )}
              </button>

              {/* Auth Buttons */}
              {isAuthenticated ? (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center gap-2 p-1 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200 border-2 border-transparent hover:border-indigo-500"
                  >
                    {/* Profile Image with fallback */}
                    {user?.photoUrl && !avatarError ? (
                      <img
                        src={user.photoUrl}
                        alt={user.name}
                        className="w-8 h-8 rounded-full object-cover"
                        onError={handleAvatarError}
                      />
                    ) : (
                      <img
                        src={defaultAvatar}
                        alt={user?.name || "User"}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    )}
                    <span className="hidden md:block text-sm font-medium text-gray-700 dark:text-gray-300 mr-1">
                      {user?.name?.split(" ")[0] || "User"}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
                        isProfileOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {/* Profile Dropdown */}
                  {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden z-50">
                      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center gap-3">
                        {/* Larger profile image in dropdown with fallback */}
                        {user?.photoUrl && !avatarError ? (
                          <img
                            src={user.photoUrl}
                            alt={user.name}
                            className="w-12 h-12 rounded-full object-cover"
                            onError={handleAvatarError}
                          />
                        ) : (
                          <img
                            src={defaultProfileImage}
                            alt={user?.name || "User"}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        )}
                        <div>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">
                            {user?.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {user?.email}
                          </p>
                          <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400">
                            {user?.role || "Student"}
                          </span>
                        </div>
                      </div>

                      <div className="py-2">
                        <Link
                          to="/profile"
                          onClick={() => setIsProfileOpen(false)}
                          className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
                        >
                          <UserCircle className="w-4 h-4" />
                          My Profile
                        </Link>
                        <Link
                          to="/my-courses"
                          onClick={() => setIsProfileOpen(false)}
                          className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
                        >
                          <BookMarked className="w-4 h-4" />
                          My Courses
                        </Link>
                        <Link
                          to="/dashboard"
                          onClick={() => setIsProfileOpen(false)}
                          className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
                        >
                          <LayoutDashboard className="w-4 h-4" />
                          Dashboard
                        </Link>
                        <hr className="my-2 border-gray-200 dark:border-gray-700" />
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200"
                        >
                          <LogOut className="w-4 h-4" />
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="hidden md:flex items-center gap-3">
                  <Link
                    to="/login"
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-200"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-2 text-sm font-medium bg-linear-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div
          ref={mobileMenuRef}
          className="fixed top-16 left-0 right-0 bg-white dark:bg-[#0A0A0A] border-b border-gray-200 dark:border-gray-800 md:hidden z-40"
        >
          <div className="px-4 py-4 space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors duration-200"
              >
                <link.icon className="w-5 h-5" />
                <span className="font-medium">{link.label}</span>
              </Link>
            ))}

            {!isAuthenticated && (
              <>
                <hr className="border-gray-200 dark:border-gray-700" />
                <Link
                  to="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors duration-200"
                >
                  <User className="w-5 h-5" />
                  <span className="font-medium">Login</span>
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 bg-linear-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200"
                >
                  <GraduationCap className="w-5 h-5" />
                  <span className="font-medium">Sign Up</span>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
