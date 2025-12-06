import express from 'express'
import { authenticate } from '../middlewares/authenticate';
import { authorize } from '../middlewares/authorize';
import { Role } from '../models/User';
import { getAllActiveCinemas, getAllPendingCinemas, getAllRejectedCinemas } from '../controllers/cinemaController';

const router = express.Router();

router.get('/active',authenticate,authorize([Role.ADMIN]),getAllActiveCinemas);

router.get('/pending',authenticate,authorize([Role.ADMIN]),getAllPendingCinemas);

router.get('/rejected',authenticate,authorize([Role.ADMIN]),getAllRejectedCinemas);

export default router;