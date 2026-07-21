package com.ecolift.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.ecolift.entity.Review;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    boolean existsByRideIdAndReviewerId(Long rideId, Long reviewerId);
    List<Review> findByRideId(Long rideId);
    List<Review> findByRevieweeId(Long revieweeId);
    
    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.reviewee.id = :userId")
    Optional<Double> calculateAverageRatingByUserId(@Param("userId") Long userId);
}
