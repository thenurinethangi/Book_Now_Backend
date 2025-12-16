import { Response } from "express";
import { AuthRequest } from "../middlewares/authenticate";
import { redis } from "../config/redis";
import { Showtime } from "../models/Showtime";

export const lockSeats = async (req: AuthRequest, res: Response) => {

    const { showId, seats } = req.body;

    const userId = req.sub;

    for (const seat of seats) {
        const key = `seat_lock:${showId}:${seat}`;

        const locked = await redis.set(
            key,
            JSON.stringify({ userId }),
            { nx: true, ex: 300 }
        );

        // if (!locked) {
        //     return res.status(409).json({
        //         message: `Seat ${seat} is already locked`,
        //         data: null
        //     });
        // }
    }

    res.status(200).json({ message: "Seats locked for 5 minutes", data: null });
};


export const checkIsLock = async (req: AuthRequest, res: Response) => {

    const { showId, seatNo } = req.body;
    const currentUserId = req.sub;

    const key = `seat_lock:${showId}:${seatNo}`;

    const lockData: any = await redis.get(key);

    if (!lockData) {
        return res.status(200).json({
            locked: false,
            data: null,
        });
    }

    res.status(200).json({
        locked: true,
        lockedByMe: lockData.userId === currentUserId,
        data: lockData,
    });
};


export const checkLockedSeats = async (req: AuthRequest, res: Response) => {

    const showId = req.params.showtimeId;
    const currentUserId = req.sub;

    console.log(showId);

    if (!showId) {
        res.status(400).json({ message: "Showtime ID not provided!", data: null });
        return;
    }

    try {
        const showtime = await Showtime.findOne({ _id: showId });
        console.log(showtime);

        if (!showtime) {
            res.status(400).json({ message: "Showtime not found!", data: null });
            return;
        }

        const seatPromises: Promise<any>[] = [];

        for (let i = 0; i < showtime.seats.length; i++) {
            const row = showtime.seats[i];
            for (let j = 0; j < row.length; j++) {
                const seat: any = row[j];
                if (!seat) continue;

                const key = `seat_lock:${showId}:${seat.id}`;
                console.log(key);

                // Push the Redis get promise to array
                seatPromises.push(
                    redis.get(key).then((lockData: any) => {
                        if (!lockData) {
                            return { locked: false, data: null };
                        } else {
                            return { locked: true, lockedByMe: lockData.userId === currentUserId, data: lockData };
                        }
                    })
                );
            }
        }

        // Wait for all Redis queries in parallel
        const arr = await Promise.all(seatPromises);
        console.log('--------------------');
        console.log(arr);

        res.status(200).json({ message: 'Successfully load seat locking result!', data: arr });
        return;
    } catch (e) {
        res.status(500).json({ message: "Failed to load seat locking result!", data: null });
        return;
    }
};


