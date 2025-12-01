import mongoose, { Document, Schema } from "mongoose";

export enum Role {
    USER = 'USER',
    ADMIN = 'ADMIN',
    CINEMA = 'CINEMA'
}

export enum Status {
    ACITIVE = 'ACTIVE',
    DEACTIVE = 'DEACTIVE'
}

export interface IUser extends Document {
    _id: mongoose.Types.ObjectId
    email: string
    password?: string
    firstName: string
    lastName: string
    dateOfBirth?: Date
    mobile?: string
    postCode?: string
    gender?: string
    primaryCinema?: string
    profileImageUrl?: string
    roles: Role[]
    isVerified: boolean
    status: Status
    createdAt?: Date
    updatedAt?: Date
}

const userSchema = new Schema<IUser>({
    email: { type: String, required: true, unique: true },
    password: { type: String, default: null },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    dateOfBirth: { type: Date, default: null },
    mobile: { type: String, default: null },
    postCode: { type: String, default: null },
    gender: { type: String, default: null },
    primaryCinema: { type: String, default: null },
    profileImageUrl: { type: String, default: null },
    roles: { type: [String], enum: Object.values(Role), required: true },
    isVerified: { type: Boolean, required: true },
    status: { type: String, enum: Object.values(Status), required: true }
},
    {
        timestamps: true
    }
);

export const User = mongoose.model<IUser>('User', userSchema);