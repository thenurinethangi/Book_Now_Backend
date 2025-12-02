import mongoose, { Document, Schema } from "mongoose";
import { MovieStatus } from "./Movie";

export interface ICinemaMovie extends Document {
    _id: mongoose.Types.ObjectId
    formatsAvailble: string[]
    status: MovieStatus
    cinemaId: mongoose.Types.ObjectId
    movieId: mongoose.Types.ObjectId
    createdAt?: Date
    updatedAt?: Date
}

const cinemaMovieSchema = new Schema<ICinemaMovie>({
    formatsAvailble: { type: [String], required: true },
    status: { type: String, enum: Object.values(MovieStatus), required: true },
    cinemaId: { type: Schema.Types.ObjectId, ref: 'Cinema', required: true },
    movieId: { type: Schema.Types.ObjectId, ref: 'Movie', required: true },
},
    {
        timestamps: true,
    }
);

export const CinemaMovie = mongoose.model<ICinemaMovie>('CinemaMovie', cinemaMovieSchema);