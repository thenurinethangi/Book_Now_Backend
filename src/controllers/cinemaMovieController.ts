import { Response } from "express";
import { AuthRequest } from "../middlewares/authenticate";
import { Cinema } from "../models/Cinema";
import { CinemaMovie } from "../models/CinemaMovie";

export const removeMovieFromCinemasManageMovieList = async (req: AuthRequest, res: Response) => {

    const id = req.params.id;
    if (!id) {
        return res.status(400).json({ message: "Cinema Movie ID not provided!", data: null });
    }

    try {
        const cinema = await Cinema.findOne({ userId: req.sub });

        if (!cinema) {
            return res.status(404).json({ message: "Cinema not found!", data: null });
        }

        const isDelete = await CinemaMovie.deleteOne({ _id: id, cinemaId: cinema._id });

        if (isDelete.deletedCount > 0) {
            res.status(200).json({ message: "Successfully remove movie from managed movie list!", data: null });
            return;
        }
        res.status(500).json({ message: "failed to remove movie from managed movie list!", data: null });
        return;
    }
    catch (e) {
        res.status(500).json({ message: `Failed to remove movie from managed movie list!`, data: null });
        return;
    }

}