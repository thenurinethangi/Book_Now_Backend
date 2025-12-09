import express from 'express'
import { authenticate } from '../middlewares/authenticate';
import { authorize } from '../middlewares/authorize';
import { Role } from '../models/User';
import { deleteMovieRequest, getAllRequestMovies, rejectMovieRequest } from '../controllers/requestMovieController';

const router = express.Router();

router.put('/admin/reject/:id',authenticate,authorize([Role.ADMIN]),rejectMovieRequest);

router.get('/admin/all',authenticate,authorize([Role.ADMIN]),getAllRequestMovies);

router.delete('/admin/delete/:id',authenticate,authorize([Role.ADMIN]),deleteMovieRequest);

export default router;