import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { HiOutlineUser, HiOutlineMail, HiOutlineLockClosed, HiOutlinePhone, HiEye, HiEyeOff } from "react-icons/hi";

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("buyer"); // "buyer" or "seller"
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    const res = await register(name, email, password, phone, role);
    setLoading(false);

    if (res.success) {
      setSuccess(true);
      setName("");
      setEmail("");
      setPassword("");
      setPhone("");
      setRole("buyer");
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="min-h-screen bg-bg-alt flex items-center justify-center pt-2 px-6 pb-12">
      <div className="card-premium w-full max-w-[480px] p-8 md:p-10 shadow-lg bg-white">
        
        {/* Logo/Title */}
        <div className="text-center mb-8">
          <Link to="/" className="flex items-center justify-center gap-2 text-2xl font-extrabold text-primary mb-3">
            <span className="bg-primary text-white py-1 px-2.5 rounded-xl text-base font-extrabold">RE</span>
            <span>RealEstate</span>
          </Link>
          <h2 className="text-2xl font-extrabold text-text-main">Create Account</h2>
          <p className="text-sm text-text-muted mt-1.5">Join the platform to browse wishlists or list properties.</p>
        </div>

        {/* Status Panels */}
        {error && (
          <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm font-semibold mb-6 border border-red-100 text-left">
            {error}
          </div>
        )}
        {success && (
          <div className="p-4 bg-green-50 text-green-700 rounded-xl text-sm font-semibold mb-6 border border-green-100 text-left">
            Registration successful! Redirecting to login page...
          </div>
        )}

        {/* Register Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4.5 text-left">
          
          {/* Full Name */}
          <div>
            <label className="block text-sm font-bold text-text-main mb-2">Full Name</label>
            <div className="relative">
              <input
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full py-3 pl-11 pr-4 rounded-xl border border-[#e5e7eb] outline-none text-[15px] focus:border-primary transition-colors"
                required
              />
              <HiOutlineUser className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94a3b8] text-xl" />
            </div>
          </div>

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

          {/* Phone */}
          <div>
            <label className="block text-sm font-bold text-text-main mb-2">Phone Number</label>
            <div className="relative">
              <input
                type="tel"
                placeholder="+94 77 123 4567"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/[^0-9+\s-]/g, ""))}
                className="w-full py-3 pl-11 pr-4 rounded-xl border border-[#e5e7eb] outline-none text-[15px] focus:border-primary transition-colors"
                required
              />
              <HiOutlinePhone className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94a3b8] text-xl" />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-bold text-text-main mb-2">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Create a password"
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

          {/* Role selection */}
          <div>
            <label className="block text-sm font-bold text-text-main mb-2">Join as</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setRole("buyer")}
                className={`py-3 rounded-xl text-sm font-bold border transition-all cursor-pointer ${
                  role === "buyer"
                    ? "bg-primary border-primary text-white shadow-sm"
                    : "bg-white border-[#e5e7eb] text-text-main hover:bg-[#f8fafc]"
                }`}
              >
                Buyer
              </button>
              <button
                type="button"
                onClick={() => setRole("seller")}
                className={`py-3 rounded-xl text-sm font-bold border transition-all cursor-pointer ${
                  role === "seller"
                    ? "bg-primary border-primary text-white shadow-sm"
                    : "bg-white border-[#e5e7eb] text-text-main hover:bg-[#f8fafc]"
                }`}
              >
                Seller/Agent
              </button>
            </div>
            {role === "seller" && (
              <p className="text-[11px] text-[#6b7280] font-semibold mt-2 text-left">
                * Sellers require validation and approval from the administrator before logging in.
              </p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || success}
            className="btn btn-primary w-full py-3.5 mt-2 font-bold cursor-pointer disabled:opacity-50"
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        {/* Footer */}
        <div className="text-center mt-8 pt-6 border-t border-[#f1f5f9] text-sm text-text-muted">
          <span>Already have an account? </span>
          <Link to="/login" className="font-bold text-primary hover:underline">
            Login Here
          </Link>
        </div>

      </div>
    </div>
  );
};

export default Register;
