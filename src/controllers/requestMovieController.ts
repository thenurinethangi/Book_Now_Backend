import { Response } from "express";
import { AuthRequest } from "../middlewares/authenticate";
import { RequestMovie, RequestStatus } from "../models/RequestMovie";

export const rejectMovieRequest = async (req: AuthRequest, res: Response) => {

    const id = req.params.id;

    if (!id) {
        res.status(401).json({ message: `Movie id not provided!`, data: null });
        return;
    }

    try {
        const result = await RequestMovie.updateOne({ _id: id }, { requestStatus: RequestStatus.REJECTED });

        if (result.modifiedCount >= 1) {
            res.status(200).json({ message: "Successfully rejected the movie request!", data: null });
            return;
        }
        res.status(500).json({ message: `Fail to reject the movie request!`, data: null });
        return;
    }
    catch (e) {
        res.status(500).json({ message: `Fail to reject the movie request!`, data: null });
        return;
    }

}


export const getAllRequestMovies = async (req: AuthRequest, res: Response) => {

    try {
        const requestedMovies = await RequestMovie.find({ requestStatus: { $ne: RequestStatus.APPROVED } }).populate('cinemaId');


        res.status(200).json({ message: "Successfully load all requested movies!", data: requestedMovies });
        return;

    }
    catch (e) {
        res.status(500).json({ message: `Fail to load all requested movies!`, data: null });
        return;
    }

}


export const deleteMovieRequest = async (req: AuthRequest, res: Response) => {

    const id = req.params.id;

    if (!id) {
        res.status(401).json({ message: `Movie id not provided!`, data: null });
        return;
    }

    try {
        const result = await RequestMovie.deleteOne({ _id: id });

        if (result.deletedCount >= 1) {
            res.status(200).json({ message: "Successfully deleted the movie request!", data: null });
            return;
        }
        res.status(500).json({ message: `Fail to delete the movie request!`, data: null });
        return;
    }
    catch (e) {
        res.status(500).json({ message: `Fail to delete the movie request!`, data: null });
        return;
    }

}


export const approveMovieRequest = async (id: string) => {

    if (!id) {
        return false;
    }

    try {
        const result = await RequestMovie.updateOne({ _id: id }, { requestStatus: RequestStatus.APPROVED });

        if (result.modifiedCount >= 1) {
            return true;
        }
        return false;
    }
    catch (e) {
        return false;
    }

}