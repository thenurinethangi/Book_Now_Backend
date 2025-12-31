import express from 'express'
import mongoose from 'mongoose';
import cors from 'cors'
import dotenv from 'dotenv'
dotenv.config();

import authRouter from './routes/authRoute'
import screenRouter from './routes/screenRoute'
import movieRouter from './routes/movieRoute'
import showtimeRouter from './routes/showtimeRoute'
import bookingRouter from './routes/bookingRoute'
import transactionRouter from './routes/transactionRoute'
import cinemaRouter from './routes/cinemaRoute'
import requestMovieRoute from './routes/requestMovieRoute'
import userRoute from './routes/userRoute'
import heroRoute from './routes/heroRoute'
import stripeRoute from './routes/stripeRoute'
import seatsRoute from './routes/seatsRoute'
import aiRoute from './routes/aiRoute'
import watchlistRoute from './routes/watchlistRoute'

const dbUrl = process.env.DATABASE_URL as string;

const app = express();

app.use(cors({
    origin: ['http://localhost:5173'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));

app.use(express.json({limit: "500mb"}));

app.use(express.urlencoded({ limit: "500mb", extended: true }));

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/screen', screenRouter);
app.use('/api/v1/movie', movieRouter);
app.use('/api/v1/showtime', showtimeRouter);
app.use('/api/v1/booking', bookingRouter);
app.use('/api/v1/transaction', transactionRouter);
app.use('/api/v1/cinema', cinemaRouter);
app.use('/api/v1/movieRequest', requestMovieRoute);
app.use('/api/v1/user', userRoute);
app.use('/api/v1/hero', heroRoute);
app.use('/api/v1/payment/stripe', stripeRoute);
app.use('/api/v1/seats', seatsRoute);
app.use('/api/v1/ai', aiRoute);
app.use('/api/v1/watchlist', watchlistRoute);

mongoose.connect(dbUrl)
    .then(() => {
        console.log('Database connected!');
    })
    .catch((err) => {
        console.error('Database connection fail: ', err);
        process.exit(1);
    })

app.listen(5000, () => {
    console.log('Server listen on port 5000.');
});