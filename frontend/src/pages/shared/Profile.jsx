import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { profileStyles as s } from "../../assets/dummyStyles";
import { HiOutlineUser, HiOutlinePhone, HiOutlineMail, HiOutlineCamera, HiOutlineTrash, HiOutlineCheck } from "react-icons/hi";

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [removePic, setRemovePic] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setRemovePic(false);
    }
  };

  const handleRemovePic = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setRemovePic(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    const formData = new FormData();
    formData.append("name", name);
    formData.append("phone", phone);
    if (removePic) {
      formData.append("removeProfilePic", "true");
    } else if (selectedFile) {
      formData.append("profilePic", selectedFile);
    }

    const res = await updateProfile(formData);
    setLoading(false);
    if (res.success) {
      setSuccess(true);
      setIsEditing(false);
    } else {
      setError(res.message);
    }
  };

  const handleCancel = () => {
    setName(user?.name || "");
    setPhone(user?.phone || "");
    setSelectedFile(null);
    setPreviewUrl(null);
    setRemovePic(false);
    setIsEditing(false);
  };

  // Determine avatar image source
  const getAvatarSrc = () => {
    if (removePic) return null;
    if (previewUrl) return previewUrl;
    return user?.profilePic || null;
  };

  const avatarSrc = getAvatarSrc();

  // Conditionally style container wrapper based on seller role to look identical
  const wrapperClass = s.containerWrapper(user?.role);
  const containerClass = s.mainContainer(user?.role);

  return (
    <div className={wrapperClass}>
      <div className={containerClass}>
        
        {/* Header Section */}
        <div className="flex justify-between items-center mb-8 flex-wrap gap-4 text-left">
          <div>
            <h1 className="text-3xl font-extrabold text-text-main mb-1.5">User Profile</h1>
            <p className="text-sm text-text-muted">Manage your profile details and preferences.</p>
          </div>
        </div>

        {error && <div className={`${s.errorMessage} mb-6`}>{error}</div>}
        {success && (
          <div className="p-4 bg-green-50 text-green-700 rounded-xl mb-6 flex items-center gap-2 font-bold text-sm">
            <HiOutlineCheck size={18} /> Profile updated successfully!
          </div>
        )}

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8 items-start">
          
          {/* Left Column: Profile Card */}
          <div className="card-premium p-8 flex flex-col items-center text-center">
            <div className={s.avatarSection}>
              <div className="w-[128px] h-[128px] rounded-[2.5rem] bg-primary-light overflow-hidden flex items-center justify-center text-[3.5rem] font-bold text-primary border-4 border-white shadow-lg">
                {avatarSrc ? (
                  <img src={avatarSrc} alt="Avatar" className={s.avatarImage} />
                ) : (
                  <HiOutlineUser className={s.avatarPlaceholder} />
                )}
              </div>
              
              {isEditing && (
                <>
                  <label className="absolute -bottom-1 -right-1 bg-primary text-white w-9 h-9 rounded-full flex items-center justify-center cursor-pointer shadow-[0_4px_10px_rgba(0,0,0,0.15)] border-2 border-white z-10 hover:bg-primary-dark transition-colors">
                    <HiOutlineCamera size={18} />
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleFileChange} 
                      className="hidden" 
                    />
                  </label>
                  {avatarSrc && (
                    <button 
                      type="button" 
                      onClick={handleRemovePic} 
                      className="absolute -top-1 -right-1 bg-red-500 text-white w-9 h-9 rounded-full flex items-center justify-center cursor-pointer shadow-[0_4px_10px_rgba(0,0,0,0.15)] border-2 border-white z-10 hover:bg-red-600 transition-colors"
                    >
                      <HiOutlineTrash size={18} />
                    </button>
                  )}
                </>
              )}
            </div>

            <h2 className="text-[1.35rem] font-extrabold text-text-main mt-5 mb-1.5 break-all leading-tight">{user?.name}</h2>
            <span className="badge badge-sale bg-primary-light text-primary px-4 py-1 text-xs font-bold uppercase rounded-xl tracking-wider">{user?.role}</span>
            
            <div className="w-full border-t border-[#e2e8f0] mt-6 pt-6 text-left">
              <span className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2">Account Status</span>
              <div className="flex items-center gap-2 text-sm text-text-main font-semibold">
                <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></div>
                <span>Active & Verified</span>
              </div>
            </div>
          </div>

          {/* Right Column: Information Panel */}
          <div className="card-premium p-8 md:p-10 text-left">
            {isEditing ? (
              <div>
                <h3 className="text-lg font-bold text-text-main mb-6">Edit Account Details</h3>
                <form onSubmit={handleSubmit} className={s.editForm}>
                  <div>
                    <label className={s.label}>Full Name</label>
                    <input 
                      type="text" 
                      value={name} 
                      onChange={(e) => setName(e.target.value)} 
                      className={s.input} 
                      required
                    />
                  </div>

                  <div>
                    <label className={s.label}>Phone Number</label>
                    <input 
                      type="text" 
                      value={phone} 
                      onChange={(e) => setPhone(e.target.value)} 
                      className={s.input} 
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 mt-6 pt-6 border-t border-[#f1f5f9]">
                    <button 
                      type="submit" 
                      disabled={loading} 
                      className="btn btn-primary flex-1 py-3.5 font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {loading ? "Saving..." : "Save Changes"}
                    </button>
                    <button 
                      type="button" 
                      onClick={handleCancel} 
                      className="btn btn-outline flex-1 py-3.5 font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div>
                <h3 className="text-lg font-bold text-text-main mb-8">Personal Information</h3>
                <div className={s.infoSection}>
                  {/* Email */}
                  <div className={s.infoItem}>
                    <div className="w-12 h-12 rounded-2xl bg-[#f0fdfa] border border-[#0d6e59]/15 flex items-center justify-center text-primary shrink-0">
                      <HiOutlineMail size={22} />
                    </div>
                    <div>
                      <p className={s.infoLabel}>Email Address</p>
                      <p className="font-extrabold text-[15px] text-text-main break-all">{user?.email}</p>
                    </div>
                  </div>

                  {/* Phone */}
                  <div className={s.infoItem}>
                    <div className="w-12 h-12 rounded-2xl bg-[#f0fdfa] border border-[#0d6e59]/15 flex items-center justify-center text-primary shrink-0">
                      <HiOutlinePhone size={22} />
                    </div>
                    <div>
                      <p className={s.infoLabel}>Phone Number</p>
                      <p className="font-extrabold text-[15px] text-text-main break-all">{user?.phone || "Not provided"}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-8 border-t border-[#f1f5f9] flex justify-end">
                  <button 
                    onClick={() => setIsEditing(true)} 
                    className="btn btn-primary px-8 py-3.5 font-bold rounded-xl cursor-pointer"
                  >
                    Edit Profile
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};

export default Profile;
