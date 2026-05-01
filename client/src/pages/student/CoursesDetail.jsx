// pages/student/CourseDetail.js
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGetPublicCourseByIdQuery } from "../../features/api/courseApi";
import { useCheckPurchaseStatusQuery } from "../../features/api/purchaseApi";
import PaymentButton from "../../components/PaymentButton";
import ReportContentModal from "../../components/ReportContentModal";
import CourseReviews from "../../components/CourseReviews";
import {
  ArrowLeft,
  Clock,
  Users,
  Star,
  BookOpen,
  Play,
  Video,
  Lock,
  CheckCircle,
  User,
  FileText,
  Loader,
  AlertCircle,
  Eye,
  Award,
  Shield,
  Infinity,
  Download,
  Share2,
  Heart,
  MessageCircle,
  Flag,
} from "lucide-react";

const CourseDetail = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [selectedLecture, setSelectedLecture] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [reportModal, setReportModal] = useState({
    isOpen: false,
    contentId: null,
    contentType: null,
    contentTitle: null,
  });

  // Fetch course details
  const {
    data: courseData,
    isLoading,
    error,
    refetch: refetchCourse,
  } = useGetPublicCourseByIdQuery(courseId);

  // Check if user has purchased this course
  const { data: purchaseStatus, isLoading: checkingPurchase } =
    useCheckPurchaseStatusQuery(courseId, { skip: !courseId });

  // Set enrollment status based on purchase
  useEffect(() => {
    if (purchaseStatus?.isPurchased) {
      setIsEnrolled(true);
    }
  }, [purchaseStatus]);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (courseData?.course?.lectures?.length > 0 && !selectedLecture) {
      const firstPreview = courseData.course.lectures.find(
        (l) => l.isPreviewFree,
      );
      setSelectedLecture(firstPreview || courseData.course.lectures[0]);
    }
  }, [courseData]);

  const formatDuration = (seconds) => {
    if (!seconds) return "N/A";
    const minutes = Math.floor(seconds / 60);
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const rem = minutes % 60;
      return `${hours}h ${rem}m`;
    }
    return `${minutes}m`;
  };

  const getThumbnailUrl = () => {
    if (!courseData?.course?.courseThumbnail)
      return "https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?w=800&h=400&fit=crop";
    let t = courseData.course.courseThumbnail;
    if (t.startsWith("http")) return t;
    return `http://localhost:5000${t}`;
  };

  const getVideoUrl = (lecture) => {
    if (!lecture?.videoUrl) return null;
    let url = lecture.videoUrl;
    if (url.includes("youtube.com/watch") || url.includes("youtu.be")) {
      const id = url.includes("v=")
        ? url.split("v=")[1]?.split("&")[0]
        : url.split("/").pop();
      return `https://www.youtube.com/embed/${id}`;
    }
    if (url.includes("vimeo.com"))
      return `https://player.vimeo.com/video/${url.split("/").pop()}`;
    if (url.startsWith("http")) return url;
    return `http://localhost:5000${url}`;
  };

  // Handle successful payment - navigate to course progress page
  const handlePaymentSuccess = () => {
    setIsEnrolled(true);
    refetchCourse();
    // Navigate to course progress page after successful payment
    navigate(`/course-progress/${courseId}`);
  };

  // Handle "Start Learning" button click for already enrolled users
  const handleStartLearning = () => {
    navigate(`/course-progress/${courseId}`);
  };

  const handleReportClick = (contentId, contentType, contentTitle) => {
    setReportModal({
      isOpen: true,
      contentId,
      contentType,
      contentTitle,
    });
  };

  const handleCloseReportModal = () => {
    setReportModal({
      isOpen: false,
      contentId: null,
      contentType: null,
      contentTitle: null,
    });
  };

  if (isLoading || checkingPurchase) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Loading course...</p>
        </div>
      </div>
    );
  }

  if (error || !courseData?.course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-sm p-6 max-w-md text-center">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h2 className="text-lg font-semibold text-gray-800 mb-1">
            Course Not Found
          </h2>
          <p className="text-gray-500 text-sm mb-4">
            The course you're looking for doesn't exist.
          </p>
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const course = courseData.course;
  const lectures = course.lectures || [];
  const totalLectures = lectures.length;
  const totalDuration = lectures.reduce((s, l) => s + (l.duration || 0), 0);
  const previewLectures = lectures.filter((l) => l.isPreviewFree).length;
  const enrolledCount = course.enrolledStudents?.length || 0;
  const ratingCount = course.totalRatings || 0;

  return (
    <div className="bg-gray-50 min-h-screen mt-13">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-1 text-gray-500 hover:text-gray-700 mb-4 text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to courses
          </button>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <div className="flex flex-wrap gap-2 mb-3">
                <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded">
                  {course.category}
                </span>
                <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                  {course.courseLevel}
                </span>
                {previewLectures > 0 && (
                  <span className="px-2 py-0.5 bg-green-50 text-green-700 text-xs rounded flex items-center gap-1">
                    <Eye className="w-3 h-3" /> {previewLectures} free previews
                  </span>
                )}
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                {course.courseTitle}
              </h1>
              {course.subTitle && (
                <p className="text-gray-600 text-sm mb-3">{course.subTitle}</p>
              )}
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span className="font-medium text-gray-700">
                    {course.rating || "New"}
                  </span>
                  {ratingCount > 0 && <span>({ratingCount} ratings)</span>}
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {enrolledCount} students
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {formatDuration(totalDuration)}
                </div>
                <div className="flex items-center gap-1">
                  <Video className="w-4 h-4" />
                  {totalLectures} lessons
                </div>
              </div>
            </div>

            <div>
              <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                <div className="mb-2">
                  <span className="text-2xl font-bold text-gray-900">
                    ${course.coursePrice}
                  </span>
                </div>
                {!isEnrolled ? (
                  <PaymentButton
                    courseId={course._id}
                    coursePrice={course.coursePrice}
                    courseTitle={course.courseTitle}
                    courseThumbnail={course.courseThumbnail}
                    onSuccess={handlePaymentSuccess}
                  />
                ) : (
                  <button
                    onClick={handleStartLearning}
                    className="w-full bg-green-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition mb-3 flex items-center justify-center gap-2"
                  >
                    <Play className="w-4 h-4" />
                    Start Learning
                  </button>
                )}
                <div className="grid grid-cols-3 gap-2 text-xs text-gray-500 pt-3 border-t border-gray-100">
                  <div className="text-center">
                    <Shield className="w-4 h-4 mx-auto mb-1" />
                    30-day guarantee
                  </div>
                  <div className="text-center">
                    <Infinity className="w-4 h-4 mx-auto mb-1" />
                    Lifetime access
                  </div>
                  <div className="text-center">
                    <Download className="w-4 h-4 mx-auto mb-1" />
                    Resources
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => setIsSaved(!isSaved)}
                    className="flex-1 flex items-center justify-center gap-1 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-600 hover:bg-gray-50"
                  >
                    <Heart
                      className={`w-3 h-3 ${isSaved ? "fill-red-500 text-red-500" : ""}`}
                    />{" "}
                    Save
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-1 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-600 hover:bg-gray-50">
                    <Share2 className="w-3 h-3" /> Share
                  </button>
                  <button
                    onClick={() =>
                      handleReportClick(courseId, "course_description", course.courseTitle)
                    }
                    className="flex-1 flex items-center justify-center gap-1 py-1.5 border border-red-200 rounded-lg text-xs text-red-600 hover:bg-red-50"
                    title="Report this course"
                  >
                    <Flag className="w-3 h-3" /> Report
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Rest of the component remains the same... */}
      {/* Course Stats Bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-4 divide-x divide-gray-200">
            <div className="py-3 text-center">
              <FileText className="w-4 h-4 text-gray-400 mx-auto mb-1" />
              <div className="text-sm font-semibold text-gray-800">
                {totalLectures}
              </div>
              <div className="text-xs text-gray-500">Lessons</div>
            </div>
            <div className="py-3 text-center">
              <Clock className="w-4 h-4 text-gray-400 mx-auto mb-1" />
              <div className="text-sm font-semibold text-gray-800">
                {formatDuration(totalDuration)}
              </div>
              <div className="text-xs text-gray-500">Duration</div>
            </div>
            <div className="py-3 text-center">
              <Eye className="w-4 h-4 text-gray-400 mx-auto mb-1" />
              <div className="text-sm font-semibold text-gray-800">
                {previewLectures}
              </div>
              <div className="text-xs text-gray-500">Free previews</div>
            </div>
            <div className="py-3 text-center">
              <Users className="w-4 h-4 text-gray-400 mx-auto mb-1" />
              <div className="text-sm font-semibold text-gray-800">
                {enrolledCount}
              </div>
              <div className="text-xs text-gray-500">Students</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {/* Tabs */}
            <div className="border-b border-gray-200 mb-5">
              <div className="flex gap-5">
                {[
                  { id: "overview", label: "Overview", icon: BookOpen },
                  { id: "curriculum", label: "Curriculum", icon: FileText },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`pb-2 text-sm font-medium transition ${
                      activeTab === tab.id
                        ? "text-blue-600 border-b-2 border-blue-600"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <tab.icon className="w-4 h-4" />
                      {tab.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-base font-semibold text-gray-800 mb-2">
                    About this course
                  </h2>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {course.description || "No description available."}
                  </p>
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  {[
                    {
                      icon: Award,
                      title: "Certificate",
                      text: "Earn on completion",
                    },
                    {
                      icon: Award,
                      title: "Skill level",
                      text: course.courseLevel,
                    },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="flex gap-2 p-3 bg-white border border-gray-100 rounded-lg"
                    >
                      <item.icon className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-gray-800 text-xs">
                          {item.title}
                        </p>
                        <p className="text-xs text-gray-500">{item.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Curriculum Tab */}
            {activeTab === "curriculum" && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-base font-semibold text-gray-800">
                    Course curriculum
                  </h2>
                  <span className="text-xs text-gray-500">
                    {totalLectures} lessons • {formatDuration(totalDuration)}
                  </span>
                </div>
                {lectures.length === 0 ? (
                  <div className="text-center py-8 border border-dashed rounded-lg">
                    <Video className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-400 text-sm">No lessons yet</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {lectures.map((lecture, index) => {
                      const canAccess = isEnrolled || lecture.isPreviewFree;
                      const isSelected = selectedLecture?._id === lecture._id;
                      return (
                        <div
                          key={lecture._id || index}
                          onClick={() =>
                            canAccess && setSelectedLecture(lecture)
                          }
                          className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition ${
                            isSelected
                              ? "bg-blue-50 border border-blue-100"
                              : "hover:bg-gray-50 border border-transparent"
                          } ${!canAccess ? "opacity-60" : ""}`}
                        >
                          <div className="flex items-center gap-3 flex-1">
                            <div
                              className={`w-7 h-7 rounded-lg flex items-center justify-center ${canAccess ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-400"}`}
                            >
                              {canAccess ? (
                                <Play className="w-3 h-3" />
                              ) : (
                                <Lock className="w-3 h-3" />
                              )}
                            </div>
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-medium text-gray-800 text-sm">
                                  {lecture.lectureTitle}
                                </span>
                                {lecture.isPreviewFree && !isEnrolled && (
                                  <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded">
                                    Preview
                                  </span>
                                )}
                              </div>
                              <span className="text-xs text-gray-400">
                                {formatDuration(lecture.duration)}
                              </span>
                            </div>
                          </div>
                          {isSelected && canAccess && (
                            <span className="text-[10px] font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded">
                              Now playing
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Video Player */}
            {selectedLecture && (
              <div className="bg-gray-900 rounded-lg overflow-hidden">
                <div className="aspect-video">
                  {getVideoUrl(selectedLecture) ? (
                    <iframe
                      src={getVideoUrl(selectedLecture)}
                      className="w-full h-full"
                      title={selectedLecture.lectureTitle}
                      frameBorder="0"
                      allowFullScreen
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500 bg-gray-800">
                      <Video className="w-8 h-8" />
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <h3 className="text-white text-sm font-medium">
                    {selectedLecture.lectureTitle}
                  </h3>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-gray-400 text-xs">
                      {formatDuration(selectedLecture.duration)}
                    </span>
                    {selectedLecture.isPreviewFree && !isEnrolled && (
                      <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded">
                        Free Preview
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Instructor */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <User className="w-4 h-4 text-blue-600" />
                Instructor
              </h3>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-medium text-sm">
                    {course.creator?.name?.charAt(0) || "I"}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-800 text-sm">
                    {course.creator?.name || "Instructor"}
                  </p>
                  <p className="text-xs text-gray-500">Course Creator</p>
                </div>
              </div>
              <button className="w-full mt-3 flex items-center justify-center gap-1 border border-gray-200 text-gray-600 py-1.5 rounded-lg text-xs hover:bg-gray-50">
                <MessageCircle className="w-3 h-3" /> Contact
              </button>
            </div>

            {/* Bonus */}
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <Award className="w-4 h-4 text-blue-600 mt-0.5" />
                <div>
                  <h3 className="text-sm font-semibold text-gray-800 mb-1">
                    What's included
                  </h3>
                  <div className="space-y-1 text-xs text-gray-600">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3 text-green-600" />
                      Certificate of completion
                    </div>
                    <div className="flex items-center gap-2">
                      <Download className="w-3 h-3 text-green-600" />
                      Downloadable resources
                    </div>
                    <div className="flex items-center gap-2">
                      <Infinity className="w-3 h-3 text-green-600" />
                      Lifetime access
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <CourseReviews
          courseId={courseId}
          isEnrolled={isEnrolled}
          onReportClick={handleReportClick}
        />
      </div>

      {/* Report Modal */}
      <ReportContentModal
        isOpen={reportModal.isOpen}
        onClose={handleCloseReportModal}
        contentId={reportModal.contentId}
        contentType={reportModal.contentType}
        contentTitle={reportModal.contentTitle}
      />
    </div>
  );
};

export default CourseDetail;
