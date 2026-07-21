package com.ecolift.service;

import com.ecolift.entity.Review;
import java.util.List;

public interface ReviewService {
    Review save(Review review);
    Review update(Long id, Review review);
    void delete(Long id);
    Review findById(Long id);
    List<Review> findAll();
    boolean exists(Long id);
    long count();

    Review addReview(Long rideId, Long reviewerId, Long revieweeId, int rating, String comment);
    Review editReview(Long reviewId, int rating, String comment);
    void deleteReview(Long reviewId);
    List<Review> getRideReviews(Long rideId);
    List<Review> getUserReviews(Long userId);
    Double calculateAverageRating(Long userId);
}