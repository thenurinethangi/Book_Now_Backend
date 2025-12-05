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

const dbUrl = process.env.DATABASE_URL as string;

const app = express();

app.use(cors({
    origin: ['http://localhost:5173'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/screen', screenRouter);
app.use('/api/v1/movie', movieRouter);
app.use('/api/v1/showtime', showtimeRouter);
app.use('/api/v1/booking', bookingRouter);
app.use('/api/v1/transaction', transactionRouter);

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