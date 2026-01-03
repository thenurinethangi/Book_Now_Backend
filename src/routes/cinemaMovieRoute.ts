import express from 'express'
import { authenticate } from '../middlewares/authenticate';
import { authorize } from '../middlewares/authorize';
import { Role } from '../models/User';
import { removeMovieFromCinemasManageMovieList } from '../controllers/cinemaMovieController';

const router = express.Router();

router.delete('/remove/:id', authenticate, authorize([Role.CINEMA]), removeMovieFromCinemasManageMovieList);

export default router;