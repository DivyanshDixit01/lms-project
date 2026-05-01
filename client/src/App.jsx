import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { Provider, useSelector } from "react-redux";
import { store } from "../src/app/store"; // Import your Redux store
import { useEffect } from "react";
import Login from "./pages/login";
import MainLayout from "./layout/MainLayout";
import AdminLayout from "./layout/AdminLayout";
import HeroSection from "./pages/student/HeroSection";
import Courses from "./pages/student/Courses";
import Profile from "./pages/student/Profile";
import MyCourses from "./pages/student/MyCourses";
import AboutUs from "./pages/student/AboutUs";
import Sidebar from "./pages/admin/Sidebar";
import Dashboard from "./pages/admin/Dashboard";
import AdminDashboard from "./pages/admin/AdminDashboard";
import UserManagement from "./pages/admin/UserManagement";
import CourseManagement from "./pages/admin/CourseManagement";
import CreateCourse from "./pages/admin/course/AddCourse";
import EditCourse from "./pages/admin/course/EditCourse";
import Lectures from "./pages/admin/lecture/Lecture";
import CreateLecture from "./pages/admin/lecture/CreateLecture";
import EditLecture from "./pages/admin/lecture/EditLecture";
import CourseDetail from "./pages/student/CoursesDetail";
import CourseProgress from "./pages/student/CourseProgress";
import PaymentManagement from "./pages/admin/PaymentManagement";
import Moderation from "./pages/admin/Moderation";
import Analytics from "./pages/admin/Analytics";
import { ProtectedRoute } from "./components/ProtectedRoutes";

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: (
          <>
            <HeroSection />
            <Courses />
            <AboutUs />
          </>
        ),
      },
      {
        path: "courses",
        element: <Courses />,
      },
      {
        path: "about",
        element: <AboutUs />,
      },
      // Protected student routes
      {
        path: "profile",
        element: (
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        ),
      },
      {
        path: "my-courses",
        element: (
          <ProtectedRoute>
            <MyCourses />
          </ProtectedRoute>
        ),
      },
      {
        path: "course/:courseId",
        element: (
          <ProtectedRoute>
            <CourseDetail />
          </ProtectedRoute>
        ),
      },
      {
        path: "course-progress/:courseId",
        element: (
          <ProtectedRoute>
            <CourseProgress />
          </ProtectedRoute>
        ),
      },
    ],
  },
  {
    path: "/admin",
    element: (
      <ProtectedRoute requiredRole="admin">
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <AdminDashboard />,
      },
      {
        path: "users",
        element: <UserManagement />,
      },
      {
        path: "courses",
        element: <CourseManagement />,
      },
      {
        path: "payments",
        element: <PaymentManagement />, // Placeholder - will create PaymentManagement component
      },
      {
        path: "analytics",
        element: <Analytics />, // Placeholder - will create Analytics component
      },
      {
        path: "moderation",
        element: <Moderation />, // Placeholder - will create Moderation component
      },
    ],
  },
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute requiredRole="instructor">
        <Sidebar />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: "create-course",
        element: <CreateCourse />,
      },
      {
        path: "edit-course/:courseId",
        element: <EditCourse />,
      },
      {
        path: "edit-course/:courseId/lectures",
        element: <Lectures />,
      },
      {
        path: "edit-course/:courseId/lectures/create",
        element: <CreateLecture />,
      },
      {
        path: "edit-course/:courseId/lectures/:lectureId/edit",
        element: <EditLecture />,
      },
      {
        path: "payments",
        element: <PaymentManagement />,
      },
      {
        path: "moderation",
        element: <Moderation />,
      },
      {
        path: "analytics",
        element: <Analytics />,
      },
    ],
  },
  {
    path: "/login",
    element: <Login />,
  },
]);

// Theme Provider Component
const ThemeProvider = ({ children }) => {
  const isDarkMode = useSelector((state) => state.theme.isDarkMode);

  useEffect(() => {
    console.log("ThemeProvider: isDarkMode changed to:", isDarkMode);
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      console.log("Added dark class");
    } else {
      document.documentElement.classList.remove("dark");
      console.log("Removed dark class");
    }
  }, [isDarkMode]);

  return <>{children}</>;
};

const App = () => {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <RouterProvider router={router} />
      </ThemeProvider>
    </Provider>
  );
};

export default App;
