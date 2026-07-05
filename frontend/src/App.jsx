import React, { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, Outlet, Link, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";

// Components
import Navbar from "./components/common/Navbar";
import Footer from "./components/common/Footer";
import SellerSidebar from "./components/SellerSidebar";
import AdminSidebar from "./components/AdminSidebar";

// Public Pages
import LandingPage from "./pages/shared/LandingPage";
import Properties from "./pages/shared/Properties";
import PropertyDetails from "./pages/shared/PropertyDetails";
import Contact from "./pages/shared/Contact";

// Auth Pages
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ResetPassword from "./pages/auth/ResetPassword";

// Protected Shared
import Profile from "./pages/shared/Profile";
import Wishlist from "./pages/shared/Wishlist";
import ChatMessages from "./pages/shared/ChatMessages";

// Seller Pages
import SellerDashboard from "./pages/seller/SellerDashboard";
import MyProperties from "./pages/seller/MyProperties";
import AddProperty from "./pages/seller/AddProperty";
import EditProperty from "./pages/seller/EditProperty";
import Inquiries from "./pages/seller/Inquiries";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminSellerRequests from "./pages/admin/AdminSellerRequests";
import AdminProperties from "./pages/admin/AdminProperties";
import AdminInquiries from "./pages/admin/AdminInquiries";
import AdminContacts from "./pages/admin/AdminContacts";

// Protected Route Guard
const ProtectedRoute = ({ allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loader-full-page">
        <div className="loader"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

// Layouts
const MainLayout = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const dashboardPages = ["/profile", "/chat-messages", "/contact"];
  const isSellerDashboardPage = user?.role === "seller" && dashboardPages.includes(location.pathname);

  if (isSellerDashboardPage) {
    return (
      <div className={sellerLayoutStyles.container}>
        <SellerSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        <div className={sellerLayoutStyles.contentWrapper}>
          <SellerHeader onMenuClick={() => setIsSidebarOpen(true)} />
          <main className={sellerLayoutStyles.main}>
            <Outlet />
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex-grow pt-20">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
};

import { sellerLayoutStyles, adminLayoutStyles, dashboardNavbarStyles, logoStyles } from "./assets/dummyStyles";

const SellerHeader = ({ onMenuClick }) => {
  return (
    <header className={dashboardNavbarStyles.header}>
      <button onClick={onMenuClick} className={dashboardNavbarStyles.menuButton}>
        <HiMenu size={24} />
      </button>
      <div className={dashboardNavbarStyles.logoContainer}>
        <Logo fontSize="1.125rem" iconSize={18} />
      </div>
    </header>
  );
};

const SellerLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  return (
    <div className={sellerLayoutStyles.container}>
      <SellerSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className={sellerLayoutStyles.contentWrapper}>
        <SellerHeader onMenuClick={() => setIsSidebarOpen(true)} />
        <main className={sellerLayoutStyles.main}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

import { HiMenu, HiOfficeBuilding } from "react-icons/hi";

const Logo = ({ fontSize = "1.125rem", iconSize = 18, showText = true, className = "", onClick }) => {
  return (
    <Link
      to="/"
      onClick={onClick}
      className={`${logoStyles.link} ${className}`}
      style={{ fontSize }}
    >
      <div className={logoStyles.iconWrapper}>
        <HiOfficeBuilding size={iconSize} />
      </div>
      {showText && <span className={logoStyles.text}>RealEstate</span>}
    </Link>
  );
};

const AdminHeader = ({ onMenuClick }) => {
  return (
    <header className={dashboardNavbarStyles.header}>
      <button onClick={onMenuClick} className={dashboardNavbarStyles.menuButton}>
        <HiMenu size={24} />
      </button>
      <div className={dashboardNavbarStyles.logoContainer}>
        <Logo fontSize="1.125rem" iconSize={18} />
      </div>
    </header>
  );
};

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  return (
    <div className={adminLayoutStyles.layout}>
      <AdminSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className={adminLayoutStyles.mainWrapper}>
        <AdminHeader onMenuClick={() => setIsSidebarOpen(true)} />
        <main className={adminLayoutStyles.mainContent}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Pages Layout */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/properties" element={<Properties />} />
            <Route path="/properties/:id" element={<PropertyDetails />} />
            <Route path="/contact" element={<Contact />} />
            
            {/* Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ResetPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />

            {/* Buyer Protected Pages */}
            <Route element={<ProtectedRoute allowedRoles={["buyer", "seller", "admin"]} />}>
              <Route path="/profile" element={<Profile />} />
              <Route path="/chat-messages" element={<ChatMessages />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={["buyer"]} />}>
              <Route path="/wishlist" element={<Wishlist />} />
            </Route>
          </Route>

          {/* Seller Dashboard Layout */}
          <Route element={<ProtectedRoute allowedRoles={["seller"]} />}>
            <Route element={<SellerLayout />}>
              <Route path="/dashboard" element={<SellerDashboard />} />
              <Route path="/my-properties" element={<MyProperties />} />
              <Route path="/add-property" element={<AddProperty />} />
              <Route path="/edit-property/:id" element={<EditProperty />} />
              <Route path="/inquiries" element={<Inquiries />} />
            </Route>
          </Route>

          {/* Admin Dashboard Layout */}
          <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin-dashboard" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/admin/seller-requests" element={<AdminSellerRequests />} />
              <Route path="/admin/properties" element={<AdminProperties />} />
              <Route path="/admin/inquiries" element={<AdminInquiries />} />
              <Route path="/admin/contacts" element={<AdminContacts />} />
            </Route>
          </Route>

          {/* Catch-all Redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
