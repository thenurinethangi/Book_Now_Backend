import mongoose, { Document, Schema } from "mongoose";

export enum Role{
    USER = 'USER',
    ADMIN = 'ADMIN',
    CINEMA_OWNER = 'CINEMA_OWNER'
}

export enum UserStatus{
    ACITIVE = 'ACTIVE',
    DEACTIVE = 'DEACTIVE'
}

export interface IUser extends Document{
    _id: mongoose.Types.ObjectId,
    email: string,
    password?: string,
    firstName: string,
    lastName: string,
    dateOfBirth: Date,
    mobile: string,
    postCode: string,
    gender: string,
    primaryCinema?: string
    roles: Role[]
}

const userSchema = new Schema<IUser>({
    email: {type: String, required: true, unique: true},
    password: {type: String},
    firstName: {type: String, required: true},
    lastName: {type: String, required: true},
    dateOfBirth: {type: Date, required: true},
    mobile: {type: String, required: true},
    postCode: {type: String, required: true},
    gender: {type: String, required: true},
    primaryCinema: {type: String, required: true},
    roles: {type: [String], required: true}

});

export const User = mongoose.model<IUser>('User',userSchema);