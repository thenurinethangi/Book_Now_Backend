import express from 'express'
import { authenticate } from '../middlewares/authenticate';
import { authorize } from '../middlewares/authorize';
import { Role } from '../models/User';
import { addMovieRequest, addMovieToCinemaMovieList, addNewMovieForAdmin, changeMovieStatusForAdmin, checkMovieInCinemasManageMovieList, deleteAMovie, fuck, getAllAvailableMoviesOfCinemaToAdd, getAllCinemaMovies, getAllManagedMoviesForAdmin, getCinemaAllAvailableMovie, getMovieAvailableFormats } from '../controllers/movieController';
import { upload } from '../middlewares/upload';

const router = express.Router();

router.get('/cinema/all', authenticate, authorize([Role.CINEMA]), getAllCinemaMovies);

router.get('/cinema/availableToAdd', authenticate, authorize([Role.CINEMA]), getAllAvailableMoviesOfCinemaToAdd);

router.get('/cinema/availableFormats/:id', authenticate, authorize([Role.CINEMA]), getMovieAvailableFormats);

router.post('/cinema/add', authenticate, authorize([Role.CINEMA]), addMovieToCinemaMovieList);

router.post('/cinema/request', authenticate, authorize([Role.CINEMA]), upload.single('poster'), addMovieRequest);

router.get('/cinema/available/all', authenticate, authorize([Role.CINEMA]), getCinemaAllAvailableMovie);

router.get('/admin/manage/all', authenticate, authorize([Role.ADMIN]), getAllManagedMoviesForAdmin);

router.put('/admin/update/status', authenticate, authorize([Role.ADMIN]), changeMovieStatusForAdmin);

router.get('/admin/check/cinema/use/:id', authenticate, authorize([Role.ADMIN]), checkMovieInCinemasManageMovieList);

router.delete('/admin/delete/:id', authenticate, authorize([Role.ADMIN]), deleteAMovie);

router.post('/admin/add', authenticate, authorize([Role.ADMIN]), upload.fields([{ name: 'posterImageUrl', maxCount: 1 }, { name: 'bannerImageUrl', maxCount: 1 }]), addNewMovieForAdmin);

export default router;