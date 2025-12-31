import { Response } from 'express'
import { AuthRequest } from "../middlewares/authenticate";
import { Watchlist } from '../models/Watchlist';
import { Movie, MovieStatus } from '../models/Movie';

export const addMovieToWatchlist = async (req: AuthRequest, res: Response) => {

    const { movieId } = req.body;

    try {
        const watchlist = await Watchlist.find({ userId: req.sub, movieId: movieId });

        if (watchlist.length > 0) {
            return res.status(200).json({ message: "Already added!", data: null });
        }

        const newWatchlist = new Watchlist({ userId: req.sub, movieId: movieId });
        const savedWatchlist = await newWatchlist.save();

        return res.status(200).json({ message: "Suucessfully added movie to watchlist.", data: savedWatchlist });
    }
    catch (e) {
        res.status(500).json({ message: `Fail to add movie to watchlist !`, data: null });
        return;
    }
}


export const removeMovieFromWatchlist = async (req: AuthRequest, res: Response) => {

    const { movieId } = req.body;

    try {
        const watchlist = await Watchlist.findOne({ userId: req.sub, movieId: movieId });

        if (watchlist) {
            const isDelete = await Watchlist.deleteOne({ userId: req.sub, movieId: movieId });

            if (isDelete.deletedCount > 0) {
                return res.status(200).json({ message: "Successfully removed movie from watchlist!", data: null });
            }
            return res.status(500).json({ message: "Failed to remove movie from watchlist!", data: null });
        }

        return res.status(400).json({ message: "Watchlist not found!", data: null });
    }
    catch (e) {
        res.status(500).json({ message: `Failed to remove movie from watchlist!`, data: null });
        return;
    }
}


export const getAllWatchlistMovies = async (req: AuthRequest, res: Response) => {

    try {
        const watchlist = await Watchlist.find({ userId: req.sub });

        let arr = [];
        for (let i = 0; i < watchlist.length; i++) {
            const e = watchlist[i];
            const movie = await Movie.find({ _id: e.movieId, status: { $ne: MovieStatus.NOT_SHOWING } });
            if (movie) {
                arr.push(e);
            }
        }

        return res.status(200).json({ message: "Successfully load all watchlist movies!", data: null });
    }
    catch (e) {
        res.status(500).json({ message: `Failed to load all watchlist movies!`, data: null });
        return;
    }
}