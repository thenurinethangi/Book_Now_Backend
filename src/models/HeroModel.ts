import mongoose, { Document, Schema } from "mongoose";

export interface IHero extends Document {
    _id: mongoose.Types.ObjectId
    imageUrl: string
    videoUrl: string
    description: string
    movieId: mongoose.Types.ObjectId
    createdAt?: Date
    updatedAt?: Date
}

const heroSchema = new Schema<IHero>({
    imageUrl: { type: String, required: true },
    videoUrl: { type: String, required: true },
    description: { type: String, required: true },
    movieId: { type: Schema.Types.ObjectId, ref: 'Movie', required: true },
},
    {
        timestamps: true,
    }
);

export const Hero = mongoose.model<IHero>('Hero', heroSchema);
