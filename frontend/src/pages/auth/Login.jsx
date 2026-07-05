import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { HiOutlineMail, HiOutlineLockClosed, HiEye, HiEyeOff } from "react-icons/hi";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [error, setError] = useState(null);
  const [pendingApproval, setPendingApproval] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setPendingApproval(false);

    const res = await login(email, password);
    setLoading(false);
    
    if (res.success) {
      navigate("/");
    } else {
      setError(res.message);
      if (res.pendingApproval) {
        setPendingApproval(true);
      }
    }
  };

  return (
    <div className="min-h-screen bg-bg-alt flex items-center justify-center pt-2 px-6 pb-12">
      <div className="card-premium w-full max-w-[450px] p-8 md:p-10 shadow-lg bg-white">
        
        {/* Logo/Title */}
        <div className="text-center mb-8">
          <Link to="/" className="flex items-center justify-center gap-2 text-2xl font-extrabold text-primary mb-3">
            <span className="bg-primary text-white py-1 px-2.5 rounded-xl text-base font-extrabold">RE</span>
            <span>RealEstate</span>
          </Link>
          <h2 className="text-2xl font-extrabold text-text-main">Welcome Back</h2>
          <p className="text-sm text-text-muted mt-1.5">Sign in to manage your properties or start inquiries.</p>
        </div>

        {/* Error panel */}
        {error && (
          <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm font-semibold mb-6 border border-red-100 text-left">
            <p>{error}</p>
            {pendingApproval && (
              <p className="text-xs text-red-500 font-medium mt-1">
                Sellers/Agents must be verified and approved by the admin before logging in.
              </p>
            )}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5 text-left">
          
          {/* Email */}
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

          {/* Password */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-bold text-text-main">Password</label>
              <Link to="/forgot-password" className="text-xs font-bold text-primary hover:underline">
                Forgot Password?
              </Link>
            </div>
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

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full py-3.5 mt-2 font-bold cursor-pointer disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        {/* Footer */}
        <div className="text-center mt-8 pt-6 border-t border-[#f1f5f9] text-sm text-text-muted">
          <span>Don't have an account? </span>
          <Link to="/register" className="font-bold text-primary hover:underline">
            Register Here
          </Link>
        </div>

        {/* Testing Info */}
        <div className="mt-6 pt-5 border-t border-[#f1f5f9] text-left">
          <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider mb-2.5">Demo Seed Accounts:</p>
          <div className="flex flex-col gap-2 text-xs text-[#64748b]">
            <p><strong>Admin</strong>: <code className="bg-bg-alt px-1.5 py-0.5 rounded text-primary">admin@realestate.lk</code> / <code className="bg-bg-alt px-1.5 py-0.5 rounded text-primary">adminpassword</code></p>
            <p><strong>Seller</strong>: <code className="bg-bg-alt px-1.5 py-0.5 rounded text-primary">dilani@realestate.lk</code> / <code className="bg-bg-alt px-1.5 py-0.5 rounded text-primary">password123</code></p>
            <p><strong>Buyer</strong>: <code className="bg-bg-alt px-1.5 py-0.5 rounded text-primary">nimantha@realestate.lk</code> / <code className="bg-bg-alt px-1.5 py-0.5 rounded text-primary">password123</code></p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;
