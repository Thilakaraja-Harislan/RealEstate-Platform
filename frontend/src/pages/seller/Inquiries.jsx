import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api";
import { adminInquiriesStyles as s } from "../../assets/dummyStyles";
import { 
  HiOutlineChatAlt2, 
  HiOutlineLibrary, 
  HiOutlineCalendar,
  HiOutlineUser
} from "react-icons/hi";

const Inquiries = () => {
  const navigate = useNavigate();
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchInquiries();
  }, []);

  const fetchInquiries = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/chat");
      setInquiries(res.data || []);
      setError(null);
    } catch (err) {
      setError("Failed to fetch customer leads.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loader-full-page">
        <div className="loader"></div>
      </div>
    );
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-LK", {
      style: "currency",
      currency: "LKR",
      maximumFractionDigits: 0
    }).format(price);
  };

  return (
    <div className="fade-in text-left">
      
      {/* Header Container */}
      <div className={s.headerContainer}>
        <h1 className={s.headerTitle}>Customer Leads</h1>
        <p className={s.headerSubtitle}>
          Manage and communicate with buyers interested in your property listings.
        </p>
      </div>

      {error && <div className="text-red-500 font-bold mb-6">{error}</div>}

      {/* Inquiry List */}
      {inquiries.length === 0 ? (
        <div className={s.emptyState}>
          <div className={s.emptyIconWrapper}>
            <HiOutlineChatAlt2 size={44} className="mx-auto" />
          </div>
          <h3 className="text-lg font-bold text-text-main mb-2">No Customer Leads</h3>
          <p className={s.emptyText}>When buyers contact you regarding your listings, they will show up here.</p>
        </div>
      ) : (
        <div className={s.listContainer}>
          {inquiries.map((chat) => (
            <div key={chat.id} className={s.inquiryCard}>
              
              {/* Card Top Section */}
              <div className={s.cardTopSection}>
                <div className={s.propertyInfoWrapper}>
                  <div className={s.propertyIconWrapper}>
                    <HiOutlineLibrary size={22} />
                  </div>
                  <div className={s.propertyTextWrapper}>
                    <h4 className={s.propertyTitle}>
                      {chat.property.title}
                    </h4>
                    <p className={s.propertyId}>
                      Price: {formatPrice(chat.property.price)} • {chat.property.propertyType}
                    </p>
                  </div>
                </div>
                <div className={s.dateWrapper}>
                  <HiOutlineCalendar size={16} className={s.dateIcon} />
                  <span>Started: {new Date(chat.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                
                {/* Buyer Card */}
                <div className={`${s.detailCard} md:col-span-2`}>
                  <div className={s.detailLabel}>Buyer Information</div>
                  <div className="flex items-center gap-4">
                    <img 
                      src={chat.buyer.profilePic || `https://ui-avatars.com/api/?name=${chat.buyer.name}&background=0d6e59&color=fff`} 
                      alt="Buyer" 
                      className="w-12 h-12 rounded-full object-cover border border-[#cbd5e1] shadow-sm"
                    />
                    <div>
                      <div className={s.detailName}>{chat.buyer.name}</div>
                      <div className={s.detailEmail}>
                        {chat.buyer.email} {chat.buyer.phone ? `• ${chat.buyer.phone}` : ""}
                      </div>
                    </div>
                  </div>
                </div>

                {/* CTA Action Column */}
                <div className="flex justify-end w-full">
                  <button
                    onClick={() => navigate("/chat-messages", { state: { activeChatId: chat.id } })}
                    className="btn btn-primary py-3.5 px-6 font-bold w-full md:w-auto shadow-md"
                  >
                    <HiOutlineChatAlt2 size={16} className="inline mr-1" /> Start Chatting
                  </button>
                </div>

              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default Inquiries;
