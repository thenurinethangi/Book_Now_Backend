import mongoose, { Document, Schema } from "mongoose";

export enum MovieStatus {
    NOW_SHOWING = 'Now Showing',
    COMING_SOON = 'Coming Soon',
    NOT_SHOWING = 'Not Showing',
}

export interface IMovie extends Document {
    _id: mongoose.Types.ObjectId
    title: string
    description: string
    releaseDate: Date
    duration: string
    originalLanguage: string
    genres: string[]
    formats: string[]
    directors: string[]
    production?: string[]
    cast: string[]
    posterImageUrl: string
    bannerImageUrl: string
    trailerUrl: string
    ageRating: string
    ratings?: {
        imdb?: number;
        rottenTomatoes?: number;
    }
    status: MovieStatus
    createdAt?: Date
    updatedAt?: Date
}

const movieSchema = new Schema<IMovie>({
    title: { type: String, required: true },
    description: { type: String, required: true },
    releaseDate: { type: Date, required: true },
    duration: { type: String, required: true },
    originalLanguage: { type: String, required: true },
    genres: { type: [String], required: true },
    formats: { type: [String], required: true }, 
    directors: { type: [String], required: true },
    production: { type: [String], default: [] },
    cast: { type: [String], required: true },
    posterImageUrl: { type: String, required: true },
    bannerImageUrl: { type: String, required: true },
    trailerUrl: { type: String, required: true },
    ageRating: { type: String, required: true },
    ratings: { imdb: { type: Number }, rottenTomatoes: { type: Number }},
    status: { type: String, enum: Object.values(MovieStatus), required: true}
},
    {
        timestamps: true, 
    }
);

export const Movie = mongoose.model<IMovie>('Movie', movieSchema);