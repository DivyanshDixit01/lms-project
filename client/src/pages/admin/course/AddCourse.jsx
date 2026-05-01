// pages/admin/course/AddCourse.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  Upload,
  Save,
  Plus,
  Trash2,
  AlertCircle,
} from "lucide-react";
import { useCreateCourseMutation } from "../../../features/api/courseApi";

const AddCourse = () => {
  const navigate = useNavigate();
  const [createCourse, { isLoading: isSubmitting }] = useCreateCourseMutation();

  const [formData, setFormData] = useState({
    courseTitle: "",
    subTitle: "",
    description: "",
    category: "",
    courseLevel: "Beginner",
    coursePrice: "",
    courseThumbnail: null,
  });

  const [errors, setErrors] = useState({});

  const categories = [
    "Frontend Development",
    "Backend Development",
    "Full Stack Development",
    "Mobile Development",
    "Data Science",
    "DevOps",
    "Cloud Computing",
    "Cybersecurity",
  ];

  const courseLevels = ["Beginner", "Intermediate", "Advanced"];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          courseThumbnail: "File size should be less than 5MB",
        }));
        return;
      }
      if (!file.type.startsWith("image/")) {
        setErrors((prev) => ({
          ...prev,
          courseThumbnail: "Please upload an image file",
        }));
        return;
      }
      setFormData((prev) => ({ ...prev, courseThumbnail: file }));
      setErrors((prev) => ({ ...prev, courseThumbnail: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.courseTitle)
      newErrors.courseTitle = "Course title is required";
    if (!formData.category) newErrors.category = "Category is required";
    if (!formData.courseLevel)
      newErrors.courseLevel = "Course level is required";
    if (!formData.coursePrice) newErrors.coursePrice = "Price is required";
    if (
      formData.coursePrice &&
      (isNaN(formData.coursePrice) || formData.coursePrice <= 0)
    ) {
      newErrors.coursePrice = "Price must be a positive number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Prepare data for API submission
  const prepareCourseData = () => {
    const formDataToSend = new FormData();

    formDataToSend.append("courseTitle", formData.courseTitle);
    formDataToSend.append("subTitle", formData.subTitle || "");
    formDataToSend.append("description", formData.description || "");
    formDataToSend.append("category", formData.category);
    formDataToSend.append("courseLevel", formData.courseLevel);
    formDataToSend.append("coursePrice", formData.coursePrice);

    if (formData.courseThumbnail) {
      formDataToSend.append("courseThumbnail", formData.courseThumbnail);
    }

    return formDataToSend;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const courseData = prepareCourseData();
      const result = await createCourse(courseData).unwrap();
      console.log("Course created successfully:", result);
      alert("Course created successfully!");
      navigate("/dashboard");
    } catch (error) {
      console.error("Error creating course:", error);
      if (error.data?.message) {
        alert(`Failed to create course: ${error.data.message}`);
      } else {
        alert("Failed to create course. Please try again.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            Create New Course
          </h1>
          <p className="text-gray-500 mt-2">
            Fill in the details to add a new course to your platform
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-600" />
              Basic Information
            </h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Course Title *
                </label>
                <input
                  type="text"
                  name="courseTitle"
                  value={formData.courseTitle}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                    errors.courseTitle ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="e.g., Mastering React.js"
                />
                {errors.courseTitle && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.courseTitle}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subtitle
                </label>
                <input
                  type="text"
                  name="subTitle"
                  value={formData.subTitle}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="e.g., Build modern web applications with React"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="4"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Course description..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                      errors.category ? "border-red-500" : "border-gray-300"
                    }`}
                  >
                    <option value="">Select a category</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                  {errors.category && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.category}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Course Level *
                  </label>
                  <select
                    name="courseLevel"
                    value={formData.courseLevel}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                      errors.courseLevel ? "border-red-500" : "border-gray-300"
                    }`}
                  >
                    {courseLevels.map((level) => (
                      <option key={level} value={level}>
                        {level}
                      </option>
                    ))}
                  </select>
                  {errors.courseLevel && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.courseLevel}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price ($) *
                </label>
                <input
                  type="number"
                  name="coursePrice"
                  value={formData.coursePrice}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                    errors.coursePrice ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="49.99"
                  step="0.01"
                />
                {errors.coursePrice && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.coursePrice}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Course Thumbnail *
                </label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors">
                    <Upload className="w-4 h-4" />
                    <span>Upload Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                  {formData.courseThumbnail && (
                    <span className="text-sm text-gray-600">
                      {formData.courseThumbnail.name}
                    </span>
                  )}
                </div>
                {errors.courseThumbnail && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.courseThumbnail}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {isSubmitting ? "Creating..." : "Create Course"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCourse;
