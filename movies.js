const express = require('express');
const axios = require('axios');
const router = express.Router();
const { validateSearch, validateMovieId } = require('../middleware/validation');

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

if (!TMDB_API_KEY) {
  console.error('  TMDB_API_KEY is not set in environment variables');
}

const mockMovies = [
  {
    id: 550,
    title: "Fight Club",
    overview: "A ticking-time-bomb insomniac and a slippery soap salesman channel primal male aggression into a shocking new form of therapy.",
    poster_path: "/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg",
    backdrop_path: "/fCayJrkfRaCRCTh8GqN30f8oyQF.jpg",
    release_date: "1999-10-15",
    vote_average: 8.4,
    vote_count: 26280,
    runtime: 139,
    genres: [{ id: 18, name: "Drama" }, { id: 53, name: "Thriller" }]
  },
  {
    id: 13,
    title: "Forrest Gump",
    overview: "A man with a low IQ has accomplished great things in his life and been present during significant historic events—in each case, far exceeding what anyone imagined he could do.",
    poster_path: "/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg",
    backdrop_path: "/3h1JZGDhZ8nzxdgvkxha0qBqi05.jpg",
    release_date: "1994-06-23",
    vote_average: 8.8,
    vote_count: 25000,
    runtime: 142,
    genres: [{ id: 18, name: "Drama" }, { id: 35, name: "Comedy" }]
  }
];

router.get('/search', validateSearch, async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    if (!TMDB_API_KEY || TMDB_API_KEY === 'your_tmdb_api_key_here') {
      const filteredMovies = mockMovies.filter(movie => 
        movie.title.toLowerCase().includes(query.toLowerCase())
      );
      
      return res.json({
        results: filteredMovies,
        total_results: filteredMovies.length,
        total_pages: 1,
        page: 1
      });
    }

    const response = await axios.get(`${TMDB_BASE_URL}/search/movie`, {
      params: {
        api_key: TMDB_API_KEY,
        query: query,
        language: 'en-US',
        page: 1,
        include_adult: false
      }
    });

    res.json(response.data);
  } catch (error) {
    console.error('Movie search error:', error);
    res.status(500).json({ error: 'Failed to search movies' });
  }
});

router.get('/popular', async (req, res) => {
  try {
    if (!TMDB_API_KEY || TMDB_API_KEY === 'your_tmdb_api_key_here') {
      return res.json({
        results: mockMovies,
        total_results: mockMovies.length,
        total_pages: 1,
        page: 1
      });
    }

    const response = await axios.get(`${TMDB_BASE_URL}/movie/popular`, {
      params: {
        api_key: TMDB_API_KEY,
        language: 'en-US',
        page: 1
      }
    });

    res.json(response.data);
  } catch (error) {
    console.error('Popular movies error:', error);
    res.status(500).json({ error: 'Failed to fetch popular movies' });
  }
});

router.get('/:id', validateMovieId, async (req, res) => {
  try {
    const { id } = req.params;

    if (!TMDB_API_KEY || TMDB_API_KEY === 'your_tmdb_api_key_here') {
      const movie = mockMovies.find(m => m.id === parseInt(id));
      
      if (!movie) {
        return res.status(404).json({ error: 'Movie not found' });
      }

      const movieDetails = {
        ...movie,
        tagline: movie.id === 550 ? "Mischief. Mayhem. Soap." : "Life is like a box of chocolates.",
        director: movie.id === 550 ? "David Fincher" : "Robert Zemeckis",
        cast: movie.id === 550 
          ? ["Brad Pitt", "Edward Norton", "Helena Bonham Carter"]
          : ["Tom Hanks", "Robin Wright", "Gary Sinise"]
      };

      return res.json(movieDetails);
    }

    const response = await axios.get(`${TMDB_BASE_URL}/movie/${id}`, {
      params: {
        api_key: TMDB_API_KEY,
        language: 'en-US',
        append_to_response: 'credits'
      }
    });

    res.json(response.data);
  } catch (error) {
    console.error('Movie details error:', error);
    if (error.response && error.response.status === 404) {
      res.status(404).json({ error: 'Movie not found' });
    } else {
      res.status(500).json({ error: 'Failed to fetch movie details' });
    }
  }
});

router.get('/trending/day', async (req, res) => {
  try {
    if (!TMDB_API_KEY || TMDB_API_KEY === 'your_tmdb_api_key_here') {
      return res.json({
        results: mockMovies,
        total_results: mockMovies.length,
        total_pages: 1,
        page: 1
      });
    }

    const response = await axios.get(`${TMDB_BASE_URL}/trending/movie/day`, {
      params: {
        api_key: TMDB_API_KEY
      }
    });

    res.json(response.data);
  } catch (error) {
    console.error('Trending movies error:', error);
    res.status(500).json({ error: 'Failed to fetch trending movies' });
  }
});

module.exports = router;