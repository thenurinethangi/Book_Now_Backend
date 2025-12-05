import mongoose, { Document, Schema } from "mongoose";

export enum TransactionStatus {
    COMPLETED = 'Completed',
    FAILED = 'Failed',
    PENDING = 'Pending'
}

export interface ITransaction extends Document {
    _id: mongoose.Types.ObjectId
    date: Date
    amount: string
    userId: mongoose.Types.ObjectId
    bookingId: mongoose.Types.ObjectId
    cinemaId: mongoose.Types.ObjectId
    status: TransactionStatus
    createdAt?: Date
    updatedAt?: Date
}

const transactionSchema = new Schema<ITransaction>({
    date: { type: Date, required: true },
    amount: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    bookingId: { type: Schema.Types.ObjectId, ref: 'Booking', required: true },
    cinemaId: { type: Schema.Types.ObjectId, ref: 'Cinema', required: true },
    status: { type: String, enum: Object.values(TransactionStatus), required: true }
},
    {
        timestamps: true,
    }
);

export const Transaction = mongoose.model<ITransaction>('Transaction', transactionSchema);