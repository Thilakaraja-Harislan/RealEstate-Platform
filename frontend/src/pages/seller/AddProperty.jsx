import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api";
import { addPropertyStyles as s } from "../../assets/dummyStyles";
import { HiOutlineUpload, HiX } from "react-icons/hi";

const AddProperty = () => {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [city, setCity] = useState("");
  const [area, setArea] = useState("");
  const [pincode, setPincode] = useState("");
  const [propertyType, setPropertyType] = useState("flat");
  const [bhk, setBhk] = useState("");
  const [bathrooms, setBathrooms] = useState("");
  const [areaSize, setAreaSize] = useState("");
  const [furnishing, setFurnishing] = useState("unfurnished");
  const [amenities, setAmenities] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const availableAmenities = [
    "parking", "lift", "gym", "swimming pool", "security", "clubhouse", "power backup", "gas pipeline", "play area"
  ];

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setSelectedFiles([...selectedFiles, ...files]);
      const newUrls = files.map(file => URL.createObjectURL(file));
      setPreviewUrls([...previewUrls, ...newUrls]);
    }
  };

  const handleRemoveImage = (index) => {
    setSelectedFiles(selectedFiles.filter((_, idx) => idx !== index));
    setPreviewUrls(previewUrls.filter((_, idx) => idx !== index));
  };

  const handleAmenityToggle = (amenity) => {
    if (amenities.includes(amenity)) {
      setAmenities(amenities.filter(a => a !== amenity));
    } else {
      setAmenities([...amenities, amenity]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("price", price);
    formData.append("city", city);
    formData.append("area", area);
    formData.append("pincode", pincode);
    formData.append("propertyType", propertyType);
    formData.append("bhk", bhk);
    formData.append("bathrooms", bathrooms);
    formData.append("areaSize", areaSize);
    formData.append("furnishing", furnishing);
    formData.append("amenities", JSON.stringify(amenities));

    selectedFiles.forEach((file) => {
      formData.append("images", file);
    });

    try {
      await api.post("/api/property", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add property. Please verify your fields.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={s.outerContainer}>
      <div className={s.innerContainer}>
        
        {/* Header */}
        <div className={s.header}>
          <h1 className={s.heading}>Add New Listing</h1>
          <p className={s.subheading}>Fill in the specifications of your property below.</p>
        </div>

        {error && <div className={s.error}>{error}</div>}

        {/* Form */}
        <form onSubmit={handleSubmit} className={s.form}>
          
          {/* Section 1: Basic Info */}
          <div className={s.section}>
            <div className={`${s.sectionHeader} ${s.sectionHeaderLargeMargin}`}>
              <div className={s.sectionBar}></div>
              <h3 className={s.sectionTitle}>Basic Property Information</h3>
            </div>

            <div className={s.contentGroupLarge}>
              <div>
                <label className={s.label}>Property Title</label>
                <input
                  type="text"
                  placeholder="e.g. 3BHK Premium Flat in Patia"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={s.input}
                  required
                />
              </div>

              <div>
                <label className={s.label}>Description</label>
                <textarea
                  placeholder="Describe your property (condition, distance from major hubs, society, etc.)..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className={`${s.input} ${s.textarea}`}
                  required
                ></textarea>
              </div>

              <div className={s.gridTwoCol}>
                <div>
                  <label className={s.label}>Price (LKR)</label>
                  <input
                    type="number"
                    placeholder="e.g. 7500000"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className={s.input}
                    required
                  />
                </div>

                <div>
                  <label className={s.label}>Property Type</label>
                  <select
                    value={propertyType}
                    onChange={(e) => setPropertyType(e.target.value)}
                    className={`${s.input} ${s.select}`}
                  >
                    <option value="flat">Flat / Apartment</option>
                    <option value="villa">Independent House / Villa</option>
                    <option value="penthouse">Penthouse</option>
                    <option value="commercial">Commercial</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Location Details */}
          <div className={s.section}>
            <div className={`${s.sectionHeader} ${s.sectionHeaderSmallMargin}`}>
              <div className={s.sectionBar}></div>
              <h3 className={s.sectionTitle}>Location Details</h3>
            </div>

            <div className={s.gridThreeCol}>
              <div>
                <label className={s.label}>City</label>
                <input
                  type="text"
                  placeholder="Colombo"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className={s.input}
                  required
                />
              </div>
              
              <div>
                <label className={s.label}>Area / Locality</label>
                <input
                  type="text"
                  placeholder="Cinnamon Gardens"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  className={s.input}
                  required
                />
              </div>

              <div>
                <label className={s.label}>Pincode</label>
                <input
                  type="text"
                  placeholder="00700"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  className={s.input}
                  required
                />
              </div>
            </div>
          </div>

          {/* Section 3: Technical Specs */}
          <div className={s.section}>
            <div className={`${s.sectionHeader} ${s.sectionHeaderSmallMargin}`}>
              <div className={s.sectionBar}></div>
              <h3 className={s.sectionTitle}>Specifications</h3>
            </div>

            <div className={s.gridTwoCol}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={s.label}>BHK (Beds)</label>
                  <input
                    type="text"
                    placeholder="e.g. 3"
                    value={bhk}
                    onChange={(e) => setBhk(e.target.value)}
                    className={s.input}
                  />
                </div>
                <div>
                  <label className={s.label}>Bathrooms</label>
                  <input
                    type="number"
                    placeholder="2"
                    value={bathrooms}
                    onChange={(e) => setBathrooms(e.target.value)}
                    className={s.input}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={s.label}>Area Size (sqft)</label>
                  <input
                    type="number"
                    placeholder="1500"
                    value={areaSize}
                    onChange={(e) => setAreaSize(e.target.value)}
                    className={s.input}
                  />
                </div>
                <div>
                  <label className={s.label}>Furnishing</label>
                  <select
                    value={furnishing}
                    onChange={(e) => setFurnishing(e.target.value)}
                    className={`${s.input} ${s.select}`}
                  >
                    <option value="furnished">Furnished</option>
                    <option value="semi-furnished">Semi-Furnished</option>
                    <option value="unfurnished">Unfurnished</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Amenities */}
          <div className={s.section}>
            <div className={`${s.sectionHeader} ${s.sectionHeaderSmallMargin}`}>
              <div className={s.sectionBar}></div>
              <h3 className={s.sectionTitle}>Amenities Available</h3>
            </div>

            <div className={s.amenitiesGrid}>
              {availableAmenities.map((amenity) => {
                const isActive = amenities.includes(amenity);
                return (
                  <label
                    key={amenity}
                    className={`${s.amenityLabelBase} ${
                      isActive ? s.amenityLabelActive : s.amenityLabelInactive
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={() => handleAmenityToggle(amenity)}
                      className={s.amenityCheckbox}
                    />
                    <span
                      className={`${s.amenityTextBase} ${
                        isActive ? s.amenityTextActive : s.amenityTextInactive
                      } capitalize`}
                    >
                      {amenity}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Section 5: Image Uploads */}
          <div className={s.section}>
            <div className={`${s.sectionHeader} ${s.sectionHeaderSmallMargin}`}>
              <div className={s.sectionBar}></div>
              <h3 className={s.sectionTitle}>Property Images</h3>
            </div>

            <div className={s.uploadArea} onClick={() => document.getElementById("file-upload").click()}>
              <div className={s.uploadIconWrapper}>
                <HiOutlineUpload size={32} className="text-primary" />
              </div>
              <h4 className={s.uploadTitle}>Upload Images</h4>
              <p className={s.uploadSubtext}>Select multiple images showcasing the rooms and outside views.</p>
              <input
                id="file-upload"
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            {previewUrls.length > 0 && (
              <div className={s.previewsGrid}>
                {previewUrls.map((url, idx) => (
                  <div key={idx} className={s.previewItem}>
                    <img src={url} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className={s.removeButton}
                    >
                      <HiX size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className={s.footerButtons}>
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className={s.cancelButton}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={s.submitButton}
            >
              {loading ? "Creating Listing..." : "Publish Listing"}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

export default AddProperty;
