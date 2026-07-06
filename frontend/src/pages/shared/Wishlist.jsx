import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api";
import PropertyCard from "../../components/common/PropertyCard";
import { wishlistStyles as s } from "../../assets/dummyStyles";
import { HiOutlineHeart } from "react-icons/hi";

const Wishlist = () => {
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/property/wishlist");
      setProperties(res.data.wishlist);
      setError(null);
    } catch (err) {
      setError("Failed to load wishlist properties.");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromWishlist = async (propertyId) => {
    try {
      await api.post(`/api/property/${propertyId}/wishlist`);
      // Update local state by removing the property
      setProperties(properties.filter(p => p.id !== propertyId));
    } catch (err) {
      console.error("Error removing from wishlist:", err);
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
    <div className={s.pageContainer}>
      <div className={s.mainContainer}>
        
        {/* Header Section */}
        <div className="flex justify-between items-center mb-8 flex-wrap gap-4 text-left md:pl-8">
          <div>
            <h1 className="text-3xl font-extrabold text-text-main mb-1.5 pl-15">My Wishlist</h1>
            <p className="text-sm text-text-muted pl-15">Your bookmarked property listings.</p>
          </div>
        </div>

        {properties.length === 0 ? (
          <div className={s.emptyCard}>
            <div className={s.emptyIconWrapper}>
              <HiOutlineHeart size={44} className="text-text-muted" />
            </div>
            <h3 className={`text-xl font-bold text-text-main ${s.emptyTitle}`}>Wishlist is Empty</h3>
            <p className={s.emptyText}>You haven't added any properties to your wishlist yet.</p>
            <Link to="/properties" className={s.browseButton}>
              Browse Properties
            </Link>
          </div>
        ) : (
          <div className={s.gridContainer}>
            {properties.map((property) => (
              <PropertyCard 
                key={property.id}
                property={property} 
                isWishlisted={true}
                onToggleWishlist={handleRemoveFromWishlist}
              />
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default Wishlist;
