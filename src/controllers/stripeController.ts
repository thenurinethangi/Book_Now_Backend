import { Response } from "express";
import { AuthRequest } from "../middlewares/authenticate";
import Stripe from 'stripe';
import dotenv from 'dotenv'
import { getLkrToUsdRate } from "../utils/exchangeRateUtil";
import { User } from "../models/User";
import { Showtime } from "../models/Showtime";
import { Booking, BookingStatus } from "../models/Booking";
import { Transaction, TransactionStatus } from "../models/Transaction";
dotenv.config();

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY as string;
const stripe = new Stripe(STRIPE_SECRET_KEY);

export const stripeCheckout = async (req: AuthRequest, res: Response) => {

    const { choosedTicketTypesCount, showtimeDeatils, selectedSeats, totalPayable } = req.body;

    if (!choosedTicketTypesCount || !showtimeDeatils || !selectedSeats || !totalPayable) {
        res.status(400).json({ message: "Incomplete data provided!", data: null });
        return;
    }

    try {
        const user = await User.findOne({ _id: req.sub });

        if (!user) {
            res.status(404).json({ message: "User not found!", data: null });
            return;
        }

        const ticketsDetails: any = {};
        Object.entries(choosedTicketTypesCount).forEach(([type, count]: any) => {
            if (count > 0) {
                ticketsDetails[type] = count;
            }
        });

        const newBooking = new Booking({
            date: new Date(),
            tickets: selectedSeats.length.toString(),
            ticketsDetails,
            seatsDetails: selectedSeats,
            showtimeId: showtimeDeatils._id,
            userId: user._id,
            total: totalPayable.toFixed(2).toString(),
            status: BookingStatus.SCHEDULED
        });

        const savedBooking = await newBooking.save();

        const transaction = new Transaction({
            date: new Date(),
            amount: totalPayable.toFixed(2).toString(),
            userId: user._id,
            bookingId: savedBooking._id,
            cinemaId: showtimeDeatils.cinemaId._id,
            status: TransactionStatus.PENDING
        });

        const savedTransaction = await transaction.save();

        const rate = await getLkrToUsdRate();

        const ticketData: any = [];
        Object.entries(choosedTicketTypesCount).forEach(([type, count]: any) => {
            if (count > 0) {
                ticketData.push({
                    name: type,
                    price: Math.round((Number(showtimeDeatils.ticketPrices[type]) * rate) * 100),
                    quantity: count,
                });
            }
        });

        const line_items = ticketData.map((item: any) => {
            return {
                price_data: {
                    currency: "usd",
                    product_data: {
                        name: item.name,
                    },
                    unit_amount: item.price
                },
                quantity: item.quantity
            }
        })

        const session = await stripe.checkout.sessions.create({
            line_items,
            mode: 'payment', 
            success_url: 'http://localhost:5173/success/' + savedTransaction._id,
            cancel_url: 'http://localhost:5173/error/' + savedTransaction._id,
            metadata: {
                orderId: '1',
                userId: '1'
            }
        });

        const url = session.url;

        return res.status(200).json({ message: 'success', data: { success: true, url } });
    }
    catch (e) {
        console.log(e);
        return res.status(500).json({ message: 'fail', data: null });
    }
}