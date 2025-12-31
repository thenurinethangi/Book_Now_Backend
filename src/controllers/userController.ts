import { Response } from "express";
import { AuthRequest } from "../middlewares/authenticate";
import { Role, User } from "../models/User";

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

    res.status(200).json({ message: 'Logged out!' , data: null});

}