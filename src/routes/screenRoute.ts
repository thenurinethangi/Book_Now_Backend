import express from 'express';
import { addNewScreen, getAllScreens } from '../controllers/screenController';
import { authenticate } from '../middlewares/authenticate';
import { authorize } from '../middlewares/authorize';
import { Role } from '../models/User';
import { upload } from '../middlewares/upload';

const router = express.Router();

router.post('/add', authenticate, authorize([Role.CINEMA]), upload.single('screenImage'), addNewScreen);

router.get('/all', authenticate, authorize([Role.CINEMA]), getAllScreens);

export default router;