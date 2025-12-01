import express from 'express'
import { sendEmailWithOtp, signIn, signUpCinema, verifyUser } from '../controllers/authController';
import { upload } from '../middlewares/upload';

const router = express.Router();

router.post('/cinema/signup', upload.fields([{ name: "cinemaImage", maxCount: 1 }, { name: "bussinessRegisterDocuments", maxCount: 1 }, { name: "ownerNicDocuments", maxCount: 1 },]), signUpCinema);

router.post('/signin', upload.none(), signIn);

router.post('/otp',sendEmailWithOtp);

router.put('/user/verify',verifyUser);

export default router;