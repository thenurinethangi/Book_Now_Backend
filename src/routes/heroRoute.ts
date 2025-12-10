import express from 'express'
import { authenticate } from '../middlewares/authenticate';
import { authorize } from '../middlewares/authorize';
import { Role } from '../models/User';
import { addNewHeroPoster, deleteAHeroPoster, getAllHeroPosters } from '../controllers/heroController';
import { upload } from '../middlewares/upload';

const router = express.Router();

router.post('/admin/add',authenticate,authorize([Role.ADMIN]), upload.fields([{ name: 'heroImage', maxCount: 1 }, { name: 'videoFile', maxCount: 1 }]), addNewHeroPoster);

router.get('/all',authenticate,authorize([Role.ADMIN,Role.USER]), getAllHeroPosters);

router.delete('/admin/delete/:id',authenticate,authorize([Role.ADMIN]), deleteAHeroPoster);

export default router;