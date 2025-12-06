import { Response } from "express";
import { AuthRequest } from "../middlewares/authenticate";
import { Cinema, CinemaStatus } from "../models/Cinema";
import { Screen } from "../models/Screen";

export const getAllActiveCinemas = async (req: AuthRequest, res: Response) => {

    try {
        const activeCinemas = await Cinema.find({ status: CinemaStatus.ACITIVE });

        const cinemaList = [];

        for (let i = 0; i < activeCinemas.length; i++) {
            const e: any = activeCinemas[i].toObject();

            const screens = await Screen.find({ cinemaId: e._id });

            const formats: string[] = [];

            for (const s of screens) {
                for (const type of s.screenTypes) {
                    if (!formats.includes(type)) {
                        formats.push(type);
                    }
                }
            }

            e.formats = formats;

            cinemaList.push(e);
        }

        res.status(200).json({ message: `Successfully load all active cinemas!`, data: cinemaList });
        return;
    }
    catch (e) {
        res.status(500).json({ message: `Fail to load active cinema!`, data: null });
        return;
    }
}


export const getAllPendingCinemas = async (req: AuthRequest, res: Response) => {

    try {
        const pendingCinemas = await Cinema.find({ status: CinemaStatus.PENDING });

        res.status(200).json({ message: `Successfully load all pending cinemas!`, data: pendingCinemas });
        return;
    }
    catch (e) {
        res.status(500).json({ message: `Fail to load pending cinema!`, data: null });
        return;
    }
}


export const getAllRejectedCinemas = async (req: AuthRequest, res: Response) => {

    try {
        const rejectedCinemas = await Cinema.find({ status: CinemaStatus.REJECTED });

        res.status(200).json({ message: `Successfully load all rejected cinemas!`, data: rejectedCinemas });
        return;
    }
    catch (e) {
        res.status(500).json({ message: `Fail to load rejected cinema!`, data: null });
        return;
    }
}