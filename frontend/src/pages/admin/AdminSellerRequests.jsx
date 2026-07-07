import React, { useState, useEffect } from "react";
import api from "../../api";
import { sellerRequestsStyles as s } from "../../assets/dummyStyles";
import { 
  HiOutlineUserAdd, 
  HiOutlineCheck, 
  HiOutlineMail, 
  HiOutlinePhone,
  HiOutlineClock 
} from "react-icons/hi";

const AdminSellerRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/user/admin/seller-requests");
      setRequests(res.data);
      setError(null);
    } catch (err) {
      setError("Failed to fetch pending requests.");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await api.patch(`/api/user/admin/seller-requests/${id}/approve`);
      fetchRequests();
    } catch (err) {
      console.error("Error approving seller:", err);
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
        <h1 className={s.pageTitle}>Seller Registrations</h1>
        <p className={s.pageSubtitle}>
          Validate and approve accounts for real estate agents and individual sellers.
        </p>
      </div>

      {error && <div className="text-red-500 font-bold mb-6">{error}</div>}

      {/* Main Content Card */}
      <div className={s.card}>
        <div className={s.cardInner}>
          <h2 className={s.sectionTitle}>Pending Requests</h2>

          {requests.length === 0 ? (
            <div className={s.emptyState}>
              <HiOutlineUserAdd size={48} className={`text-text-muted ${s.emptyStateIcon}`} />
              <p className="mt-4 font-semibold text-sm">All caught up!</p>
              <p className="text-xs text-text-muted mt-1">No pending seller verification requests at the moment.</p>
            </div>
          ) : (
            <div className={s.requestGrid}>
              {requests.map((req) => (
                <div key={req.id} className={s.requestCard}>
                  
                  {/* Card Header */}
                  <div className={s.requestHeader}>
                    <div className={s.avatar}>
                      {req.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className={s.requestName}>{req.name}</h4>
                      <p className={s.requestDate}>
                        <HiOutlineClock size={12} />
                        {new Date(req.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className={s.contactInfo}>
                    <div className={s.contactItem}>
                      <HiOutlineMail size={16} className="text-text-muted" />
                      <span>{req.email}</span>
                    </div>
                    <div className={s.contactItem}>
                      <HiOutlinePhone size={16} className="text-text-muted" />
                      <span>{req.phone || "No phone number listed"}</span>
                    </div>
                  </div>

                  {/* Approve Button */}
                  <button
                    onClick={() => handleApprove(req.id)}
                    className={s.approveButton}
                  >
                    <HiOutlineCheck size={16} /> Approve Account
                  </button>

                </div>
              ))}
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default AdminSellerRequests;
