import { Response } from "express";
import { AuthRequest } from "../middlewares/authenticate";
import { Cinema } from "../models/Cinema";
import { Booking } from "../models/Booking";
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

        console.log(bookings);
        return res.status(200).json({ message: "Load all bookings successfully.", data: bookings });

    }
    catch (e) {
        res.status(500).json({ message: `Fail to load booking!`, data: null });
        return;
    }
}