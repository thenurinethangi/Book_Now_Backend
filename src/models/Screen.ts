import mongoose, { Document, Schema } from "mongoose";

enum ScreenStatus{
    ACTIVE = 'ACTIVE',
    UNAVAILABLE = 'UNAVAILABLE',
    MAINTENANCE = 'MAINTENANCE',
    CLOSED = 'CLOSED'
}

export interface IScreen extends Document {
    _id: mongoose.Types.ObjectId
    screenName: string
    description: string
    numberOfSeats: string
    screenTypes: string[]
    seatTypes: string[]
    seatLayout: {}[][]
    screenImageUrl: string
    cinemaId: mongoose.Types.ObjectId
    status: ScreenStatus
    createdAt?: Date
    updatedAt?: Date
}

const screenSchema = new Schema<IScreen>({
    screenName: { type: String, required: true },
    description: { type: String, required: true },
    numberOfSeats: { type: String, required: true },
    screenTypes: { type: [String], required: true },
    seatTypes: { type: [String], required: true },
    seatLayout: { type: [{}], required: true },
    screenImageUrl: { type: String, required: true },
    cinemaId: { type: Schema.Types.ObjectId, ref: 'Cinema', required: true },
    status: { type: String, enum: Object.values(ScreenStatus), required: true }
},
    {
        timestamps: true
    }
);

export const Screen = mongoose.model<IScreen>('Screen', screenSchema);