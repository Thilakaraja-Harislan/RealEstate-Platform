import React, { useState } from "react";
import api from "../../api";
import { contactStyles as s } from "../../assets/dummyStyles";
import { HiOutlineMail, HiOutlinePhone, HiOutlineLocationMarker, HiCheckCircle } from "react-icons/hi";

const Contact = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("buyer");
  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await api.post("/api/contact", {
        name,
        email,
        phone,
        role,
        message,
      });
      setSuccess(true);
      setName("");
      setEmail("");
      setPhone("");
      setRole("buyer");
      setMessage("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={s.container}>
      <div className={s.mainContainer}>
        
        {/* Header */}
        <div className={s.header}>
          <h1 className={s.heading}>Contact Support</h1>
          <p className={s.subheading}>Have questions or need assistance? Reach out to our customer care team.</p>
        </div>

        {/* Grid */}
        <div className={s.grid}>
          {/* Left Column: Info Card */}
          <div className={s.contactInfoContainer}>
            <div className={s.contactInfoCard}>
              {/* Email */}
              <div className={`${s.contactItem} ${s.contactItemMarginBottom}`}>
                <div className={s.contactIconWrapper}>
                  <HiOutlineMail size={22} />
                </div>
                <div className="text-left">
                  <h4 className={s.contactTitle}>Email Support</h4>
                  <p className={s.contactDetail}>support@realestate.com</p>
                </div>
              </div>

              {/* Phone */}
              <div className={`${s.contactItem} ${s.contactItemMarginBottom}`}>
                <div className={s.contactIconWrapperAlt}>
                  <HiOutlinePhone size={22} />
                </div>
                <div className="text-left">
                  <h4 className={s.contactTitle}>Phone Support</h4>
                  <p className={s.contactDetail}>+91 1234567890</p>
                </div>
              </div>

              {/* Location */}
              <div className={s.contactItem}>
                <div className={s.contactIconWrapper}>
                  <HiOutlineLocationMarker size={22} />
                </div>
                <div className="text-left">
                  <h4 className={s.contactTitle}>Office Location</h4>
                  <p className={s.contactDetail}>123 Business Hub, Bhubaneswar, India</p>
                </div>
              </div>
            </div>

            {/* Quick Promo Card */}
            <div className={s.quickSupportCard}>
              <h4 className={s.quickSupportTitle}>Fast & Friendly</h4>
              <p className={s.quickSupportText}>Our agents respond within 24 hours to help you solve listing or verification issues.</p>
            </div>
          </div>

          {/* Right Column: Form */}
          <div className={s.formCard}>
            {success ? (
              <div className={s.successContainer}>
                <HiCheckCircle size={64} className={s.successIcon} />
                <h3 className={s.successTitle}>Thank You!</h3>
                <p className={s.successMessage}>Your inquiry has been successfully sent. An administrator will contact you shortly.</p>
                <button onClick={() => setSuccess(false)} className={s.successButton}>
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className={s.form}>
                {error && <div className={s.errorMessage}>{error}</div>}

                <div className={s.formTwoColGrid}>
                  <div className={s.inputGroup}>
                    <label className={s.label}>Your Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="John Doe"
                      className={s.input}
                      required
                    />
                  </div>

                  <div className={s.inputGroup}>
                    <label className={s.label}>Your Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="john@example.com"
                      className={s.input}
                      required
                    />
                  </div>
                </div>

                <div className={s.formTwoColGrid}>
                  <div className={s.inputGroup}>
                    <label className={s.label}>Phone Number (Optional)</label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 9999999999"
                      className={s.input}
                    />
                  </div>

                  <div className={s.inputGroup}>
                    <label className={s.label}>Who are you?</label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className={s.input}
                    >
                      <option value="buyer">Buyer / Searcher</option>
                      <option value="seller">Seller / Agent</option>
                    </select>
                  </div>
                </div>

                <div className={s.inputGroup}>
                  <label className={s.label}>Your Message</label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Enter your message here..."
                    rows="5"
                    className={`${s.input} ${s.textarea}`}
                    required
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={s.submitButton}
                >
                  {loading ? "Submitting..." : "Send Message"}
                </button>
              </form>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Contact;
