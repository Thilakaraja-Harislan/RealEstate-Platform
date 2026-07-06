import React from "react";
import { Link } from "react-router-dom";
import { 
  HiHeart, 
  HiOutlineHeart, 
  HiOutlineLocationMarker, 
  HiOutlineHome, 
  HiArrowsExpand 
} from "react-icons/hi";
import { FaBath, FaBed } from "react-icons/fa";

const PropertyCard = ({ 
  property, 
  isWishlisted, 
  onToggleWishlist, 
  role, 
  onStatusChange, 
  onDelete, 
  onVerify,
  renderActions
}) => {
  const formattedPrice = new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    maximumFractionDigits: 0,
  }).format(property.price);

  const mainImage = property.images && property.images.length > 0 
    ? property.images[0] 
    : "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80";

  return (
    <div className="card-premium flex flex-col h-full w-full max-w-[360px] bg-white group hover:shadow-xl transition-all duration-300">
      {/* Property Image & Badge */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#f1f5f9]">
        <img 
          src={mainImage} 
          alt={property.title} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        
        {/* Status Badge */}
        <span className={`absolute top-4 left-4 badge ${property.status === 'sold' ? 'badge-sale' : 'badge-rent'}`}>
          For {property.status === 'sold' ? 'Sold' : 'Sale'}
        </span>

        {/* Wishlist Button (Only for buyers/public, not for management dashboards) */}
        {!role && onToggleWishlist && (
          <button 
            onClick={(e) => {
              e.preventDefault();
              onToggleWishlist(property.id);
            }}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white flex items-center justify-center text-red-500 shadow-md cursor-pointer hover:scale-105 active:scale-95 transition-all z-10"
          >
            {isWishlisted ? <HiHeart className="text-xl" /> : <HiOutlineHeart className="text-xl text-[#6b7280]" />}
          </button>
        )}
      </div>

      {/* Property Details */}
      <div className="p-5 flex flex-col flex-1">
        <span className="text-xs font-bold text-primary uppercase tracking-wider mb-1.5">{property.propertyType}</span>
        
        <Link to={`/properties/${property.id}`} className="hover:text-primary transition-colors mb-2">
          <h3 className="font-extrabold text-[17px] text-text-main leading-snug line-clamp-1">{property.title}</h3>
        </Link>

        {/* Location */}
        <div className="flex items-center gap-1.5 text-text-muted text-[13px] mb-4">
          <HiOutlineLocationMarker className="text-primary text-[15px] shrink-0" />
          <span className="truncate">{property.area}, {property.city}</span>
        </div>

        {/* Specs Grid */}
        <div className="grid grid-cols-3 gap-2 py-3 border-y border-[#f1f5f9] mb-4 text-center">
          <div className="flex flex-col items-center">
            <span className="text-[#6b7280] text-[13px] mb-0.5 flex items-center gap-1"><FaBed /> BHK</span>
            <span className="font-bold text-[14px] text-text-main">{property.bhk || "N/A"}</span>
          </div>
          <div className="flex flex-col items-center border-x border-[#f1f5f9]">
            <span className="text-[#6b7280] text-[13px] mb-0.5 flex items-center gap-1"><FaBath /> Baths</span>
            <span className="font-bold text-[14px] text-text-main">{property.bathrooms || 1}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[#6b7280] text-[13px] mb-0.5 flex items-center gap-1"><HiArrowsExpand /> Area</span>
            <span className="font-bold text-[13px] text-text-main">{property.areaSize ? `${property.areaSize} sqft` : "N/A"}</span>
          </div>
        </div>

        {/* Price Tag & CTA */}
        <div className="flex items-center justify-between mt-auto">
          <div className="flex flex-col">
            <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Price</span>
            <span className="text-[18px] font-extrabold text-primary">{formattedPrice}</span>
          </div>
          
          {!role && (
            <Link to={`/properties/${property.id}`} className="btn btn-outline py-2 px-4 text-xs font-bold rounded-lg">
              View Details
            </Link>
          )}
        </div>

        {/* Seller Management Actions */}
        {role === "seller" && (
          <div className="mt-4 pt-4 border-t border-[#f1f5f9] flex gap-2">
            <select
              value={property.status}
              onChange={(e) => onStatusChange(property.id, e.target.value)}
              className={`flex-1 py-1.5 px-2.5 text-xs font-bold rounded-lg border border-[#e2e8f0] bg-white outline-none cursor-pointer ${
                property.status === "sold" ? "text-red-500" : "text-[#10b981]"
              }`}
            >
              <option value="sale" className="text-[#10b981]">For Sale</option>
              <option value="sold" className="text-red-500">Sold</option>
            </select>
            <Link 
              to={`/edit-property/${property.id}`}
              className="py-1.5 px-3 text-xs font-bold rounded-lg border border-[#e2e8f0] bg-white text-text-main hover:bg-[#f8fafc] transition-colors flex items-center justify-center"
            >
              Edit
            </Link>
            <button
              onClick={() => onDelete(property.id)}
              className="py-1.5 px-3 text-xs font-bold rounded-lg border-none bg-red-50 text-red-600 hover:bg-red-100 cursor-pointer transition-colors"
            >
              Delete
            </button>
          </div>
        )}

        {/* Admin Management Actions */}
        {role === "admin" && (
          <div className="mt-4 pt-4 border-t border-[#f1f5f9] flex items-center justify-between gap-2">
            <div className="text-[10px] text-text-muted text-left">
              <span>Owner: </span>
              <span className="font-bold text-text-main truncate block max-w-[120px]">
                {property.seller?.name || "Seller"}
              </span>
            </div>
            <div className="flex gap-2">
              {!property.verified && onVerify && (
                <button
                  onClick={() => onVerify(property.id)}
                  className="py-1.5 px-2.5 text-xs font-bold rounded-lg border-none bg-primary-light text-primary hover:bg-primary hover:text-white cursor-pointer transition-all"
                >
                  Verify
                </button>
              )}
              {property.verified && (
                <span className="py-1 px-2 text-[10px] font-bold uppercase rounded bg-green-100 text-green-700">
                  Verified
                </span>
              )}
              <button
                onClick={() => onDelete(property.id)}
                className="py-1.5 px-2.5 text-xs font-bold rounded-lg border-none bg-red-50 text-red-600 hover:bg-red-100 cursor-pointer transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        )}
        {renderActions && renderActions()}
      </div>
    </div>
  );
};

export default PropertyCard;
