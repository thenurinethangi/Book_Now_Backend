import express from 'express'
import { authenticate } from '../middlewares/authenticate';
import { authorize } from '../middlewares/authorize';
import { Role } from '../models/User';
import { activateACinema, deactivateACinema, deleteRejectedCinema, getAllActiveCinemas, getAllPendingCinemas, getAllRejectedCinemas, getCinemaDetailsById, rejectACinema } from '../controllers/cinemaController';

const router = express.Router();

router.get('/active',authenticate,authorize([Role.ADMIN]),getAllActiveCinemas);

router.get('/pending',authenticate,authorize([Role.ADMIN]),getAllPendingCinemas);

router.get('/rejected',authenticate,authorize([Role.ADMIN]),getAllRejectedCinemas);

router.put('/deactivate/:id',authenticate,authorize([Role.ADMIN]),deactivateACinema);

router.put('/activate/:id',authenticate,authorize([Role.ADMIN]),activateACinema);

router.put('/reject/:id',authenticate,authorize([Role.ADMIN]),rejectACinema);

router.delete('/rejected/delete/:id',authenticate,authorize([Role.ADMIN]),deleteRejectedCinema);

router.get('/active/all',getAllActiveCinemas);

router.get('/data/:id',getCinemaDetailsById);

export default router;