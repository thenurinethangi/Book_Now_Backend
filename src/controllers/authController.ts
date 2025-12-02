import { Request, Response } from "express";
import cloudinary from "../config/cloudinaryConfig";
import { Role, Status, User } from "../models/User";
import { Cinema } from "../models/Cinema";
import { CinemaOwner } from "../models/CinemaOwner";
import transporter from "../config/emailConfig";
import dotenv from "dotenv";
import { generateAccessToken, generateRefreshToken } from "../utils/jwtUtil";
dotenv.config();

export const signUpCinema = async (req: Request, res: Response) => {
    const {
        cinemaName,
        description,
        cinemaEmail,
        cinemaPhoneNo,
        address,
        city,
        distric,
        postCode,
        googleMapLink,
        website,
        noOfScreens,
        bussinessRegisterNo,
        ownerEmail,
        ownerName,
        ownerNicNo,
        adminEmail,
        adminFirstName,
        adminLastName,
        adminPassword,
    } = req.body;

    const files = req.files as {
        [fieldname: string]: Express.Multer.File[];
    };

    let cinemaImageUrl = "";
    let bussinessRegisterDocumentsUrl = "";
    let ownerNicDocumentUrl = "";

    const uploadToCloudinary = (fileBuffer: Buffer): Promise<any> => {
        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                { folder: "auth" },
                (error, result) => {
                    if (error) return reject(error);
                    resolve(result);
                }
            );
            uploadStream.end(fileBuffer);
        });
    };

    if (files?.cinemaImage?.[0]) {
        const result = await uploadToCloudinary(files.cinemaImage[0].buffer);
        cinemaImageUrl = result.secure_url;
    }

    if (files?.bussinessRegisterDocuments?.[0]) {
        const result = await uploadToCloudinary(
            files.bussinessRegisterDocuments[0].buffer
        );
        bussinessRegisterDocumentsUrl = result.secure_url;
    }

    if (files?.ownerNicDocuments?.[0]) {
        const result = await uploadToCloudinary(files.ownerNicDocuments[0].buffer);
        ownerNicDocumentUrl = result.secure_url;
    }

    try {
        const newUser = new User({
            email: adminEmail,
            password: adminPassword,
            firstName: adminFirstName,
            lastName: adminLastName,
            roles: [Role.CINEMA],
            isVerified: false,
            status: Status.ACITIVE,
        });

        const savedUser = await newUser.save();

        const newCinema = new Cinema({
            cinemaName,
            description,
            cinemaEmail,
            cinemaPhoneNo,
            address,
            city,
            distric,
            postCode,
            googleMapLink,
            website,
            noOfScreens,
            bussinessRegisterNo,
            cinemaImageUrl,
            bussinessRegisterDocumentsUrl,
            userId: savedUser._id,
            status: Status.ACITIVE,
        });

        const savedCinema = await newCinema.save();

        const newCinemaOwner = new CinemaOwner({
            email: ownerEmail,
            name: ownerName,
            nationalIdNumber: ownerNicNo,
            nationalIdDocumentUrl: ownerNicDocumentUrl,
            cinemaId: savedCinema._id,
            status: Status.ACITIVE,
        });

        const savedCinemaOwner = await newCinemaOwner.save();

        res.status(200).json({ message: "Sign Up Successfull!", data: savedUser });
        return;
    }
    catch (e) {
        res.status(500).json({ message: "Sign Up Fail!", data: null });
        return;
    }
};


export const signIn = async (req: Request, res: Response) => {

    const { email, password } = req.body;

    if (!email || !password) {
        res.status(400).json({ message: "All fields required!", data: null });
        return;
    }

    try {
        const user = await User.findOne({ email: email });

        if (!user) {
            res.status(404).json({ message: "User not found, please sign up!", data: null });
            return;
        }

        if (user.password !== password) {
            res.status(401).json({ message: "Authentication failed, password is incorrect!", data: null });
            return;
        }

        if(!user.isVerified){
            res.status(401).json({ message: "Authentication failed, verify your email!", data: user });
            return;
        }

        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: false, sameSite: 'lax', maxAge: 24 * 60 * 60 * 1000 });

        res.status(200).json({ message: "Successfully sign in!", data: accessToken});
        return;
    }
    catch (e) {
        res.status(500).json({ message: "Failed to sign in, try later", data: null });
        return;
    }
};


export const sendEmailWithOtp = async (req: Request, res: Response) => {

    const { email } = req.body;

    if (!email) {
        res.status(400).json({ message: "Email not provided!", data: null });
        return;
    }

    const user = await User.findOne({ email: email });
    if (user == null) {
        res.status(404).json({ message: "User not found!", data: null });
        return;
    }

    function generate6DigitCode() {
        return Math.floor(100000 + Math.random() * 900000);
    }

    const code = generate6DigitCode();

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        replyTo: email,
        subject: "Synema - one time password (OTP)",
        text: `Use this otp to verify your account`,
        html: `
            <h3>OTP</h3>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>otp:</strong></p>
            <p>${code}</p>
            `,
    };

    try {
        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: "Email sent successfully!", data: code });
        return;
    }
    catch (error) {
        console.error("Email error:", error);
        res.status(500).json({ message: "Failed to send email", data: null });
        return;
    }
};


export const verifyUser = async (req: Request, res: Response) => {

    const { email } = req.body;

    if (!email) {
        res.status(400).json({ message: "Email not provided!", data: null });
        return;
    }

    try {
        const user = await User.findOne({ email: email });
        if (user == null) {
            res.status(404).json({ message: "User not found!", data: null });
            return;
        }

        const result = await User.updateOne({ email: email }, { isVerified: true });

        if (result) {
            res.status(200).json({ message: "Verified user!", data: null });
            return;
        }
        else {
            res.status(500).json({ message: "Failed to verify user!", data: null });
            return;
        }
    }
    catch (e) {
        res.status(500).json({ message: "Failed to verify user!", data: null });
        return;
    }
}
