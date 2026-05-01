import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  BookOpen,
  Camera,
  Edit2,
  Save,
  X,
  LogOut,
  ChevronRight,
  Award,
  Calendar,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Clock,
  Loader2,
  MapPin,
  GraduationCap,
} from "lucide-react";
import {
  useUpdateProfileMutation,
  useLoadUserQuery,
} from "../../features/api/authApi";
import { userLoggedIn, userLoggedOut } from "../../features/authSlice";

// ==================== SKELETON LOADER ====================
const ProfileSkeleton = () => {
  return (
    <div className="min-h-screen bg-gray-50 animate-pulse pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="h-32 bg-gradient-to-r from-indigo-500 to-purple-600" />
          <div className="relative px-6 pb-6">
            <div className="absolute -top-16 left-6">
              <div className="w-28 h-28 bg-gray-300 rounded-2xl border-4 border-white shadow-lg" />
            </div>
            <div className="pt-20 pl-36">
              <div className="h-7 bg-gray-300 rounded w-48 mb-2" />
              <div className="h-4 bg-gray-300 rounded w-32 mb-3" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==================== COURSE CARD COMPONENT ====================
const EnrolledCourseCard = ({ course, onContinue }) => {
  const formatDate = (dateString) => {
    if (!dateString) return "Recently";
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const getCategoryColor = (category) => {
    const colors = {
      Frontend: "bg-blue-100 text-blue-700",
      Backend: "bg-green-100 text-green-700",
      CSS: "bg-pink-100 text-pink-700",
      Programming: "bg-purple-100 text-purple-700",
    };
    return colors[category] || "bg-gray-100 text-gray-700";
  };

  return (
    <div className="group bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100">
      <div className="relative h-36 overflow-hidden">
        <img
          src={course.thumbnail || "https://via.placeholder.com/400x250"}
          alt={course.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm rounded-full px-2.5 py-1">
          <span className="text-xs font-semibold text-white">
            {course.progress || 0}%
          </span>
        </div>
        <div className="absolute bottom-3 left-3">
          <span
            className={`text-xs font-medium px-2 py-0.5 rounded-full ${getCategoryColor(
              course.category,
            )}`}
          >
            {course.category || "Course"}
          </span>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-800 mb-1 line-clamp-1">
          {course.title}
        </h3>
        <p className="text-xs text-gray-500 mb-2">
          by {course.instructor || "Instructor"}
        </p>

        <div className="mb-3">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Progress</span>
            <span className="font-medium text-indigo-600">
              {course.progress || 0}%
            </span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${course.progress || 0}%` }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <Clock className="w-3 h-3" />
            <span>{formatDate(course.lastAccessed)}</span>
          </div>
          <button
            onClick={() => onContinue(course)}
            className="flex items-center gap-1 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg transition-colors text-sm font-medium"
          >
            Continue
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

// ==================== EDIT PROFILE MODAL ====================
const EditProfileModal = ({
  isOpen,
  onClose,
  userData,
  onSave,
  isUpdating,
}) => {
  const [formData, setFormData] = useState({
    name: userData?.name || "",
    location: userData?.location || "",
    education: userData?.education || "",
    profilePicture: null,
  });
  const [previewUrl, setPreviewUrl] = useState(userData?.profilePicture || "");
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (userData) {
      setFormData({
        name: userData.name || "",
        location: userData.location || "",
        education: userData.education || "",
        profilePicture: null,
      });
      setPreviewUrl(userData.profilePicture || "");
    }
  }, [userData]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const submitData = { ...formData };
    if (!submitData.profilePicture) {
      delete submitData.profilePicture;
    }
    onSave(submitData);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setIsUploading(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
        setFormData({ ...formData, profilePicture: file });
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">Edit Profile</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="flex flex-col items-center">
            <div className="relative">
              <img
                src={previewUrl || "https://via.placeholder.com/100"}
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover border-4 border-indigo-100"
              />
              <label className="absolute bottom-0 right-0 p-1.5 bg-indigo-600 rounded-full cursor-pointer hover:bg-indigo-700 transition-colors shadow-md">
                <Camera className="w-4 h-4 text-white" />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                  disabled={isUploading}
                />
              </label>
            </div>
            {isUploading && (
              <p className="text-xs text-gray-500 mt-2">Uploading...</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) =>
                setFormData({ ...formData, location: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="City, Country"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Education
            </label>
            <input
              type="text"
              value={formData.education}
              onChange={(e) =>
                setFormData({ ...formData, education: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="e.g., BS in Computer Science"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUpdating}
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUpdating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {isUpdating ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ==================== STAT CARD COMPONENT ====================
const StatCard = ({ icon: Icon, label, value, color }) => {
  const colorClasses = {
    indigo: "bg-indigo-50 text-indigo-600",
    green: "bg-green-50 text-green-600",
    purple: "bg-purple-50 text-purple-600",
    amber: "bg-amber-50 text-amber-600",
  };

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1">{label}</p>
          <p className="text-2xl font-bold text-gray-800">{value}</p>
        </div>
        <div
          className={`w-12 h-12 rounded-xl ${colorClasses[color]} flex items-center justify-center`}
        >
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};

// ==================== MAIN PROFILE COMPONENT ====================
const UserProfile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Get user from Redux store
  const { user: reduxUser, isAuthenticated } = useSelector(
    (state) => state.auth,
  );
  const [updateProfile] = useUpdateProfileMutation();
  const { refetch } = useLoadUserQuery(undefined, {
    skip: !isAuthenticated,
  });

  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [notification, setNotification] = useState(null);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Set user from Redux store
  useEffect(() => {
    if (reduxUser) {
      setUser(reduxUser);
    } else {
      // Try to load from localStorage
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
        } catch (error) {
          console.error("Error parsing stored user:", error);
        }
      }
    }
  }, [reduxUser]);

  // Check authentication and redirect if not logged in
  useEffect(() => {
    const checkAuth = () => {
      const storedAuth = localStorage.getItem("isAuthenticated");

      if (!isAuthenticated && storedAuth !== "true") {
        navigate("/login");
      }
    };

    checkAuth();
  }, [isAuthenticated, navigate]);

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleSaveProfile = async (updatedData) => {
    setIsUpdatingProfile(true);
    try {
      const result = await updateProfile(updatedData).unwrap();

      if (result.success && result.user) {
        // Update local state
        setUser(result.user);

        // Update Redux store
        dispatch(userLoggedIn({ user: result.user }));

        // Refetch user data to ensure everything is synced
        await refetch();

        showNotification("Profile updated successfully!", "success");

        // Close modal after successful update
        setIsEditModalOpen(false);
      }
    } catch (error) {
      console.error("Update error:", error);
      let errorMessage = "Failed to update profile";

      if (error.status === 404) {
        errorMessage = "User not found. Please login again.";
        setTimeout(() => navigate("/login"), 2000);
      } else if (error.data?.message) {
        errorMessage = error.data.message;
      }

      showNotification(errorMessage, "error");
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleContinueCourse = (course) => {
    showNotification(`Continuing: ${course.title}`, "info");
  };

  const handleSignOut = () => {
    dispatch(userLoggedOut());
    showNotification("Signed out successfully", "success");
    setTimeout(() => {
      navigate("/login");
    }, 500);
  };

  // Show loading state while checking authentication
  if (!isAuthenticated && !localStorage.getItem("isAuthenticated")) {
    return <ProfileSkeleton />;
  }

  // If no user data, show loading
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-indigo-600 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Loading Profile...
          </h2>
          <p className="text-gray-500">
            Please wait while we load your information
          </p>
        </div>
      </div>
    );
  }

  const memberSince = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : "Recently";

  const enrolledCourses = user.enrolledCourses || [];
  const completedCourses = enrolledCourses.filter(
    (c) => c.progress === 100,
  ).length;
  const avgProgress = enrolledCourses.length
    ? Math.round(
        enrolledCourses.reduce((acc, c) => acc + (c.progress || 0), 0) /
          enrolledCourses.length,
      )
    : 0;

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Notification Toast */}
      {notification && (
        <div className="fixed top-24 right-4 z-50 animate-slide-in">
          <div
            className={`flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg ${
              notification.type === "success"
                ? "bg-green-500"
                : notification.type === "error"
                  ? "bg-red-500"
                  : "bg-blue-500"
            } text-white`}
          >
            {notification.type === "success" ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <span className="text-sm">{notification.message}</span>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header Card */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-8 border border-gray-100">
          <div className="h-36 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

          <div className="relative px-6 pb-6">
            <div className="absolute -top-14 left-6">
              <div className="relative">
                <img
                  src={
                    user.profilePicture ||
                    `https://ui-avatars.com/api/?background=6366f1&color=fff&bold=true&size=112&name=${user.name?.charAt(0) || "U"}`
                  }
                  alt={user.name}
                  className="w-28 h-28 rounded-2xl object-cover border-4 border-white shadow-lg"
                />
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="absolute bottom-1 right-1 p-1.5 bg-indigo-600 rounded-full hover:bg-indigo-700 transition-colors shadow-md"
                >
                  <Camera className="w-3 h-3 text-white" />
                </button>
              </div>
            </div>

            <div className="pt-20 pl-36">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 flex-wrap mb-2">
                    <h1 className="text-2xl font-bold text-gray-800">
                      {user.name}
                    </h1>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.role === "admin"
                          ? "bg-purple-100 text-purple-700"
                          : user.role === "instructor"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-green-100 text-green-700"
                      }`}
                    >
                      {user.role?.charAt(0).toUpperCase() +
                        user.role?.slice(1) || "Student"}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Mail className="w-4 h-4" />
                      <span>{user.email}</span>
                    </div>
                    {user.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span>{user.location}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>Joined {memberSince}</span>
                    </div>
                  </div>

                  {user.education && (
                    <div className="flex items-center gap-2 mt-3 text-sm text-gray-600">
                      <GraduationCap className="w-4 h-4" />
                      <span>{user.education}</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setIsEditModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit Profile
                  </button>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={BookOpen}
            label="Total Courses"
            value={enrolledCourses.length}
            color="indigo"
          />
          <StatCard
            icon={CheckCircle}
            label="Completed"
            value={completedCourses}
            color="green"
          />
          <StatCard
            icon={TrendingUp}
            label="Avg Progress"
            value={`${avgProgress}%`}
            color="purple"
          />
          <StatCard
            icon={Award}
            label="Certificates"
            value={completedCourses}
            color="amber"
          />
        </div>

        {/* Tabs Navigation */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
          <div className="flex border-b border-gray-100 overflow-x-auto">
            {[
              { id: "overview", label: "Overview", icon: User },
              { id: "courses", label: "My Courses", icon: BookOpen },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 text-sm font-medium transition-colors relative flex items-center gap-2 whitespace-nowrap ${
                  activeTab === tab.id
                    ? "text-indigo-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-indigo-600" />
                  Recent Courses
                </h2>
                {enrolledCourses.length > 3 && (
                  <button
                    onClick={() => setActiveTab("courses")}
                    className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                  >
                    View All
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {enrolledCourses.slice(0, 3).map((course) => (
                  <EnrolledCourseCard
                    key={course._id}
                    course={course}
                    onContinue={handleContinueCourse}
                  />
                ))}
                {enrolledCourses.length === 0 && (
                  <div className="col-span-full text-center py-12">
                    <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No courses enrolled yet</p>
                    <button
                      onClick={() => navigate("/courses")}
                      className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      Browse Courses
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "courses" && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">
                All Enrolled Courses
              </h2>
              <span className="text-sm text-gray-500">
                {enrolledCourses.length} courses
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {enrolledCourses.map((course) => (
                <EnrolledCourseCard
                  key={course._id}
                  course={course}
                  onContinue={handleContinueCourse}
                />
              ))}
              {enrolledCourses.length === 0 && (
                <div className="col-span-full text-center py-12">
                  <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No courses enrolled yet</p>
                  <button
                    onClick={() => navigate("/courses")}
                    className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Browse Courses
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        userData={user}
        onSave={handleSaveProfile}
        isUpdating={isUpdatingProfile}
      />

      <style>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
        .line-clamp-1 {
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default UserProfile;
