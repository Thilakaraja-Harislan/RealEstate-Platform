package com.realestate.platform.controller;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.realestate.platform.model.Property;
import com.realestate.platform.model.User;
import com.realestate.platform.repository.PropertyRepository;
import com.realestate.platform.repository.UserRepository;
import com.realestate.platform.service.CloudinaryService;
import com.realestate.platform.service.PropertyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/property")
public class PropertyController {

    @Autowired
    private PropertyRepository propertyRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PropertyService propertyService;

    @Autowired
    private CloudinaryService cloudinaryService;

    private final ObjectMapper objectMapper = new ObjectMapper();

    private User getAuthenticatedUser() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof org.springframework.security.core.userdetails.UserDetails) {
            String email = ((org.springframework.security.core.userdetails.UserDetails) principal).getUsername();
            return userRepository.findByEmail(email).orElse(null);
        }
        return null;
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> addProperty(
            @RequestParam("title") String title,
            @RequestParam("description") String description,
            @RequestParam("price") Double price,
            @RequestParam("city") String city,
            @RequestParam("area") String area,
            @RequestParam("pincode") String pincode,
            @RequestParam("propertyType") String propertyType,
            @RequestParam(value = "bhk", required = false) String bhk,
            @RequestParam(value = "bathrooms", required = false) Integer bathrooms,
            @RequestParam(value = "areaSize", required = false) Double areaSize,
            @RequestParam(value = "furnishing", required = false) String furnishing,
            @RequestParam(value = "amenities", required = false) String amenitiesJson,
            @RequestParam(value = "images", required = false) List<MultipartFile> images) {

        User seller = getAuthenticatedUser();
        if (seller == null || !"seller".equals(seller.getRole())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Only sellers can add properties"));
        }

        try {
            List<String> amenities = new ArrayList<>();
            if (amenitiesJson != null && !amenitiesJson.isEmpty()) {
                try {
                    amenities = objectMapper.readValue(amenitiesJson, new TypeReference<List<String>>() {});
                } catch (Exception e) {
                    amenities = Arrays.asList(amenitiesJson.split(","));
                }
            }

            List<String> imageUrls = new ArrayList<>();
            if (images != null && !images.isEmpty()) {
                for (MultipartFile file : images) {
                    if (!file.isEmpty()) {
                        String url = cloudinaryService.uploadImage(file.getBytes(), "properties");
                        imageUrls.add(url);
                    }
                }
            }

            Property property = Property.builder()
                    .title(title)
                    .description(description)
                    .price(price)
                    .city(city)
                    .area(area)
                    .pincode(pincode)
                    .propertyType(propertyType.toLowerCase())
                    .bhk(bhk)
                    .bathrooms(bathrooms)
                    .areaSize(areaSize)
                    .furnishing(furnishing)
                    .status("sale")
                    .seller(seller)
                    .verified(false)
                    .views(0)
                    .amenities(amenities)
                    .images(imageUrls)
                    .createdAt(LocalDateTime.now())
                    .build();

            Property savedProperty = propertyRepository.save(property);

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(Map.of("success", true, "message", "Property added successfully", "property", savedProperty));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error uploading images to Cloudinary: " + e.getMessage()));
        }
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> updateProperty(
            @PathVariable("id") Long id,
            @RequestParam("title") String title,
            @RequestParam("description") String description,
            @RequestParam("price") Double price,
            @RequestParam("city") String city,
            @RequestParam("area") String area,
            @RequestParam("pincode") String pincode,
            @RequestParam("propertyType") String propertyType,
            @RequestParam(value = "bhk", required = false) String bhk,
            @RequestParam(value = "bathrooms", required = false) Integer bathrooms,
            @RequestParam(value = "areaSize", required = false) Double areaSize,
            @RequestParam(value = "furnishing", required = false) String furnishing,
            @RequestParam(value = "status", required = false) String status,
            @RequestParam(value = "existingImages", required = false) String existingImagesJson,
            @RequestParam(value = "amenities", required = false) String amenitiesJson,
            @RequestParam(value = "images", required = false) List<MultipartFile> newImages) {

        User seller = getAuthenticatedUser();
        Optional<Property> propertyOpt = propertyRepository.findById(id);

        if (propertyOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Property not found"));
        }

        Property property = propertyOpt.get();
        if (seller == null || (!seller.getId().equals(property.getSeller().getId()) && !"admin".equals(seller.getRole()))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Not authorized to update this property"));
        }

        try {
            property.setTitle(title);
            property.setDescription(description);
            property.setPrice(price);
            property.setCity(city);
            property.setArea(area);
            property.setPincode(pincode);
            property.setPropertyType(propertyType.toLowerCase());
            property.setBhk(bhk);
            property.setBathrooms(bathrooms);
            property.setAreaSize(areaSize);
            property.setFurnishing(furnishing);
            if (status != null) {
                property.setStatus(status);
            }

            if (amenitiesJson != null && !amenitiesJson.isEmpty()) {
                try {
                    List<String> amenities = objectMapper.readValue(amenitiesJson, new TypeReference<List<String>>() {});
                    property.setAmenities(amenities);
                } catch (Exception e) {
                    property.setAmenities(Arrays.asList(amenitiesJson.split(",")));
                }
            }

            List<String> imageUrls = new ArrayList<>();
            if (existingImagesJson != null && !existingImagesJson.isEmpty()) {
                try {
                    imageUrls = objectMapper.readValue(existingImagesJson, new TypeReference<List<String>>() {});
                } catch (Exception e) {
                    // Ignore
                }
            } else {
                imageUrls = property.getImages();
            }

            if (newImages != null && !newImages.isEmpty()) {
                for (MultipartFile file : newImages) {
                    if (!file.isEmpty()) {
                        String url = cloudinaryService.uploadImage(file.getBytes(), "properties");
                        imageUrls.add(url);
                    }
                }
            }

            property.setImages(imageUrls);
            Property updatedProperty = propertyRepository.save(property);

            return ResponseEntity.ok(Map.of("success", true, "message", "Property updated successfully", "property", updatedProperty));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error uploading images to Cloudinary: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProperty(@PathVariable("id") Long id) {
        User user = getAuthenticatedUser();
        Optional<Property> propertyOpt = propertyRepository.findById(id);

        if (propertyOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Property not found"));
        }

        Property property = propertyOpt.get();
        if (user == null || (!user.getId().equals(property.getSeller().getId()) && !"admin".equals(user.getRole()))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Not authorized to delete this property"));
        }

        propertyRepository.delete(property);
        return ResponseEntity.ok(Map.of("success", true, "message", "Property deleted successfully"));
    }

    @GetMapping
    public ResponseEntity<?> getAllProperties(
            @RequestParam(value = "city", required = false) String city,
            @RequestParam(value = "area", required = false) String area,
            @RequestParam(value = "pincode", required = false) String pincode,
            @RequestParam(value = "propertyType", required = false) String propertyType,
            @RequestParam(value = "bhk", required = false) String bhk,
            @RequestParam(value = "furnishing", required = false) String furnishing,
            @RequestParam(value = "status", required = false) String status,
            @RequestParam(value = "minPrice", required = false) Double minPrice,
            @RequestParam(value = "maxPrice", required = false) Double maxPrice,
            @RequestParam(value = "amenities", required = false) String amenities,
            @RequestParam(value = "sort", required = false) String sort,
            @RequestParam(value = "seller", required = false) Long sellerId) {

        List<String> types = propertyType != null ? Arrays.asList(propertyType.split(",")) : null;
        List<String> furnishings = furnishing != null ? Arrays.asList(furnishing.split(",")) : null;
        List<String> amenitiesList = amenities != null ? Arrays.asList(amenities.split(",")) : null;

        User seller = null;
        if (sellerId != null) {
            seller = userRepository.findById(sellerId).orElse(null);
        }

        // Default search status is "sale" for public properties page
        String queryStatus = status != null ? status : "sale";

        List<Property> properties = propertyService.searchProperties(
                city, area, pincode, types, bhk, furnishings, queryStatus,
                minPrice, maxPrice, amenitiesList, seller, sort);

        return ResponseEntity.ok(Map.of("success", true, "count", properties.size(), "properties", properties));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getPropertyDetails(@PathVariable("id") Long id) {
        Optional<Property> propertyOpt = propertyRepository.findById(id);
        if (propertyOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Property not found"));
        }

        Property property = propertyOpt.get();
        User currentUser = getAuthenticatedUser();

        // Increment views logic
        boolean alreadyViewed = false;
        if (currentUser != null) {
            String email = currentUser.getEmail();
            if (property.getViewedBy().contains(email)) {
                alreadyViewed = true;
            } else {
                property.getViewedBy().add(email);
            }
        }

        if (!alreadyViewed) {
            property.setViews(property.getViews() + 1);
            propertyRepository.save(property);
        }

        return ResponseEntity.ok(property);
    }

    @GetMapping("/counts")
    public ResponseEntity<?> getPropertyCounts() {
        List<Object[]> counts = propertyRepository.countPropertiesByType();
        Map<String, Long> countsMap = new HashMap<>();
        
        // Initialize all standard types to 0
        countsMap.put("flat", 0L);
        countsMap.put("villa", 0L);
        countsMap.put("penthouse", 0L);
        countsMap.put("commercial", 0L);

        for (Object[] result : counts) {
            String type = (String) result[0];
            Long count = (Long) result[1];
            countsMap.put(type, count);
        }

        return ResponseEntity.ok(countsMap);
    }

    @GetMapping("/seller")
    public ResponseEntity<?> getSellerProperties() {
        User seller = getAuthenticatedUser();
        if (seller == null || !"seller".equals(seller.getRole())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Only sellers can view their dashboard listings"));
        }

        List<Property> properties = propertyRepository.findBySeller(seller);
        return ResponseEntity.ok(Map.of("success", true, "properties", properties));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updatePropertyStatus(
            @PathVariable("id") Long id,
            @RequestBody Map<String, String> request) {
        
        User seller = getAuthenticatedUser();
        Optional<Property> propertyOpt = propertyRepository.findById(id);

        if (propertyOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Property not found"));
        }

        Property property = propertyOpt.get();
        if (seller == null || !seller.getId().equals(property.getSeller().getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Not authorized"));
        }

        String status = request.get("status"); // "sale" or "sold"
        if (status == null || (!status.equals("sale") && !status.equals("sold"))) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid status value"));
        }

        property.setStatus(status);
        propertyRepository.save(property);

        return ResponseEntity.ok(Map.of("success", true, "message", "Property status updated successfully", "property", property));
    }

    @PostMapping("/{id}/wishlist")
    public ResponseEntity<?> toggleWishlist(@PathVariable("id") Long id) {
        User user = getAuthenticatedUser();
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Authentication required"));
        }

        Optional<Property> propertyOpt = propertyRepository.findById(id);
        if (propertyOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Property not found"));
        }

        Property property = propertyOpt.get();
        List<Property> wishlist = user.getWishlist();
        boolean wishlisted;

        if (wishlist.contains(property)) {
            wishlist.remove(property);
            wishlisted = false;
        } else {
            wishlist.add(property);
            wishlisted = true;
        }

        userRepository.save(user);
        return ResponseEntity.ok(Map.of("success", true, "wishlisted", wishlisted, "wishlistIds", user.getWishlist().stream().map(Property::getId).toList()));
    }

    @GetMapping("/wishlist")
    public ResponseEntity<?> getWishlist() {
        User user = getAuthenticatedUser();
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Authentication required"));
        }

        return ResponseEntity.ok(Map.of("success", true, "wishlist", user.getWishlist()));
    }

    @PatchMapping("/{id}/verify")
    public ResponseEntity<?> verifyProperty(@PathVariable("id") Long id) {
        User user = getAuthenticatedUser();
        if (user == null || !"admin".equals(user.getRole())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Only admins can verify properties"));
        }

        Optional<Property> propertyOpt = propertyRepository.findById(id);
        if (propertyOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Property not found"));
        }

        Property property = propertyOpt.get();
        property.setVerified(true);
        propertyRepository.save(property);

        return ResponseEntity.ok(Map.of("success", true, "message", "Property verified successfully", "property", property));
    }
}
