import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api";
import { useAuth } from "../../context/AuthContext";
import PropertyCard from "../../components/common/PropertyCard";
import { sellerDashboardStyles as s } from "../../assets/dummyStyles";
import { 
  HiOutlineOfficeBuilding, 
  HiOutlineEye, 
  HiOutlineChatAlt2, 
  HiOutlinePlus,
  HiOutlineSearch,
  HiOutlineDownload,
  HiOutlineCheckCircle,
  HiOutlineTrash,
  HiOutlinePencil
} from "react-icons/hi";

const SellerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [properties, setProperties] = useState([]);
  const [chats, setChats] = useState([]);
  const [stats, setStats] = useState({
    totalListings: 0,
    totalViews: 0,
    activeInquiries: 0,
    totalValue: 0
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const propsRes = await api.get("/api/property/seller");
      const sellerProps = propsRes.data.properties || [];
      setProperties(sellerProps);

      // Fetch chats/leads for inquiries widget
      const chatsRes = await api.get("/api/chat");
      const sellerChats = chatsRes.data || [];
      setChats(sellerChats);

      // Calculate stats
      const totalViews = sellerProps.reduce((sum, p) => sum + (p.views || 0), 0);
      const totalValue = sellerProps.reduce((sum, p) => sum + (p.price || 0), 0);
      const activeListings = sellerProps.filter(p => p.status !== "sold").length;
      const soldProperties = sellerProps.filter(p => p.status === "sold").length;

      setStats({
        totalListings: sellerProps.length,
        totalViews: totalViews,
        activeInquiries: sellerChats.length,
        totalValue: totalValue,
        activeListings: activeListings,
        soldProperties: soldProperties
      });

    } catch (err) {
      console.error("Error loading seller dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (propertyId, currentStatus) => {
    const nextStatus = currentStatus === "sold" ? "sale" : "sold";
    try {
      await api.patch(`/api/property/${propertyId}/status`, { status: nextStatus });
      fetchDashboardData();
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  const handleDelete = async (propertyId) => {
    if (window.confirm("Are you sure you want to permanently delete this listing?")) {
      try {
        await api.delete(`/api/property/${propertyId}`);
        fetchDashboardData();
      } catch (err) {
        console.error("Error deleting property:", err);
      }
    }
  };

  const handleExport = () => {
    const headers = ["Title", "Location", "Type", "Price (LKR)", "Status", "Views"];
    const rows = properties.map(p => [
      `"${p.title.replace(/"/g, '""')}"`,
      `"${p.area}, ${p.city}"`,
      p.propertyType,
      p.price,
      p.status,
      p.views || 0
    ]);
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `my_listings_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredProperties = properties.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.area.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className={s.loaderFullPage}>
        <div className={s.loader}></div>
      </div>
    );
  }

  const statItems = [
    {
      title: "Total Views",
      value: stats.totalViews.toLocaleString(),
      icon: HiOutlineEye,
      color: "#0d6e59"
    },
    {
      title: "Active Leads",
      value: stats.activeInquiries.toLocaleString(),
      icon: HiOutlineChatAlt2,
      color: "#0d6e59"
    },
    {
      title: "Live Listings",
      value: (stats.activeListings || 0).toLocaleString(),
      icon: HiOutlineOfficeBuilding,
      color: "#0d6e59"
    },
    {
      title: "Properties Sold",
      value: (stats.soldProperties || 0).toLocaleString(),
      icon: HiOutlineCheckCircle,
      color: "#0d6e59"
    }
  ];

  return (
    <div className="fade-in text-left">
      
      {/* Header */}
      <header className={s.header}>
        <div className={s.headerLeft}>
          <h1 className={s.headerTitle}>Seller Dashboard</h1>
          <p className={s.headerSubtitle}>Manage your property portfolio and track performance.</p>
        </div>
        <div className={s.headerActions}>
          <button onClick={handleExport} className={s.exportButton}>
            <HiOutlineDownload size={20} /> Export
          </button>
          <Link to="/add-property" className={s.addButton}>
            <HiOutlinePlus size={20} /> Add New
          </Link>
        </div>
      </header>

      {/* Stats Cards */}
      <div className={s.statsGrid}>
        {statItems.map((m, p) => (
          <div className={s.statCard} style={{ "--card-color": m.color }} key={p}>
            <div className={s.statIconWrapper}>
              <m.icon size={20} className="text-primary" />
            </div>
            <div className={s.statTitle}>{m.title}</div>
            <div className={s.statValue}>{m.value}</div>
          </div>
        ))}
      </div>

      {/* Listings Section */}
      <div className={s.listingsSection}>
        <div className={s.listingsHeader}>
          <h2 className={s.listingsTitle}>Property Listings</h2>
          <div className={s.searchWrapper}>
            <HiOutlineSearch className={s.searchIcon} />
            <input
              type="text"
              placeholder="Search listings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={s.searchInput}
            />
          </div>
        </div>

        {filteredProperties.length === 0 ? (
          <div className={s.emptyListings}>
            {searchQuery ? `No properties found matching "${searchQuery}".` : "No listings created yet."}
          </div>
        ) : (
          <div className={s.propertiesGrid}>
            {filteredProperties.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                renderActions={() => (
                  <div className={s.propertyActions}>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleToggleStatus(property.id, property.status); }}
                      className={s.statusButton(property.status)}
                      title={property.status === "sold" ? "Mark as Available" : "Mark as Sold"}
                    >
                      <HiOutlineCheckCircle size={14} />
                      <span>{property.status === "sold" ? "Available" : "Sold"}</span>
                    </button>
                    <Link to={`/edit-property/${property.id}`} className={s.editButton}>
                      <HiOutlinePencil size={14} />
                      <span>Edit</span>
                    </Link>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(property.id); }}
                      className={s.deleteButton}
                      title="Delete Property"
                    >
                      <HiOutlineTrash size={14} />
                      <span>Delete</span>
                    </button>
                  </div>
                )}
              />
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default SellerDashboard;
