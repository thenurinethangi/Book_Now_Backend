import jwt, { JwtPayload } from 'jsonwebtoken'
import dontenv from 'dotenv'
import { Role } from '../models/User';
dontenv.config();

const jwtAccessTokenSecret = process.env.JWT_ACCESS_TOKEN_SECRET as string;
const jwtRefreshTokenSecret = process.env.JWT_REFRESH_TOKEN_SECRET as string;

export interface CustomJwtPayload extends JwtPayload{
    sub: string,
    roles: Role[]
}

export const verifyAccessToken = (token: string) : CustomJwtPayload | null => {

    try {
        return jwt.verify(token, jwtAccessTokenSecret) as CustomJwtPayload;
    }
    catch (e) {
        return null;
    }
}

export const verifyRefreshToken = (token: string) : CustomJwtPayload | null => {

    try {
        return jwt.verify(token, jwtRefreshTokenSecret) as CustomJwtPayload;
    }
    catch (e) {
        return null;
    }
}