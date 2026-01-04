import { Response } from "express";
import { AuthRequest } from "../middlewares/authenticate";
import { Cinema } from "../models/Cinema";
import { Transaction, TransactionStatus } from "../models/Transaction";
import { Booking, BookingStatus } from "../models/Booking";
import { Showtime } from "../models/Showtime";
import transporter from "../config/emailConfig";

export const getCinemaAllTransaction = async (req: AuthRequest, res: Response) => {

    const { searchKey, daysRange, no } = req.body;
    console.log(req.body)

    if (!daysRange || !no) {
        res.status(400).json({ message: "Incomplete data provided!", data: null });
        return;
    }

    try {
        const cinema = await Cinema.findOne({ userId: req.sub });

        if (!cinema) {
            res.status(404).json({ message: "Cinema not found!", data: null });
            return;
        }

        const transactions = await Transaction.find({ cinemaId: cinema._id })
            .populate("userId")
            .sort({ createdAt: -1 });


        let filterAfterSearchWord: any[] = [];
        if (searchKey.trim() === '') {
            filterAfterSearchWord = [...transactions];
        } else {
            const key = searchKey.toLowerCase();

            filterAfterSearchWord = transactions.filter((t: any) =>
                String(t._id).toLowerCase().includes(key) ||
                String(t.bookingId).toLowerCase().includes(key) ||
                String(t.cinemaId).toLowerCase().includes(key) ||
                String(t.userId?._id).toLowerCase().includes(key) ||
                t.userId?.email?.toLowerCase().includes(key) ||
                t.userId?.firstName?.toLowerCase().includes(key) ||
                t.status?.toLowerCase().includes(key) ||
                String(t.amount).includes(key)
            );
        }

        let filterAfterDaysRange: any[] = [];
        if (daysRange === 'all') {
            filterAfterDaysRange = [...filterAfterSearchWord];
        } else {
            const rangeDays = Number(daysRange);

            const nowColombo = new Date(
                new Date().toLocaleString('en-US', { timeZone: 'Asia/Colombo' })
            );

            const startDate = new Date(
                nowColombo.getFullYear(),
                nowColombo.getMonth(),
                nowColombo.getDate() - (rangeDays - 1)
            );

            filterAfterDaysRange = filterAfterSearchWord.filter((t: any) => {
                const txDateColombo = new Date(
                    new Date(t.date).toLocaleString('en-US', { timeZone: 'Asia/Colombo' })
                );

                return txDateColombo >= startDate && txDateColombo <= nowColombo;
            });
        }

        const startIndex = no === 1 ? 0 : (no - 1) * 10;
        const filterAfterTablePageNo = filterAfterDaysRange.slice(
            startIndex,
            startIndex + 10
        );

        return res.status(200).json({ message: "Load all transactions successfully.", data: { filterAfterTablePageNo, size: filterAfterDaysRange.length } });
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

        let change = getRevenueChange(todayRevenue, yesterdayRevenue);

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

    return +(((today - yesterday) / yesterday) * 100).toFixed(2);
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
                    replyTo: process.env.EMAIL_USER,
                    subject: "Synema - Booking Confirmed",
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
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #1a1a1a; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);">
                    
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #FF4646 0%, #8B0000 100%); padding: 40px 40px 35px 40px; text-align: center;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 600; letter-spacing: 2px;">SYNEMA</h1>
                            <p style="margin: 8px 0 0 0; color: rgba(255, 255, 255, 0.9); font-size: 14px; letter-spacing: 0.5px;">YOUR CINEMA EXPERIENCE</p>
                        </td>
                    </tr>

                    <!-- Content -->
                    <tr>
                        <td style="padding: 50px 40px 40px 40px;">
                            <h2 style="margin: 0 0 20px 0; color: #ffffff; font-size: 24px; font-weight: 500; text-align: center;">Booking Confirmed!</h2>
                            <p style="margin: 0 0 10px 0; color: rgba(255, 255, 255, 0.8); font-size: 15px; line-height: 1.6; text-align: center;">
                                Hi ${(booking?.userId as any).firstName}, your payment was successful.
                            </p>
                            <p style="margin: 0 0 40px 0; color: rgba(255, 255, 255, 0.7); font-size: 14px; line-height: 1.6; text-align: center;">
                                Your tickets are ready! See you at the cinema.
                            </p>

                            <!-- Ticket -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="margin: 0 0 30px 0;">
                                <tr>
                                    <td align="center">
                                        <!-- Ticket Container - Golden/Tan color like screenshot -->
                                        <table cellpadding="0" cellspacing="0" style="width: 540px; background: linear-gradient(135deg, #D4A574 0%, #C9954D 100%); border-radius: 12px; position: relative; box-shadow: 0 8px 16px rgba(0, 0, 0, 0.4);">
                                            <tr>
                                                <td style="padding: 35px 40px;">
                                                    <table width="100%" cellpadding="0" cellspacing="0">
                                                        <tr>
                                                            <!-- Left Section -->
                                                            <td style="width: 65%; padding-right: 25px; border-right: 3px dashed rgba(0, 0, 0, 0.2); vertical-align: top;">
                                                                <!-- Movie Title -->
                                                                <h1 style="margin: 0 0 4px 0; color: #1a1a1a; font-size: 32px; font-weight: 800; line-height: 1.1; font-family: 'Courier New', monospace; text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
                                                                    ${(showtime?.movieId as any).title}
                                                                </h1>
                                                                <p style="margin: 0 0 20px 0; font-size: 9px; font-weight: 600; letter-spacing: 0.15em; color: rgba(0, 0, 0, 0.4); text-transform: uppercase;">CONFIRMED</p>

                                                                <!-- Venue -->
                                                                <div style="margin-bottom: 22px;">
                                                                    <p style="margin: 0 0 3px 0; font-size: 10px; font-weight: 700; letter-spacing: 0.05em; color: rgba(0, 0, 0, 0.5); text-transform: uppercase;">Venue</p>
                                                                    <p style="margin: 0 0 3px 0; color: #1a1a1a; font-size: 16px; font-weight: 700; line-height: 1.2; font-family: 'Courier New', monospace;">${(showtime?.cinemaId as any).cinemaName}</p>
                                                                    <p style="margin: 0 0 2px 0; color: rgba(0, 0, 0, 0.7); font-size: 11px; line-height: 1.3;">${(showtime?.cinemaId as any).address}</p>
                                                                    <p style="margin: 0; color: rgba(0, 0, 0, 0.6); font-size: 10px;">${(showtime?.screenId as any).screenName}</p>
                                                                </div>

                                                                <!-- Details Grid -->
                                                                <table width="100%" cellpadding="0" cellspacing="0">
                                                                    <tr>
                                                                        <td style="width: 40%; vertical-align: top; padding-right: 10px;">
                                                                            <p style="margin: 0 0 3px 0; font-size: 9px; font-weight: 700; letter-spacing: 0.05em; color: rgba(0, 0, 0, 0.5); text-transform: uppercase;">Date & Time</p>
                                                                            <p style="margin: 0 0 2px 0; color: #1a1a1a; font-size: 13px; font-weight: 700;">${formatShowDate(showtime?.date)}</p>
                                                                            <p style="margin: 0; color: rgba(0, 0, 0, 0.8); font-size: 12px; font-weight: 600;">${formatToTime12h(showtime?.time)}</p>
                                                                        </td>
                                                                        <td style="width: 30%; vertical-align: top; padding-right: 10px;">
                                                                            <p style="margin: 0 0 3px 0; font-size: 9px; font-weight: 700; letter-spacing: 0.05em; color: rgba(0, 0, 0, 0.5); text-transform: uppercase;">Seats</p>
                                                                            <div>
                                                                                ${booking.seatsDetails.map((seat: string) =>
                        `<span style="display: inline-block; background: rgba(0, 0, 0, 0.12); padding: 2px 7px; border-radius: 3px; margin: 0 3px 3px 0; font-size: 12px; font-weight: 700; color: #1a1a1a;">${seat}</span>`
                    ).join('')}
                                                                            </div>
                                                                        </td>
                                                                        <td style="width: 30%; vertical-align: top;">
                                                                            <p style="margin: 0 0 3px 0; font-size: 9px; font-weight: 700; letter-spacing: 0.05em; color: rgba(0, 0, 0, 0.5); text-transform: uppercase;">Tickets</p>
                                                                            ${Object.entries(booking.ticketsDetails).map(([key, value]) =>
                        `<p style="margin: 0 0 2px 0; color: rgba(0, 0, 0, 0.8); font-size: 11px;">${key} × ${value}</p>`
                    ).join('')}
                                                                        </td>
                                                                    </tr>
                                                                </table>

                                                                <!-- Booking ID -->
                                                                <p style="margin: 20px 0 0 0; font-size: 8px; font-family: 'Courier New', monospace; color: rgba(0, 0, 0, 0.4); letter-spacing: 0.05em;">ID: BK-${booking._id.toString().slice(-10)}</p>
                                                            </td>

                                                            <!-- Right Section -->
                                                            <td style="width: 35%; padding-left: 20px; text-align: center; vertical-align: top;">
                                                                <!-- Payment Status -->
                                                                <div style="margin-bottom: 25px;">
                                                                    <div style="width: 38px; height: 38px; margin: 0 auto 8px auto;">
                                                                        <svg viewBox="0 0 100 100" style="width: 100%; height: 100%;">
                                                                            <circle cx="50" cy="50" r="48" fill="rgba(34, 197, 94, 0.15)" />
                                                                            <circle cx="50" cy="50" r="40" stroke="#22c55e" stroke-width="5" fill="none" />
                                                                            <path d="M32 50 L44 62 L68 38" fill="none" stroke="#22c55e" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" />
                                                                        </svg>
                                                                    </div>
                                                                    <p style="margin: 0; font-size: 9px; font-weight: 900; letter-spacing: 0.2em; color: #22c55e;">PAID</p>
                                                                </div>

                                                                <!-- Amount -->
                                                                <div style="margin-bottom: 25px;">
                                                                    <p style="margin: 0 0 2px 0; color: #1a1a1a; font-size: 28px; font-weight: 900; line-height: 1;">${transaction.amount}</p>
                                                                    <p style="margin: 0; font-size: 10px; font-weight: 700; color: rgba(0, 0, 0, 0.5); letter-spacing: 0.1em;">LKR</p>
                                                                </div>

                                                                <!-- Booked On -->
                                                                <div>
                                                                    <p style="margin: 0 0 3px 0; font-size: 8px; font-weight: 700; letter-spacing: 0.1em; color: rgba(0, 0, 0, 0.4); text-transform: uppercase;">Booked On</p>
                                                                    <p style="margin: 0 0 2px 0; color: rgba(0, 0, 0, 0.8); font-size: 11px; font-weight: 700;">${formatShowDate(booking?.date)}</p>
                                                                    <p style="margin: 0; color: rgba(0, 0, 0, 0.6); font-size: 10px;">${formatToTime12h(booking?.date)}</p>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    </table>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>

                            <p style="margin: 0 0 10px 0; color: rgba(255, 255, 255, 0.7); font-size: 14px; line-height: 1.6;">
                                <strong style="color: rgba(255, 255, 255, 0.9);">Important:</strong> Please arrive at least 15 minutes before showtime and present your booking ID at the cinema entrance.
                            </p>
                            <p style="margin: 0 0 30px 0; color: rgba(255, 255, 255, 0.7); font-size: 14px; line-height: 1.6;">
                                Save this email or take a screenshot of your ticket for entry.
                            </p>

                            <!-- Divider -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                                <tr>
                                    <td style="border-bottom: 1px solid rgba(255, 255, 255, 0.1);"></td>
                                </tr>
                            </table>

                            <p style="margin: 0; color: rgba(255, 255, 255, 0.6); font-size: 13px; line-height: 1.6; text-align: center;">
                                Questions? Contact us at <a href="mailto:${process.env.EMAIL_USER}" style="color: #FF4646; text-decoration: none;">${process.env.EMAIL_USER}</a>
                            </p>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #0a0a0a; padding: 30px 40px; text-align: center; border-top: 1px solid rgba(255, 255, 255, 0.1);">
                            <p style="margin: 0 0 10px 0; color: rgba(255, 255, 255, 0.5); font-size: 12px;">
                                © ${new Date().getFullYear()} Synema. All rights reserved.
                            </p>
                            <p style="margin: 0; color: rgba(255, 255, 255, 0.4); font-size: 11px;">
                                This is an automated message, please do not reply to this email.
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


export const getCinemaRevenue = async (req: AuthRequest, res: Response) => {

    try {
        const cinema = await Cinema.findOne({ userId: req.sub });

        if (!cinema) {
            res.status(404).json({ message: "Cinema not found!", data: null });
            return;
        }

        const transactions_amount = await Transaction.find({ cinemaId: cinema._id, status: TransactionStatus.COMPLETED }).select('amount -_id');

        const revenue = transactions_amount.reduce((sum, t: any) => sum + parseFloat(t.amount || '0'), 0)

        return res.status(200).json({ message: "Load cinema revenue successfully.", data: revenue });
    }
    catch (e) {
        res.status(500).json({ message: `Fail to cinema revenue!`, data: null });
        return;
    }
}


export const getCompleteTransactionCount = async (req: AuthRequest, res: Response) => {

    try {
        const cinema = await Cinema.findOne({ userId: req.sub });

        if (!cinema) {
            res.status(404).json({ message: "Cinema not found!", data: null });
            return;
        }

        const transactions = await Transaction.find({ cinemaId: cinema._id, status: TransactionStatus.COMPLETED }).select('_id');

        return res.status(200).json({ message: "Load all Completed transactions count successfully.", data: transactions.length });
    }
    catch (e) {
        res.status(500).json({ message: `Fail to load Completed transactions count!`, data: null });
        return;
    }
}


export const getPendingTransactionCount = async (req: AuthRequest, res: Response) => {

    try {
        const cinema = await Cinema.findOne({ userId: req.sub });

        if (!cinema) {
            res.status(404).json({ message: "Cinema not found!", data: null });
            return;
        }

        const transactions = await Transaction.find({ cinemaId: cinema._id, status: TransactionStatus.PENDING }).select('_id');

        return res.status(200).json({ message: "Load all Pending transactions count successfully.", data: transactions.length });
    }
    catch (e) {
        res.status(500).json({ message: `Fail to load Pending transactions count!`, data: null });
        return;
    }
}


export const getFailedTransactionCount = async (req: AuthRequest, res: Response) => {

    try {
        const cinema = await Cinema.findOne({ userId: req.sub });

        if (!cinema) {
            res.status(404).json({ message: "Cinema not found!", data: null });
            return;
        }

        const transactions = await Transaction.find({ cinemaId: cinema._id, status: TransactionStatus.FAILED }).select('_id');

        return res.status(200).json({ message: "Load all Failed transactions count successfully.", data: transactions.length });
    }
    catch (e) {
        res.status(500).json({ message: `Fail to load Failed transactions count!`, data: null });
        return;
    }
}