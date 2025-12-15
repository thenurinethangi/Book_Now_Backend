import express from 'express'
import { stripeCheckout } from '../controllers/stripeController';
import { authenticate } from '../middlewares/authenticate';
import { authorize } from '../middlewares/authorize';
import { Role } from '../models/User';

const router = express.Router();

router.post('/', authenticate, authorize([Role.USER]), stripeCheckout);

export default router;