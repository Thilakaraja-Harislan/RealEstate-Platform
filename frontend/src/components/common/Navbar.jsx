import React, { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { HiMenu, HiX, HiOfficeBuilding } from "react-icons/hi";
import { navbarStyles as Ge, logoStyles } from "../../assets/dummyStyles";

const Logo = ({ fontSize = "1.5rem", iconSize = 24, showText = true, className = "", onClick }) => {
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

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    navigate("/");
  };

  const menuContent = (
    <>
      {(!user || user.role !== "buyer") && (
        <NavLink to="/properties" className={Ge.navLink} onClick={() => setIsOpen(false)}>
          Browse Properties
        </NavLink>
      )}
      {user && user.role === "buyer" && (
        <>
          <NavLink to="/" className={Ge.navLink} onClick={() => setIsOpen(false)}>
            Home
          </NavLink>
          <NavLink to="/properties" className={Ge.navLink} onClick={() => setIsOpen(false)}>
            Property
          </NavLink>
          <NavLink to="/wishlist" className={Ge.navLink} onClick={() => setIsOpen(false)}>
            Wishlist
          </NavLink>
          <NavLink to="/chat-messages" className={Ge.navLink} onClick={() => setIsOpen(false)}>
            Messages
          </NavLink>
          <NavLink to="/contact" className={Ge.navLink} onClick={() => setIsOpen(false)}>
            Contact Us
          </NavLink>
        </>
      )}
      {!user && (
        <>
          <NavLink to="/login" className={Ge.navLink} onClick={() => setIsOpen(false)}>
            Login
          </NavLink>
          <NavLink to="/register" className={Ge.navLink} onClick={() => setIsOpen(false)}>
            Register
          </NavLink>
        </>
      )}
      {user && user.role === "seller" && (
        <>
          <NavLink to="/dashboard" className={Ge.navLink} onClick={() => setIsOpen(false)}>
            Dashboard
          </NavLink>
        </>
      )}
      {user && user.role === "admin" && (
        <>
          <NavLink to="/admin-dashboard" className={Ge.navLink} onClick={() => setIsOpen(false)}>
            Admin Panel
          </NavLink>
        </>
      )}
    </>
  );

  return (
    <>
      <nav className={Ge.nav}>
        <div className={Ge.container}>
          <div className={Ge.grid}>
            <div className="justify-self-start">
              <Logo />
            </div>
            <div className={Ge.desktopMenu}>
              {menuContent}
            </div>
            <div className={Ge.rightSection}>
              {user ? (
                <div className={Ge.userSection}>
                  <Link to="/profile" className="flex items-center">
                    <img
                      src={user.profilePic || `https://ui-avatars.com/api/?name=${user.name}&background=0d6e59&color=fff`}
                      alt="Profile"
                      className={Ge.avatar}
                    />
                  </Link>
                  <button onClick={handleLogout} className={Ge.logoutButton}>
                    Logout
                  </button>
                </div>
              ) : null}
              <div className={Ge.mobileToggle} onClick={() => setIsOpen(!isOpen)}>
                {isOpen ? <HiX size={28} /> : <HiMenu size={28} />}
              </div>
            </div>
          </div>
        </div>
      </nav>
      <div className={Ge.backdrop(isOpen)} onClick={() => setIsOpen(false)}></div>
      <div className={Ge.drawer(isOpen)}>
        <div className={Ge.drawerHeader}>
          <Logo onClick={() => setIsOpen(false)} />
          <HiX size={28} onClick={() => setIsOpen(false)} className={Ge.drawerCloseIcon} />
        </div>
        <div className={Ge.drawerNavLinks}>
          {menuContent}
        </div>
        {user && (
          <div className={Ge.drawerUserSection}>
            <div className={Ge.drawerUserInfo}>
              <img
                src={user.profilePic || `https://ui-avatars.com/api/?name=${user.name}&background=0d6e59&color=fff`}
                alt="Profile"
                className={Ge.drawerAvatar}
              />
              <div>
                <div className={Ge.drawerUserName}>{user.name}</div>
                <div className={Ge.drawerUserEmail}>{user.email}</div>
              </div>
            </div>
            <button onClick={handleLogout} className={Ge.drawerLogoutButton}>
              Logout
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default Navbar;
