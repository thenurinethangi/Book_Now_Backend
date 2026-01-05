import { Response } from "express";
import { AuthRequest } from "../middlewares/authenticate";
import { Role, Status, User } from "../models/User";
import { Cinema } from "../models/Cinema";

export const getAllUsers = async (req: AuthRequest, res: Response) => {

    try {
        const users = await User.find({ roles: [Role.USER] });

        res.status(200).json({ message: `Successfully load all users!`, data: users });
        return;
    }
    catch (e) {
        res.status(500).json({ message: `Fail to load all users!`, data: null });
        return;
    }
}

export const getAllAdmins = async (req: AuthRequest, res: Response) => {

    try {
        const admins = await User.find({ roles: [Role.ADMIN] });

        res.status(200).json({ message: `Successfully load all admins!`, data: admins });
        return;
    }
    catch (e) {
        res.status(500).json({ message: `Fail to load all admins!`, data: null });
        return;
    }
}


export const getCurrentUserData = async (req: AuthRequest, res: Response) => {

    const id = req.sub;

    if (!id) {
        res.status(401).json({ message: `Unauthenicate!`, data: null });
        return;
    }

    try {
        const user = await User.findOne({ _id: id });

        if (!user) {
            res.status(404).json({ message: `User not found!`, data: null });
            return;
        }

        res.status(200).json({ message: `Successfully get current user data!`, data: user });
        return;

    }
    catch (e) {
        console.log(e);
        res.status(500).json({ message: `Fail get current user data!`, data: null });
        return;
    }
}


export const logout = async (req: AuthRequest, res: Response) => {

    res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: false,
        sameSite: 'lax'
    });

    res.status(200).json({ message: 'Logged out!', data: null });

}


export const getCurrentUserAndCinemaData = async (req: AuthRequest, res: Response) => {

    const id = req.sub;

    if (!id) {
        res.status(401).json({ message: `Unauthenicate!`, data: null });
        return;
    }

    try {
        const user = await User.findOne({ _id: id });

        if (!user) {
            res.status(404).json({ message: `User not found!`, data: null });
            return;
        }

        const cinema = await Cinema.findOne({ userId: user._id });

        res.status(200).json({ message: `Successfully get current user data!`, data: { user, cinema } });
        return;

    }
    catch (e) {
        console.log(e);
        res.status(500).json({ message: `Fail get current user data!`, data: null });
        return;
    }
}


export const addNewAdmin = async (req: AuthRequest, res: Response) => {
    try {
        const { email, password, firstName, lastName, dateOfBirth, mobile, postCode, gender } = req.body;

        if (!email || !password || !firstName || !lastName) {
            res.status(400).json({ message: `Email, password, first name, and last name are required!`, data: null });
            return;
        }

        const existingAdmin = await User.findOne({ email });
        if (existingAdmin) {
            res.status(400).json({ message: `Admin with this email already exists!`, data: null });
            return;
        }

        const newAdmin = new User({
            email,
            password: password,
            firstName,
            lastName,
            dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
            mobile: mobile || null,
            postCode: postCode || null,
            gender: gender || null,
            roles: [Role.ADMIN],
            isVerified: true,
            status: Status.ACITIVE
        });

        await newAdmin.save();

        const adminResponse = {
            _id: newAdmin._id,
            email: newAdmin.email,
            firstName: newAdmin.firstName,
            lastName: newAdmin.lastName,
            dateOfBirth: newAdmin.dateOfBirth,
            mobile: newAdmin.mobile,
            postCode: newAdmin.postCode,
            gender: newAdmin.gender,
            roles: newAdmin.roles,
            isVerified: newAdmin.isVerified,
            status: newAdmin.status,
            createdAt: newAdmin.createdAt,
            updatedAt: newAdmin.updatedAt
        };

        res.status(201).json({ message: `Successfully created new admin!`, data: adminResponse });
        return;
    }
    catch (e) {
        console.error('Error creating admin:', e);
        res.status(500).json({ message: `Failed to create new admin!`, data: null });
        return;
    }
}