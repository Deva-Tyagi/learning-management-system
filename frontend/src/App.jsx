import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { Toaster } from "sonner";
import { AnimatePresence } from "framer-motion";
import LandingNavbar from "./components/LandingNavbar";
import Footer from "./components/Footer";

import Home from "./pages/index";
import AboutUsPage from "./pages/landing/AboutUsPage";
import FeaturesPage from "./pages/landing/FeaturesPage";
import PricingPage from "./pages/landing/PricingPage";
import ContactUsPage from "./pages/landing/ContactUsPage";

import Explore from "./pages/Explore";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";

import AdminLogin from "./pages/admin/Login";
import AdminDashboard from "./pages/admin/Dashboard";
import SuperAdminLogin from "./pages/superadmin/Login";
import SuperAdminDashboard from "./pages/superadmin/Dashboard";
import StudentLogin from "./pages/student/Login";
import StudentDashboard from "./pages/student/Dashboard";
import TakeExam from "./pages/student/TakeExam";
import "./App.css";
import { HelmetProvider } from "react-helmet-async";
import { PlatformProvider } from "./context/PlatformContext";

// Landing pages — those that get the LandingNavbar + Footer
const landingPaths = ["/", "/about", "/features", "/pricing", "/contact", "/privacy", "/terms", "/Explore"];

const LayoutWrapper = ({ children }) => {
  const location = useLocation();
  const isAdminPath = location.pathname.startsWith("/admin");
  const isStudentPath = location.pathname.startsWith("/student");
  const isSuperAdminPath = location.pathname.startsWith("/superadmin");
  const isExcludedPath = isAdminPath || isStudentPath || isSuperAdminPath;
  const isLandingPath = landingPaths.some((p) => location.pathname === p);

  return (
    <div className="min-h-screen bg-[#080d1a] font-sans">
      {!isExcludedPath && isLandingPath && <LandingNavbar />}
      <AnimatePresence mode="wait">
        <main key={location.pathname}>{children}</main>
      </AnimatePresence>
      {!isExcludedPath && isLandingPath && <Footer />}
    </div>
  );
};

function App() {
  return (
    <HelmetProvider>
      <PlatformProvider>
        <Toaster richColors position="top-right" />
        <Router>
          <LayoutWrapper>
            <Routes>
              {/* Landing Pages */}
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<AboutUsPage />} />
              <Route path="/features" element={<FeaturesPage />} />
              <Route path="/pricing" element={<PricingPage />} />
              <Route path="/contact" element={<ContactUsPage />} />
  
              {/* Other public pages */}
              <Route path="/Explore" element={<Explore />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
  
              {/* Admin Routes */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
  
              {/* Superadmin Routes */}
              <Route path="/superadmin/login" element={<SuperAdminLogin />} />
              <Route path="/superadmin/dashboard" element={<SuperAdminDashboard />} />
  
              {/* Student Routes */}
              <Route path="/student/login" element={<StudentLogin />} />
              <Route path="/student/dashboard" element={<StudentDashboard />} />
              <Route path="/student/exam/:id" element={<TakeExam />} />
            </Routes>
          </LayoutWrapper>
        </Router>
      </PlatformProvider>
    </HelmetProvider>
  );
}

export default App;
