import express from 'express'
import mongoose from 'mongoose';
import dotenv from 'dotenv'
dotenv.config();

const dbUrl = process.env.DATABASE_URL as string;

const app = express();

mongoose.connect(dbUrl)
        .then(() => {
            console.log('Database connected!');
        })
        .catch((err) => {
            console.error('Database connection fail: ',err);
            process.exit(1);
        })

app.listen(5000,() => {
    console.log('Server listen on port 5000.');
});