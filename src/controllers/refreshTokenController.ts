import express, { Request, Response, NextFunction } from 'express'
import { generateAccessToken, verifyRefreshToken } from '../utils/jwtUtil';
import { User } from '../models/User';

export const handleRefreshToken = async (req: Request, res: Response) => {

    const refreshToken = req.cookies.RefreshToken;

    if (!refreshToken) {
        res.status(401).json({ message: 'Unauthenticate!, no refresh token provide, please login!', data: null });
        return;
    }

    const payload = verifyRefreshToken(refreshToken);

    if (!payload) {
        res.status(401).json({ message: 'Invalid token, please login!', data: null });
        return;
    }

    try {
        const user = await User.findById(payload.sub);

        if(!user){
            res.status(401).json({ message: 'User not found, invalid token!', data: null });
            return; 
        }

        const accessToken = generateAccessToken(user);

        res.status(200).json({ message: 'Successfully obtained a new access token!', data: accessToken });
        return;
    }
    catch (e) {
        res.status(500).json({ message: 'Internal server error!', data: null });
        return; 
    }
}