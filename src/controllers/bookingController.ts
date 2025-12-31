import { Response } from "express";
import { AuthRequest } from "../middlewares/authenticate";
import { Cinema } from "../models/Cinema";
import { Booking, BookingStatus } from "../models/Booking";
import { Showtime } from "../models/Showtime";
import { Movie } from "../models/Movie";
import { Screen } from "../models/Screen";

export const getCinemaAllBookings = async (req: AuthRequest, res: Response) => {

    try {
        const cinema = await Cinema.findOne({ userId: req.sub });

        if (!cinema) {
            res.status(404).json({ message: "Cinema not found!", data: null });
            return;
        }

        const showtimes = await Showtime.find({ cinemaId: cinema._id }).select("_id");

        if (showtimes.length === 0) {
            return res.status(200).json({ message: "No bookings found", data: [] });
        }

        const showtimeIds = showtimes.map(st => st._id);

        const bookings = await Booking.find({ showtimeId: { $in: showtimeIds } })
            .populate("userId")
            .populate("showtimeId")
            .sort({ createdAt: -1 });

        let arr = [];
        for (let i = 0; i < bookings.length; i++) {
            const e: any = bookings[i];
            const movie = await Movie.findOne({ _id: e.showtimeId.movieId });
            const screen = await Screen.findOne({ _id: e.showtimeId.screenId });

            arr.push({
                _id: e._id,
                date: e.date,
                tickets: e.tickets,
                ticketsDetails: e.ticketsDetails,
                seatsDetails: e.seatsDetails,
                showtimeId: e.showtimeId,
                userId: e.userId,
                status: e.status,
                total: e.total,
                movieTitle: movie?.title || 'N/A',
                screenName: screen?.screenName || 'N/A'
            });
        }

        return res.status(200).json({ message: "Load all bookings successfully.", data: arr });
    }
    catch (e) {
        res.status(500).json({ message: `Fail to load booking!`, data: null });
        return;
    }
}


export const getCinemaTodayBooking = async (req: AuthRequest, res: Response) => {

    try {
        const cinema = await Cinema.findOne({ userId: req.sub });

        if (!cinema) {
            res.status(404).json({ message: "Cinema not found!", data: null });
            return;
        }

        const showtimes = await Showtime.find({ cinemaId: cinema._id });

        let showtimeIds = [];
        for (let i = 0; i < showtimes.length; i++) {
            const e = showtimes[i];
            showtimeIds.push(e._id);
        }

        const { start, end } = getTodayRange();
        const bookingToday = await Booking.find({ showtimeId: { $in: showtimeIds }, date: { $gte: start, $lte: end } });

        const { start2, end2 } = getYesterdayRange();
        const bookingYesterday = await Booking.find({ showtimeId: { $in: showtimeIds }, date: { $gte: start2, $lte: end2 } });

        const change = getBookingChange(bookingToday.length, bookingYesterday.length);

        const data = {
            todayBooking: bookingToday.length,
            yesterdayBooking: bookingYesterday.length,
            change
        }

        return res.status(200).json({ message: "Load all today booking successfully.", data: data });
    }
    catch (e) {
        res.status(500).json({ message: `Fail to load today booking!`, data: null });
        return;
    }
}

function getTodayRange() {
    const now = new Date();

    const start = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        0, 0, 0, 0
    );

    const end = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        23, 59, 59, 999
    );

    return { start, end };
}

function getYesterdayRange() {
    const now = new Date();

    const start2 = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() - 1,
        0, 0, 0, 0
    );

    const end2 = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() - 1,
        23, 59, 59, 999
    );

    return { start2, end2 };
}

function getBookingChange(today: number, yesterday: number): number {
    if (yesterday === 0) {
        return today === 0 ? 0 : 100;
    }

    return ((today - yesterday) / yesterday) * 100;
}


export const getAllMyBookings = async (req: AuthRequest, res: Response) => {

    try {
        const bookings = await Booking.find({ userId: req.sub, status: { $ne: BookingStatus.FAILED } })
            .populate("userId")
            .populate("showtimeId")
            .sort({ createdAt: -1 });

        let arr = [];
        for (let i = 0; i < bookings.length; i++) {
            const e: any = bookings[i];
            const movie = await Movie.findOne({ _id: e.showtimeId.movieId });
            const screen = await Screen.findOne({ _id: e.showtimeId.screenId });
            const cinema = await Cinema.findOne({ _id: e.showtimeId.cinemaId });

            arr.push({
                _id: e._id,
                date: e.date,
                tickets: e.tickets,
                ticketsDetails: e.ticketsDetails,
                seatsDetails: e.seatsDetails,
                showtimeId: e.showtimeId,
                userId: e.userId,
                status: e.status,
                total: e.total,
                movie,
                screen,
                cinema
            });
        }

        return res.status(200).json({ message: "Load all my bookings successfully.", data: arr });
    }
    catch (e) {
        res.status(500).json({ message: `Fail to load my booking!`, data: null });
        return;
    }
}