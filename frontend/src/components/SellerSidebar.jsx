import React from "react";
import { NavLink, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { 
  HiOutlineViewGrid, 
  HiOutlineClipboardList, 
  HiOutlineChartBar, 
  HiOutlineChatAlt2, 
  HiOutlineUser, 
  HiOutlineSupport,
  HiOutlineLogout,
  HiOfficeBuilding
} from "react-icons/hi";
import { sellerSidebarStyles as s, logoStyles } from "../assets/dummyStyles";

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

const SellerSidebar = ({ isOpen, onClose }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { name: "Dashboard", icon: HiOutlineViewGrid, path: "/dashboard" },
    { name: "My Listings", icon: HiOutlineClipboardList, path: "/my-properties" },
    { name: "Leads", icon: HiOutlineChartBar, path: "/inquiries" },
    { name: "Messages", icon: HiOutlineChatAlt2, path: "/chat-messages" },
    { name: "Profile", icon: HiOutlineUser, path: "/profile" },
    { name: "Support", icon: HiOutlineSupport, path: "/contact" },
  ];

  const handleLogout = () => {
    onClose();
    logout();
    navigate("/login");
  };

  return (
    <>
      {/* Sidebar Backdrop Overlay for Mobile */}
      <div 
        className={`${s.backdrop} ${isOpen ? s.backdropVisible : s.backdropHidden}`} 
        onClick={onClose}
      ></div>

      {/* Sidebar Container */}
      <aside className={`${s.sidebar} ${isOpen ? s.sidebarOpen : s.sidebarClosed}`}>
        {/* Brand/Logo */}
        <div className={s.logoContainer}>
          <Logo fontSize="1.25rem" iconSize={20} onClick={onClose} />
        </div>

        {/* Navigation */}
        <nav className={s.nav}>
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) => 
                `${s.navLink} ${isActive ? s.navLinkActive : s.navLinkInactive}`
              }
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

export default SellerSidebar;
