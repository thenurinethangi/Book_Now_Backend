import express, { Request, Response, NextFunction } from 'express'
import { AuthRequest } from './authenticate'
import { Role } from '../models/User'

export const authorize = (allowedRoles: Role[]) => {

    return (req: AuthRequest, res: Response, next: NextFunction) => {

        const roles = req.roles;
        
        if (!roles) {
            res.status(401).json({ message: 'Unauthenticate!, please login!', data: null });
            return;
        }

        for (let i = 0; i < allowedRoles.length; i++) {
            if (roles.includes(allowedRoles[i])) {
                next();
                return;
            }
        }

        res.status(403).json({ message: 'Unauthorize, you have no access to this!', data: null });
        return;
    }
}