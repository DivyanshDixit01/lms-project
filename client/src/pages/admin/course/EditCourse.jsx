// pages/admin/course/EditCourse.js
import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  BookOpen,
  Upload,
  Save,
  X,
  AlertCircle,
  Loader,
  Trash2,
  Plus,
  Video,
  Clock,
  Link as LinkIcon,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  FileText,
} from "lucide-react";
import {
  useGetCourseByIdQuery,
  useUpdateCourseMutation,
  useUpdateCourseStatusMutation,
} from "../../../features/api/courseApi";

const EditCourse = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [updateCourse, { isLoading: isUpdating }] = useUpdateCourseMutation();
  const [updateCourseStatus] = useUpdateCourseStatusMutation();
  const {
    data: courseData,
    isLoading: isLoadingCourse,
    refetch,
  } = useGetCourseByIdQuery(courseId);

  const [formData, setFormData] = useState({
    courseTitle: "",
    subTitle: "",
    description: "",
    category: "",
    courseLevel: "Beginner",
    coursePrice: "",
    courseThumbnail: null,
    isPublished: false,
  });

  const [errors, setErrors] = useState({});
  const [thumbnailPreview, setThumbnailPreview] = useState("");
  const [activeSection, setActiveSection] = useState(null);

  const categories = [
    "Frontend Development",
    "Backend Development",
    "Full Stack Development",
    "Mobile Development",
    "Data Science",
    "DevOps",
    "Cloud Computing",
    "Cybersecurity",
    "Artificial Intelligence",
    "Machine Learning",
  ];

  const courseLevels = ["Beginner", "Intermediate", "Advanced"];

  useEffect(() => {
    if (courseData?.course) {
      const course = courseData.course;
      setFormData({
        courseTitle: course.courseTitle || "",
        subTitle: course.subTitle || "",
        description: course.description || "",
        category: course.category || "",
        courseLevel: course.courseLevel || "Beginner",
        coursePrice: course.coursePrice || "",
        courseThumbnail: null,
        isPublished: course.isPublished || false,
      });
      if (course.courseThumbnail) {
        setThumbnailPreview(`http://localhost:5000${course.courseThumbnail}`);
      }
    }
  }, [courseData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
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
      setThumbnailPreview(URL.createObjectURL(file));
      setErrors((prev) => ({ ...prev, courseThumbnail: "" }));
    }
  };

  const removeThumbnail = () => {
    setFormData((prev) => ({ ...prev, courseThumbnail: null }));
    setThumbnailPreview("");
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

  const prepareCourseData = () => {
    const formDataToSend = new FormData();

    formDataToSend.append("courseTitle", formData.courseTitle);
    formDataToSend.append("subTitle", formData.subTitle || "");
    formDataToSend.append("description", formData.description || "");
    formDataToSend.append("category", formData.category);
    formDataToSend.append("courseLevel", formData.courseLevel);
    formDataToSend.append("coursePrice", formData.coursePrice);
    formDataToSend.append("isPublished", formData.isPublished);

    if (formData.courseThumbnail) {
      formDataToSend.append("courseThumbnail", formData.courseThumbnail);
    }

    return formDataToSend;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const courseDataToSend = prepareCourseData();
      await updateCourse({
        id: courseId,
        body: courseDataToSend,
      }).unwrap();

      alert("Course updated successfully!");
      setTimeout(() => {
        navigate("/dashboard");
      }, 1500);
    } catch (error) {
      console.error("Error updating course:", error);
      alert(
        error.data?.message || "Failed to update course. Please try again.",
      );
    }
  };

  const handleTogglePublish = async () => {
    try {
      const newStatus = !formData.isPublished;
      await updateCourseStatus({
        id: courseId,
        isPublished: newStatus,
      }).unwrap();
      setFormData((prev) => ({ ...prev, isPublished: newStatus }));
      alert(`Course ${newStatus ? "published" : "unpublished"} successfully!`);
      refetch();
    } catch (error) {
      console.error("Error toggling publish status:", error);
      alert("Failed to update course status. Please try again.");
    }
  };

  const handleAddSection = () => {
    const sectionTitle = prompt("Enter section title:");
    if (!sectionTitle) return;

    const updatedSections = [
      ...(courseData?.course?.sections || []),
      {
        title: sectionTitle,
        lectures: [],
        _id: Date.now().toString(),
      },
    ];

    updateCourse({
      id: courseId,
      sections: updatedSections,
    })
      .unwrap()
      .then(() => {
        alert("Section added successfully!");
        refetch();
      })
      .catch((error) => {
        alert("Failed to add section");
        console.error(error);
      });
  };

  const handleRemoveSection = (sectionIndex) => {
    if (
      window.confirm(
        "Are you sure you want to remove this section? All lectures will be deleted.",
      )
    ) {
      const updatedSections = [...(courseData?.course?.sections || [])];
      updatedSections.splice(sectionIndex, 1);

      updateCourse({
        id: courseId,
        sections: updatedSections,
      })
        .unwrap()
        .then(() => {
          alert("Section removed successfully!");
          refetch();
        })
        .catch((error) => {
          alert("Failed to remove section");
          console.error(error);
        });
    }
  };

  if (isLoadingCourse) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading course data...</p>
        </div>
      </div>
    );
  }

  if (!courseData?.course) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
            <h2 className="text-xl font-semibold text-red-700 mb-2">
              Course Not Found
            </h2>
            <p className="text-red-600 mb-4">
              The course you're trying to edit doesn't exist.
            </p>
            <button
              onClick={() => navigate("/dashboard")}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  const course = courseData.course;
  const sections = course.sections || [];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Edit Course</h1>
              <p className="text-gray-500 mt-2">
                Update your course information and manage content
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleTogglePublish}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  formData.isPublished
                    ? "bg-green-100 text-green-700 hover:bg-green-200"
                    : "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                }`}
              >
                {formData.isPublished ? (
                  <>
                    <Eye className="w-4 h-4" />
                    <span>Published</span>
                  </>
                ) : (
                  <>
                    <EyeOff className="w-4 h-4" />
                    <span>Draft</span>
                  </>
                )}
              </button>
              <Link
                to={`/dashboard/edit-course/${courseId}/lectures`}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <FileText className="w-4 h-4" />
                Manage Lectures
              </Link>
            </div>
          </div>
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
                  Course Thumbnail
                </label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors">
                    <Upload className="w-4 h-4" />
                    <span>Upload New Image</span>
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
                  {thumbnailPreview && (
                    <button
                      type="button"
                      onClick={removeThumbnail}
                      className="text-red-600 hover:text-red-800"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                {thumbnailPreview && (
                  <div className="mt-4">
                    <img
                      src={thumbnailPreview}
                      alt="Preview"
                      className="w-32 h-32 object-cover rounded-lg"
                    />
                  </div>
                )}
                {errors.courseThumbnail && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.courseThumbnail}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Course Content Preview */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <Video className="w-5 h-5 text-indigo-600" />
                Course Content Preview
              </h2>
              <button
                type="button"
                onClick={handleAddSection}
                className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm"
              >
                <Plus className="w-4 h-4" />
                Add Section
              </button>
            </div>

            {sections.length === 0 ? (
              <div className="text-center py-8">
                <Video className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No sections added yet</p>
                <button
                  type="button"
                  onClick={handleAddSection}
                  className="mt-3 text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                >
                  Add your first section
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {sections.map((section, sectionIndex) => (
                  <div
                    key={section._id || sectionIndex}
                    className="border border-gray-200 rounded-lg overflow-hidden"
                  >
                    <div
                      className="flex justify-between items-center p-4 bg-gray-50 cursor-pointer hover:bg-gray-100"
                      onClick={() =>
                        setActiveSection(
                          activeSection === sectionIndex ? null : sectionIndex,
                        )
                      }
                    >
                      <div className="flex items-center gap-2">
                        {activeSection === sectionIndex ? (
                          <ChevronUp className="w-5 h-5 text-gray-500" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-500" />
                        )}
                        <h3 className="font-semibold text-gray-800">
                          {section.title}
                        </h3>
                        <span className="text-sm text-gray-500">
                          ({section.lectures?.length || 0} lectures)
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveSection(sectionIndex);
                        }}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {activeSection === sectionIndex && (
                      <div className="p-4">
                        <div className="space-y-2">
                          {section.lectures?.map((lecture, lectureIndex) => (
                            <div
                              key={lecture._id || lectureIndex}
                              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
                            >
                              <div className="flex items-center gap-3 flex-1">
                                <Video className="w-4 h-4 text-gray-400" />
                                <div>
                                  <p className="font-medium text-gray-800">
                                    {lecture.lectureTitle || lecture.title}
                                  </p>
                                  <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                                    <span className="flex items-center gap-1">
                                      <LinkIcon className="w-3 h-3" />
                                      {lecture.videoUrl}
                                    </span>
                                    {lecture.duration && (
                                      <span className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {lecture.duration}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <Link
                                to={`/dashboard/edit-course/${courseId}/lectures/${lecture._id}/edit`}
                                className="text-indigo-600 hover:text-indigo-800 mr-2"
                              >
                                Edit
                              </Link>
                            </div>
                          ))}
                        </div>
                        <div className="mt-4">
                          <Link
                            to={`/dashboard/edit-course/${courseId}/lectures`}
                            className="inline-flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-800"
                          >
                            <Plus className="w-4 h-4" />
                            Manage all lectures
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
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
              disabled={isUpdating}
              className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUpdating ? (
                <Loader className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {isUpdating ? "Updating..." : "Update Course"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditCourse;
