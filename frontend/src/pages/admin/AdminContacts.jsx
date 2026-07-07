import React, { useState, useEffect } from "react";
import api from "../../api";
import { adminContactsStyles as s } from "../../assets/dummyStyles";
import { 
  HiOutlineMailOpen, 
  HiOutlineMail, 
  HiOutlinePhone, 
  HiOutlineCalendar 
} from "react-icons/hi";

const AdminContacts = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/contact");
      setContacts(res.data || []);
      setError(null);
    } catch (err) {
      setError("Failed to fetch contact inbox messages.");
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

  return (
    <div className="fade-in text-left">
      
      {/* Header Container */}
      <div className={s.container}>
        <h1 className={s.heading}>Contact Inbox</h1>
        <p className={s.subheading}>Review contact requests submitted by public visitors.</p>
      </div>

      {error && <div className="text-red-500 font-bold mb-6">{error}</div>}

      {/* Main Card Container */}
      <div className={s.card}>
        <div className={s.cardHeader}>
          <h2 className={s.cardTitle}>Inbound Messages</h2>
        </div>

        {contacts.length === 0 ? (
          <div className={s.emptyState}>
            <HiOutlineMailOpen size={48} className={`text-text-muted ${s.emptyIcon}`} />
            <h3 className="text-lg font-bold text-text-main mb-1">Inbox is Empty</h3>
            <p className="text-sm text-text-muted">There are no contact forms submitted yet.</p>
          </div>
        ) : (
          <div className={s.contactList}>
            {contacts.map((msg, index) => (
              <div 
                key={msg.id} 
                className={`${s.contactItem(index, contacts.length)} flex flex-col md:flex-row gap-5 items-start`}
              >
                
                {/* Avatar wrapper */}
                <div className={s.avatarWrapper(msg.role)}>
                  {msg.name.charAt(0).toUpperCase()}
                </div>

                <div className="flex-1 min-w-0">
                  
                  {/* Item Header */}
                  <div className="flex flex-col sm:flex-row justify-between items-start mb-4 gap-2 sm:gap-0">
                    <div>
                      <div className={s.nameBadgeContainer}>
                        <h4 className={s.name}>{msg.name}</h4>
                        <span className={s.roleBadge(msg.role)}>{msg.role}</span>
                      </div>
                      <div className={s.contactDetails}>
                        <div className={s.detailItem}>
                          <HiOutlineMail size={14} />
                          <span>{msg.email}</span>
                        </div>
                        {msg.phone && (
                          <div className={s.detailItem}>
                            <HiOutlinePhone size={14} />
                            <span>{msg.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-text-muted font-semibold">
                      <HiOutlineCalendar size={14} />
                      <span>{new Date(msg.createdAt).toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Message body */}
                  <p className={s.messageBox}>
                    {msg.message}
                  </p>

                </div>

              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default AdminContacts;
