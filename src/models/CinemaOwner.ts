import mongoose, { Document, Schema } from "mongoose";
import { Status } from "./User";

export interface ICinemaOwner extends Document {
    _id: mongoose.Types.ObjectId,
    email: string
    name: string
    nationalIdNumber: string
    nationalIdDocumentUrl: string
    cinemaId: mongoose.Types.ObjectId
    status: Status
    createdAt?: Date
    updatedAt?: Date
}

const cinemaOwnerSchema = new Schema<ICinemaOwner>({
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true, unique: true },
    nationalIdNumber: { type: String, required: true, unique: true },
    nationalIdDocumentUrl: { type: String, required: true },
    cinemaId: { type: Schema.Types.ObjectId, ref: 'Cinema', required: true },
    status: { type: String, enum: Object.values(Status), required: true }
},
    {
        timestamps: true
    }
);

export const CinemaOwner = mongoose.model<ICinemaOwner>('CinemaOwner', cinemaOwnerSchema);