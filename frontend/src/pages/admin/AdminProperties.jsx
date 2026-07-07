import React, { useState, useEffect } from "react";
import api from "../../api";
import PropertyCard from "../../components/common/PropertyCard";
import { adminPropertiesStyles as s } from "../../assets/dummyStyles";
import { HiOutlineLibrary } from "react-icons/hi";

const AdminProperties = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      // Empty status means fetch all properties (both sale and sold)
      const res = await api.get("/api/property?status=");
      setProperties(res.data.properties || []);
      setError(null);
    } catch (err) {
      setError("Failed to fetch property listings.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (propertyId) => {
    try {
      await api.patch(`/api/property/${propertyId}/verify`);
      fetchProperties();
    } catch (err) {
      console.error("Error verifying property:", err);
    }
  };

  const handleDelete = async (propertyId) => {
    if (window.confirm("Are you sure you want to delete this property listing?")) {
      try {
        await api.delete(`/api/property/${propertyId}`);
        fetchProperties();
      } catch (err) {
        console.error("Error deleting property:", err);
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
    <div className="fade-in text-left">
      
      {/* Header Container */}
      <div className={s.headerContainer}>
        <h1 className={s.pageTitle}>Properties Catalog</h1>
        <p className={s.pageSubtitle}>
          Review listed properties, verify ownership status, or delete listings.
        </p>
      </div>

      {error && <div className="text-red-500 font-bold mb-6">{error}</div>}

      {/* Catalog List */}
      {properties.length === 0 ? (
        <div className={s.emptyStateCard}>
          <HiOutlineLibrary size={44} className="opacity-20 mb-4 mx-auto text-[#64748b]" />
          <h3 className="text-lg font-bold text-text-main mb-1">No Properties Listed</h3>
          <p className="text-sm text-text-muted">Properties will show up here once agents post them.</p>
        </div>
      ) : (
        <div className={s.propertiesGrid}>
          {properties.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              role="admin"
              onVerify={handleVerify}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

    </div>
  );
};

export default AdminProperties;
