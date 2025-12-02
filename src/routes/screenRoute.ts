import express from 'express';
import { addNewScreen } from '../controllers/screenController';
import { authenticate } from '../middlewares/authenticate';
import { authorize } from '../middlewares/authorize';
import { Role } from '../models/User';
import { upload } from '../middlewares/upload';

const router = express.Router();

router.post('/add', authenticate, authorize([Role.CINEMA]), upload.single('screenImage'), addNewScreen);

export default router;