import mongoose, { Document, Schema } from "mongoose";

export enum CinemaStatus {
    ACITIVE = 'ACTIVE',
    DEACTIVE = 'DEACTIVE',
    PENDING = 'PENDING',
    REJECTED = 'REJECTED'
}

export interface ICinema extends Document {
    _id: mongoose.Types.ObjectId
    cinemaName: string
    description: string
    cinemaEmail: string
    cinemaPhoneNo: string
    address: string
    city: string
    distric: string
    postCode: string
    googleMapLink: string
    website?: string
    noOfScreens: string
    bussinessRegisterNo: string
    cinemaImageUrl: string
    bussinessRegisterDocumentsUrl: string
    userId: mongoose.Types.ObjectId
    status: CinemaStatus
    createdAt?: Date
    updatedAt?: Date
}

const cinemaSchema = new Schema<ICinema>({
    cinemaName: { type: String, required: true },
    description: { type: String, required: true },
    cinemaEmail: { type: String, required: true },
    cinemaPhoneNo: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    distric: { type: String, required: true },
    postCode: { type: String, required: true },
    googleMapLink: { type: String, required: true },
    website: { type: String, default: null },
    noOfScreens: { type: String, required: true },
    bussinessRegisterNo: { type: String, required: true },
    cinemaImageUrl: { type: String, required: true },
    bussinessRegisterDocumentsUrl: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: Object.values(CinemaStatus), required: true }
},
    {
        timestamps: true
    }
);

export const Cinema = mongoose.model<ICinema>('Cinema', cinemaSchema);