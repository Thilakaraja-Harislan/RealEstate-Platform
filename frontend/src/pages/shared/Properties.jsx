import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../../api";
import PropertyCard from "../../components/common/PropertyCard";
import { HiOutlineFilter, HiX, HiSearch } from "react-icons/hi";

const Properties = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [properties, setProperties] = useState([]);
  const [wishlistIds, setWishlistIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const [filters, setFilters] = useState({
    city: "",
    propertyType: [],
    bhk: "",
    maxPrice: 300000000,
    furnishing: [],
    sort: "latest",
  });

  const propertyTypes = [
    { label: "Flat/Apartment", value: "flat" },
    { label: "Independent House/Villa", value: "villa" },
    { label: "Penthouse", value: "penthouse" },
    { label: "Commercial", value: "commercial" },
  ];

  const bhkOptions = ["1", "2", "3", "4", "5+"];
  
  const furnishingOptions = [
    { label: "Furnished", value: "furnished" },
    { label: "Semi-Furnished", value: "semi-furnished" },
    { label: "Unfurnished", value: "unfurnished" },
  ];

  // Parse URL search parameters on load
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const updatedFilters = {
      city: params.get("city") || "",
      propertyType: params.get("propertyType") ? params.get("propertyType").split(",") : [],
      bhk: params.get("bhk") || "",
      maxPrice: params.get("maxPrice") ? parseInt(params.get("maxPrice")) : 300000000,
      furnishing: params.get("furnishing") ? params.get("furnishing").split(",") : [],
      sort: params.get("sort") || "latest",
    };
    setFilters(updatedFilters);
    fetchProperties(updatedFilters);
    fetchWishlist();
  }, [location.search]);

  const fetchProperties = async (currentFilters) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (currentFilters.city) params.append("city", currentFilters.city);
      if (currentFilters.propertyType.length > 0)
        params.append("propertyType", currentFilters.propertyType.join(","));
      if (currentFilters.bhk) params.append("bhk", currentFilters.bhk);
      if (currentFilters.maxPrice)
        params.append("maxPrice", currentFilters.maxPrice.toString());
      if (currentFilters.furnishing.length > 0)
        params.append("furnishing", currentFilters.furnishing.join(","));
      if (currentFilters.sort) params.append("sort", currentFilters.sort);

      const res = await api.get(`/api/property?${params.toString()}`);
      setProperties(res.data.properties);
      setError(null);
    } catch (err) {
      setError("Failed to load properties. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const fetchWishlist = async () => {
    if (localStorage.getItem("token")) {
      try {
        const res = await api.get("/api/property/wishlist");
        setWishlistIds(res.data.wishlist.map(p => p.id));
      } catch (err) {
        console.error("Failed to load wishlist:", err);
      }
    }
  };

  const handleToggleWishlist = async (propertyId) => {
    if (!localStorage.getItem("token")) {
      navigate("/login");
      return;
    }
    try {
      const res = await api.post(`/api/property/${propertyId}/wishlist`);
      setWishlistIds(res.data.wishlistIds || []);
    } catch (err) {
      console.error("Error updating wishlist:", err);
    }
  };

  const updateURL = (updatedFilters) => {
    const params = new URLSearchParams();
    if (updatedFilters.city) params.append("city", updatedFilters.city);
    if (updatedFilters.propertyType.length > 0)
      params.append("propertyType", updatedFilters.propertyType.join(","));
    if (updatedFilters.bhk) params.append("bhk", updatedFilters.bhk);
    if (updatedFilters.maxPrice)
      params.append("maxPrice", updatedFilters.maxPrice.toString());
    if (updatedFilters.furnishing.length > 0)
      params.append("furnishing", updatedFilters.furnishing.join(","));
    if (updatedFilters.sort) params.append("sort", updatedFilters.sort);
    
    navigate(`/properties?${params.toString()}`);
  };

  const handleCheckboxChange = (category, value) => {
    const current = [...(filters[category] || [])];
    const index = current.indexOf(value);
    if (index === -1) {
      current.push(value);
    } else {
      current.splice(index, 1);
    }
    const updatedFilters = { ...filters, [category]: current };
    setFilters(updatedFilters);
    updateURL(updatedFilters);
  };

  const handlePriceChange = (e) => {
    const value = parseInt(e.target.value);
    const updatedFilters = { ...filters, maxPrice: value };
    setFilters(updatedFilters);
  };

  const handlePriceRelease = () => {
    updateURL(filters);
  };

  const handleBhkSelect = (value) => {
    const updatedFilters = {
      ...filters,
      bhk: filters.bhk === value ? "" : value,
    };
    setFilters(updatedFilters);
    updateURL(updatedFilters);
  };

  const handleSortChange = (e) => {
    const newSort = e.target.value;
    const updatedFilters = { ...filters, sort: newSort };
    setFilters(updatedFilters);
    updateURL(updatedFilters);
  };

  const handleCitySearch = (e) => {
    e.preventDefault();
    updateURL(filters);
  };

  const resetFilters = () => {
    const reset = {
      city: "",
      propertyType: [],
      bhk: "",
      maxPrice: 300000000,
      furnishing: [],
      sort: "latest",
    };
    setFilters(reset);
    navigate("/properties");
  };

  const renderFiltersContent = () => (
    <div className="flex flex-col justify-between h-full gap-4 md:gap-1">
      {/* City search */}
      <div>
        <h4 className="text-[14px] font-bold text-text-main uppercase tracking-wider mb-3">Location</h4>
        <form onSubmit={handleCitySearch} className="relative">
          <input
            type="text"
            placeholder="Search City..."
            value={filters.city}
            onChange={(e) => setFilters({ ...filters, city: e.target.value })}
            className="w-full py-2.5 pl-4 pr-10 border border-[#e5e7eb] rounded-xl text-sm outline-none focus:border-primary transition-colors"
          />
          <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94a3b8] cursor-pointer">
            <HiSearch size={20} />
          </button>
        </form>
      </div>

      {/* Property types */}
      <div>
        <h4 className="text-[14px] font-bold text-text-main uppercase tracking-wider mb-3">Property Type</h4>
        <div className="flex flex-col gap-2.5">
          {propertyTypes.map((item) => (
            <label key={item.value} className="flex items-center gap-3 cursor-pointer text-sm font-semibold text-text-main">
              <input
                type="checkbox"
                checked={filters.propertyType.includes(item.value)}
                onChange={() => handleCheckboxChange("propertyType", item.value)}
                className="w-4.5 h-4.5 rounded accent-primary cursor-pointer"
              />
              <span>{item.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* BHK Select */}
      <div>
        <h4 className="text-[14px] font-bold text-text-main uppercase tracking-wider mb-3">Beds (BHK)</h4>
        <div className="flex gap-2">
          {bhkOptions.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => handleBhkSelect(option)}
              className={`flex-1 py-2 rounded-xl text-sm font-bold border transition-all cursor-pointer ${
                filters.bhk === option
                  ? "bg-primary border-primary text-white"
                  : "bg-white border-[#e5e7eb] text-text-main hover:bg-[#f8fafc]"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <h4 className="text-[14px] font-bold text-text-main uppercase tracking-wider">Price Limit</h4>
          <span className="text-sm font-bold text-primary">
            {filters.maxPrice >= 1000000
              ? `Rs. ${(filters.maxPrice / 1000000).toFixed(1)} M`
              : `Rs. ${(filters.maxPrice / 100000).toFixed(1)} Lakhs`}
          </span>
        </div>
        <input
          type="range"
          min="1000000"
          max="300000000"
          step="1000000"
          value={filters.maxPrice}
          onChange={handlePriceChange}
          onMouseUp={handlePriceRelease}
          onTouchEnd={handlePriceRelease}
          className="w-full h-2 bg-[#f1f5f9] rounded-lg appearance-none cursor-pointer accent-primary"
        />
        <div className="flex justify-between text-xs text-text-muted mt-1 font-bold">
          <span>Rs. 1M</span>
          <span>Rs. 300M</span>
        </div>
      </div>

      {/* Furnishing */}
      <div>
        <h4 className="text-[14px] font-bold text-text-main uppercase tracking-wider mb-3">Furnishing</h4>
        <div className="flex flex-col gap-2.5">
          {furnishingOptions.map((item) => (
            <label key={item.value} className="flex items-center gap-3 cursor-pointer text-sm font-semibold text-text-main">
              <input
                type="checkbox"
                checked={filters.furnishing.includes(item.value)}
                onChange={() => handleCheckboxChange("furnishing", item.value)}
                className="w-4.5 h-4.5 rounded accent-primary cursor-pointer"
              />
              <span>{item.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Reset button */}
      <button
        type="button"
        onClick={resetFilters}
        className="btn btn-outline w-full py-3 font-bold rounded-xl cursor-pointer"
      >
        Reset Filters
      </button>
    </div>
  );

  return (
    <div className="bg-bg-alt min-h-screen pt-2 pb-16">
      <div className="max-w-[1280px] mx-auto px-6">
        
        {/* Header Section */}
        <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-text-main mb-1.5">Properties Catalog</h1>
            <p className="text-sm text-text-muted">Find legal, pre-approved premium homes matching your budget.</p>
          </div>
          
          <div className="flex items-center gap-3">
            <select
              value={filters.sort}
              onChange={handleSortChange}
              className="py-2.5 px-4 rounded-xl border border-[#e5e7eb] bg-white text-sm font-bold text-text-main outline-none cursor-pointer"
            >
              <option value="latest">Latest Listings</option>
              <option value="priceLow">Price: Low to High</option>
              <option value="priceHigh">Price: High to Low</option>
            </select>

            <button
              onClick={() => setShowMobileFilters(true)}
              className="md:hidden flex items-center gap-2 py-2.5 px-4 rounded-xl border border-[#e5e7eb] bg-white text-sm font-bold text-text-main cursor-pointer"
            >
              <HiOutlineFilter />
              Filters
            </button>
          </div>
        </div>

        <div className="grid grid-cols-[280px_1fr] gap-8 max-md:grid-cols-1">
          {/* Desktop Filters Sidebar */}
          <aside className="hidden md:flex flex-col bg-white p-6 rounded-2xl border border-[#e5e7eb] shadow-sm sticky top-[100px] h-[calc(100vh-140px)]">
            {renderFiltersContent()}
          </aside>

          {/* Properties Grid */}
          <main className="flex-1">
            {loading ? (
              <div className="loader-container">
                <div className="loader"></div>
              </div>
            ) : error ? (
              <div className="text-center py-20 text-red-500 font-bold">
                <p>{error}</p>
              </div>
            ) : properties.length === 0 ? (
              <div className="bg-white rounded-2xl border border-[#e5e7eb] p-16 text-center text-text-muted shadow-sm">
                <p className="text-lg font-bold mb-2">No Properties Found</p>
                <p className="text-sm text-[#64748b] mb-6">We couldn't find any listings matching your search filters.</p>
                <button onClick={resetFilters} className="btn btn-primary py-2 px-6 rounded-lg font-bold">
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center">
                {properties.map((property) => (
                  <PropertyCard
                    key={property.id}
                    property={property}
                    isWishlisted={wishlistIds.includes(property.id)}
                    onToggleWishlist={handleToggleWishlist}
                  />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Filters Drawer */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            onClick={() => setShowMobileFilters(false)}
          ></div>
          
          {/* Drawer content */}
          <div className="relative w-80 max-w-full bg-white h-full p-6 flex flex-col overflow-y-auto shadow-2xl z-10 animate-slide-in">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-extrabold text-text-main">Filters</h3>
              <button 
                onClick={() => setShowMobileFilters(false)}
                className="p-1.5 bg-[#f8fafc] rounded-full text-text-main cursor-pointer"
              >
                <HiX size={20} />
              </button>
            </div>
            {renderFiltersContent()}
          </div>
        </div>
      )}
    </div>
  );
};

export default Properties;
