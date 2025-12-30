import { Response } from "express";
import { AuthRequest } from "../middlewares/authenticate";
import { Cinema } from "../models/Cinema";
import { Showtime, ShowtimeStatus } from "../models/Showtime";
import { Booking, BookingStatus } from "../models/Booking";
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
            formatShowing: format,
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


export const getAllShowtimesOfAMovie = async (req: AuthRequest, res: Response) => {

    try {
        const movieId = req.params.movieId;

        const toSLTime = (date: Date) =>
            new Date(date.toLocaleString("en-US", { timeZone: "Asia/Colombo" }));

        const todaySL = toSLTime(new Date());

        const daysArray: any[][][] = [];

        for (let i = 0; i < 7; i++) {
            const day = new Date(todaySL);
            day.setDate(todaySL.getDate() + i);

            const startOfDaySL = new Date(
                day.getFullYear(),
                day.getMonth(),
                day.getDate(),
                0, 0, 0
            );

            const endOfDaySL = new Date(
                day.getFullYear(),
                day.getMonth(),
                day.getDate(),
                23, 59, 59
            );

            const startUTC = new Date(startOfDaySL.toISOString());
            const endUTC = new Date(endOfDaySL.toISOString());

            const showtimes = await Showtime.find({
                movieId,
                date: {
                    $gte: startUTC,
                    $lte: endUTC
                }
            })
                .populate('cinemaId')
                .populate('screenId');

            const screenGroups: { [key: string]: any[] } = {};

            showtimes.forEach(st => {
                const screenId = st.screenId?._id?.toString();

                if (!screenGroups[screenId]) {
                    screenGroups[screenId] = [];
                }

                screenGroups[screenId].push(st);
            });

            daysArray.push(Object.values(screenGroups));
        }

        const arr: any[][][] = [];
        for (let i = 0; i < daysArray.length; i++) {
            const day = daysArray[i];
            for (let j = 0; j < day.length; j++) {
                const screen = day[j];
                for (let k = 0; k < screen.length; k++) {
                    let st = screen[k];
                    st = st.toObject();
                    const bookings = await Booking.find({ showtimeId: st._id, status: { $ne: BookingStatus.FAILED } });
                    let count = 0;
                    for (let l = 0; l < bookings.length; l++) {
                        const book: any = bookings[l];
                        count += book.seatsDetails.length;
                    }
                    console.log('bookings', count);
                    st["bookings"] = count;
                    screen[k] = st;
                }
            }
            arr.push(day);
        }

        return res.status(200).json({
            message: "Showtimes fetched successfully",
            data: arr
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Server error", data: null });
    }
};


export const getShowtimeDetailsById = async (req: AuthRequest, res: Response) => {

    const id = req.params.id;

    if (!id) {
        res.status(400).json({ message: "Showtime ID not provided!", data: null });
        return;
    }

    try {
        const showtime = await Showtime.findOne({ _id: id })
            .populate('movieId')
            .populate('screenId')
            .populate('cinemaId');

        res.status(200).json({ message: `Successfully load selected showtime details!`, data: showtime });
        return;
    }
    catch (e) {
        res.status(500).json({ message: `Fail to load selected shomtime details!`, data: null });
        return;
    }
}


export const getUnavailableSeats = async (req: AuthRequest, res: Response) => {

    const id = req.params.id;

    if (!id) {
        res.status(400).json({ message: "Showtime ID not provided!", data: null });
        return;
    }

    try {
        const bookings = await Booking.find({ showtimeId: id, status: { $ne: BookingStatus.FAILED } });

        res.status(200).json({ message: `Successfully load bookings for showtime!`, data: bookings });
        return;
    }
    catch (e) {
        res.status(500).json({ message: `Fail to load bookings for shomtime!`, data: null });
        return;
    }
}


export const getAllShowtimesOfACinema = async (req: AuthRequest, res: Response) => {

    try {
        const cinemaId = req.params.cinemaId;
        console.log(cinemaId)

        const toSLTime = (date: Date) =>
            new Date(date.toLocaleString("en-US", { timeZone: "Asia/Colombo" }));

        const todaySL = toSLTime(new Date());

        const daysArray: any[][][] = [];

        for (let i = 0; i < 7; i++) {
            const day = new Date(todaySL);
            day.setDate(todaySL.getDate() + i);

            const startOfDaySL = new Date(
                day.getFullYear(),
                day.getMonth(),
                day.getDate(),
                0, 0, 0
            );

            const endOfDaySL = new Date(
                day.getFullYear(),
                day.getMonth(),
                day.getDate(),
                23, 59, 59
            );

            const startUTC = new Date(startOfDaySL.toISOString());
            const endUTC = new Date(endOfDaySL.toISOString());

            const showtimes = await Showtime.find({
                cinemaId,
                date: {
                    $gte: startUTC,
                    $lte: endUTC
                }
            })
                .populate('movieId')
                .populate('screenId');

            console.log(showtimes);

            const movieGroups: { [key: string]: any[] } = {};

            showtimes.forEach(st => {
                const movieId = st.movieId?._id?.toString();

                if (!movieGroups[movieId]) {
                    movieGroups[movieId] = [];
                }

                movieGroups[movieId].push(st);
            });

            daysArray.push(Object.values(movieGroups));
        }

        const arr: any[][][] = [];
        for (let i = 0; i < daysArray.length; i++) {
            const day = daysArray[i];
            for (let j = 0; j < day.length; j++) {
                const screen = day[j];
                for (let k = 0; k < screen.length; k++) {
                    let st = screen[k];
                    st = st.toObject();
                    const bookings = await Booking.find({ showtimeId: st._id, status: { $ne: BookingStatus.FAILED } });
                    let count = 0;
                    for (let l = 0; l < bookings.length; l++) {
                        const book: any = bookings[l];
                        count += book.seatsDetails.length;
                    }
                    console.log('bookings', count);
                    st["bookings"] = count;
                    screen[k] = st;
                }
            }
            arr.push(day);
        }

        return res.status(200).json({
            message: "Showtimes fetched successfully",
            data: arr
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Server error", data: null });
    }
};