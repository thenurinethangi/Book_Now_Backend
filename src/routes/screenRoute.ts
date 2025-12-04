import express from 'express';
import { addNewScreen, deleteAScreen, getAllScreens, getCinemaAllAvaiableScreens, updateScreenStatus } from '../controllers/screenController';
import { authenticate } from '../middlewares/authenticate';
import { authorize } from '../middlewares/authorize';
import { Role } from '../models/User';
import { upload } from '../middlewares/upload';

const router = express.Router();

router.post('/add', authenticate, authorize([Role.CINEMA]), upload.single('screenImage'), addNewScreen);

router.get('/all', authenticate, authorize([Role.CINEMA]), getAllScreens);

router.delete('/delete/:id', authenticate, authorize([Role.CINEMA]), deleteAScreen);

router.put('/update/status', authenticate, authorize([Role.CINEMA]), updateScreenStatus);

router.get('/cinema/available/all', authenticate, authorize([Role.CINEMA]), getCinemaAllAvaiableScreens);

export default router;