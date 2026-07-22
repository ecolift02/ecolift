package com.ecolift.service;

import com.ecolift.entity.Location;
import java.util.List;

public interface LocationService {
    Location save(Location location);
    Location update(Long id, Location location);
    void delete(Long id);
    Location findById(Long id);
    List<Location> findAll();
    boolean exists(Long id);
    long count();

    Location saveLocation(Location location);
    Location updateLocation(Long id, Location location);
    void deleteLocation(Long id);
    List<Location> findNearbyLocations(Double latitude, Double longitude, Double radiusInKm);
}