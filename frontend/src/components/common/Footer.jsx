import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { 
  FaFacebookF, 
  FaTwitter, 
  FaInstagram, 
  FaLinkedinIn 
} from "react-icons/fa";
import { 
  HiMail, 
  HiPhone, 
  HiLocationMarker 
} from "react-icons/hi";

const Footer = () => {
  const { user } = useAuth();

  const socialLinks = [
    { icon: <FaFacebookF />, url: "#" },
    { icon: <FaTwitter />, url: "#" },
    { icon: <FaInstagram />, url: "#" },
    { icon: <FaLinkedinIn />, url: "#" }
  ];

  return (
    <footer className="bg-white border-t border-[#e2e8f0] pt-20 pb-8 mt-auto">
      <div className="max-w-[1280px] mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
        {/* Brand Section */}
        <div className="flex flex-col gap-4">
          <Link to="/" className="flex items-center gap-2 text-2xl font-bold text-primary">
            <span className="bg-primary text-white py-1 px-2.5 rounded-xl text-base font-extrabold">RE</span>
            <span>RealEstate</span>
          </Link>
          <p className="text-text-muted text-[14px] leading-relaxed max-w-[320px]">
            Reinventing the property search experience from the ground up with transparency, premium services, and smart matching technology.
          </p>
          <div className="flex gap-3 mt-2">
            {socialLinks.map((social, index) => (
              <a 
                key={index} 
                href={social.url} 
                className="w-9 h-9 rounded-full bg-[#f8fafc] flex items-center justify-center text-text-main hover:bg-primary hover:text-white hover:-translate-y-1 transition-all duration-300"
              >
                {social.icon}
              </a>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-[17px] font-bold text-text-main mb-6 uppercase tracking-wider">Company</h4>
          <ul className="flex flex-col gap-3.5 text-text-muted text-[14px]">
            <li><Link to="/" className="hover:text-primary transition-colors">Home</Link></li>
            <li><Link to="/properties" className="hover:text-primary transition-colors">Properties</Link></li>
            <li><Link to="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
            {user && user.role === "buyer" && (
              <li><Link to="/wishlist" className="hover:text-primary transition-colors">Wishlist</Link></li>
            )}
          </ul>
        </div>

        {/* Contact info */}
        <div>
          <h4 className="text-[17px] font-bold text-text-main mb-6 uppercase tracking-wider">Support</h4>
          <ul className="flex flex-col gap-4 text-text-muted text-[14px]">
            <li className="flex items-center gap-3">
              <HiMail className="text-primary text-xl shrink-0" />
              <span>contact@realestate.com</span>
            </li>
            <li className="flex items-center gap-3">
              <HiPhone className="text-primary text-xl shrink-0" />
              <span>+91 1234567890</span>
            </li>
            <li className="flex items-start gap-3">
              <HiLocationMarker className="text-primary text-xl shrink-0 mt-0.5" />
              <span>123 Business Hub, Bhubaneswar, Odisha, India</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Copyright */}
      <div className="max-w-[1280px] mx-auto px-6 pt-6 border-t border-[#f1f5f9] text-center text-text-muted text-[13px]">
        <p>&copy; {new Date().getFullYear()} RealEstate Platform. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
