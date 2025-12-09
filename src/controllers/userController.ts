import { Response } from "express";
import { AuthRequest } from "../middlewares/authenticate";
import { Role, User } from "../models/User";

export const getAllUsers = async (req: AuthRequest, res: Response) => {

    try {
        const users = await User.find({roles: [Role.USER]});

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
        const admins = await User.find({roles: [Role.ADMIN]});

        res.status(200).json({ message: `Successfully load all admins!`, data: admins });
        return;
    }
    catch (e) {
        res.status(500).json({ message: `Fail to load all admins!`, data: null });
        return;
    }
}