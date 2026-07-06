import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../api";
import PropertyCard from "../../components/common/PropertyCard";
import { myPropertiesStyles as s } from "../../assets/dummyStyles";
import { 
  HiOutlineOfficeBuilding, 
  HiOutlinePlus, 
  HiOutlineTrash, 
  HiOutlinePencil,
  HiChevronDown
} from "react-icons/hi";

const MyProperties = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/property/seller");
      setProperties(res.data.properties || []);
      setError(null);
    } catch (err) {
      setError("Failed to fetch listings.");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (propertyId, newStatus) => {
    try {
      await api.patch(`/api/property/${propertyId}/status`, { status: newStatus });
      fetchProperties();
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  const handleDelete = async (propertyId) => {
    if (window.confirm("Are you sure you want to permanently delete this listing?")) {
      try {
        await api.delete(`/api/property/${propertyId}`);
        fetchProperties();
      } catch (err) {
        console.error("Failed to delete property:", err);
      }
    }
  };

  if (loading) {
    return (
      <div className={s.loaderFullPage}>
        <div className={s.loader}></div>
      </div>
    );
  }

  return (
    <div className={`fade-in text-left`}>
      
      {/* Header Container */}
      <div className={s.header}>
        <div>
          <h1 className={s.heading}>My Listings</h1>
          <p className={s.subheading}>Manage and update availability for your properties catalog.</p>
        </div>
        <Link to="/add-property" className={s.addButton}>
          <HiOutlinePlus size={20} className="inline mr-1" /> Add Listing
        </Link>
      </div>

      {error && <div className="text-red-500 font-bold mb-6">{error}</div>}

      {/* Main Content Area */}
      <div className={s.content}>
        {properties.length === 0 ? (
          <div className={s.emptyCard}>
            <div className={s.emptyIconWrapper}>
              <HiOutlineOfficeBuilding size={44} className="text-text-muted" />
            </div>
            <h3 className={s.emptyTitle}>No Listings Yet</h3>
            <p className={s.emptyText}>Start advertising your properties to verify and convert leads.</p>
            <Link to="/add-property" className={s.emptyButton}>
              <HiOutlinePlus size={20} className="inline mr-1" /> Add Your First Property
            </Link>
          </div>
        ) : (
          <div className={s.grid}>
            {properties.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                renderActions={() => (
                  <div className={s.actionContainer}>
                    <div className={s.selectWrapper}>
                      <select
                        value={property.status}
                        onChange={(e) => handleStatusChange(property.id, e.target.value)}
                        className={`${s.select} ${
                          property.status === "sold" ? s.selectSold : s.selectAvailable
                        }`}
                      >
                        <option value="sale" className={s.selectAvailable}>For Sale</option>
                        <option value="sold" className={s.selectSold}>Sold</option>
                      </select>
                      <HiChevronDown size={14} className={s.selectIcon} />
                    </div>
                    <Link 
                      to={`/edit-property/${property.id}`}
                      className={s.editButton}
                      title="Edit Property"
                    >
                      <HiOutlinePencil size={14} />
                      <span>Edit</span>
                    </Link>
                    <button
                      onClick={() => handleDelete(property.id)}
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

export default MyProperties;
