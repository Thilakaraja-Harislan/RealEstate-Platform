package com.realestate.platform.repository;

import com.realestate.platform.model.Property;
import com.realestate.platform.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PropertyRepository extends JpaRepository<Property, Long>, JpaSpecificationExecutor<Property> {
    List<Property> findBySeller(User seller);

    @Query("SELECT p.propertyType, COUNT(p) FROM Property p WHERE p.status = 'sale' GROUP BY p.propertyType")
    List<Object[]> countPropertiesByType();

    long countByVerified(boolean verified);
}
