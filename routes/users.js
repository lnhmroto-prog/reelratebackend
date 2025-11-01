const express = require('express');
const router = express.Router();

let users = [
  {
    id: "user1",
    username: "CinemaLover",
    email: "cinemalover@example.com",
    bio: "Passionate about cinema and storytelling. Love discussing movies and discovering hidden gems.",
    joinDate: "2024-01-15T00:00:00Z",
    avatar: null,
    totalReviews: 12,
    averageRating: 4.2,
    favoriteGenres: ["Action", "Drama", "Sci-Fi"],
    reviewsHelpful: 156,
    createdAt: new Date("2024-01-15T00:00:00Z"),
    updatedAt: new Date("2025-10-30T10:30:00Z")
  },
  {
    id: "user2",
    username: "MovieBuff2024",
    email: "moviebuff@example.com",
    bio: "Movie enthusiast since childhood. Always looking for the next great film to watch.",
    joinDate: "2024-03-22T00:00:00Z",
    avatar: null,
    totalReviews: 8,
    averageRating: 4.5,
    favoriteGenres: ["Comedy", "Drama", "Romance"],
    reviewsHelpful: 89,
    createdAt: new Date("2024-03-22T00:00:00Z"),
    updatedAt: new Date("2025-10-29T14:20:00Z")
  },
  {
    id: "user3",
    username: "FilmCritic",
    email: "filmcritic@example.com",
    bio: "Professional film critic and movie blogger. Reviewing films for over 5 years.",
    joinDate: "2023-08-10T00:00:00Z",
    avatar: null,
    totalReviews: 25,
    averageRating: 3.8,
    favoriteGenres: ["Drama", "Thriller", "Art House"],
    reviewsHelpful: 234,
    createdAt: new Date("2023-08-10T00:00:00Z"),
    updatedAt: new Date("2025-10-28T16:45:00Z")
  }
];

router.get('/', (req, res) => {
  try {
    const { limit = 20, offset = 0 } = req.query;
    
    const publicUsers = users.map(user => ({
      id: user.id,
      username: user.username,
      bio: user.bio,
      joinDate: user.joinDate,
      totalReviews: user.totalReviews,
      averageRating: user.averageRating,
      favoriteGenres: user.favoriteGenres,
      reviewsHelpful: user.reviewsHelpful
    }));
    
    publicUsers.sort((a, b) => new Date(b.joinDate) - new Date(a.joinDate));
    
    const limitNum = parseInt(limit);
    const offsetNum = parseInt(offset);
    const paginatedUsers = publicUsers.slice(offsetNum, offsetNum + limitNum);
    
    res.json({
      users: paginatedUsers,
      total: publicUsers.length,
      limit: limitNum,
      offset: offsetNum
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const user = users.find(u => u.id === id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const publicProfile = {
      id: user.id,
      username: user.username,
      bio: user.bio,
      joinDate: user.joinDate,
      totalReviews: user.totalReviews,
      averageRating: user.averageRating,
      favoriteGenres: user.favoriteGenres,
      reviewsHelpful: user.reviewsHelpful
    };
    
    res.json(publicProfile);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

router.get('/:id/profile', (req, res) => {
  try {
    const { id } = req.params;
    const { requestingUserId } = req.query; 
    
    const user = users.find(u => u.id === id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    if (requestingUserId === id) {
      res.json(user);
    } else {
      const publicProfile = {
        id: user.id,
        username: user.username,
        bio: user.bio,
        joinDate: user.joinDate,
        totalReviews: user.totalReviews,
        averageRating: user.averageRating,
        favoriteGenres: user.favoriteGenres,
        reviewsHelpful: user.reviewsHelpful
      };
      
      res.json(publicProfile);
    }
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { username, bio, favoriteGenres, requestingUserId } = req.body;
    
    const userIndex = users.findIndex(u => u.id === id);
    
    if (userIndex === -1) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    if (requestingUserId !== id) {
      return res.status(403).json({ error: 'You can only update your own profile' });
    }
    
    const user = users[userIndex];
    
    if (username && username.trim().length < 3) {
      return res.status(400).json({ 
        error: 'Username must be at least 3 characters long' 
      });
    }
    
    if (username && username.trim().length > 30) {
      return res.status(400).json({ 
        error: 'Username must be less than 30 characters' 
      });
    }
    
    if (username && username !== user.username) {
      const existingUser = users.find(u => 
        u.username.toLowerCase() === username.toLowerCase() && u.id !== id
      );
      
      if (existingUser) {
        return res.status(409).json({ error: 'Username already taken' });
      }
    }
    
    if (username) user.username = username.trim();
    if (bio !== undefined) user.bio = bio.trim();
    if (favoriteGenres && Array.isArray(favoriteGenres)) {
      user.favoriteGenres = favoriteGenres.slice(0, 5); 
    }
    user.updatedAt = new Date();
    
    users[userIndex] = user;
    
    res.json({
      message: 'Profile updated successfully',
      user: user
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Failed to update user profile' });
  }
});

router.post('/', (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    if (!username || !email || !password) {
      return res.status(400).json({ 
        error: 'Missing required fields: username, email, password' 
      });
    }
    
    if (username.trim().length < 3) {
      return res.status(400).json({ 
        error: 'Username must be at least 3 characters long' 
      });
    }
    
    if (username.trim().length > 30) {
      return res.status(400).json({ 
        error: 'Username must be less than 30 characters' 
      });
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }
    
    const existingUser = users.find(u => 
      u.username.toLowerCase() === username.toLowerCase() || 
      u.email.toLowerCase() === email.toLowerCase()
    );
    
    if (existingUser) {
      return res.status(409).json({ 
        error: 'Username or email already exists' 
      });
    }
    
    const newUser = {
      id: `user${Date.now()}`, 
      username: username.trim(),
      email: email.toLowerCase().trim(),
      bio: '',
      joinDate: new Date().toISOString(),
      avatar: null,
      totalReviews: 0,
      averageRating: 0,
      favoriteGenres: [],
      reviewsHelpful: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    users.push(newUser);
    
    const publicUser = {
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      bio: newUser.bio,
      joinDate: newUser.joinDate,
      totalReviews: newUser.totalReviews,
      averageRating: newUser.averageRating,
      favoriteGenres: newUser.favoriteGenres,
      reviewsHelpful: newUser.reviewsHelpful
    };
    
    res.status(201).json({
      message: 'User created successfully',
      user: publicUser
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { requestingUserId } = req.body;
    
    const userIndex = users.findIndex(u => u.id === id);
    
    if (userIndex === -1) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    if (requestingUserId !== id) {
      return res.status(403).json({ error: 'You can only delete your own account' });
    }
    
    users.splice(userIndex, 1);
    
    res.json({
      message: 'User account deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user account' });
  }
});

router.get('/stats/summary', (req, res) => {
  try {
    const totalUsers = users.length;
    const totalReviews = users.reduce((sum, user) => sum + user.totalReviews, 0);
    const averageReviewsPerUser = totalReviews / totalUsers;
    
    const genreCounts = {};
    users.forEach(user => {
      user.favoriteGenres.forEach(genre => {
        genreCounts[genre] = (genreCounts[genre] || 0) + 1;
      });
    });
    
    const popularGenres = Object.entries(genreCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([genre, count]) => ({ genre, count }));
    
    res.json({
      totalUsers,
      totalReviews,
      averageReviewsPerUser: Math.round(averageReviewsPerUser * 10) / 10,
      popularGenres
    });
  } catch (error) {
    console.error('User stats error:', error);
    res.status(500).json({ error: 'Failed to fetch user statistics' });
  }
});

module.exports = router;