import express from 'express';
import { activateAScreenForAdmin, addNewScreen, deactivateAScreenForAdmin, deleteAScreen, getAllActiveScreensForAdmin, getAllDeactiveScreensForAdmin, getAllScreens, getCinemaAllAvaiableScreens, getCinemaScreensStats, getScreenOccupancy, updateScreenStatus } from '../controllers/screenController';
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

router.get('/cinema/stats', authenticate, authorize([Role.CINEMA]), getCinemaScreensStats);

router.get('/admin/active/all', authenticate, authorize([Role.ADMIN]), getAllActiveScreensForAdmin);

router.get('/admin/deactive/all', authenticate, authorize([Role.ADMIN]), getAllDeactiveScreensForAdmin);

router.put('/admin/deactive/:id', authenticate, authorize([Role.ADMIN]), deactivateAScreenForAdmin);

router.put('/admin/active/:id', authenticate, authorize([Role.ADMIN]), activateAScreenForAdmin);

router.get('/occupancy', authenticate, authorize([Role.CINEMA]), getScreenOccupancy);

export default router;