import React, { useState, useEffect } from "react";
import api from "../../api";
import { adminDashboardStyles as s } from "../../assets/dummyStyles";
import { 
  HiOutlineUsers, 
  HiOutlineLibrary, 
  HiOutlineCheckCircle, 
  HiOutlineShoppingBag 
} from "react-icons/hi";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProperties: 0,
    activeListings: 0,
    soldProperties: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminDashboardData();
  }, []);

  const fetchAdminDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch users
      const usersRes = await api.get("/api/user/admin/users");
      const users = usersRes.data;

      // Fetch properties
      const propsRes = await api.get("/api/property");
      const properties = propsRes.data.properties || [];

      const activeListings = properties.filter(p => p.status === "available" || p.status === "active").length;
      const soldProperties = properties.filter(p => p.status === "sold").length;

      setStats({
        totalUsers: users.length,
        totalProperties: properties.length,
        activeListings: activeListings,
        soldProperties: soldProperties
      });

    } catch (err) {
      console.error("Error fetching admin dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={s.loaderFullPage}>
        <div className={s.loader}></div>
      </div>
    );
  }

  const statItems = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: HiOutlineUsers,
      color: "#0d9488",
      bg: "#ccfbf1"
    },
    {
      title: "Total Properties",
      value: stats.totalProperties,
      icon: HiOutlineLibrary,
      color: "#f59e0b",
      bg: "#fef3c7"
    },
    {
      title: "Active Listings",
      value: stats.activeListings,
      icon: HiOutlineCheckCircle,
      color: "#3b82f6",
      bg: "#dbeafe"
    },
    {
      title: "Sold Properties",
      value: stats.soldProperties,
      icon: HiOutlineShoppingBag,
      color: "#10b981",
      bg: "#dcfce7"
    }
  ];

  return (
    <div className="fade-in text-left">
      
      {/* Header Container */}
      <div className={s.headerContainer}>
        <div>
          <h1 className={s.pageTitle}>Admin Overview</h1>
          <p className={s.pageSubtitle}>Welcome back, administrator. Here's today's summary.</p>
        </div>
        <button onClick={fetchAdminDashboardData} className={s.refreshButton}>
          Refresh Data
        </button>
      </div>

      {/* Stats Grid */}
      <div className={s.statsGrid}>
        {statItems.map((m, p) => (
          <div className={s.statCard} key={p}>
            <div className={s.statIconContainer} style={{ backgroundColor: m.bg, color: m.color }}>
              <m.icon size={22} />
            </div>
            <div>
              <div className={s.statTitle}>{m.title}</div>
              <div className={s.statValue}>{m.value.toLocaleString()}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Second Grid */}
      <div className={s.secondGrid}>
        
        {/* System Health */}
        <div className={s.systemHealthCard}>
          <h3 className={s.systemHealthTitle}>System Health</h3>
          <div className={s.servicesContainer}>
            {["Database", "Media Storage", "Auth Service", "API Gateway"].map((m, p) => (
              <div className={s.serviceItem} key={p}>
                <div className={s.serviceName}>{m}</div>
                <div className={s.statusContainer}>
                  <span className={s.statusDot}></span>
                  <span className={s.statusText}>Online</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Admin Tools */}
        <div className={s.adminToolsCard}>
          <h3 className={s.adminToolsTitle}>Admin Tools</h3>
          <p className={s.adminToolsDesc}>Quickly manage platform resources and tasks.</p>
          <div className={s.adminToolsButtonsContainer}>
            <button className={s.adminToolButton}>System Logs</button>
            <button className={s.adminToolButton}>DB Backup</button>
            <button className={s.adminToolButton}>Settings</button>
          </div>
        </div>

      </div>

    </div>
  );
};

export default AdminDashboard;
