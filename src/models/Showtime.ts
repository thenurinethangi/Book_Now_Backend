import mongoose, { Document, Schema } from "mongoose";

export enum ShowtimeStatus {
    EXPIRED = 'Expired',
    TODAY = 'Today',
    SCHEDULED = 'Scheduled',
}

export interface IShowtime extends Document {
    _id: mongoose.Types.ObjectId
    date: Date
    time: Date
    screenId: mongoose.Types.ObjectId
    movieId: mongoose.Types.ObjectId
    cinemaId: mongoose.Types.ObjectId
    status: ShowtimeStatus
    createdAt?: Date
    updatedAt?: Date
}

const showtimeSchema = new Schema<IShowtime>({
    date: { type: Date, required: true },
    time: { type: Date, required: true },
    screenId: { type: Schema.Types.ObjectId, ref: 'Screen', required: true },
    movieId: { type: Schema.Types.ObjectId, ref: 'Movie', required: true },
    cinemaId: { type: Schema.Types.ObjectId, ref: 'Cinema', required: true },
    status: { type: String, enum: Object.values(ShowtimeStatus), required: true}
},
    {
        timestamps: true, 
    }
);

showtimeSchema.virtual('bookings', {
  ref: 'Booking',
  localField: '_id',
  foreignField: 'showtimeId'
});

showtimeSchema.set('toObject', { virtuals: true });
showtimeSchema.set('toJSON', { virtuals: true });

export const Showtime = mongoose.model<IShowtime>('Showtime', showtimeSchema);