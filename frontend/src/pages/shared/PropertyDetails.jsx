import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../../api";
import { useAuth } from "../../context/AuthContext";
import { 
  HiOutlineLocationMarker, 
  HiOutlineEye, 
  HiShieldCheck, 
  HiOutlineChevronLeft,
  HiOutlineChatAlt2
} from "react-icons/hi";
import { FaBed, FaBath, FaCube, FaRulerCombined } from "react-icons/fa";

const PropertyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [property, setProperty] = useState(null);
  const [activeImage, setActiveImage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Inquiry form
  const [inquiryMessage, setInquiryMessage] = useState(
    "Hi, I am interested in this property. Please contact me with more details."
  );
  const [sendingInquiry, setSendingInquiry] = useState(false);
  const [inquirySuccess, setInquirySuccess] = useState(false);

  useEffect(() => {
    fetchPropertyDetails();
  }, [id]);

  const fetchPropertyDetails = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/api/property/${id}`);
      setProperty(res.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load property details.");
    } finally {
      setLoading(false);
    }
  };

  const handleInquirySubmit = async (e) => {
    e.preventDefault();
    if (!localStorage.getItem("token")) {
      navigate("/login");
      return;
    }

    try {
      setSendingInquiry(true);
      // Start or get chat session
      const res = await api.post("/api/chat/start", {
        propertyId: property.id,
        sellerId: property.seller.id,
        buyerId: user?.id,
      });

      // Send the initial text message over REST or WebSocket
      // For REST fallback to set up chat instantly:
      const savedChat = res.data;

      // We redirect to chat-messages, highlighting the active chat
      navigate("/chat-messages", { state: { activeChatId: savedChat.id, initialMessage: inquiryMessage } });
      setInquirySuccess(true);
    } catch (err) {
      console.error("Failed to start chat inquiry:", err);
    } finally {
      setSendingInquiry(false);
    }
  };

  if (loading) {
    return (
      <div className="loader-full-page">
        <div className="loader"></div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="bg-bg-alt min-h-screen pt-12 pb-16 flex flex-col items-center justify-center">
        <div className="card-premium p-8 max-w-[500px] text-center bg-white shadow-sm">
          <p className="text-red-500 font-bold text-lg mb-4">{error || "Property not found."}</p>
          <Link to="/properties" className="btn btn-primary py-2 px-6 rounded-lg">
            Back to Properties
          </Link>
        </div>
      </div>
    );
  }

  const formattedPrice = new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    maximumFractionDigits: 0,
  }).format(property.price);

  return (
    <div className="bg-bg-alt min-h-screen pt-2 pb-16">
      <div className="max-w-[1280px] mx-auto px-6">
        
        {/* Back Link */}
        <Link to="/properties" className="flex items-center gap-1.5 text-sm font-bold text-text-muted hover:text-primary transition-colors mb-6">
          <HiOutlineChevronLeft size={18} /> Back to Catalog
        </Link>

        {/* Title and Top Info */}
        <div className="flex justify-between items-start mb-8 flex-wrap gap-4 text-left">
          <div>
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <span className="badge badge-sale">For Sale</span>
              <span className="badge bg-primary-light text-primary">{property.propertyType}</span>
              {property.verified && (
                <span className="badge bg-green-100 text-green-700 flex items-center gap-1.5 font-bold">
                  <HiShieldCheck size={16} /> Verified
                </span>
              )}
            </div>
            <h1 className="text-3xl md:text-[32px] font-extrabold text-text-main leading-tight mb-2.5">{property.title}</h1>
            <div className="flex items-center gap-2 text-text-muted text-sm flex-wrap">
              <HiOutlineLocationMarker className="text-primary text-base" />
              <span>{property.area}, {property.city} - {property.pincode}</span>
              <span className="mx-2 hidden sm:inline">•</span>
              <HiOutlineEye className="text-text-muted text-base" />
              <span>{property.views} Views</span>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider block mb-0.5">Price</span>
            <span className="text-[32px] font-extrabold text-primary">{formattedPrice}</span>
          </div>
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-[1fr_380px] gap-8 max-lg:grid-cols-1">
          {/* Main Column */}
          <div className="flex flex-col gap-8">
            {/* Image Gallery */}
            <div className="bg-white rounded-3xl border border-[#e5e7eb] p-4 shadow-sm flex flex-col gap-4">
              <div className="aspect-[16/9] w-full rounded-2xl overflow-hidden bg-[#f8fafc]">
                <img 
                  src={property.images && property.images.length > 0 ? property.images[activeImage] : "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80"} 
                  alt={property.title} 
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Thumbnails */}
              {property.images && property.images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-1">
                  {property.images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveImage(index)}
                      className={`w-[80px] h-[60px] rounded-lg overflow-hidden border-2 shrink-0 cursor-pointer transition-all ${
                        activeImage === index ? "border-primary scale-[1.03]" : "border-[#e5e7eb]"
                      }`}
                    >
                      <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Specs Grid */}
            <div className="bg-white rounded-3xl border border-[#e5e7eb] p-6 shadow-sm grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="flex flex-col items-center">
                <span className="text-[#6b7280] text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5"><FaBed /> BHK</span>
                <span className="font-extrabold text-lg text-text-main">{property.bhk || "N/A"}</span>
              </div>
              <div className="flex flex-col items-center border-l border-[#f1f5f9] max-sm:border-none">
                <span className="text-[#6b7280] text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5"><FaBath /> Baths</span>
                <span className="font-extrabold text-lg text-text-main">{property.bathrooms || 1}</span>
              </div>
              <div className="flex flex-col items-center border-l border-[#f1f5f9]">
                <span className="text-[#6b7280] text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5"><FaRulerCombined /> Area</span>
                <span className="font-extrabold text-lg text-text-main">{property.areaSize ? `${property.areaSize} sqft` : "N/A"}</span>
              </div>
              <div className="flex flex-col items-center border-l border-[#f1f5f9] max-sm:border-none">
                <span className="text-[#6b7280] text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5"><FaCube /> Furnishing</span>
                <span className="font-extrabold text-lg text-text-main capitalize">{property.furnishing || "N/A"}</span>
              </div>
            </div>

            {/* Details Description */}
            <div className="bg-white rounded-3xl border border-[#e5e7eb] p-8 shadow-sm text-left">
              <h3 className="text-xl font-bold text-text-main mb-4 border-b border-[#f1f5f9] pb-3">Description</h3>
              <p className="text-text-muted leading-relaxed whitespace-pre-wrap">{property.description}</p>
            </div>

            {/* Amenities Section */}
            {property.amenities && property.amenities.length > 0 && (
              <div className="bg-white rounded-3xl border border-[#e5e7eb] p-8 shadow-sm text-left">
                <h3 className="text-xl font-bold text-text-main mb-5 border-b border-[#f1f5f9] pb-3">Amenities</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {property.amenities.map((amenity, index) => (
                    <div key={index} className="flex items-center gap-2.5 py-1 text-sm font-semibold text-[#475569]">
                      <HiShieldCheck className="text-primary text-xl shrink-0" />
                      <span className="capitalize">{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Seller & Contact */}
          <div className="flex flex-col gap-6 text-left">
            {/* Seller Info Card */}
            <div className="bg-white rounded-3xl border border-[#e5e7eb] p-6 shadow-sm flex flex-col gap-5">
              <h3 className="font-extrabold text-lg text-text-main border-b border-[#f1f5f9] pb-3">Property Agent</h3>
              
              <div className="flex items-center gap-4">
                <img 
                  src={property.seller?.profilePic || `https://ui-avatars.com/api/?name=${property.seller?.name || "Seller"}&background=0d6e59&color=fff`} 
                  alt="Agent" 
                  className="w-16 h-16 rounded-full object-cover border"
                />
                <div>
                  <h4 className="font-extrabold text-text-main text-[15px]">{property.seller?.name}</h4>
                  <p className="text-xs text-text-muted capitalize">{property.seller?.role}</p>
                  {property.seller?.phone && (
                    <p className="text-xs text-primary font-bold mt-1">{property.seller.phone}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Contact / Inquiry Box */}
            <div className="bg-white rounded-3xl border border-[#e5e7eb] p-6 shadow-sm flex flex-col gap-4">
              <h3 className="font-extrabold text-lg text-text-main border-b border-[#f1f5f9] pb-3">Contact Partner</h3>

              {user ? (
                user.id === property.seller.id ? (
                  <div className="text-center py-4 bg-[#f8fafc] rounded-2xl border border-[#f1f5f9]">
                    <p className="text-text-muted text-sm font-semibold">This is your property listing</p>
                  </div>
                ) : user.role === "seller" ? (
                  <div className="text-center py-4 bg-[#f8fafc] rounded-2xl border border-[#f1f5f9]">
                    <p className="text-text-muted text-sm font-semibold">Sellers cannot send inquiries</p>
                  </div>
                ) : (
                  <form onSubmit={handleInquirySubmit} className="flex flex-col gap-4">
                    <div>
                      <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Message</label>
                      <textarea
                        value={inquiryMessage}
                        onChange={(e) => setInquiryMessage(e.target.value)}
                        placeholder="Write your message here..."
                        rows="4"
                        className="w-full p-3 rounded-xl border border-[#e5e7eb] outline-none text-sm leading-relaxed resize-none focus:border-primary transition-colors"
                        required
                      ></textarea>
                    </div>

                    <button
                      type="submit"
                      disabled={sendingInquiry}
                      className="btn btn-primary w-full py-3.5 flex items-center justify-center gap-2 font-bold cursor-pointer disabled:opacity-50"
                    >
                      <HiOutlineChatAlt2 size={20} />
                      {sendingInquiry ? "Starting Chat..." : "Send Inquiry & Chat"}
                    </button>
                  </form>
                )
              ) : (
                <div className="flex flex-col gap-4 text-center">
                  <p className="text-text-muted text-sm">Please sign in to send messages or start chats with property agents.</p>
                  <Link to="/login" className="btn btn-primary w-full py-3 font-bold">
                    Sign In to Contact
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PropertyDetails;
