package com.ecolift.controller;

import com.ecolift.dto.request.RouteRequest;
import com.ecolift.service.MapService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/maps")
@RequiredArgsConstructor
public class MapController {

    private final MapService mapService;

    @GetMapping("/search")
    public ResponseEntity<?> searchLocation(@RequestParam(name = "q", required = false) String query) {
        if (query == null || query.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Query is required"));
        }
        try {
            return ResponseEntity.ok(mapService.searchLocation(query));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("message", "Failed to search location"));
        }
    }

    @PostMapping("/route")
    public ResponseEntity<?> getRoute(@RequestBody RouteRequest request) {
        if (request.getStart() == null || request.getEnd() == null ||
            request.getStart().getLat() == null || request.getStart().getLon() == null ||
            request.getEnd().getLat() == null || request.getEnd().getLon() == null) {
            
            return ResponseEntity.badRequest().body(Map.of("message", "Start and end coordinates are required"));
        }

        try {
            return ResponseEntity.ok(mapService.getRoute(request));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("message", "Failed to build route"));
        }
    }
}