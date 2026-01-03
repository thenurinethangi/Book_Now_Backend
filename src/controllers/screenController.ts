import { Response } from "express";
import { AuthRequest } from "../middlewares/authenticate";
import cloudinary from "../config/cloudinaryConfig";
import { Cinema } from "../models/Cinema";
import { Screen, ScreenStatus } from "../models/Screen";
import { Showtime } from "../models/Showtime";
import { Booking } from "../models/Booking";

export const addNewScreen = async (req: AuthRequest, res: Response) => {

    let { screenName, description, numberOfSeats, screenTypes, seatTypes, seatLayout } = req.body;

    try {
        seatLayout = JSON.parse(seatLayout);
    }
    catch (err) {
        res.status(400).json({ message: "Invalid seat layout format!", data: null });
        return;
    }

    if (!screenName || !description || !numberOfSeats || !screenTypes?.length || !seatTypes?.length || !seatLayout?.length) {
        res.status(400).json({ message: "All fields required!", data: null });
        return;
    }

    let screenImageUrl = ""

    if (req.file) {
        const result: any = await new Promise((resole, reject) => {
            const upload_stream = cloudinary.uploader.upload_stream(
                { folder: "screen" },
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
        screenImageUrl = result.secure_url
    }

    try {
        const cinema = await Cinema.findOne({ userId: req.sub });

        if (!cinema) {
            res.status(500).json({ message: "Something went wrong, try later!", data: null });
            return;
        }

        const newScreen = new Screen({
            screenName,
            description,
            numberOfSeats,
            screenTypes,
            seatTypes,
            seatLayout,
            screenImageUrl,
            cinemaId: cinema._id,
            status: ScreenStatus.ACTIVE
        });

        const savedScreen = await newScreen.save();

        res.status(200).json({ message: "Add a new screen successfully!", data: savedScreen });
        return;
    }
    catch (e) {
        res.status(500).json({ message: "Fail to add a new screen, try later!", data: null });
        return;
    }
}


export const getAllScreens = async (req: AuthRequest, res: Response) => {

    try {
        const cinema = await Cinema.findOne({ userId: req.sub });

        if (!cinema) {
            res.status(500).json({ message: "Something went wrong, try later!", data: null });
            return;
        }

        const screens = await Screen.find({ cinemaId: cinema._id });

        res.status(200).json({ message: "Successfully load all screens!", data: screens });
        return;
    }
    catch (e) {
        res.status(500).json({ message: "Fail to load screens, try later!", data: null });
        return;
    }

}


export const deleteAScreen = async (req: AuthRequest, res: Response) => {

    const id = req.params.id;

    if (!id) {
        res.status(400).json({ message: "Screen ID is required for deletion!", data: null });
        return;
    }

    try {
        const screen = await Screen.findOne({ _id: id });

        if (!screen) {
            res.status(404).json({ message: "Screen not found!", data: null });
            return;
        }

        const result = await Screen.deleteOne({ _id: screen._id });

        if (result) {
            res.status(200).json({ message: "Successfully load all screens!", data: null });
            return;
        }
        res.status(500).json({ message: `Fail to delete the screen id: ${id}!`, data: null });
        return;
    }
    catch (e) {
        res.status(500).json({ message: `Fail to delete the screen id: ${id}!`, data: null });
        return;
    }

}


export const updateScreenStatus = async (req: AuthRequest, res: Response) => {

    const { id, status } = req.body;

    if (!id || !status) {
        res.status(400).json({ message: "Data not provided!", data: null });
        return;
    }

    try {
        const screen = await Screen.findOne({ _id: id });

        if (!screen) {
            res.status(404).json({ message: "Screen not found!", data: null });
            return;
        }

        let result = false;
        if (status === 'ACTIVE') {
            const r1 = await Screen.updateOne({ _id: screen._id }, { status: ScreenStatus.ACTIVE });
            result = r1.modifiedCount === 1;
        }
        else if (status === 'UNAVAILABLE') {
            const r2 = await Screen.updateOne({ _id: screen._id }, { status: ScreenStatus.UNAVAILABLE });
            result = r2.modifiedCount === 1;
        }

        if (result) {
            res.status(200).json({ message: "Successfully updated the screen status!", data: null });
            return;
        }
        res.status(500).json({ message: `Fail to update the screen status!`, data: null });
        return;
    }
    catch (e) {
        res.status(500).json({ message: `Fail to update the screen status!`, data: null });
        return;
    }

}


export const getCinemaAllAvaiableScreens = async (req: AuthRequest, res: Response) => {

    try {
        const cinema = await Cinema.findOne({ userId: req.sub });

        if (!cinema) {
            res.status(500).json({ message: "Something went wrong, try later!", data: null });
            return;
        }

        const screens = await Screen.find({ cinemaId: cinema._id, status: ScreenStatus.ACTIVE });

        res.status(200).json({ message: "Successfully load all available screens!", data: screens });
        return;
    }
    catch (e) {
        res.status(500).json({ message: "Fail to load screens, try later!", data: null });
        return;
    }

}


export const getCinemaScreensStats = async (req: AuthRequest, res: Response) => {

    try {
        const cinema = await Cinema.findOne({ userId: req.sub });

        if (!cinema) {
            res.status(500).json({ message: "Something went wrong, try later!", data: null });
            return;
        }

        const allScreens = await Screen.find({ cinemaId: cinema._id });
        const activeScreens = await Screen.find({ cinemaId: cinema._id, status: ScreenStatus.ACTIVE });

        const change = getActiveScreenPercentage(allScreens.length, activeScreens.length);

        const data = {
            allScreens: allScreens.length,
            activeScreens: activeScreens.length,
            change
        }

        res.status(200).json({ message: "Successfully load screens stats!", data: data });
        return;
    }
    catch (e) {
        res.status(500).json({ message: "Fail to load screens stats!", data: null });
        return;
    }

}

function getActiveScreenPercentage(active: number, total: number): number {
    if (total === 0) return 0;
    return (active / total) * 100;
}


export const getAllActiveScreensForAdmin = async (req: AuthRequest, res: Response) => {

    try {
        const screens = await Screen.find({ status: { $ne: ScreenStatus.DEACTIVE } })
            .populate('cinemaId');


        res.status(200).json({ message: `Successfully load all active screens!`, data: screens });
        return;

    }
    catch (e) {
        res.status(500).json({ message: `Fail to load all active screens!`, data: null });
        return;
    }
}


export const getAllDeactiveScreensForAdmin = async (req: AuthRequest, res: Response) => {

    try {
        const screens = await Screen.find({ status: { $eq: ScreenStatus.DEACTIVE } })
            .populate('cinemaId');


        res.status(200).json({ message: `Successfully load all deactive screens!`, data: screens });
        return;

    }
    catch (e) {
        res.status(500).json({ message: `Fail to load all deactive screens!`, data: null });
        return;
    }
}


export const deactivateAScreenForAdmin = async (req: AuthRequest, res: Response) => {

    const id = req.params.id;

    try {
        const result = await Screen.updateOne({ _id: id }, { $set: { status: ScreenStatus.DEACTIVE } });

        if (result.modifiedCount === 1) {
            res.status(200).json({ message: `Successfully deactivated a screen!`, data: null });
            return;
        }
        else {
            res.status(401).json({ message: `Fail to deactivate a screen!`, data: null });
            return;
        }
    }
    catch (e) {
        res.status(500).json({ message: `Fail to deactivate a screen!`, data: null });
        return;
    }
}


export const activateAScreenForAdmin = async (req: AuthRequest, res: Response) => {

    const id = req.params.id;

    try {
        const result = await Screen.updateOne({ _id: id }, { $set: { status: ScreenStatus.ACTIVE } });

        if (result.modifiedCount === 1) {
            res.status(200).json({ message: `Successfully activated a screen!`, data: null });
            return;
        }
        else {
            res.status(401).json({ message: `Fail to activate a screen!`, data: null });
            return;
        }
    }
    catch (e) {
        res.status(500).json({ message: `Fail to activate a screen!`, data: null });
        return;
    }
}


export const getScreenOccupancy = async (req: AuthRequest, res: Response) => {

    try {
        const cinema = await Cinema.findOne({ userId: req.sub });

        if (!cinema) {
            return res.status(404).json({ message: "Cinema not found!", data: null });
        }

        const screens = await Screen.find({
            cinemaId: cinema._id,
            status: ScreenStatus.ACTIVE
        });

        const { start, end } = getTodayRange();

        const result: any[] = [];

        for (const screen of screens) {

            const showtimes = await Showtime.find({
                screenId: screen._id,
                date: { $gte: start, $lte: end }
            }).select("_id");

            if (showtimes.length === 0) {
                result.push({
                    screenName: screen.screenName,
                    occupancy: 0
                });
                continue;
            }

            const showtimeIds = showtimes.map(s => s._id);

            const bookings = await Booking.find({
                showtimeId: { $in: showtimeIds }
            });

            let bookedSeats = 0;

            for (const booking of bookings) {
                if (booking.seatsDetails) {
                    bookedSeats += booking.seatsDetails.length;
                }
            }

            let totalSeats = Number(screen.numberOfSeats);

            const occupancy =
                totalSeats === 0
                    ? 0
                    : Math.round((bookedSeats / totalSeats) * 100);

            result.push({
                screenName: screen.screenName,
                occupancy
            });
        }

        return res.status(200).json({
            message: "Screen occupancy fetched successfully",
            data: result
        });

    } catch (e) {
        console.error(e);
        return res.status(500).json({
            message: "Fail get screen occupancy!",
            data: null
        });
    }
};

function getTodayRange() {
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const end = new Date();
    end.setHours(23, 59, 59, 999);

    return { start, end };
}


export const getTodayBookingsOfScreens = async (req: AuthRequest, res: Response) => {

    try {
        const cinema = await Cinema.findOne({ userId: req.sub });

        if (!cinema) {
            return res.status(404).json({ message: "Cinema not found!", data: null });
        }

        const screens = await Screen.find({
            cinemaId: cinema._id,
            status: ScreenStatus.ACTIVE
        });

        const { start, end } = getTodayRange();

        const result: any[] = [];

        for (const screen of screens) {

            const showtimes = await Showtime.find({
                screenId: screen._id,
                date: { $gte: start, $lte: end }
            }).select("_id");

            if (showtimes.length === 0) {
                result.push({
                    screenName: screen.screenName,
                    bookings: 0
                });
                continue;
            }

            const showtimeIds = showtimes.map(s => s._id);

            const bookings = await Booking.find({
                showtimeId: { $in: showtimeIds }
            });

            let bookedSeats = 0;

            for (const booking of bookings) {
                if (booking.seatsDetails) {
                    bookedSeats += booking.seatsDetails.length;
                }
            }

            result.push({
                screenName: screen.screenName,
                bookings: bookedSeats
            });
        }

        return res.status(200).json({
            message: "Screen occupancy fetched successfully",
            data: result
        });

    } catch (e) {
        console.error(e);
        return res.status(500).json({
            message: "Fail get screen occupancy!",
            data: null
        });
    }
};


export const checkScreensHasShowtimes = async (req: AuthRequest, res: Response) => {

    try {
        const cinema = await Cinema.findOne({ userId: req.sub });

        if (!cinema) {
            return res.status(404).json({ message: "Cinema not found!", data: null });
        }

        const screens = await Screen.find({
            cinemaId: cinema._id,
            status: ScreenStatus.ACTIVE
        });

        const { start, end } = getTodayRange();

        const result: any[] = [];

        for (const screen of screens) {

            const showtimes = await Showtime.find({
                screenId: screen._id,
                date: { $gte: start }
            }).select("_id");

            result.push({
                screenName: screen.screenName,
                showtimes: showtimes.length
            });
        }

        return res.status(200).json({
            message: "Screen occupancy fetched successfully",
            data: result
        });

    } catch (e) {
        console.error(e);
        return res.status(500).json({
            message: "Fail get screen occupancy!",
            data: null
        });
    }
};