package com.ecolift.dto.request;

import lombok.Data;

@Data
public class RouteRequest {
    private Coordinate start;
    private Coordinate end;

    @Data
    public static class Coordinate {
        private Double lat;
        private Double lon;
    }
}