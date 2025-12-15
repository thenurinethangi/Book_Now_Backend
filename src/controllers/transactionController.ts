import { Response } from "express";
import { AuthRequest } from "../middlewares/authenticate";
import { Cinema } from "../models/Cinema";
import { Transaction, TransactionStatus } from "../models/Transaction";
import { Booking } from "../models/Booking";
import { Showtime } from "../models/Showtime";

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

        if (transaction.status === TransactionStatus.PENDING) {
            const isTransactionDelete = await Transaction.deleteOne({ _id: transaction._id });
            const isBookingDelete = await Booking.deleteOne({ _id: booking._id });

            if (isBookingDelete.deletedCount > 0 && isTransactionDelete.deletedCount > 0) {
                return res.status(200).json({ message: "Successfully deleted both transaction and booking for failed booking.", data: null });
            }
            else {
                return res.status(500).json({ message: "Fail to delete both transaction and booking for failed booking.", data: null });
            }
        }

        return res.status(400).json({ message: "You can't delete Non Pending transactions.", data: null });
    }
    catch (e) {
        res.status(500).json({ message: `Fail to delete both transaction and booking for failed booking!`, data: null });
        return;
    }
}