import mongoose, { Document, Schema } from "mongoose";

export enum BookingStatus {
    PAST = 'Past',
    TODAY = 'Today',
    SCHEDULED = 'Scheduled',
    CANCELED = 'Canceled',
    FAILED = 'Failed'
}

export interface IBooking extends Document {
    _id: mongoose.Types.ObjectId
    date: Date
    tickets: string
    ticketsDetails: {}
    seatsDetails: {}
    showtimeId: mongoose.Types.ObjectId
    userId: mongoose.Types.ObjectId
    total: string
    status: BookingStatus
    createdAt?: Date
    updatedAt?: Date
}

const bookingSchema = new Schema<IBooking>({
    date: { type: Date, required: true },
    tickets: { type: String, required: true },
    ticketsDetails: { type: {}, required: true },
    seatsDetails: { type: {}, required: true },
    showtimeId: { type: Schema.Types.ObjectId, ref: 'Showtime', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    total: { type: String, required: true },
    status: { type: String, enum: Object.values(BookingStatus), required: true }
},
    {
        timestamps: true,
    }
);

export const Booking = mongoose.model<IBooking>('Booking', bookingSchema);