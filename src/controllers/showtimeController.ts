import { Response } from "express";
import { AuthRequest } from "../middlewares/authenticate";
import { Cinema } from "../models/Cinema";
import { Showtime, ShowtimeStatus } from "../models/Showtime";
import { Booking } from "../models/Booking";
import { Movie } from "../models/Movie";
import { Screen } from "../models/Screen";

export const getCinemaShowtime = async (req: AuthRequest, res: Response) => {

    try {
        const cinema = await Cinema.findOne({ userId: req.sub });

        if (!cinema) {
            res.status(404).json({ message: "Cinema not found!", data: null });
            return;
        }

        const showtimes = await Showtime.find({ cinemaId: cinema._id })
            .populate('movieId', 'title')
            .populate('screenId', 'screenName numberOfSeats')
            .sort({ date: -1, time: -1 });

        const nowColombo = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Colombo' }));
        const startOfTodayColombo = new Date(nowColombo.getFullYear(), nowColombo.getMonth(), nowColombo.getDate());
        const startOfTomorrowColombo = new Date(nowColombo.getFullYear(), nowColombo.getMonth(), nowColombo.getDate() + 1);

        let arr = [];
        for (let i = 0; i < showtimes.length; i++) {
            const showDate = new Date(showtimes[i].date);
            const showDateColombo = new Date(showDate.toLocaleString('en-US', { timeZone: 'Asia/Colombo' }));

            if (showDateColombo >= startOfTomorrowColombo) {
                showtimes[i].status = ShowtimeStatus.SCHEDULED;
            }
            else if (showDateColombo < startOfTodayColombo) {
                showtimes[i].status = ShowtimeStatus.EXPIRED;
            }
            else {
                showtimes[i].status = ShowtimeStatus.TODAY;
            }

            const bookings = await Booking.find({ showtimeId: showtimes[i]._id });

            if (showtimes[i].status === ShowtimeStatus.TODAY) {
                arr.push({
                    _id: showtimes[i]._id,
                    cinemaId: showtimes[i].cinemaId,
                    movieId: {
                        _id: showtimes[i].movieId._id,
                        title: showtimes[i].movieId.title
                    },
                    screenId: {
                        _id: showtimes[i].screenId._id,
                        screenName: showtimes[i].screenId.screenName,
                        numberOfSeats: showtimes[i].screenId.numberOfSeats
                    },
                    date: formatDate(showtimes[i].date.toString()),
                    time: formatTime(showtimes[i].time.toString()),
                    status: showtimes[i].status,
                    bookingCount: bookings.length
                });
            }
        }

        for (let i = 0; i < showtimes.length; i++) {
            const showDate = new Date(showtimes[i].date);
            const showDateColombo = new Date(showDate.toLocaleString('en-US', { timeZone: 'Asia/Colombo' }));

            if (showDateColombo >= startOfTomorrowColombo) {
                showtimes[i].status = ShowtimeStatus.SCHEDULED;
            }
            else if (showDateColombo < startOfTodayColombo) {
                showtimes[i].status = ShowtimeStatus.EXPIRED;
            }
            else {
                showtimes[i].status = ShowtimeStatus.TODAY;
            }

            const bookings = await Booking.find({ showtimeId: showtimes[i]._id });

            if (showtimes[i].status !== ShowtimeStatus.TODAY) {
                arr.push({
                    _id: showtimes[i]._id,
                    cinemaId: showtimes[i].cinemaId,
                    movieId: {
                        _id: showtimes[i].movieId._id,
                        title: showtimes[i].movieId.title
                    },
                    screenId: {
                        _id: showtimes[i].screenId._id,
                        screenName: showtimes[i].screenId.screenName,
                        numberOfSeats: showtimes[i].screenId.numberOfSeats
                    },
                    date: formatDate(showtimes[i].date.toString()),
                    time: formatTime(showtimes[i].time.toString()),
                    status: showtimes[i].status,
                    bookingCount: bookings.length
                });
            }
        }

        res.status(200).json({ message: `Successfully load all showtimes!`, data: arr });
        return;
    }
    catch (e) {
        res.status(500).json({ message: `Fail to load showtimes!`, data: null });
        return;
    }
}

function formatDate(dateString: string) {
    const date = new Date(dateString);

    return date.toLocaleDateString("en-US", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
}

function formatTime(dateString: string) {
    const date = new Date(dateString);

    return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
    });
}



export const checkShowtimeAlreadyExist = async (req: AuthRequest, res: Response) => {

    const { date, time, screen: screenId, movie: movieId } = req.body;

    console.log(req.body);

    if (!date || !time || !screenId || !movieId) {
        res.status(400).json({ message: "Incomplete data provide!", data: null });
        return;
    }

    try {
        const cinema = await Cinema.findOne({ userId: req.sub });

        if (!cinema) {
            res.status(404).json({ message: "Cinema not found!", data: null });
            return;
        }

        const movie = await Movie.findOne({ _id: movieId });

        if (!movie) {
            res.status(404).json({ message: "Movie not found!", data: null });
            return;
        }

        const { start, end } = getShowtimeRange(date, time, movie.duration.split(' ')[0]);

        const showtimes = await Showtime.find({ cinemaId: cinema._id, screenId: screenId, time: { $gte: start, $lte: end } });

        res.status(200).json({ message: `Successfully get showtime availability!`, data: showtimes.length <= 0 });
        return;
    }
    catch (e) {
        res.status(500).json({ message: `Fail to check showtime availability!`, data: null });
        return;
    }
}


function getShowtimeRange(dateString: string, startTime: string, durationMinutes: string) {
    const [h, m] = startTime.split(":").map(Number);
    const duration = Number(durationMinutes);

    const start = new Date(dateString);
    start.setHours(h, m, 0, 0);

    const end = new Date(start);
    end.setMinutes(start.getMinutes() + duration);

    return { start, end };
}



export const addANewShowtime = async (req: AuthRequest, res: Response) => {

    let { date, time, screenId, movieId, ticketPrices, format } = req.body;

    console.log(req.body);

    if (!date || !time || !screenId || !movieId || !ticketPrices || !format) {
        res.status(400).json({ message: "Incomplete data provide!", data: null });
        return;
    }

    try {
        const cinema = await Cinema.findOne({ userId: req.sub });

        if (!cinema) {
            res.status(404).json({ message: "Cinema not found!", data: null });
            return;
        }

        const movie = await Movie.findOne({ _id: movieId });

        if (!movie) {
            res.status(404).json({ message: "Movie not found!", data: null });
            return;
        }

        const screen = await Screen.findOne({ _id: screenId });

        if (!screen) {
            res.status(404).json({ message: "Screen not found!", data: null });
            return;
        }

        const d = combineDateTimeSL(date, time);

        const newShowtime = new Showtime({
            date: d,
            time: d,
            screenId: screen._id,
            movieId: movie._id,
            cinemaId: cinema._id,
            ticketPrices,
            seats: screen.seatLayout,
            status: ShowtimeStatus.SCHEDULED
        });

        const savedShowtime = await newShowtime.save();

        res.status(200).json({ message: `Successfully add new showtime!`, data: savedShowtime });
        return;
    }
    catch (e) {
        res.status(500).json({ message: `Fail to add new showtime!`, data: null });
        return;
    }
}

function combineDateTimeSL(dateStr: string, timeStr: string) {
    return new Date(`${dateStr}T${timeStr}:00`);
}
