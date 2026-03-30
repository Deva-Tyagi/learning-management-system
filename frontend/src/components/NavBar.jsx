import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "../lib/axios";
import { usePlatform } from "../context/PlatformContext";

// keep optional fallback for public URL (debug only)
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const Navbar = () => {
  const [isCoursesMenuOpen, setIsCoursesMenuOpen] = useState(false);
  const [isLoginMenuOpen, setIsLoginMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolling, setScrolling] = useState(false);
  const { platformName, primaryColor } = usePlatform();
  const [courses, setCourses] = useState({
    computerCourses: [],
    englishCourses: [],
    distanceLearning: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Base courses that are always shown
  const baseCourses = {
    computerCourses: [
      { name: "Typing Skills", link: "/courses/typing-skills" },
      { name: "MS Office", link: "/courses/ms-office" },
      { name: "Advanced MS Excel", link: "/courses/advanced-ms-excel" },
      {
        name: "Accounting Software (Tally Prime)",
        link: "/courses/accounting-software",
      },
      { name: "Web Development", link: "/courses/web-development" },
      {
        name: "Programming Basics (C, Python, HTML)",
        link: "/courses/basic-programming",
      },
      {
        name: "Advanced Programming (C, C++, Python, Java, MySQL, JavaScript)",
        link: "/courses/programming-mastery",
      },
      { name: "Digital Marketing", link: "/courses/digital-marketing" },
      { name: "Video Editing", link: "/courses/video-editing" },
      {
        name: "Designing and Editing (Corel Draw, Photoshop)",
        link: "/courses/designing-editing",
      },
      { name: "CCC and O-Level (by NIELIT)", link: "/courses/ccc-o-level" },
      {
        name: "Computer Technology Program (AI Tools, ChatGPT, Merlin)",
        link: "/courses/computer-technology-program",
      },
    ],
    englishCourses: [
      { name: "Basic English Grammar", link: "/courses/basic-grammar" },
      {
        name: "Conversational English",
        link: "/courses/conversational-english",
      },
      { name: "Business English", link: "/courses/business-english" },
      { name: "Advanced Writing Skills", link: "/courses/advanced-writing" },
      { name: "IELTS Preparation", link: "/courses/ielts-preparation" },
      {
        name: "English Speaking (Personality Development, Interview Preparation)",
        link: "/courses/english-speaking",
      },
    ],
    distanceLearning: [
      { name: "Virtual Classrooms", link: "#virtual-classrooms" },
      { name: "Interactive Assignments", link: "#interactive-assignments" },
      { name: "Online Tutorials", link: "#online-tutorials" },
      { name: "Live Q&A Sessions", link: "#live-qa-sessions" },
      { name: "Certifications", link: "#certifications" },
    ],
  };

  // Function to merge base courses with API courses
  const mergeCourses = (apiCourses) => {
    const merged = {};

    Object.keys(baseCourses).forEach((category) => {
      merged[category] = [...baseCourses[category]];

      if (apiCourses[category] && Array.isArray(apiCourses[category])) {
        const baseCourseNames = baseCourses[category].map((course) =>
          course.name.toLowerCase(),
        );
        const newCourses = apiCourses[category].filter(
          (apiCourse) =>
            !baseCourseNames.includes(apiCourse.name.toLowerCase()),
        );
        merged[category] = [...merged[category], ...newCourses];
      }
    });

    return merged;
  };

  // Initialize with base courses
  useEffect(() => {
    setCourses(baseCourses);
  }, []);

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolling(true);
      } else {
        setScrolling(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Fetch additional courses from API and merge with base courses
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);

        // Prefer axios for consistent baseURL handling and better error parsing
        const response = await axios.get("/courses/navbar");

        const apiCourses = response.data;
        const mergedCourses = mergeCourses(apiCourses);
        setCourses(mergedCourses);
        setError(null);
      } catch (error) {
        console.error("Failed to fetch additional courses:", error);

        // Sometimes fallback to pure fetch from explicit base URL if axios is not configured yet
        try {
          const response = await fetch(`${API_BASE_URL}/courses/navbar`);
          if (response.ok) {
            const apiCourses = await response.json();
            setCourses(mergeCourses(apiCourses));
            setError(null);
            return;
          }
        } catch (fallbackError) {
          console.warn("Fallback fetch also failed", fallbackError);
        }

        setError("Failed to load additional courses from server");
        setCourses(baseCourses);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        !event.target.closest(".courses-dropdown") &&
        !event.target.closest(".courses-button")
      ) {
        setIsCoursesMenuOpen(false);
      }
      if (
        !event.target.closest(".login-dropdown") &&
        !event.target.closest(".login-button")
      ) {
        setIsLoginMenuOpen(false);
      }
      if (
        !event.target.closest(".mobile-menu") &&
        !event.target.closest(".mobile-toggle")
      ) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const categoryDisplayNames = {
    computerCourses: "Computer Courses",
    englishCourses: "English Courses",
    distanceLearning: "Distance Learning",
  };

  return (
    <nav
      className={`flex items-center justify-between p-4 bg-white border-b
                 border-gray-300 sticky top-0 z-50 transition-opacity
                  duration-300 ${scrolling ? "opacity-70" : "opacity-100"}`}
    >
      {/* Left Section: Brand */}
      <div className="flex items-center">
        <Link to="/">
          <img src="/photos/logo.png" alt="Logo" className="w-30 h-10 mr-2" />
        </Link>
        <span className="text-xl font-bold text-gray-800">{platformName}</span>
      </div>

      {/* Center Section: Desktop Links (Visible only on screens lg and larger) */}
      <div className="lg:hidden flex flex-1 justify-center space-x-8">
        <Link
          to="/"
          className="text-gray-800 hover:text-blue-600 transition duration-300"
        >
          Home
        </Link>
      </div>

      {/* Right Section: Enroll, Login, and Sign Up */}
      <div className="lg:hidden flex space-x-3">
        <Link
          to="/Explore"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-300"
        >
          Enroll
        </Link>

        {/* Login Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsLoginMenuOpen(!isLoginMenuOpen)}
            className="login-button bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition duration-300 flex items-center"
          >
            Login
            <span
              className={`ml-2 text-sm transform transition duration-300 ${
                isLoginMenuOpen ? "rotate-180" : ""
              }`}
            >
              ▼
            </span>
          </button>

          {isLoginMenuOpen && (
            <div className="login-dropdown absolute right-0 bg-white border border-gray-300 shadow-lg mt-2 rounded-md z-10 w-48">
              <Link
                to="/admin/login"
                className="block px-4 py-3 text-gray-800 hover:bg-gray-100 hover:text-green-600 transition duration-300 border-b border-gray-200"
                onClick={() => setIsLoginMenuOpen(false)}
              >
                <div className="flex items-center">
                  <span className="mr-2">🔧</span>
                  Admin Login
                </div>
              </Link>
              <Link
                to="/student/login"
                className="block px-4 py-3 text-gray-800 hover:bg-gray-100 hover:text-blue-600 transition duration-300"
                onClick={() => setIsLoginMenuOpen(false)}
              >
                <div className="flex items-center">
                  <span className="mr-2">🎓</span>
                  Student Login
                </div>
              </Link>
            </div>
          )}
        </div>

        <Link
          to="/signup"
          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition duration-300"
        >
          Sign Up
        </Link>
      </div>

      {/* Mobile Menu Toggle (Visible on screens below lg) */}
      <button
        className="mobile-toggle hidden lg:flex text-gray-800 hover:text-blue-600 transition duration-300"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        ☰
      </button>

      {/* Mobile Menu (Visible on screens below lg) */}
      {isMobileMenuOpen && (
        <div className="mobile-menu absolute top-16 left-0 w-full bg-white shadow-md z-50">
          <ul className="flex flex-col space-y-4 p-4">
            <li>
              <Link
                to="/"
                className="text-gray-800 hover:text-blue-600 transition duration-300 text-xl lg:text-lg md:text-base sm:text-sm xs:text-xs"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Home
              </Link>
            </li>

            {/* Mobile Login Dropdown */}
            <li>
              <button
                onClick={() => setIsLoginMenuOpen(!isLoginMenuOpen)}
                className="text-gray-800 hover:text-green-600 transition duration-300 flex items-center text-xl lg:text-lg md:text-base sm:text-sm xs:text-xs w-full text-left"
              >
                Login Options
                <span
                  className={`ml-2 text-sm transform transition duration-300 ${
                    isLoginMenuOpen ? "rotate-180" : ""
                  }`}
                >
                  ▼
                </span>
              </button>

              {isLoginMenuOpen && (
                <div className="bg-gray-50 border border-gray-300 shadow-lg p-4 mt-2 rounded-md space-y-2">
                  <Link
                    to="/admin/login"
                    className="block text-gray-800 hover:text-green-600 transition duration-300 py-2"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setIsLoginMenuOpen(false);
                    }}
                  >
                    <div className="flex items-center">
                      <span className="mr-2">🔧</span>
                      Admin Login
                    </div>
                  </Link>
                  <Link
                    to="/student/login"
                    className="block text-gray-800 hover:text-blue-600 transition duration-300 py-2"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setIsLoginMenuOpen(false);
                    }}
                  >
                    <div className="flex items-center">
                      <span className="mr-2">🎓</span>
                      Student Login
                    </div>
                  </Link>
                </div>
              )}
            </li>

            {/* Mobile Sign Up button */}
            <li className="pt-2">
              <Link
                to="/signup"
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition duration-300 text-center block"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Sign Up
              </Link>
            </li>
          </ul>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
