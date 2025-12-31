import { Response } from "express";
import { AuthRequest } from "../middlewares/authenticate";
import { Cinema } from "../models/Cinema";
import { Transaction, TransactionStatus } from "../models/Transaction";
import { Booking, BookingStatus } from "../models/Booking";
import { Showtime } from "../models/Showtime";
import transporter from "../config/emailConfig";

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

export const getCinemaTodayRevenue = async (req: AuthRequest, res: Response) => {

    try {
        const cinema = await Cinema.findOne({ userId: req.sub });

        if (!cinema) {
            res.status(404).json({ message: "Cinema not found!", data: null });
            return;
        }

        const { start, end } = getTodayRange();
        const transactionsToday = await Transaction.find({ cinemaId: cinema._id, date: { $gte: start, $lte: end } });

        let todayRevenue = 0;
        for (let i = 0; i < transactionsToday.length; i++) {
            const e = transactionsToday[i];
            todayRevenue += Number(e.amount);
        }

        const { start2, end2 } = getYesterdayRange();
        const transactionsYesterday = await Transaction.find({ cinemaId: cinema._id, date: { $gte: start2, $lte: end2 } });

        let yesterdayRevenue = 0;
        for (let i = 0; i < transactionsYesterday.length; i++) {
            const e = transactionsYesterday[i];
            yesterdayRevenue += Number(e.amount);
        }

        const change = getRevenueChange(todayRevenue, yesterdayRevenue);

        const data = {
            todayRevenue,
            yesterdayRevenue,
            change
        }

        return res.status(200).json({ message: "Load all today revenue successfully.", data: data });
    }
    catch (e) {
        res.status(500).json({ message: `Fail to load today revenue!`, data: null });
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

function getRevenueChange(today: number, yesterday: number): number {
    if (yesterday === 0) {
        return today === 0 ? 0 : 100;
    }

    return ((today - yesterday) / yesterday) * 100;
}



export const getCinemaWholeYearRevenue = async (req: AuthRequest, res: Response) => {

    try {
        const cinema = await Cinema.findOne({ userId: req.sub });

        if (!cinema) {
            res.status(404).json({ message: "Cinema not found!", data: null });
            return;
        }

        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

        const currentMonth = new Date().toLocaleString("en-US", { month: "short" });

        const selectedMonth = [];
        for (let i = 0; i < months.length; i++) {
            const e = months[i];
            if (e === currentMonth) {
                selectedMonth.push(e);
                break;
            }
            else {
                selectedMonth.push(e);
            }
        }

        let arr = [];
        for (let i = 0; i < selectedMonth.length; i++) {
            const e = selectedMonth[i];

            const { startDate, endDate } = getMonthStartEnd(e);
            const transactions = await Transaction.find({ cinemaId: cinema._id, date: { $gte: startDate, $lte: endDate } });

            let total = 0;
            for (let j = 0; j < transactions.length; j++) {
                const a: any = transactions[j];
                total += Number(a.amount);
            }
            arr.push(total);
        }

        const data = {
            months: selectedMonth,
            values: arr
        }

        return res.status(200).json({ message: "Load this year revenue.", data: data });
    }
    catch (e) {
        res.status(500).json({ message: `Fail to load this year revenue!`, data: null });
        return;
    }
}

function getMonthStartEnd(monthName: string) {
    const monthIndex = new Date(Date.parse(monthName + " 1, 2000")).getMonth();
    const year = new Date().getFullYear();

    const start = new Date(year, monthIndex, 1, 0, 0, 0, 0);
    const end = new Date(year, monthIndex + 1, 0, 23, 59, 59, 999);

    return {
        startDate: formatWithOffset(start),
        endDate: formatWithOffset(end)
    };
}

function formatWithOffset(date: Date) {
    const pad = (n: number) => n.toString().padStart(2, "0");

    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());

    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    const seconds = pad(date.getSeconds());
    const ms = date.getMilliseconds().toString().padStart(3, "0");

    const offsetMin = date.getTimezoneOffset();
    const sign = offsetMin <= 0 ? "+" : "-";

    const absMin = Math.abs(offsetMin);
    const offsetH = pad(Math.floor(absMin / 60));
    const offsetM = pad(absMin % 60);

    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${ms}${sign}${offsetH}:${offsetM}`;
}



export const getCinemaThisWeekRevenue = async (req: AuthRequest, res: Response) => {

    try {
        const cinema = await Cinema.findOne({ userId: req.sub });

        if (!cinema) {
            res.status(404).json({ message: "Cinema not found!", data: null });
            return;
        }

        const past7Days = getPast7DaysRangesSL();

        let arr = [];
        for (let i = 0; i < past7Days.length; i++) {
            const e: any = past7Days[i];

            const { startDate, endDate } = e;
            const transactions = await Transaction.find({ cinemaId: cinema._id, date: { $gte: startDate, $lte: endDate } });

            let total = 0;
            for (let j = 0; j < transactions.length; j++) {
                const a: any = transactions[j];
                total += Number(a.amount);
            }
            arr.push(total);
        }

        const data = {
            days: formatDateListToDayMonth(past7Days),
            values: arr
        }

        return res.status(200).json({ message: "Load this week revenue.", data: data });
    }
    catch (e) {
        res.status(500).json({ message: `Fail to load this week revenue!`, data: null });
        return;
    }
}

function getPast7DaysRangesSL() {
    const result = [];
    const now = new Date();

    for (let i = 0; i < 7; i++) {
        const slNow = new Date(
            now.toLocaleString("en-US", { timeZone: "Asia/Colombo" })
        );

        slNow.setDate(slNow.getDate() - i);

        const y = slNow.getFullYear();
        const m = slNow.getMonth();
        const d = slNow.getDate();

        const start = new Date(y, m, d, 0, 0, 0);
        const end = new Date(y, m, d, 23, 59, 59, 999);

        const startSL = start.toLocaleString("sv-SE", { timeZone: "Asia/Colombo", hour12: false })
            .replace(" ", "T") + "+05:30";

        const endSL = end.toLocaleString("sv-SE", { timeZone: "Asia/Colombo", hour12: false })
            .replace(" ", "T") + "+05:30";

        result.push({
            startDate: startSL,
            endDate: endSL
        });
    }

    return result;
}

function formatDateListToDayMonth(list: any) {
    const options: any = {
        day: "2-digit",
        month: "short",
        timeZone: "Asia/Colombo"
    };

    return list.map((item: any) => {
        const date = new Date(item.startDate);
        const formatted = date.toLocaleDateString("en-US", options);

        const [month, day] = formatted.split(" ");
        return `${day} ${month}`;
    });
}


export const getShowtimeDetailsByPaymentId = async (req: AuthRequest, res: Response) => {

    const transactionId = req.params.transactionId;

    try {
        const transaction = await Transaction.findOne({ _id: transactionId });

        if (!transaction) {
            res.status(404).json({ message: "Transaction not found!", data: null });
            return;
        }

        const booking = await Booking.findOne({ _id: transaction.bookingId });

        if (!booking) {
            res.status(404).json({ message: "Booking not found!", data: null });
            return;
        }

        const showtime = await Showtime.findOne({ _id: booking.showtimeId }).populate('movieId').populate('cinemaId').populate('screenId');

        if (!showtime) {
            res.status(404).json({ message: "Showtime not found!", data: null });
            return;
        }

        const data = {
            transaction,
            booking,
            showtime
        }

        return res.status(200).json({ message: "Load this week revenue.", data: data });
    }
    catch (e) {
        res.status(500).json({ message: `Fail to load this week revenue!`, data: null });
        return;
    }
}


export const deleteTransactionAndBookingIfErrorInBooking = async (req: AuthRequest, res: Response) => {

    const transactionId = req.params.transactionId;

    try {
        const transaction = await Transaction.findOne({ _id: transactionId });

        if (!transaction) {
            res.status(404).json({ message: "Transaction not found!", data: null });
            return;
        }

        const booking = await Booking.findOne({ _id: transaction.bookingId });

        if (!booking) {
            res.status(404).json({ message: "Booking not found!", data: null });
            return;
        }

        if (transaction.status !== TransactionStatus.COMPLETED) {
            const isTransactionDelete = await Transaction.updateOne({ _id: transaction._id }, { status: TransactionStatus.FAILED });
            const isBookingDelete = await Booking.updateOne({ _id: booking._id }, { status: BookingStatus.FAILED });

            if (isBookingDelete.modifiedCount > 0 && isTransactionDelete.modifiedCount > 0) {
                return res.status(200).json({ message: "Successfully change status of both transaction and booking for failed booking.", data: null });
            }
            else {
                return res.status(500).json({ message: "Fail to change status of both transaction and booking for failed booking.", data: null });
            }
        }

        return res.status(400).json({ message: "You can't change status of none pending transaction.", data: null });
    }
    catch (e) {
        res.status(500).json({ message: `Fail to chnage status of both transaction and booking for failed booking!`, data: null });
        return;
    }
}


export const confirmTransactionAndBookingIfBookingComplete = async (req: AuthRequest, res: Response) => {

    const transactionId = req.params.transactionId;

    try {
        const transaction = await Transaction.findOne({ _id: transactionId });

        if (!transaction) {
            res.status(404).json({ message: "Transaction not found!", data: null });
            return;
        }

        const booking = await Booking.findOne({ _id: transaction.bookingId }).populate('userId').populate('showtimeId');

        if (!booking) {
            res.status(404).json({ message: "Booking not found!", data: null });
            return;
        }

        const showtime = await Showtime.findOne({ _id: booking.showtimeId._id }).populate('movieId').populate('cinemaId').populate('screenId');

        if (transaction.status !== TransactionStatus.FAILED) {
            const isTransactionDelete = await Transaction.updateOne({ _id: transaction._id }, { status: TransactionStatus.COMPLETED });
            const isBookingDelete = await Booking.updateOne({ _id: booking._id }, { status: BookingStatus.SCHEDULED });

            if (isBookingDelete.modifiedCount > 0 && isTransactionDelete.modifiedCount > 0) {

                const userEmail = (booking.userId as any).email;

                const mailOptions = {
                    from: process.env.EMAIL_USER,
                    to: userEmail,
                    replyTo: userEmail,
                    subject: "Synema - Booking Confirmed!",
                    text: `Your booking for ${(showtime?.movieId as any).title} has been confirmed. Booking ID: ${booking._id}`,
                    html: `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Booking Confirmed</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0a0a0a;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0a; padding: 40px 20px;">
        <tr>
            <td align="center">
                <!-- Main Container -->
                <table width="650" cellpadding="0" cellspacing="0" style="background-color: #1a1a1a; border-radius: 8px; overflow: hidden;">
                    
                    <!-- Header -->
                    <tr>
                        <td style="background-color: #1a1a1a; padding: 32px 40px; border-bottom: 1px solid rgba(255, 255, 255, 0.08);">
                            <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 500; letter-spacing: 1px;">Synema</h1>
                        </td>
                    </tr>

                    <!-- Success Message -->
                    <tr>
                        <td style="padding: 40px 40px 30px 40px; text-align: center;">
                            <!-- Success Icon -->
                            <div style="width: 64px; height: 64px; margin: 0 auto 20px auto; background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); border-radius: 50%; display: inline-flex; align-items: center; justify-content: center;">
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" style="display: block;">
                                    <path d="M5 13l4 4L19 7" stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
                                </svg>
                            </div>
                            
                            <h2 style="margin: 0 0 12px 0; color: #ffffff; font-size: 26px; font-weight: 600;">Booking Confirmed!</h2>
                            <p style="margin: 0 0 8px 0; color: rgba(255, 255, 255, 0.75); font-size: 15px;">
                                Hi ${(booking?.userId as any).firstName}, your payment was successful.
                            </p>
                            <p style="margin: 0; color: rgba(255, 255, 255, 0.6); font-size: 14px;">
                                Your tickets are ready! See you at the cinema.
                            </p>
                        </td>
                    </tr>

                    <!-- Ticket -->
                    <tr>
                        <td style="padding: 0 30px 40px 30px;">
                            <!-- Ticket Container -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, rgba(139, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0.6) 100%); border-radius: 12px; overflow: hidden; border: 1px solid rgba(255, 255, 255, 0.1);">
                                <tr>
                                    <td style="padding: 40px 30px;">
                                        <table width="100%" cellpadding="0" cellspacing="0">
                                            <tr>
                                                <!-- Left Section -->
                                                <td style="width: 65%; padding-right: 30px; border-right: 2px dashed rgba(255, 255, 255, 0.15); vertical-align: top;">
                                                    <!-- Movie Title -->
                                                    <h1 style="margin: 0 0 8px 0; color: #ffffff; font-size: 28px; font-weight: 800; line-height: 1.1; font-family: 'Courier New', monospace;">
                                                        ${(showtime?.movieId as any).title}
                                                    </h1>
                                                    <div style="margin-bottom: 24px;">
                                                        <table cellpadding="0" cellspacing="0" style="margin: 0;">
                                                            <tr>
                                                                <td style="height: 2px; width: 50px; background: linear-gradient(to right, #ffffff, transparent);"></td>
                                                                <td style="padding-left: 12px;">
                                                                    <span style="font-size: 9px; font-weight: 700; letter-spacing: 0.2em; color: rgba(255, 255, 255, 0.5);">CONFIRMED</span>
                                                                </td>
                                                            </tr>
                                                        </table>
                                                    </div>

                                                    <!-- Venue -->
                                                    <div style="margin-bottom: 28px;">
                                                        <p style="margin: 0 0 4px 0; font-size: 11px; font-weight: 700; letter-spacing: 0.05em; color: rgba(255, 255, 255, 0.5); text-transform: uppercase;">Venue</p>
                                                        <p style="margin: 0 0 4px 0; color: #ffffff; font-size: 17px; font-weight: 700; line-height: 1.2; font-family: 'Courier New', monospace;">${(showtime?.cinemaId as any).cinemaName}</p>
                                                        <p style="margin: 0 0 2px 0; color: rgba(255, 255, 255, 0.8); font-size: 12px; line-height: 1.3;">${(showtime?.cinemaId as any).address}</p>
                                                        <p style="margin: 0; color: rgba(255, 255, 255, 0.7); font-size: 11px;">${(showtime?.screenId as any).screenName}</p>
                                                    </div>

                                                    <!-- Details Grid -->
                                                    <table width="100%" cellpadding="0" cellspacing="0">
                                                        <tr>
                                                            <td style="width: 33%; vertical-align: top; padding-right: 15px;">
                                                                <p style="margin: 0 0 4px 0; font-size: 9px; font-weight: 700; letter-spacing: 0.05em; color: rgba(255, 255, 255, 0.5); text-transform: uppercase;">Date & Time</p>
                                                                <p style="margin: 0 0 2px 0; color: #ffffff; font-size: 14px; font-weight: 700;">${formatShowDate(showtime?.date)}</p>
                                                                <p style="margin: 0; color: rgba(255, 255, 255, 0.9); font-size: 13px; font-weight: 500;">${formatToTime12h(showtime?.time)}</p>
                                                            </td>
                                                            <td style="width: 33%; vertical-align: top; padding-right: 15px;">
                                                                <p style="margin: 0 0 4px 0; font-size: 9px; font-weight: 700; letter-spacing: 0.05em; color: rgba(255, 255, 255, 0.5); text-transform: uppercase;">Seats</p>
                                                                <div>
                                                                    ${booking.seatsDetails.map((seat: string) =>
                        `<span style="display: inline-block; background: rgba(255, 255, 255, 0.15); padding: 2px 8px; border-radius: 3px; margin: 0 4px 4px 0; font-size: 13px; font-weight: 700; color: #ffffff;">${seat}</span>`
                    ).join('')}
                                                                </div>
                                                            </td>
                                                            <td style="width: 33%; vertical-align: top;">
                                                                <p style="margin: 0 0 4px 0; font-size: 9px; font-weight: 700; letter-spacing: 0.05em; color: rgba(255, 255, 255, 0.5); text-transform: uppercase;">Tickets</p>
                                                                ${Object.entries(booking.ticketsDetails).map(([key, value]) =>
                        `<p style="margin: 0 0 2px 0; color: rgba(255, 255, 255, 0.9); font-size: 12px;">${key} × ${value}</p>`
                    ).join('')}
                                                            </td>
                                                        </tr>
                                                    </table>

                                                    <!-- Booking ID -->
                                                    <p style="margin: 24px 0 0 0; font-size: 8px; font-family: 'Courier New', monospace; color: rgba(255, 255, 255, 0.4); letter-spacing: 0.1em;">ID: ${booking._id}</p>
                                                </td>

                                                <!-- Right Section -->
                                                <td style="width: 35%; padding-left: 25px; text-align: center; vertical-align: top;">
                                                    <!-- Payment Status -->
                                                    <div style="margin-bottom: 30px;">
                                                        <div style="width: 42px; height: 42px; margin: 0 auto 10px auto;">
                                                            <svg viewBox="0 0 100 100" style="width: 100%; height: 100%; filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.3));">
                                                                <circle cx="50" cy="50" r="48" fill="rgba(34, 197, 94, 0.1)" />
                                                                <circle cx="50" cy="50" r="42" stroke="#22c55e" stroke-width="4" fill="none" />
                                                                <path d="M32 50 L44 62 L68 38" fill="none" stroke="#22c55e" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" />
                                                            </svg>
                                                        </div>
                                                        <p style="margin: 0; font-size: 10px; font-weight: 900; letter-spacing: 0.25em; color: #22c55e;">PAID</p>
                                                    </div>

                                                    <!-- Amount -->
                                                    <div style="margin-bottom: 30px;">
                                                        <p style="margin: 0 0 2px 0; color: #ffffff; font-size: 26px; font-weight: 900; line-height: 1;">${transaction.amount}</p>
                                                        <p style="margin: 0; font-size: 10px; font-weight: 700; color: rgba(255, 255, 255, 0.6); letter-spacing: 0.1em;">LKR</p>
                                                    </div>

                                                    <!-- Booked On -->
                                                    <div>
                                                        <p style="margin: 0 0 4px 0; font-size: 8px; font-weight: 700; letter-spacing: 0.1em; color: rgba(255, 255, 255, 0.4); text-transform: uppercase;">Booked On</p>
                                                        <p style="margin: 0 0 2px 0; color: rgba(255, 255, 255, 0.9); font-size: 11px; font-weight: 700;">${formatShowDate(booking?.date)}</p>
                                                        <p style="margin: 0; color: rgba(255, 255, 255, 0.7); font-size: 10px;">${formatToTime12h(booking?.date)}</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Important Info -->
                    <tr>
                        <td style="padding: 0 40px 40px 40px;">
                            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: rgba(255, 70, 70, 0.08); border: 1px solid rgba(255, 70, 70, 0.2); border-radius: 6px; padding: 20px;">
                                <tr>
                                    <td>
                                        <p style="margin: 0 0 10px 0; color: #ffffff; font-size: 14px; font-weight: 600;">Important Information</p>
                                        <ul style="margin: 0; padding-left: 20px; color: rgba(255, 255, 255, 0.7); font-size: 13px; line-height: 1.6;">
                                            <li style="margin-bottom: 6px;">Please arrive at least 15 minutes before showtime</li>
                                            <li style="margin-bottom: 6px;">Save this email or take a screenshot of your ticket</li>
                                            <li style="margin-bottom: 6px;">Present your booking ID at the cinema entrance</li>
                                            <li>No refunds available after booking confirmation</li>
                                        </ul>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Divider -->
                    <tr>
                        <td style="padding: 0 40px;">
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td style="border-bottom: 1px solid rgba(255, 255, 255, 0.08);"></td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Contact -->
                    <tr>
                        <td style="padding: 24px 40px;">
                            <p style="margin: 0; color: rgba(255, 255, 255, 0.5); font-size: 13px; text-align: center;">
                                Questions? Contact us at <a href="mailto:${process.env.EMAIL_USER}" style="color: #FF4646; text-decoration: none;">${process.env.EMAIL_USER}</a>
                            </p>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #0a0a0a; padding: 24px 40px; text-align: center; border-top: 1px solid rgba(255, 255, 255, 0.08);">
                            <p style="margin: 0 0 6px 0; color: rgba(255, 255, 255, 0.4); font-size: 12px;">
                                © ${new Date().getFullYear()} Synema. All rights reserved.
                            </p>
                            <p style="margin: 0; color: rgba(255, 255, 255, 0.35); font-size: 11px;">
                                Enjoy your movie experience!
                            </p>
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>
</body>
</html>
        `,
                };

                transporter.sendMail(mailOptions);

                return res.status(200).json({ message: "Successfully change status of both transaction and booking for success booking.", data: null });
            }
            else {
                return res.status(500).json({ message: "Fail to change status of both transaction and booking for success booking.", data: null });
            }
        }

        return res.status(400).json({ message: "You can't change status of failed transaction.", data: null });
    }
    catch (e) {
        res.status(500).json({ message: `Fail to chnage status of both transaction and booking for success booking!`, data: null });
        return;
    }
}

function formatShowDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("en-GB", {
        weekday: "short",
        day: "2-digit",
        month: "short",
        year: "numeric"
    }).replace(",", "");
}

function formatToTime12h(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
    });
}