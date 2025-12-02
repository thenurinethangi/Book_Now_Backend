import { Response } from "express";
import { AuthRequest } from "../middlewares/authenticate";
import cloudinary from "../config/cloudinaryConfig";
import { Cinema } from "../models/Cinema";
import { Screen, ScreenStatus } from "../models/Screen";

export const addNewScreen = async (req: AuthRequest, res: Response) => {

    let { screenName, description, numberOfSeats, screenTypes, seatTypes, seatLayout } = req.body;

    try {
        seatLayout = JSON.parse(seatLayout);
    } 
    catch (err) {
        res.status(400).json({message: "Invalid seat layout format!",data: null});
        return;
    }

    console.log(screenName)
    console.log(description);
    console.log(numberOfSeats)
    console.log(screenTypes)
    console.log(seatTypes)
    console.log(seatLayout)

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

        console.log(cinema);

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