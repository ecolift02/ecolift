package com.ecolift.repository;

import com.ecolift.entity.Location;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LocationRepository extends JpaRepository<Location, Long> {
    // Allow lookup by city name when clients only submit city strings.
    Location findByCity(String city);
}