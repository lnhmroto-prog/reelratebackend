const express = require('express');
const router = express.Router();
const { verifyToken, optionalAuth } = require('../middleware/auth');
const { 
  validateReview, 
  validateReviewUpdate, 
  validatePagination 
} = require('../middleware/validation');

let reviews = [
  {
    id: 1,
    movieId: 550,
    movieTitle: "Fight Club",
    moviePoster: "/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg",
    userId: "user1",
    username: "CinemaLover",
    rating: 5,
    comment: "An absolute masterpiece! The plot twist is incredible and the themes are thought-provoking. Brad Pitt and Edward Norton deliver outstanding performances.",
    date: "2025-10-30T10:30:00Z",
    helpful: 42,
    createdAt: new Date("2025-10-30T10:30:00Z"),
    updatedAt: new Date("2025-10-30T10:30:00Z")
  },
  {
    id: 2,
    movieId: 13,
    movieTitle: "Forrest Gump",
    moviePoster: "/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg",
    userId: "user2",
    username: "MovieBuff2024",
    rating: 5,
    comment: "A heartwarming story that spans decades. Tom Hanks is phenomenal as always. This movie has everything - comedy, drama, romance, and history.",
    date: "2025-10-29T14:20:00Z",
    helpful: 38,
    createdAt: new Date("2025-10-29T14:20:00Z"),
    updatedAt: new Date("2025-10-29T14:20:00Z")
  },
  {
    id: 3,
    movieId: 550,
    movieTitle: "Fight Club",
    moviePoster: "/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg",
    userId: "user3",
    username: "FilmCritic",
    rating: 4,
    comment: "Great movie overall, though a bit long. The Joker steals every scene he's in. The cinematography is outstanding.",
    date: "2025-10-28T16:45:00Z",
    helpful: 25,
    createdAt: new Date("2025-10-28T16:45:00Z"),
    updatedAt: new Date("2025-10-28T16:45:00Z")
  }
];

let nextId = 4;

router.get('/', validatePagination, (req, res) => {
  try {
    const { movieId, userId, limit = 20, offset = 0 } = req.query;
    
    let filteredReviews = [...reviews];
    
    if (movieId) {
      filteredReviews = filteredReviews.filter(review => 
        review.movieId === parseInt(movieId)
      );
    }
    
    if (userId) {
      filteredReviews = filteredReviews.filter(review => 
        review.userId === userId
      );
    }
    
    filteredReviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    const limitNum = parseInt(limit);
    const offsetNum = parseInt(offset);
    const paginatedReviews = filteredReviews.slice(offsetNum, offsetNum + limitNum);
    
    res.json({
      reviews: paginatedReviews,
      total: filteredReviews.length,
      limit: limitNum,
      offset: offsetNum
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const review = reviews.find(r => r.id === parseInt(id));
    
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }
    
    res.json(review);
  } catch (error) {
    console.error('Get review error:', error);
    res.status(500).json({ error: 'Failed to fetch review' });
  }
});

router.post('/', verifyToken, validateReview, (req, res) => {
  try {
    const { 
      movieId, 
      movieTitle, 
      moviePoster, 
      userId, 
      username, 
      rating, 
      comment 
    } = req.body;
    
    if (!movieId || !movieTitle || !userId || !username || !rating || !comment) {
      return res.status(400).json({ 
        error: 'Missing required fields: movieId, movieTitle, userId, username, rating, comment' 
      });
    }
    
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ 
        error: 'Rating must be between 1 and 5' 
      });
    }
    
    if (comment.trim().length < 10) {
      return res.status(400).json({ 
        error: 'Comment must be at least 10 characters long' 
      });
    }
    
    const existingReview = reviews.find(r => 
      r.movieId === parseInt(movieId) && r.userId === userId
    );
    
    if (existingReview) {
      return res.status(409).json({ 
        error: 'You have already reviewed this movie. Use PUT to update your review.' 
      });
    }
    
    const newReview = {
      id: nextId++,
      movieId: parseInt(movieId),
      movieTitle,
      moviePoster: moviePoster || null,
      userId,
      username,
      rating: parseInt(rating),
      comment: comment.trim(),
      date: new Date().toISOString(),
      helpful: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    reviews.push(newReview);
    
    res.status(201).json({
      message: 'Review created successfully',
      review: newReview
    });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({ error: 'Failed to create review' });
  }
});

router.put('/:id', verifyToken, validateReviewUpdate, (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment, userId } = req.body;
    
    const reviewIndex = reviews.findIndex(r => r.id === parseInt(id));
    
    if (reviewIndex === -1) {
      return res.status(404).json({ error: 'Review not found' });
    }
    
    const review = reviews[reviewIndex];
    
    if (review.userId !== userId) {
      return res.status(403).json({ error: 'You can only update your own reviews' });
    }
    
    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({ 
        error: 'Rating must be between 1 and 5' 
      });
    }
    
    if (comment && comment.trim().length < 10) {
      return res.status(400).json({ 
        error: 'Comment must be at least 10 characters long' 
      });
    }
    
    if (rating) review.rating = parseInt(rating);
    if (comment) review.comment = comment.trim();
    review.updatedAt = new Date();
    
    reviews[reviewIndex] = review;
    
    res.json({
      message: 'Review updated successfully',
      review: review
    });
  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({ error: 'Failed to update review' });
  }
});

router.delete('/:id', verifyToken, (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    
    const reviewIndex = reviews.findIndex(r => r.id === parseInt(id));
    
    if (reviewIndex === -1) {
      return res.status(404).json({ error: 'Review not found' });
    }
    
    const review = reviews[reviewIndex];
    
    if (review.userId !== userId) {
      return res.status(403).json({ error: 'You can only delete your own reviews' });
    }
    
    reviews.splice(reviewIndex, 1);
    
    res.json({
      message: 'Review deleted successfully'
    });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({ error: 'Failed to delete review' });
  }
});

router.post('/:id/helpful', (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    
    const review = reviews.find(r => r.id === parseInt(id));
    
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }
    
    review.helpful = (review.helpful || 0) + 1;
    
    res.json({
      message: 'Review marked as helpful',
      helpful: review.helpful
    });
  } catch (error) {
    console.error('Mark helpful error:', error);
    res.status(500).json({ error: 'Failed to mark review as helpful' });
  }
});

router.get('/stats/summary', (req, res) => {
  try {
    const totalReviews = reviews.length;
    const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews;
    const ratingDistribution = {
      1: reviews.filter(r => r.rating === 1).length,
      2: reviews.filter(r => r.rating === 2).length,
      3: reviews.filter(r => r.rating === 3).length,
      4: reviews.filter(r => r.rating === 4).length,
      5: reviews.filter(r => r.rating === 5).length
    };
    
    res.json({
      totalReviews,
      averageRating: Math.round(averageRating * 10) / 10,
      ratingDistribution
    });
  } catch (error) {
    console.error('Review stats error:', error);
    res.status(500).json({ error: 'Failed to fetch review statistics' });
  }
});

module.exports = router;