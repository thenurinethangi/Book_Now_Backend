import mongoose, { Document, Schema } from "mongoose";
import { MovieStatus } from "./Movie";

export enum RequestStatus {
    APPROVED = 'Approved',
    REJECTED = 'Rejected',
    PENDING = 'Pending',
}

export interface IRequestMovie extends Document {
    _id: mongoose.Types.ObjectId
    title: string
    releaseDate: Date
    duration: string
    originalLanguage: string
    genres: string[]
    directors: string[]
    posterImageUrl: string
    trailerUrl: string
    movieStatus: MovieStatus
    cinemaId: mongoose.Types.ObjectId
    requestStatus: RequestStatus
    createdAt?: Date
    updatedAt?: Date
}

const requestMovieSchema = new Schema<IRequestMovie>({
    title: { type: String, required: true },
    releaseDate: { type: Date, required: true },
    duration: { type: String, required: true },
    originalLanguage: { type: String, required: true },
    genres: { type: [String], required: true },
    directors: { type: [String], required: true },
    posterImageUrl: { type: String, required: true },
    trailerUrl: { type: String, required: true },
    movieStatus: { type: String, enum: Object.values(MovieStatus), required: true },
    cinemaId: { type: Schema.Types.ObjectId, ref: 'Cinema', required: true },
    requestStatus: { type: String, enum: Object.values(RequestStatus), required: true }
},
    {
        timestamps: true,
    }
);

export const RequestMovie = mongoose.model<IRequestMovie>('RequestMovie', requestMovieSchema);