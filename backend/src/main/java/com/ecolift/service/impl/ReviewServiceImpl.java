package com.ecolift.service.impl;

import com.ecolift.entity.Review;
import com.ecolift.entity.Ride;
import com.ecolift.entity.User;
import com.ecolift.exception.DuplicateResourceException;
import com.ecolift.exception.InvalidRideStateException;
import com.ecolift.exception.ResourceNotFoundException;
import com.ecolift.repository.ReviewRepository;
import com.ecolift.service.ReviewService;
import com.ecolift.service.RideService;
import com.ecolift.service.UserService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;
    private final RideService rideService;
    private final UserService userService;

    public ReviewServiceImpl(ReviewRepository reviewRepository, RideService rideService, UserService userService) {
        this.reviewRepository = reviewRepository;
        this.rideService = rideService;
        this.userService = userService;
    }

    @Override
    public Review save(Review review) {
        return reviewRepository.save(review);
    }

    @Override
    public Review update(Long id, Review reviewDetails) {
        Review review = findById(id);
        review.setRating(reviewDetails.getRating());
        review.setComment(reviewDetails.getComment());
        return reviewRepository.save(review);
    }

    @Override
    public void delete(Long id) {
        Review review = findById(id);
        reviewRepository.delete(review);
    }

    @Override
    @Transactional(readOnly = true)
    public Review findById(Long id) {
        return reviewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found with id: " + id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<Review> findAll() {
        return reviewRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public boolean exists(Long id) {
        return reviewRepository.existsById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public long count() {
        return reviewRepository.count();
    }

    @Override
    public Review addReview(Long rideId, Long reviewerId, Long revieweeId, int rating, String comment) {
        Ride ride = rideService.findById(rideId);

        // FIXED: Replaced ride.getStatus() with checks against isDeleted and departureTime
        if (Boolean.TRUE.equals(ride.getIsDeleted())) {
            throw new InvalidRideStateException("Cannot review a cancelled ride.");
        }
        
        // Ensure the ride has actually happened before allowing a review
        if (ride.getDepartureTime() != null && ride.getDepartureTime().isAfter(LocalDateTime.now())) {
            throw new InvalidRideStateException("Cannot review a ride before its departure time.");
        }

        if (reviewRepository.existsByRideIdAndReviewerId(rideId, reviewerId)) {
            throw new DuplicateResourceException("You have already submitted a review for this ride.");
        }

        User reviewer = userService.findById(reviewerId);
        User reviewee = userService.findById(revieweeId);

        Review review = new Review();
        review.setRide(ride);
        review.setReviewer(reviewer);
        review.setReviewee(reviewee);
        review.setRating(rating);
        review.setComment(comment);

        return reviewRepository.save(review);
    }

    @Override
    public Review editReview(Long reviewId, int rating, String comment) {
        Review review = findById(reviewId);
        review.setRating(rating);
        review.setComment(comment);
        return reviewRepository.save(review);
    }

    @Override
    public void deleteReview(Long reviewId) {
        delete(reviewId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Review> getRideReviews(Long rideId) {
        return reviewRepository.findByRideId(rideId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Review> getUserReviews(Long userId) {
        return reviewRepository.findByRevieweeId(userId);
    }

    @Override
    @Transactional(readOnly = true)
    public Double calculateAverageRating(Long userId) {
        return reviewRepository.calculateAverageRatingByUserId(userId).orElse(0.0);
    }
}