import express from 'express'
import { authenticate } from '../middlewares/authenticate';
import { authorize } from '../middlewares/authorize';
import { Role } from '../models/User';
import { addMovieToCinemaMovieList, getAllAvailableMoviesOfCinemaToAdd, getAllCinemaMovies, getMovieAvailableFormats } from '../controllers/movieController';

const router = express.Router();

router.get('/cinema/all',authenticate,authorize([Role.CINEMA]),getAllCinemaMovies);

router.get('/cinema/availableToAdd',authenticate,authorize([Role.CINEMA]),getAllAvailableMoviesOfCinemaToAdd);

router.get('/cinema/availableFormats/:id',authenticate,authorize([Role.CINEMA]),getMovieAvailableFormats);

router.post('/cinema/add',authenticate,authorize([Role.CINEMA]),addMovieToCinemaMovieList);

export default router;