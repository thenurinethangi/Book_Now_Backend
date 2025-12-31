import mongoose, { Document, Schema } from "mongoose";


export interface IWatchlist extends Document {
    _id: mongoose.Types.ObjectId
    userId: mongoose.Types.ObjectId
    movieId: mongoose.Types.ObjectId
    createdAt?: Date
    updatedAt?: Date
}

const watchlistSchema = new Schema<IWatchlist>({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    movieId: { type: Schema.Types.ObjectId, ref: 'Movie', required: true },
},
    {
        timestamps: true,
    }
);

export const Watchlist = mongoose.model<IWatchlist>('Watchlist', watchlistSchema);