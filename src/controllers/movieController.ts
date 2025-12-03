import { Request, Response } from "express";
import { AuthRequest } from "../middlewares/authenticate";
import { Cinema } from "../models/Cinema";
import { CinemaMovie } from "../models/CinemaMovie";
import { Movie } from "../models/Movie";
import cloudinary from "../config/cloudinaryConfig";
import { RequestMovie, RequestStatus } from "../models/RequestMovie";

export const getAllCinemaMovies = async (req: AuthRequest, res: Response) => {

    try {
        const cinema = await Cinema.findOne({ userId: req.sub });

        if (!cinema) {
            res.status(404).json({ message: "Cinema not found!", data: null });
            return;
        }

        const cinemaMovies = await CinemaMovie.find({ cinemaId: cinema._id });

        const movieIds = cinemaMovies.map(cm => cm.movieId);

        const movies = await Movie.find({ _id: { $in: movieIds } });

        const movielist = cinemaMovies.map(cinemaMovie => {
            const movie = movies.find(m => m._id.toString() === cinemaMovie.movieId.toString());
            return {
                ...cinemaMovie.toObject(),
                movieDetails: movie?.toObject() || null
            };
        });

        res.status(200).json({ message: "Successfully load all movies!", data: movielist });
        return;
    }
    catch (e) {
        res.status(500).json({ message: `Fail to load movies!`, data: null });
        return;
    }

}


export const getAllAvailableMoviesOfCinemaToAdd = async (req: AuthRequest, res: Response) => {

    try {
        const cinema = await Cinema.findOne({ userId: req.sub });

        if (!cinema) {
            res.status(404).json({ message: "Cinema not found!", data: null });
            return;
        }

        const cinemaMovies = await CinemaMovie.find({ cinemaId: cinema._id });

        const movieIds = cinemaMovies.map(cm => cm.movieId);

        const movies = await Movie.find({ _id: { $nin: movieIds } });

        res.status(200).json({ message: "Successfully load all available movies to add!", data: movies });
        return;
    }
    catch (e) {
        res.status(500).json({ message: `Fail to load available movies!`, data: null });
        return;
    }

}


export const getMovieAvailableFormats = async (req: AuthRequest, res: Response) => {

    const id = req.params.id;

    try {
        const formatsList = await Movie.findOne({ _id: id }, { formats: true });

        res.status(200).json({ message: `Successfully load movie id: ${id}, available formats!`, data: formatsList });
        return;
    }
    catch (e) {
        res.status(500).json({ message: `Fail to load movie available format!`, data: null });
        return;
    }

}


export const addMovieToCinemaMovieList = async (req: AuthRequest, res: Response) => {

    const { id, status, formats } = req.body;

    if (!id || !status || !formats) {
        res.status(400).json({ message: "Unable to add, incomplete data provide!", data: null });
        return;
    }

    try {
        const cinema = await Cinema.findOne({ userId: req.sub });

        if (!cinema) {
            res.status(404).json({ message: "Cinema not found!", data: null });
            return;
        }

        const movie = await Movie.findOne({ _id: id });

        if (!movie) {
            res.status(404).json({ message: "Movie not found!", data: null });
            return;
        }

        const newCinemaMovie = new CinemaMovie({
            formatsAvailble: formats,
            status: status,
            cinemaId: cinema._id,
            movieId: movie._id
        });

        const savedCinemaMovie = await newCinemaMovie.save();

        res.status(200).json({ message: `Successfully added movie!`, data: savedCinemaMovie });
        return;
    }
    catch (e) {
        res.status(500).json({ message: `Fail to add movie!`, data: null });
        return;
    }

}


export const addMovieRequest = async (req: AuthRequest, res: Response) => {

    let { title, originalLanguage, duration, releaseDate, genres, directors, trailerUrl, status } = req.body;

    if (!title || !originalLanguage || !duration || !releaseDate || !genres || !directors || !trailerUrl || !status) {
        res.status(400).json({ message: "Unable to send request, incomplete data provide!", data: null });
        return;
    }

    let posterImageUrl = ""

    if (req.file) {
        const result: any = await new Promise((resole, reject) => {
            const upload_stream = cloudinary.uploader.upload_stream(
                { folder: "movie" },
                (error, result) => {
                    if (error) {
                        console.error(error)
                        return reject(error)
                    }
                    resole(result)
                }
            )
            upload_stream.end(req.file?.buffer)
        })
        posterImageUrl = result.secure_url
    }

    try {
        const cinema = await Cinema.findOne({ userId: req.sub });

        if (!cinema) {
            res.status(404).json({ message: "Cinema not found!", data: null });
            return;
        }

        genres = genres.split(',');
        directors = directors.split(',');

        const newRequestMovie = new RequestMovie({
            title,
            releaseDate,
            duration,
            originalLanguage,
            genres,
            directors,
            posterImageUrl,
            trailerUrl,
            movieStatus: status,
            cinemaId: cinema._id,
            requestStatus: RequestStatus.PENDING
        });

        const savedRequestMovie = await newRequestMovie.save();

        res.status(200).json({ message: `Successfully request a movie!`, data: savedRequestMovie });
        return;
    }
    catch (e) {
        res.status(500).json({ message: `Fail to request movie!`, data: null });
        return;
    }

}