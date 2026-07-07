import React from "react";
import { NavLink, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { 
  HiOutlineViewGrid, 
  HiOutlineUsers, 
  HiOutlineUserCircle, 
  HiOutlineLibrary, 
  HiOutlineChatAlt2, 
  HiOutlineMail,
  HiOutlineLogout,
  HiOfficeBuilding
} from "react-icons/hi";
import { adminSidebarStyles as s, logoStyles } from "../assets/dummyStyles";

const Logo = ({ fontSize = "1.25rem", iconSize = 20, showText = true, className = "", onClick }) => {
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

const AdminSidebar = ({ isOpen, onClose }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { name: "Overview", icon: HiOutlineViewGrid, path: "/admin-dashboard" },
    { name: "Users", icon: HiOutlineUsers, path: "/admin/users" },
    { name: "Seller Requests", icon: HiOutlineUserCircle, path: "/admin/seller-requests" },
    { name: "Properties", icon: HiOutlineLibrary, path: "/admin/properties" },
    { name: "Inquiries", icon: HiOutlineChatAlt2, path: "/admin/inquiries" },
    { name: "Contact Inbox", icon: HiOutlineMail, path: "/admin/contacts" },
  ];

  const handleLogout = () => {
    onClose();
    logout();
    navigate("/login");
  };

  return (
    <>
      {/* Sidebar Backdrop Overlay for Mobile */}
      <div className={s.backdrop(isOpen)} onClick={onClose}></div>

      {/* Sidebar Container */}
      <aside className={s.sidebar(isOpen)}>
        {/* Brand/Logo */}
        <div className={s.logoContainer}>
          <Logo fontSize="1.25rem" iconSize={20} onClick={onClose} />
        </div>

        {/* Navigation */}
        <nav className={s.navContainer}>
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) => s.navLink(isActive)}
            >
              <item.icon size={20} />
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className={s.logoutContainer}>
          <button onClick={handleLogout} className={s.logoutButton}>
            <HiOutlineLogout size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;
