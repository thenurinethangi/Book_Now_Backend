import express from 'express'
import { authenticate } from '../middlewares/authenticate';
import { authorize } from '../middlewares/authorize';
import { Role } from '../models/User';
import { generateMovieSummery } from '../controllers/aiController';

const router = express.Router();

router.post('/movie/summery',generateMovieSummery);

export default router;