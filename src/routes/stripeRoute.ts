import express from 'express'
import { stripeCheckout } from '../controllers/stripeController';

const router = express.Router();

router.post('/',stripeCheckout);

export default router;