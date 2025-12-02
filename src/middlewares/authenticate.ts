import express, { Request, Response, NextFunction } from 'express'
import { verifyAccessToken } from '../utils/jwtUtil';
import { Role } from '../models/User';

export interface AuthRequest extends Request{
    sub?: string,
    roles?: Role[]
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {

    const accessToken = req.headers.authorization?.split('Bearer ')[1];

    if(!accessToken){
        res.status(401).json({message: 'Unauthenticate!, no access token provide, please login!', data: null});
        return;
    }

    const payload = verifyAccessToken(accessToken);

    if(!payload){
        res.status(401).json({message: 'Unauthenticate!, invalid access token!', data: null});
        return;
    }

    req.sub = payload.sub;
    req.roles = payload.roles;

    next();
}