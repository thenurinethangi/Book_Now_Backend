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


export const deactivateACinema = async (req: AuthRequest, res: Response) => {

    const id = req.params.id;

    try {
        const result = await Cinema.updateOne({ _id: id }, { $set: { status: CinemaStatus.DEACTIVE } });

        if (result.modifiedCount === 1) {
            res.status(200).json({ message: `Successfully deactivate cinemas!`, data: null });
            return;
        }
        else {
            res.status(401).json({ message: `Fail to deactivate cinemas!`, data: null });
            return;
        }
    }
    catch (e) {
        res.status(500).json({ message: `Fail to deactivate cinema!`, data: null });
        return;
    }
}


export const activateACinema = async (req: AuthRequest, res: Response) => {

    const id = req.params.id;

    try {
        const result = await Cinema.updateOne({ _id: id }, { $set: { status: CinemaStatus.ACITIVE } });

        if (result.modifiedCount === 1) {
            res.status(200).json({ message: `Successfully activate cinemas!`, data: null });
            return;
        }
        else {
            res.status(401).json({ message: `Fail to activate cinemas!`, data: null });
            return;
        }
    }
    catch (e) {
        res.status(500).json({ message: `Fail to deactivate cinema!`, data: null });
        return;
    }
}


export const rejectACinema = async (req: AuthRequest, res: Response) => {

    const id = req.params.id;

    try {
        const result = await Cinema.updateOne({ _id: id }, { $set: { status: CinemaStatus.REJECTED } });

        if (result.modifiedCount === 1) {
            res.status(200).json({ message: `Successfully rejected cinemas!`, data: null });
            return;
        }
        else {
            res.status(401).json({ message: `Fail to reject cinemas!`, data: null });
            return;
        }
    }
    catch (e) {
        res.status(500).json({ message: `Fail to reject cinema!`, data: null });
        return;
    }
}


export const deleteRejectedCinema = async (req: AuthRequest, res: Response) => {

    const id = req.params.id;

    try {
        const result = await Cinema.deleteOne({ _id: id, status: CinemaStatus.REJECTED });

        if (result.deletedCount === 1) {
            res.status(200).json({ message: `Successfully deleted rejected cinemas!`, data: null });
            return;
        }
        else {
            res.status(401).json({ message: `Fail to delete rejected cinemas!`, data: null });
            return;
        }
    }
    catch (e) {
        res.status(500).json({ message: `Fail to delete rejected cinema!`, data: null });
        return;
    }
}