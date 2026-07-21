package com.ecolift.repository;

import com.ecolift.entity.Location;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LocationRepository extends JpaRepository<Location, Long> {
    // No custom methods are needed for the current service implementation 
    // because standard CRUD operations are inherited from JpaRepository,
    // and the findNearbyLocations logic is handled in memory via Streams.
}