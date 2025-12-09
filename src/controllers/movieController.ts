import { Request, Response } from "express";
import { AuthRequest } from "../middlewares/authenticate";
import { Cinema } from "../models/Cinema";
import { CinemaMovie } from "../models/CinemaMovie";
import { Movie, MovieStatus } from "../models/Movie";
import cloudinary from "../config/cloudinaryConfig";
import { RequestMovie, RequestStatus } from "../models/RequestMovie";
import { Booking } from "../models/Booking";
import { Showtime } from "../models/Showtime";
import { approveMovieRequest } from "./requestMovieController";

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


export const getCinemaAllAvailableMovie = async (req: AuthRequest, res: Response) => {

    try {
        const cinema = await Cinema.findOne({ userId: req.sub });

        if (!cinema) {
            res.status(404).json({ message: "Cinema not found!", data: null });
            return;
        }

        const cinemaMovies = await CinemaMovie.find({ cinemaId: cinema._id, status: { $ne: MovieStatus.NOT_SHOWING } });

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


export const getAllManagedMoviesForAdmin = async (req: AuthRequest, res: Response) => {

    try {
        const movies = await Movie.find();

        let arr = [];
        for (let i = 0; i < movies.length; i++) {
            const e = movies[i];

            const cinemas = await CinemaMovie.find({ movieId: e._id }).populate('cinemaId');

            const showtimes = await Showtime.find({ movieId: e._id });
            let ids = [];
            for (let j = 0; j < showtimes.length; j++) {
                const a = showtimes[j];
                ids.push(a._id);
            }

            const bookings = await Booking.find({ showtimeId: { $in: ids } });

            arr.push({ movie: e, cinemas: cinemas, bookings: bookings.length });
        }

        res.status(200).json({ message: "Successfully load all managed movies!", data: arr });
        return;
    }
    catch (e) {
        res.status(500).json({ message: `Fail to load all managed movies!`, data: null });
        return;
    }

}


export const changeMovieStatusForAdmin = async (req: AuthRequest, res: Response) => {

    const { id, status } = req.body;

    if (!id || !status) {
        res.status(400).json({ message: `Incomplete data provided!`, data: null });
        return;
    }

    try {
        if (status === 'Now Showing') {
            const result = await Movie.updateOne({ _id: id }, { status: MovieStatus.NOW_SHOWING });
            if (result.modifiedCount === 1) {
                res.status(200).json({ message: "Successfully updated the movie status!", data: null });
                return;
            }
        }
        else if (status === 'Coming Soon') {
            const result = await Movie.updateOne({ _id: id }, { status: MovieStatus.COMING_SOON });
            if (result.modifiedCount === 1) {
                res.status(200).json({ message: "Successfully updated the movie status!", data: null });
                return;
            }
        }
    }
    catch (e) {
        res.status(500).json({ message: `Fail to update the movie status!`, data: null });
        return;
    }

}


export const checkMovieInCinemasManageMovieList = async (req: AuthRequest, res: Response) => {

    const id = req.params.id;

    if (!id) {
        res.status(401).json({ message: `Movie id not provided!`, data: null });
        return;
    }

    try {
        const cinemaMovies = await CinemaMovie.find({ movieId: id });

        res.status(200).json({ message: "Successfully check movie in cinemas movie list!", data: cinemaMovies.length });
        return;
    }
    catch (e) {
        res.status(500).json({ message: `Fail to update the movie status!`, data: null });
        return;
    }

}


export const deleteAMovie = async (req: AuthRequest, res: Response) => {

    const id = req.params.id;

    if (!id) {
        res.status(400).json({ message: `Movie id not provided!`, data: null });
        return;
    }

    try {
        const result = await CinemaMovie.deleteOne({ movieId: id });

        if (result.deletedCount >= 1) {
            res.status(200).json({ message: "Successfully delete the movie!", data: null });
            return;
        }
        res.status(500).json({ message: `Fail to delete the movie!`, data: null });
        return;
    }
    catch (e) {
        res.status(500).json({ message: `Fail to delete the movie!`, data: null });
        return;
    }

}


export const addNewMovieForAdmin = async (req: AuthRequest, res: Response) => {

    const { id, title, description, releaseDate, duration, originalLanguage, genres, formats, directors, production,
        trailerUrl, ageRating, imdbRating, rtRating, status } = req.body;

    if (!id || !title || !description || !releaseDate || !duration || !originalLanguage || !genres || !formats || !directors || !trailerUrl || !ageRating || !status) {
        res.status(400).json({ message: `Incomplete data provided for adding a new movie.!`, data: null });
        return;
    }

    const files = req.files as {
        [fieldname: string]: Express.Multer.File[];
    };

    let posterImageUrl = "";
    let bannerImageUrl = "";

    const uploadToCloudinary = (fileBuffer: Buffer): Promise<any> => {
        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                { folder: "movie" },
                (error, result) => {
                    if (error) return reject(error);
                    resolve(result);
                }
            );
            uploadStream.end(fileBuffer);
        });
    };

    if (files?.posterImageUrl?.[0]) {
        const result = await uploadToCloudinary(files.posterImageUrl[0].buffer);
        posterImageUrl = result.secure_url;
    }

    if (files?.bannerImageUrl?.[0]) {
        const result = await uploadToCloudinary(
            files.bannerImageUrl[0].buffer
        );
        bannerImageUrl = result.secure_url;
    }

    try {
        const existingMoviesWithSameName = await Movie.find({ title: title });
        if (existingMoviesWithSameName.length > 0) {
            res.status(400).json({ message: `This movie already exist in managed movie list. so can't add again!`, data: null });
            return;
        }

        const result = await approveMovieRequest(id);
        if (!result) {
            res.status(500).json({ message: `Unable to set status 'Approved' fro movie request!`, data: null });
            return;
        }

        const newMovie = new Movie({
            title,
            description,
            releaseDate: new Date(releaseDate),
            duration,
            originalLanguage,
            genres: JSON.parse(genres),
            formats: JSON.parse(formats),
            directors: JSON.parse(directors),
            production: JSON.parse(production),
            posterImageUrl,
            bannerImageUrl,
            trailerUrl,
            ageRating,
            ratings: {
                imdb: imdbRating,
                rottenTomatoes: rtRating
            },
            status
        });

        const savedMovie = await newMovie.save();

        res.status(200).json({ message: `Successfully added new movie!`, data: savedMovie });
        return;
    }
    catch (e) {
        res.status(500).json({ message: `Fail to delete the movie!`, data: null });
        return;
    }

}