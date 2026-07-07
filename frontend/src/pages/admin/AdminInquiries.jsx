import React, { useState, useEffect } from "react";
import api from "../../api";
import { adminInquiriesStyles as s } from "../../assets/dummyStyles";
import { 
  HiOutlineChatAlt2, 
  HiOutlineLibrary, 
  HiOutlineCalendar 
} from "react-icons/hi";

const AdminInquiries = () => {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchInquiries();
  }, []);

  const fetchInquiries = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/chat/admin/all");
      setInquiries(res.data || []);
      setError(null);
    } catch (err) {
      setError("Failed to fetch conversations.");
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
        <h1 className={s.headerTitle}>System Inquiries</h1>
        <p className={s.headerSubtitle}>
          Audit active chat connections between buyers and agents in the system.
        </p>
      </div>

      {error && <div className="text-red-500 font-bold mb-6">{error}</div>}

      {/* Inquiry List */}
      {inquiries.length === 0 ? (
        <div className={s.emptyState}>
          <div className={s.emptyIconWrapper}>
            <HiOutlineChatAlt2 size={44} className="mx-auto" />
          </div>
          <h3 className="text-lg font-bold text-text-main mb-2">No Active Inquiries</h3>
          <p className={s.emptyText}>There are no active chat sessions between users yet.</p>
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
                      Price: {formatPrice(chat.property.price)} • ID: {chat.property.id ? String(chat.property.id).toUpperCase() : "N/A"}
                    </p>
                  </div>
                </div>
                <div className={s.dateWrapper}>
                  <HiOutlineCalendar size={16} className={s.dateIcon} />
                  <span>Started: {new Date(chat.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Details Grid */}
              <div className={s.detailsGrid}>
                
                {/* Buyer Card */}
                <div className={s.detailCard}>
                  <div className={s.detailLabel}>Buyer Info</div>
                  <div className={s.detailName}>{chat.buyer.name}</div>
                  <div className={s.detailEmail}>{chat.buyer.email}</div>
                </div>

                {/* Seller Card */}
                <div className={s.detailCard}>
                  <div className={s.detailLabel}>Agent / Seller Info</div>
                  <div className={s.detailName}>{chat.seller.name}</div>
                  <div className={s.detailEmail}>{chat.seller.email}</div>
                </div>

              </div>

              {/* Message Container showing Chat connection ID */}
              <div className={s.messageContainer}>
                <div className={s.messageHeader}>
                  <HiOutlineChatAlt2 size={16} />
                  <span>Connection ID: CHAT-{chat.id}</span>
                </div>
                <p className={s.messageText}>
                  This chat link represents a secure connection channel where the buyer can send direct messages to the listing owner.
                </p>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default AdminInquiries;
