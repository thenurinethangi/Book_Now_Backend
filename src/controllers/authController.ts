import { request, Request, Response } from "express";
import cloudinary from "../config/cloudinaryConfig";
import { Role, Status, User } from "../models/User";
import { Cinema, CinemaStatus } from "../models/Cinema";
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

    console.log(req.body);

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
            status: Status.DEACTIVE,
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
            status: CinemaStatus.PENDING,
        });

        const savedCinema = await newCinema.save();

        const newCinemaOwner = new CinemaOwner({
            email: ownerEmail,
            name: ownerName,
            nationalIdNumber: ownerNicNo,
            nationalIdDocumentUrl: ownerNicDocumentUrl,
            cinemaId: savedCinema._id,
            status: Status.DEACTIVE,
        });

        const savedCinemaOwner = await newCinemaOwner.save();

        res.status(200).json({ message: "Sign Up Successfull!", data: savedUser });
        return;
    }
    catch (e) {
        console.log(e);
        res.status(500).json({ message: "Sign Up Fail!", data: null });
        return;
    }
};


export const signIn = async (req: Request, res: Response) => {

    const { email, password, role } = req.body;

    if (!email || !password) {
        res.status(400).json({ message: "All fields required!", data: null });
        return;
    }

    try {
        let u = null;

        if (role === Role.CINEMA) {
            const user = await User.findOne({ email: email, roles: [role] });

            if (user && user.status === Status.ACITIVE) {

                if (user.password !== password) {
                    res.status(401).json({ message: "Authentication failed, password is incorrect!", data: null });
                    return;
                }

                if (!user.isVerified) {
                    res.status(401).json({ message: "Authentication failed, verify your email!", data: user });
                    return;
                }
                u = user;
            }
            else if (user && user.status === Status.DEACTIVE) {
                res.status(400).json({ message: "Sorry, you can't sign in to Synema until the admin approves your request to manage your cinema!", data: null });
                return;
            }
            else {
                res.status(404).json({ message: "User not found, please sign up!", data: null });
                return;
            }
        }
        else {
            const user = await User.findOne({ email: email, roles: [role], status: Status.ACITIVE });

            u = user;

            if (!user) {
                res.status(404).json({ message: "User not found, please sign up!", data: null });
                return;
            }

            if (user.password !== password) {
                res.status(401).json({ message: "Authentication failed, password is incorrect!", data: null });
                return;
            }

            if (!user.isVerified) {
                res.status(401).json({ message: "Authentication failed, verify your email!", data: user });
                return;
            }
        }

        if (u) {
            const accessToken = generateAccessToken(u);
            const refreshToken = generateRefreshToken(u);

            res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: false, sameSite: 'lax', maxAge: 24 * 60 * 60 * 1000 });

            res.status(200).json({ message: "Successfully sign in!", data: accessToken });
            return;
        }
        res.status(500).json({ message: "Failed to sign in, try later", data: null });
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
        subject: "Synema - Verify Your Account",
        text: `Your verification code is: ${code}. This code will expire in 10 minutes.`,
        html: `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Account</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0a0a0a;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0a; padding: 40px 20px;">
        <tr>
            <td align="center">
                <!-- Main Container -->
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #1a1a1a; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);">
                    
                    <!-- Header with gradient -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #FF4646 0%, #8B0000 100%); padding: 40px 40px 35px 40px; text-align: center;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 600; letter-spacing: 2px;">SYNEMA</h1>
                            <p style="margin: 8px 0 0 0; color: rgba(255, 255, 255, 0.9); font-size: 14px; letter-spacing: 0.5px;">YOUR CINEMA EXPERIENCE</p>
                        </td>
                    </tr>

                    <!-- Content -->
                    <tr>
                        <td style="padding: 50px 40px 40px 40px;">
                            <h2 style="margin: 0 0 20px 0; color: #ffffff; font-size: 24px; font-weight: 500;">Verify Your Account</h2>
                            <p style="margin: 0 0 30px 0; color: rgba(255, 255, 255, 0.8); font-size: 15px; line-height: 1.6;">
                                Thank you for joining Synema! To complete your registration and start booking movie tickets, please verify your email address using the code below.
                            </p>

                            <!-- OTP Box -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="margin: 0 0 30px 0;">
                                <tr>
                                    <td align="center" style="background-color: #0a0a0a; border: 2px solid #FF4646; border-radius: 8px; padding: 30px;">
                                        <p style="margin: 0 0 10px 0; color: rgba(255, 255, 255, 0.6); font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Your Verification Code</p>
                                        <p style="margin: 0; color: #FF4646; font-size: 42px; font-weight: 600; letter-spacing: 8px; font-family: 'Courier New', monospace;">${code}</p>
                                    </td>
                                </tr>
                            </table>

                            <p style="margin: 0 0 10px 0; color: rgba(255, 255, 255, 0.7); font-size: 14px; line-height: 1.6;">
                                <strong style="color: rgba(255, 255, 255, 0.9);">Important:</strong> This code will expire in 10 minutes for security purposes.
                            </p>
                            <p style="margin: 0 0 30px 0; color: rgba(255, 255, 255, 0.7); font-size: 14px; line-height: 1.6;">
                                If you didn't request this code, please ignore this email and your account won't be created.
                            </p>

                            <!-- Divider -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                                <tr>
                                    <td style="border-bottom: 1px solid rgba(255, 255, 255, 0.1);"></td>
                                </tr>
                            </table>

                            <p style="margin: 0; color: rgba(255, 255, 255, 0.6); font-size: 13px; line-height: 1.6;">
                                Need help? Contact our support team at <a href="mailto:${process.env.EMAIL_USER}" style="color: #FF4646; text-decoration: none;">${process.env.EMAIL_USER}</a>
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


export const signUpUser = async (req: Request, res: Response) => {

    const { email, password, firstName, lastName, mobile, dateOfBirth, postCode, gender, primaryCinema } = req.body;

    if (!email || !password || !firstName || !lastName || !mobile || !dateOfBirth || !postCode || !gender || !primaryCinema) {
        res.status(400).json({ message: "Incomplete data provided for register user!", data: null });
        return;
    }

    try {
        const newUser = new User({
            email: email,
            password: password,
            firstName: firstName,
            lastName: lastName,
            dateOfBirth: getDateOfBirth(dateOfBirth),
            mobile: mobile,
            postCode: postCode,
            gender: gender,
            primaryCinema: primaryCinema,
            roles: [Role.USER],
            isVerified: false,
            status: Status.ACITIVE,
        });

        const savedUser = await newUser.save();

        res.status(200).json({ message: "User Sign Up Successfull!", data: savedUser });
        return;
    }
    catch (e) {
        res.status(500).json({ message: "User Sign Up Fail!", data: null });
        return;
    }
};

function getDateOfBirth(date: string) {
    const [month, year] = date.split("/");
    const dateObj = new Date(Number(year), Number(month) - 1);
    return dateObj;
}