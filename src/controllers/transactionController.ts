import { Response } from "express";
import { AuthRequest } from "../middlewares/authenticate";
import { Cinema } from "../models/Cinema";
import { Transaction } from "../models/Transaction";

export const getCinemaAllTransaction = async (req: AuthRequest, res: Response) => {

    try {
        const cinema = await Cinema.findOne({ userId: req.sub });

        if (!cinema) {
            res.status(404).json({ message: "Cinema not found!", data: null });
            return;
        }

        const transactions = await Transaction.find({ cinemaId: cinema._id })
        .populate("userId")
        .sort({ createdAt: -1 });

        return res.status(200).json({ message: "Load all transactions successfully.", data: transactions });
    }
    catch (e) {
        res.status(500).json({ message: `Fail to load transactions!`, data: null });
        return;
    }
}