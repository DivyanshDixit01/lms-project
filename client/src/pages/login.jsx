// AuthPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  useRegisterUserMutation,
  useLoginUserMutation,
} from "../features/api/authApi";
//import { useDispatch } from "react-redux";
//import { userLoggedIn } from "../features/authSlice";

// Image Panel Component (declared outside render)
const ImagePanel = ({
  imageError,
  setImageError,
  imageUrl,
  fallbackImageUrl,
}) => (
  <div className="md:w-2/5 h-80 md:h-auto min-h-80 relative overflow-hidden bg-linear-to-br from-indigo-600 to-purple-600">
    {!imageError ? (
      <img
        src={imageUrl}
        alt="Authentication visual"
        className="absolute inset-0 w-full h-full object-cover"
        onError={() => setImageError(true)}
      />
    ) : (
      <img
        src={fallbackImageUrl}
        alt="Authentication visual"
        className="absolute inset-0 w-full h-full object-cover"
      />
    )}
    {/* Gradient overlay for better text visibility */}
    <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/30 to-transparent"></div>

    {/* Content overlay */}
    <div className="relative z-10 h-full flex flex-col justify-between p-6 text-white">
      <div>
        <div className="mb-4">
          <svg
            className="w-10 h-10 mb-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>
          <h2 className="text-2xl font-bold mb-2">Welcome</h2>
          <p className="text-white/90 text-sm">
            Join our community and experience seamless authentication
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2 text-center">
          <div className="text-xl font-bold">10K+</div>
          <div className="text-xs text-white/80">Active Users</div>
        </div>
        <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2 text-center">
          <div className="text-xl font-bold">99%</div>
          <div className="text-xs text-white/80">Satisfaction</div>
        </div>
      </div>

      {/* Testimonial */}
      <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
        <div className="flex items-center gap-1 mb-1">
          {[...Array(5)].map((_, i) => (
            <svg
              key={i}
              className="w-3 h-3 text-yellow-400 fill-current"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
        </div>
        <p className="text-white text-xs">
          "Amazing platform! Best experience ever."
        </p>
        <p className="text-white/70 text-xs mt-1">- Sarah Johnson</p>
      </div>
    </div>
  </div>
);

// Form Panel Component (declared outside render)
const FormPanel = ({
  isLogin,
  formData,
  errors,
  showPassword,
  isLoading,
  handleChange,
  handleSubmit,
  handleGoogleSignIn,
  setShowPassword,
  toggleForm,
}) => (
  <div className="md:w-3/5 p-6 md:p-8 overflow-y-auto max-h-150 md:max-h-none">
    {/* Header */}
    <div className="text-center mb-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">
        {isLogin ? "Welcome back" : "Create an account"}
      </h1>
      <p className="text-gray-500 text-sm">
        {isLogin ? "Sign in to your account" : "Join us and start your journey"}
      </p>
    </div>

    {/* Google Sign In Button */}
    <button
      onClick={handleGoogleSignIn}
      className="w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-200 mb-5"
    >
      <svg className="w-5 h-5" viewBox="0 0 24 24">
        <path
          fill="#4285F4"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
          fill="#34A853"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
          fill="#FBBC05"
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        />
        <path
          fill="#EA4335"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        />
      </svg>
      <span className="text-gray-700 font-medium text-sm">
        {isLogin ? "Sign in with Google" : "Create account with Google"}
      </span>
    </button>

    {/* Divider */}
    <div className="relative mb-5">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-gray-200"></div>
      </div>
      <div className="relative flex justify-center text-sm">
        <span className="px-4 bg-white text-gray-400 text-xs">Or</span>
      </div>
    </div>

    {/* Form */}
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* For Signup: Name and Email in same row */}
      {!isLogin ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Full Name Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm ${
                errors.fullName ? "border-red-500" : "border-gray-200"
              }`}
              placeholder="Enter your full name"
            />
            {errors.fullName && (
              <p className="mt-1 text-xs text-red-500">{errors.fullName}</p>
            )}
          </div>

          {/* Email Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm ${
                errors.email ? "border-red-500" : "border-gray-200"
              }`}
              placeholder="Enter your email address"
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-500">{errors.email}</p>
            )}
          </div>
        </div>
      ) : (
        /* For Login: Email field only */
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Email Address
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm ${
              errors.email ? "border-red-500" : "border-gray-200"
            }`}
            placeholder="Enter your email address"
          />
          {errors.email && (
            <p className="mt-1 text-xs text-red-500">{errors.email}</p>
          )}
        </div>
      )}

      {/* Password Field */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Password
        </label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            value={formData.password}
            onChange={handleChange}
            className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm ${
              errors.password ? "border-red-500" : "border-gray-200"
            }`}
            placeholder={
              isLogin
                ? "Enter your password"
                : "Create your password (min. 6 characters)"
            }
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showPassword ? (
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            ) : (
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                />
              </svg>
            )}
          </button>
        </div>
        {errors.password && (
          <p className="mt-1 text-xs text-red-500">{errors.password}</p>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-indigo-600 text-white py-2.5 rounded-xl font-semibold hover:bg-indigo-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-5"
      >
        {isLoading ? (
          <div className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span className="text-sm">Processing...</span>
          </div>
        ) : (
          <span className="text-sm">
            {isLogin ? "Sign in" : "Create an account"}
          </span>
        )}
      </button>
    </form>

    {/* Toggle Link */}
    <div className="mt-5 text-center">
      <p className="text-gray-600 text-sm">
        {isLogin ? "Don't have an account? " : "Already have an account? "}
        <button
          onClick={toggleForm}
          className="text-indigo-600 font-semibold hover:text-indigo-700 hover:underline transition-all"
        >
          {isLogin ? "Create an account" : "Login"}
        </button>
      </p>
    </div>
  </div>
);

// Main AuthPage Component
const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    fullName: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [imageError, setImageError] = useState(false);

  // RTK Query hooks
  const [registerUser, { isLoading: isRegisterLoading }] =
    useRegisterUserMutation();
  const [loginUser, { isLoading: isLoginLoading }] = useLoginUserMutation();
  //const dispatch = useDispatch();
  const navigate = useNavigate();

  const isLoading = isRegisterLoading || isLoginLoading;

  const toggleForm = () => {
    setIsLogin(!isLogin);
    setFormData({
      email: "",
      fullName: "",
      password: "",
    });
    setErrors({});
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateLogin = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Invalid email format";

    if (!formData.password) newErrors.password = "Password is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateSignup = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Invalid email format";

    if (!formData.fullName) newErrors.fullName = "Full name is required";

    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const isValid = isLogin ? validateLogin() : validateSignup();

    if (isValid) {
      try {
        if (isLogin) {
          // Login user
          const result = await loginUser({
            email: formData.email,
            password: formData.password,
          }).unwrap();

          console.log("Login successful:", result);
          alert("Login successful! 🎉");

          // Navigate based on user role
          const userRole = result.user?.role;
          if (userRole === "admin") {
            navigate("/admin");
          } else if (userRole === "instructor") {
            navigate("/dashboard");
          } else {
            navigate("/");
          }
        } else {
          // Register user
          const result = await registerUser({
            name: formData.fullName,
            email: formData.email,
            password: formData.password,
          }).unwrap();

          console.log("Registration successful:", result);
          alert("Account created successfully! 🎉");

          // Navigate to home page after successful registration
          navigate("/");
        }
      } catch (error) {
        console.error("Authentication error:", error);
        // Handle error response from server
        if (error.data && error.data.message) {
          alert(error.data.message);
        } else {
          alert(
            isLogin
              ? "Login failed. Please try again."
              : "Registration failed. Please try again.",
          );
        }
      }
    }
  };

  const handleGoogleSignIn = () => {
    alert("Google sign in clicked");
  };

  // Working image URL (using a reliable image from Pexels)
  const imageUrl =
    "https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop";

  // Fallback image in case main image fails to load
  const fallbackImageUrl =
    "https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop";

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-200 to-gray-400 flex items-center justify-center p-4">
      {/* Main Card - Fixed size container */}
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="flex flex-col md:flex-row">
          {/* Conditional rendering based on isLogin */}
          {isLogin ? (
            // Login Mode: Image on Left, Form on Right
            <>
              <ImagePanel
                imageError={imageError}
                setImageError={setImageError}
                imageUrl={imageUrl}
                fallbackImageUrl={fallbackImageUrl}
              />
              <FormPanel
                isLogin={isLogin}
                formData={formData}
                errors={errors}
                showPassword={showPassword}
                isLoading={isLoading}
                handleChange={handleChange}
                handleSubmit={handleSubmit}
                handleGoogleSignIn={handleGoogleSignIn}
                setShowPassword={setShowPassword}
                toggleForm={toggleForm}
              />
            </>
          ) : (
            // Signup Mode: Form on Left, Image on Right
            <>
              <FormPanel
                isLogin={isLogin}
                formData={formData}
                errors={errors}
                showPassword={showPassword}
                isLoading={isLoading}
                handleChange={handleChange}
                handleSubmit={handleSubmit}
                handleGoogleSignIn={handleGoogleSignIn}
                setShowPassword={setShowPassword}
                toggleForm={toggleForm}
              />
              <ImagePanel
                imageError={imageError}
                setImageError={setImageError}
                imageUrl={imageUrl}
                fallbackImageUrl={fallbackImageUrl}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
