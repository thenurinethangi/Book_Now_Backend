import express from 'express'
import { authenticate } from '../middlewares/authenticate';
import { authorize } from '../middlewares/authorize';
import { Role } from '../models/User';
import { addMovieToWatchlist, getAllWatchlistMovies, removeMovieFromWatchlist } from '../controllers/watchlistController';

const router = express.Router();

router.post('/add', authenticate, authorize([Role.USER]), addMovieToWatchlist);

router.post('/remove', authenticate, authorize([Role.USER]), removeMovieFromWatchlist);

router.get('/all', authenticate, authorize([Role.USER]), getAllWatchlistMovies);

export default router;