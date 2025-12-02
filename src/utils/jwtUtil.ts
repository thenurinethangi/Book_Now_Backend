import jwt, { JwtPayload } from 'jsonwebtoken'
import dontenv from 'dotenv'
import { IUser, Role } from '../models/User';
dontenv.config();

const jwtAccessTokenSecret = process.env.JWT_ACCESS_TOKEN_SECRET as string;
const jwtRefreshTokenSecret = process.env.JWT_REFRESH_TOKEN_SECRET as string;

export const generateAccessToken = (user: IUser) => {

    return jwt.sign(
        {
            sub: user._id,
            roles: user.roles
        },
        jwtAccessTokenSecret,
        {
            expiresIn: '1d'
        }
    );
}

export const generateRefreshToken = (user: IUser) => {

    return jwt.sign(
        {
            sub: user._id,
            roles: user.roles
        },
        jwtRefreshTokenSecret,
        {
            expiresIn: '7d'
        }
    );
}

export interface CustomJwtPayload extends JwtPayload {
    sub: string,
    roles: Role[]
}

export const verifyAccessToken = (token: string): CustomJwtPayload | null => {

    try {
        return jwt.verify(token, jwtAccessTokenSecret) as CustomJwtPayload;
    }
    catch (e) {
        return null;
    }
}

export const verifyRefreshToken = (token: string): CustomJwtPayload | null => {

    try {
        return jwt.verify(token, jwtRefreshTokenSecret) as CustomJwtPayload;
    }
    catch (e) {
        return null;
    }
}