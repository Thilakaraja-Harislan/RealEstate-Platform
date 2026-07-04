package com.realestate.platform.service;

import com.realestate.platform.model.Property;
import com.realestate.platform.model.User;
import com.realestate.platform.repository.PropertyRepository;
import jakarta.persistence.criteria.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

@Service
public class PropertyService {

    @Autowired
    private PropertyRepository propertyRepository;

    public List<Property> searchProperties(
            String city, String area, String pincode, List<String> propertyTypes,
            String bhk, List<String> furnishings, String status,
            Double minPrice, Double maxPrice, List<String> amenities, User seller, String sortOption) {

        Specification<Property> spec = (Root<Property> root, CriteriaQuery<?> query, CriteriaBuilder cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (status != null && !status.isEmpty()) {
                predicates.add(cb.equal(root.get("status"), status));
            }

            if (seller != null) {
                predicates.add(cb.equal(root.get("seller"), seller));
            }

            if (city != null && !city.trim().isEmpty()) {
                predicates.add(cb.like(cb.lower(root.get("city")), "%" + city.toLowerCase().trim() + "%"));
            }

            if (area != null && !area.trim().isEmpty()) {
                predicates.add(cb.like(cb.lower(root.get("area")), "%" + area.toLowerCase().trim() + "%"));
            }

            if (pincode != null && !pincode.trim().isEmpty()) {
                predicates.add(cb.equal(root.get("pincode"), pincode.trim()));
            }

            if (propertyTypes != null && !propertyTypes.isEmpty()) {
                predicates.add(root.get("propertyType").in(propertyTypes));
            }

            if (bhk != null && !bhk.trim().isEmpty()) {
                if ("5+".equals(bhk)) {
                    // Try to cast bhk to integer
                    try {
                        predicates.add(cb.greaterThanOrEqualTo(root.get("bhk").as(Integer.class), 5));
                    } catch (Exception e) {
                        predicates.add(cb.greaterThanOrEqualTo(root.get("bhk"), "5"));
                    }
                } else {
                    predicates.add(cb.equal(root.get("bhk"), bhk));
                }
            }

            if (furnishings != null && !furnishings.isEmpty()) {
                predicates.add(root.get("furnishing").in(furnishings));
            }

            if (minPrice != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("price"), minPrice));
            }

            if (maxPrice != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("price"), maxPrice));
            }

            if (amenities != null && !amenities.isEmpty()) {
                for (String amenity : amenities) {
                    Expression<Collection<String>> propertyAmenities = root.get("amenities");
                    predicates.add(cb.isMember(amenity, propertyAmenities));
                }
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Sort sort = Sort.by(Sort.Direction.DESC, "createdAt");
        if (sortOption != null) {
            if ("priceLow".equals(sortOption)) {
                sort = Sort.by(Sort.Direction.ASC, "price");
            } else if ("priceHigh".equals(sortOption)) {
                sort = Sort.by(Sort.Direction.DESC, "price");
            } else if ("latest".equals(sortOption)) {
                sort = Sort.by(Sort.Direction.DESC, "createdAt");
            }
        }

        return propertyRepository.findAll(spec, sort);
    }
}
