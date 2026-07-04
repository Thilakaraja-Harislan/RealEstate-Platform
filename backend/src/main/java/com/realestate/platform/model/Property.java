package com.realestate.platform.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "properties")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Property {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, length = 2000)
    private String description;

    @Column(nullable = false)
    private Double price;

    @Column(nullable = false)
    private String city;

    @Column(nullable = false)
    private String area;

    @Column(nullable = false)
    private String pincode;

    @Column(name = "property_type", nullable = false)
    private String propertyType; // "flat", "villa", "penthouse", "commercial"

    private String bhk;

    private Integer bathrooms;

    @Column(name = "area_size")
    private Double areaSize;

    private String furnishing; // "furnished", "semi-furnished", "unfurnished"

    @Column(nullable = false)
    private String status = "sale"; // "sale", "sold"

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "seller_id", nullable = false)
    private User seller;

    @Column(name = "is_verified")
    private boolean verified = false;

    private int views = 0;

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "property_viewed_by", joinColumns = @JoinColumn(name = "property_id"))
    @Column(name = "viewer_email")
    private List<String> viewedBy = new ArrayList<>();

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "property_amenities", joinColumns = @JoinColumn(name = "property_id"))
    @Column(name = "amenity")
    private List<String> amenities = new ArrayList<>();

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "property_images", joinColumns = @JoinColumn(name = "property_id"))
    @Column(name = "image_url")
    private List<String> images = new ArrayList<>();

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
}
