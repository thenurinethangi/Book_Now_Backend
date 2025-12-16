import { Response } from "express";
import { AuthRequest } from "../middlewares/authenticate";
import { redis } from "../config/redis";

export const lockSeats = async (req: AuthRequest, res: Response) => {
    const { showId, seats, userId } = req.body;

    for (const seat of seats) {
        const key = `seat_lock:${showId}:${seat}`;

        const locked = await redis.set(
            key,
            JSON.stringify({ userId }),
            { nx: true, ex: 300 }
        );

        if (!locked) {
            return res.status(409).json({
                message: `Seat ${seat} is already locked`,
                data: null
            });
        }
    }

    res.status(200).json({ message: "Seats locked for 5 minutes", data: null });
};
