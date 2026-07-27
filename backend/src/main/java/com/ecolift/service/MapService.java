package com.ecolift.service;

import com.ecolift.dto.request.RouteRequest;
import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class MapService {

    @Value("${app.maps.ors-api-key:}")
    private String orsApiKey;

    private final RestTemplate restTemplate = new RestTemplate();

    /**
     * Replaces your GET /api/maps/search Node endpoint
     */
    public JsonNode searchLocation(String query) {
        String url = "https://nominatim.openstreetmap.org/search?q=" + query + "&format=jsonv2&limit=5";

        HttpHeaders headers = new HttpHeaders();
        headers.set("User-Agent", "Ecolift/1.0"); // Nominatim requires a User-Agent
        HttpEntity<String> entity = new HttpEntity<>(headers);

        ResponseEntity<JsonNode> response = restTemplate.exchange(url, HttpMethod.GET, entity, JsonNode.class);
        return response.getBody();
    }

    /**
     * Replaces your POST /api/maps/route Node endpoint
     */
    public List<List<Double>> getRoute(RouteRequest request) {
        Double startLat = request.getStart().getLat();
        Double startLon = request.getStart().getLon();
        Double endLat = request.getEnd().getLat();
        Double endLon = request.getEnd().getLon();

        // 1. Try OpenRouteService if API key is present
        if (orsApiKey != null && !orsApiKey.isEmpty()) {
            try {
                String orsUrl = "https://api.openrouteservice.org/v2/directions/driving-car";
                
                HttpHeaders headers = new HttpHeaders();
                headers.set("Authorization", orsApiKey);
                headers.set("Content-Type", "application/json");

                Map<String, Object> body = new HashMap<>();
                body.put("coordinates", new Double[][]{{startLon, startLat}, {endLon, endLat}});

                HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
                ResponseEntity<JsonNode> response = restTemplate.exchange(orsUrl, HttpMethod.POST, entity, JsonNode.class);

                JsonNode coordinatesNode = response.getBody()
                        .path("features").get(0)
                        .path("geometry").path("coordinates");

                return extractCoordinates(coordinatesNode);
            } catch (Exception e) {
                System.err.println("ORS failed, falling back to OSRM: " + e.getMessage());
            }
        }

        // 2. Fallback to OSRM
        try {
            String osrmUrl = String.format(
                    "https://router.project-osrm.org/route/v1/driving/%s,%s;%s,%s?overview=full&geometries=geojson",
                    startLon, startLat, endLon, endLat
            );

            ResponseEntity<JsonNode> response = restTemplate.getForEntity(osrmUrl, JsonNode.class);
            JsonNode coordinatesNode = response.getBody()
                    .path("routes").get(0)
                    .path("geometry").path("coordinates");

            return extractCoordinates(coordinatesNode);
        } catch (Exception e) {
            System.err.println("OSRM failed, falling back to straight line: " + e.getMessage());
        }

        // 3. Ultimate Fallback (Straight Line)
        List<List<Double>> fallback = new ArrayList<>();
        fallback.add(List.of(startLat, startLon));
        fallback.add(List.of(endLat, endLon));
        return fallback;
    }

    // Helper method to flip [lon, lat] from APIs to [lat, lon] for your frontend
    private List<List<Double>> extractCoordinates(JsonNode coordinatesNode) {
        List<List<Double>> route = new ArrayList<>();
        if (coordinatesNode.isArray()) {
            for (JsonNode node : coordinatesNode) {
                // APIs return [lon, lat], we map to [lat, lon] to match your Node script
                route.add(List.of(node.get(1).asDouble(), node.get(0).asDouble()));
            }
        }
        return route;
    }
}