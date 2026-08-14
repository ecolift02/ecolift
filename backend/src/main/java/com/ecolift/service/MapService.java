package com.ecolift.service;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import com.ecolift.dto.request.RouteRequest;
import com.fasterxml.jackson.databind.JsonNode;
import com.mapbox.geojson.Point;
import com.mapbox.geojson.utils.PolylineUtils;
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

    public JsonNode searchLocation(String query) {
        String url = "https://nominatim.openstreetmap.org/search?q=" + query + "&format=jsonv2&limit=5";

        HttpHeaders headers = new HttpHeaders();
        headers.set("User-Agent", "Ecolift/1.0");
        HttpEntity<String> entity = new HttpEntity<>(headers);

        ResponseEntity<JsonNode> response = restTemplate.exchange(url, HttpMethod.GET, entity, JsonNode.class);
        return response.getBody();
    }

    public Map<String, Object> getRoute(RouteRequest request) {
        Double startLat = request.getStart().getLat();
        Double startLon = request.getStart().getLon();
        Double endLat = request.getEnd().getLat();
        Double endLon = request.getEnd().getLon();

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

                JsonNode featureNode = response.getBody().path("features").get(0);
                JsonNode coordinatesNode = featureNode.path("geometry").path("coordinates");
                JsonNode summaryNode = featureNode.path("properties").path("summary");
                double distanceKm = summaryNode.path("distance").asDouble() / 1000.0;

                return buildRouteResponse(extractCoordinates(coordinatesNode), distanceKm);
            } catch (Exception e) {
                System.err.println("ORS failed, falling back to OSRM: " + e.getMessage());
            }
        }
   
        try {
            String osrmUrl = String.format(
                    "https://router.project-osrm.org/route/v1/driving/%s,%s;%s,%s?overview=full&geometries=geojson",
                    startLon, startLat, endLon, endLat
            );

            ResponseEntity<JsonNode> response = restTemplate.getForEntity(osrmUrl, JsonNode.class);
            JsonNode routeNode = response.getBody().path("routes").get(0);
            JsonNode coordinatesNode = routeNode.path("geometry").path("coordinates");
            double distanceKm = routeNode.path("distance").asDouble() / 1000.0;

            return buildRouteResponse(extractCoordinates(coordinatesNode), distanceKm);
        } catch (Exception e) {
            System.err.println("OSRM failed, falling back to straight line: " + e.getMessage());
        }

        List<List<Double>> fallback = new ArrayList<>();
        fallback.add(List.of(startLat, startLon));
        fallback.add(List.of(endLat, endLon));
        return buildRouteResponse(fallback, 0.0);
    }

    private Map<String, Object> buildRouteResponse(List<List<Double>> coordinates, double distanceKm) {
        Map<String, Object> response = new HashMap<>();
        response.put("distanceKm", Math.round(distanceKm * 100.0) / 100.0);
        response.put("polyline", encodePolyline(coordinates));
        return response;
    }

    private String encodePolyline(List<List<Double>> coordinates) {
        if (coordinates == null || coordinates.isEmpty()) {
            return "";
        }

        List<Point> points = new ArrayList<>();
        for (List<Double> point : coordinates) {
            if (point.size() >= 2) {
                points.add(Point.fromLngLat(point.get(1), point.get(0)));
            }
        }

        return PolylineUtils.encode(points, 5);
    }

    private List<List<Double>> extractCoordinates(JsonNode coordinatesNode) {
        List<List<Double>> route = new ArrayList<>();
        if (coordinatesNode.isArray()) {
            for (JsonNode node : coordinatesNode) {
                route.add(List.of(node.get(1).asDouble(), node.get(0).asDouble()));
            }
        }
        return route;
    }
}
