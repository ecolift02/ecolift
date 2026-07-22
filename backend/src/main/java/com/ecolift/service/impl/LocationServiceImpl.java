package com.ecolift.service.impl;

import com.ecolift.entity.Location;
import com.ecolift.exception.ResourceNotFoundException;
import com.ecolift.repository.LocationRepository;
import com.ecolift.service.LocationService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class LocationServiceImpl implements LocationService {

    private final LocationRepository locationRepository;

    public LocationServiceImpl(LocationRepository locationRepository) {
        this.locationRepository = locationRepository;
    }

    @Override
    public Location save(Location location) {
        return locationRepository.save(location);
    }

    @Override
    public Location update(Long id, Location locationDetails) {
        Location location = findById(id);
        location.setLatitude(locationDetails.getLatitude());
        location.setLongitude(locationDetails.getLongitude());
        location.setAddress(locationDetails.getAddress());
        return locationRepository.save(location);
    }

    @Override
    public void delete(Long id) {
        Location location = findById(id);
        locationRepository.delete(location);
    }

    @Override
    @Transactional(readOnly = true)
    public Location findById(Long id) {
        return locationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Location not found with id: " + id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<Location> findAll() {
        return locationRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public boolean exists(Long id) {
        return locationRepository.existsById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public long count() {
        return locationRepository.count();
    }

    @Override
    public Location saveLocation(Location location) {
        return save(location);
    }

    @Override
    public Location updateLocation(Long id, Location location) {
        return update(id, location);
    }

    @Override
    public void deleteLocation(Long id) {
        delete(id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Location> findNearbyLocations(Double latitude, Double longitude, Double radiusInKm) {
        List<Location> allLocations = findAll();
        return allLocations.stream()
                .filter(loc -> {
                    // Safety check in case latitude/longitude are null in the database
                    if (loc.getLatitude() == null || loc.getLongitude() == null) {
                        return false;
                    }
                    // FIX: Convert BigDecimal to double using .doubleValue()
                    double locLat = loc.getLatitude().doubleValue();
                    double locLon = loc.getLongitude().doubleValue();
                    return calculateDistance(latitude, longitude, locLat, locLon) <= radiusInKm;
                })
                .collect(Collectors.toList());
    }

    private double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        final int R = 6371; // Earth radius in km
        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lon2 - lon1);
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
}