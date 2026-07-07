import React, { useState, useEffect, useRef } from "react";
import api from "../../api";
import { adminUsersStyles as s } from "../../assets/dummyStyles";
import { 
  HiOutlineUser, 
  HiOutlineTrash, 
  HiOutlineLockOpen, 
  HiOutlineLockClosed,
  HiOutlineMail,
  HiOutlinePhone,
  HiFilter
} from "react-icons/hi";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [filterRole, setFilterRole] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowFilterDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/user/admin/users");
      setUsers(res.data);
      setError(null);
    } catch (err) {
      setError("Failed to fetch users catalog.");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleBlock = async (userId) => {
    try {
      await api.patch(`/api/user/admin/users/${userId}/block`);
      fetchUsers();
    } catch (err) {
      console.error("Error toggling block status:", err);
    }
  };

  const handleDelete = async (userId) => {
    if (window.confirm("Are you sure you want to permanently delete this user?")) {
      try {
        await api.delete(`/api/user/admin/users/${userId}`);
        fetchUsers();
      } catch (err) {
        console.error("Error deleting user:", err);
      }
    }
  };

  const filteredUsers = users.filter(user => {
    if (filterRole === "all") return true;
    return user.role === filterRole;
  });

  if (loading) {
    return (
      <div className={s.loaderFullPage}>
        <div className={s.loader}></div>
      </div>
    );
  }

  return (
    <div className="fade-in text-left">
      
      {/* Header Container */}
      <div className={s.containerHeader}>
        <div>
          <h1 className={s.headerTitle}>User Management</h1>
          <p className={s.headerSubtitle}>Monitor platform users and access levels.</p>
        </div>
        <div className={s.filterWrapper} ref={dropdownRef}>
          <button onClick={() => setShowFilterDropdown(!showFilterDropdown)} className={s.filterButton}>
            <HiFilter size={18} /> Filter
          </button>
          {showFilterDropdown && (
            <div className={s.filterDropdown}>
              <button 
                onClick={() => { setFilterRole("all"); setShowFilterDropdown(false); }} 
                className={s.filterOption(filterRole === "all")}
              >
                All Users
              </button>
              <button 
                onClick={() => { setFilterRole("buyer"); setShowFilterDropdown(false); }} 
                className={s.filterOption(filterRole === "buyer")}
              >
                Buyer
              </button>
              <button 
                onClick={() => { setFilterRole("seller"); setShowFilterDropdown(false); }} 
                className={s.filterOption(filterRole === "seller")}
              >
                Seller
              </button>
              <button 
                onClick={() => { setFilterRole("admin"); setShowFilterDropdown(false); }} 
                className={s.filterOption(filterRole === "admin")}
              >
                Admin
              </button>
            </div>
          )}
        </div>
      </div>

      {error && <div className="text-red-500 font-bold mb-6">{error}</div>}

      {/* Main Table Card */}
      <div className={s.cardContainer}>
        <div className={s.cardHeader}>
          <div className={s.cardTitleRow}>
            <h2 className={s.cardTitle}>Platform Users</h2>
            <div className={s.userCount}>
              Showing <span className={s.userCountSpan}>{filteredUsers.length}</span> users
            </div>
          </div>
        </div>

        <div className={s.tableWrapper}>
          <table className={s.table}>
            <thead className={s.thead}>
              <tr className={s.tableRow}>
                <th className={s.thUserInfo}>User Info</th>
                <th className={s.thRole}>Role</th>
                <th className={s.thContact}>Contact Details</th>
                <th className={s.thStatus}>Account Status</th>
                <th className={s.thActions}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr className={s.tableRow} key={user.id}>
                    <td className={s.tdUserInfo}>
                      <div className="flex items-center gap-4">
                        <div className={s.userAvatar}>
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className={s.userInfoName}>{user.name}</div>
                          <div className={s.userInfoId}>
                            ID: {user.id ? String(user.id).toUpperCase() : "N/A"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className={s.tdRole}>
                      <span className={s.roleBadge(user.role)}>{user.role}</span>
                    </td>
                    <td className={s.tdContact}>
                      <div className={s.contactWrapper}>
                        <div className={s.contactEmail}>
                          <HiOutlineMail color="#94a3b8" /> {user.email}
                        </div>
                        {user.phone && (
                          <div className={s.contactPhone}>
                            <HiOutlinePhone color="#94a3b8" /> {user.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className={s.tdStatus}>
                      {user.blocked ? (
                        <span className={s.statusBadgeBlocked}>
                          <HiOutlineLockClosed size={14} /> Suspended
                        </span>
                      ) : (
                        <span className={s.statusBadgeActive}>
                          <HiOutlineLockOpen size={14} /> Active
                        </span>
                      )}
                    </td>
                    <td className={s.tdActions}>
                      <div className={s.actionsWrapper}>
                        {user.role !== "admin" && (
                          <>
                            <button
                              onClick={() => handleToggleBlock(user.id)}
                              className={s.blockButton(user.blocked)}
                              title={user.blocked ? "Unblock User" : "Block User"}
                            >
                              {user.blocked ? <HiOutlineLockOpen size={18} /> : <HiOutlineLockClosed size={18} />}
                            </button>
                            <button
                              onClick={() => handleDelete(user.id)}
                              className={s.deleteButton}
                              title="Delete User"
                            >
                              <HiOutlineTrash size={18} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className={s.emptyState || "py-10 text-center text-text-muted text-sm"}>
                    No users found for this filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default AdminUsers;
