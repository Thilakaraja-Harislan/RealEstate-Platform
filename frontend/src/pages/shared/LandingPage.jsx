import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api";
import { useAuth } from "../../context/AuthContext";
import PropertyCard from "../../components/common/PropertyCard";
import { landingPageStyles as s } from "../../assets/dummyStyles";
import { 
  HiOfficeBuilding, 
  HiHome, 
  HiShieldCheck, 
  HiLightningBolt, 
  HiCurrencyDollar, 
  HiVideoCamera, 
  HiLocationMarker,
  HiChevronRight,
  HiSearch
} from "react-icons/hi";

const LandingPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [properties, setProperties] = useState([]);
  const [propertyCounts, setPropertyCounts] = useState({ flat: 0, villa: 0, penthouse: 0, commercial: 0 });
  const [wishlistIds, setWishlistIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search parameters
  const [city, setCity] = useState("");
  const [propertyType, setPropertyType] = useState("Select Type");
  const [priceRange, setPriceRange] = useState("100000000"); // default max 10Cr

  useEffect(() => {
    fetchLandingData();
  }, []);

  const fetchLandingData = async () => {
    try {
      setLoading(true);
      const propsRes = await api.get("/api/property?sort=latest");
      setProperties(propsRes.data.properties.slice(0, 6)); // top 6 latest properties

      const countsRes = await api.get("/api/property/counts");
      setPropertyCounts(countsRes.data);

      if (localStorage.getItem("token")) {
        const wishlistRes = await api.get("/api/property/wishlist");
        setWishlistIds(wishlistRes.data.wishlist.map(p => p.id));
      }
      setError(null);
    } catch (err) {
      console.error("Error fetching landing page data:", err);
      setError("Failed to load property listings.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (city.trim()) params.append("city", city.trim());
    if (propertyType !== "Select Type") params.append("propertyType", propertyType);
    if (priceRange) params.append("maxPrice", priceRange);
    navigate(`/properties?${params.toString()}`);
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

  const handleCategoryClick = (type) => {
    navigate(`/properties?propertyType=${type}`);
  };

  const categories = [
    {
      name: "Modern Flats",
      count: propertyCounts.flat || 0,
      icon: <HiOfficeBuilding size={32} />,
      type: "flat",
    },
    {
      name: "Luxury Villas",
      count: propertyCounts.villa || 0,
      icon: <HiHome size={32} />,
      type: "villa",
    },
    {
      name: "Penthouses",
      count: propertyCounts.penthouse || 0,
      icon: <HiOfficeBuilding size={32} />,
      type: "penthouse",
    },
    {
      name: "Commercial",
      count: propertyCounts.commercial || 0,
      icon: <HiOfficeBuilding size={32} />,
      type: "commercial",
    },
  ];

  return (
    <div className={s.bgMain}>
      {/* Hero Section */}
      <section className={s.heroSection}>
        <div className={s.heroContent}>
          <span className={s.badge}>Trusted by 20,000+ homeowners</span>
          <h1 className={s.heroTitle}>
            Find Your <span className={s.textGradient}>Perfect</span> Next Chapter.
          </h1>
          <p className={s.heroSubtitle}>
            Experience the most advanced real estate search platform. Discover verified listings, connect with top agents, and find a place you'll love.
          </p>

          {/* Search Form */}
          <form onSubmit={handleSearch} className={s.searchForm}>
            <div className={s.searchField}>
              <HiLocationMarker size={26} className="text-primary shrink-0" />
              <div className={s.flexCol}>
                <label className={s.labelSmall}>Location</label>
                <input
                  type="text"
                  placeholder="Where are you looking?"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className={s.inputTransparent}
                />
              </div>
            </div>

            <div className={s.searchDivider}></div>

            <div className={s.searchField}>
              <HiHome size={26} className="text-primary shrink-0" />
              <div className={s.flexCol}>
                <label className={s.labelSmall}>Property Type</label>
                <select
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value)}
                  className={`${s.inputTransparent} cursor-pointer`}
                >
                  <option value="Select Type">Select Type</option>
                  <option value="flat">Flat/Apartment</option>
                  <option value="villa">Villa/House</option>
                  <option value="penthouse">Penthouse</option>
                  <option value="commercial">Commercial</option>
                </select>
              </div>
            </div>

            <button type="submit" className={s.searchButton}>
              <HiSearch size={22} /> Search
            </button>
          </form>

          {/* Stats */}
          <div className={s.statsContainer}>
            <div className={s.statItemFlex}>
              <span className={s.statNumber}>12k+</span>
              <p className={s.statLabel}>Ready Properties</p>
            </div>
            <div className={s.statItemBorder}>
              <span className={s.statNumber}>500+</span>
              <p className={s.statLabel}>Agent Network</p>
            </div>
            <div className={s.statItemBorder}>
              <span className={s.statNumber}>4.9/5</span>
              <p className={s.statLabel}>User Rating</p>
            </div>
          </div>
        </div>

        {/* Hero Image */}
        <div className={s.heroImageContainer}>
          <div className={s.imageWrapper}>
            <img
              src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80"
              alt="Luxury Home"
              className={s.heroImage}
            />
            {/* Verified Badge Overlay */}
            <div className={s.verifiedBadge}>
              <div className={s.badgeIconWrapper}>
                <HiShieldCheck className="text-primary text-2xl" />
              </div>
              <div className="text-left">
                <h4 className={s.badgeTitle}>Legally Verified Properties</h4>
                <p className={s.badgeText}>All listings are pre-approved by our legal division</p>
                <span className={s.preApproved}>100% SECURE</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Category Section */}
      <section className={s.categorySection}>
        <div className="max-w-[1280px] mx-auto px-6">
          <div className={s.categoryHeader}>
            <div className={s.categoryHeaderText}>
              <h2 className={s.categoryTitle}>Browse by Categories</h2>
              <p className={s.categoryDesc}>Find properties categorized by their style and functional requirements.</p>
            </div>
            <Link to="/properties" className="btn btn-outline py-2.5 px-5 flex items-center gap-1.5 font-bold bg-white">
              Explore All <HiChevronRight />
            </Link>
          </div>

          <div className={s.categoryGrid}>
            {categories.map((cat) => (
              <div
                key={cat.name}
                onClick={() => handleCategoryClick(cat.type)}
                className={s.categoryCard}
              >
                <div className={s.categoryIconWrapper}>{cat.icon}</div>
                <h3 className={s.categoryName}>{cat.name}</h3>
                <p className={s.categoryCount}>{cat.count} Listings</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className={s.featuresSection}>
        <div className={s.featuresContainer}>
          <div className={s.featuresList}>
            {[
              {
                title: "Verified Trust",
                desc: "Every listing is strictly audited for ownership, condition, and legality.",
                icon: <HiShieldCheck size={24} />,
              },
              {
                title: "Smart Search",
                desc: "Filter and sort properties dynamically by budget, space size, and amenities.",
                icon: <HiLightningBolt size={24} />,
              },
              {
                title: "Direct Access",
                desc: "Direct connection with verified sellers/agents without complex intermediaries.",
                icon: <HiCurrencyDollar size={24} />,
              },
              {
                title: "Virtual Galleries",
                desc: "High-definition pictures let you inspect properties before taking a tour.",
                icon: <HiVideoCamera size={24} />,
              },
            ].map((f, idx) => (
              <div key={idx} className={s.featureCard}>
                <div className={s.featureIconWrapper}>{f.icon}</div>
                <h3 className={s.featureTitle}>{f.title}</h3>
                <p className={s.featureDesc}>{f.desc}</p>
              </div>
            ))}
          </div>

          <div className={s.featuresContent}>
            <h2 className={s.featuresHeading}>We Reinvented the Home Search Experience</h2>
            <p className={s.featuresSubtext}>
              By focusing on transparency, technological precision, and user-centric design, we help you find not just a house, but a home.
            </p>
            <div className={s.featuresListItems}>
              {[
                "Direct connection with certified agents",
                "Real-time market valuation data",
                "Secure chat and message center",
                "24/7 Premium customer support",
              ].map((item, idx) => (
                <div key={idx} className={s.listItem}>
                  <HiShieldCheck className="text-primary text-xl shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className={s.processSection}>
        <div className="max-w-[1280px] mx-auto px-6">
          <div className={s.processHeader}>
            <span className={s.processBadge}>Simple Steps</span>
            <h2 className={s.processTitle}>How it Works</h2>
            <p className={s.processSubtitle}>Find, communicate, and acquire your ideal home in three simple steps.</p>
          </div>

          <div className={s.processGrid}>
            {[
              {
                step: "01",
                title: "Smart Search",
                desc: "Search properties in specific cities or areas, filtering by price limits and category.",
                icon: <HiLightningBolt size={32} />,
              },
              {
                step: "02",
                title: "Chat with Sellers",
                desc: "Instantly chat in real-time with verified sellers to clarify details or schedule visits.",
                icon: <HiVideoCamera size={32} />,
              },
              {
                step: "03",
                title: "Acquire & Enjoy",
                desc: "Complete safe, direct agreements and relocate into your dream home.",
                icon: <HiShieldCheck size={32} />,
              },
            ].map((p, idx) => (
              <div key={idx} className={s.processCard}>
                <span className={s.stepNumber}>{p.step}</span>
                <div className={s.processIconWrapper}>{p.icon}</div>
                <h3 className={s.processCardTitle}>{p.title}</h3>
                <p className={s.processCardDesc}>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Collections Section */}
      <section className={s.featuredSection}>
        <div className="max-w-[1280px] mx-auto px-6">
          <div className={s.featuredHeader}>
            <span className={s.featuredBadge}>Premium Collection</span>
            <h2 className={s.featuredTitle}>Featured Listings</h2>
            <p className={s.featuredSubtitle}>Explore our hand-picked selection of premium properties across popular locations.</p>
          </div>

          {loading ? (
            <div className={s.loadingContainer}>
              <div className={s.loader}></div>
            </div>
          ) : error ? (
            <div className={s.errorContainer}>
              <p>{error}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
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

          <div className={s.discoverButtonContainer}>
            <Link to="/properties" className={s.discoverButton}>
              Explore More Properties
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
