import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../../api";
import { HiOutlineMail, HiOutlineLockClosed, HiEye, HiEyeOff, HiCheckCircle } from "react-icons/hi";

const ResetPassword = () => {
  const { token } = useParams(); // reset token from URL
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Forgot password flow (when no token is in URL)
  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await api.post("/api/auth/forgot-password", { email });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to process request. Please verify your email.");
    } finally {
      setLoading(false);
    }
  };

  // Reset password flow (when token is in URL)
  const handleResetSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await api.post(`/api/auth/reset-password/${token}`, { password });
      setSuccess(true);
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Reset token has expired or is invalid.");
    } finally {
      setLoading(false);
    }
  };

  const isResetFlow = !!token;

  return (
    <div className="min-h-screen bg-bg-alt flex items-center justify-center pt-2 px-6 pb-12">
      <div className="card-premium w-full max-w-[450px] p-8 md:p-10 shadow-lg bg-white">
        
        {/* Title */}
        <div className="text-center mb-8">
          <Link to="/" className="flex items-center justify-center gap-2 text-2xl font-extrabold text-primary mb-3">
            <span className="bg-primary text-white py-1 px-2.5 rounded-xl text-base font-extrabold">RE</span>
            <span>RealEstate</span>
          </Link>
          <h2 className="text-2xl font-extrabold text-text-main">
            {isResetFlow ? "Reset Password" : "Forgot Password"}
          </h2>
          <p className="text-sm text-text-muted mt-1.5">
            {isResetFlow 
              ? "Choose a strong password to secure your account." 
              : "Enter your email to receive a password reset link."}
          </p>
        </div>

        {/* Success Panel */}
        {success && (
          <div className="text-center py-6 text-left">
            <HiCheckCircle size={54} className="text-primary mx-auto mb-4" />
            <h4 className="font-extrabold text-lg text-text-main mb-2">Request Successful</h4>
            <p className="text-sm text-text-muted">
              {isResetFlow
                ? "Your password has been successfully reset! Redirecting to login..."
                : "A password reset link has been logged to the server logs. Please check the backend console."}
            </p>
            {!isResetFlow && (
              <button onClick={() => setSuccess(false)} className="btn btn-primary py-2 px-6 rounded-lg font-bold mt-6 w-full">
                Try Again
              </button>
            )}
          </div>
        )}

        {/* Main Content */}
        {!success && (
          <div className="text-left">
            {error && (
              <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm font-semibold mb-6 border border-red-100">
                {error}
              </div>
            )}

            {isResetFlow ? (
              // Reset Password Form
              <form onSubmit={handleResetSubmit} className="flex flex-col gap-5">
                <div>
                  <label className="block text-sm font-bold text-text-main mb-2">New Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full py-3 pl-11 pr-12 rounded-xl border border-[#e5e7eb] outline-none text-[15px] focus:border-primary transition-colors"
                      required
                    />
                    <HiOutlineLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94a3b8] text-xl" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#94a3b8] cursor-pointer"
                    >
                      {showPassword ? <HiEyeOff size={20} /> : <HiEye size={20} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-text-main mb-2">Confirm Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full py-3 pl-11 pr-12 rounded-xl border border-[#e5e7eb] outline-none text-[15px] focus:border-primary transition-colors"
                      required
                    />
                    <HiOutlineLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94a3b8] text-xl" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary w-full py-3.5 mt-2 font-bold cursor-pointer"
                >
                  {loading ? "Resetting..." : "Reset Password"}
                </button>
              </form>
            ) : (
              // Forgot Password Form
              <form onSubmit={handleForgotSubmit} className="flex flex-col gap-5">
                <div>
                  <label className="block text-sm font-bold text-text-main mb-2">Email Address</label>
                  <div className="relative">
                    <input
                      type="email"
                      placeholder="john@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full py-3 pl-11 pr-4 rounded-xl border border-[#e5e7eb] outline-none text-[15px] focus:border-primary transition-colors"
                      required
                    />
                    <HiOutlineMail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94a3b8] text-xl" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary w-full py-3.5 mt-2 font-bold cursor-pointer"
                >
                  {loading ? "Processing Request..." : "Request Reset Link"}
                </button>
              </form>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-8 pt-6 border-t border-[#f1f5f9] text-sm text-text-muted">
          <Link to="/login" className="font-bold text-primary hover:underline">
            Back to Login
          </Link>
        </div>

      </div>
    </div>
  );
};

export default ResetPassword;
