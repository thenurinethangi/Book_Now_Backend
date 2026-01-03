import express from 'express'
import { authenticate } from '../middlewares/authenticate';
import { authorize } from '../middlewares/authorize';
import { Role } from '../models/User';
import { addANewShowtime, checkShowtimeAlreadyExist, deleteAShowtime, getAllShowtimesOfACinema, getAllShowtimesOfAMovie, getCinemaShowtime, getScheduledShowtimesCount, getShowtimeDetailsById, getTodayShowtimesCount, getTotalShowtimesCount, getUnavailableSeats } from '../controllers/showtimeController';

const router = express.Router();

router.post('/cinema/all',authenticate,authorize([Role.CINEMA]),getCinemaShowtime);

router.post('/cinema/check/availability',authenticate,authorize([Role.CINEMA]),checkShowtimeAlreadyExist);

router.post('/cinema/add',authenticate,authorize([Role.CINEMA]),addANewShowtime);

router.get('/7Days/:movieId',getAllShowtimesOfAMovie);

router.get('/:id',getShowtimeDetailsById);

router.get('/bookings/:id',getUnavailableSeats);

router.get('/cinema/7Days/:cinemaId',getAllShowtimesOfACinema);

router.delete('/cinema/delete/:id',authenticate,authorize([Role.CINEMA]),deleteAShowtime);

router.get('/cinema/all/count',authenticate,authorize([Role.CINEMA]),getTotalShowtimesCount);

router.get('/cinema/today/count',authenticate,authorize([Role.CINEMA]),getTodayShowtimesCount);

router.get('/cinema/scheduled/count',authenticate,authorize([Role.CINEMA]),getScheduledShowtimesCount);

export default router;