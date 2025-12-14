import { Response } from "express";
import { AuthRequest } from "../middlewares/authenticate";
import cloudinary from "../config/cloudinaryConfig";
import { Hero } from "../models/HeroModel";

export const addNewHeroPoster = async (req: AuthRequest, res: Response) => {

    const { movieId, description, status } = req.body;
    console.log(req.body);

    if (!movieId || !description || !status) {
        res.status(400).json({ message: `Incomplete data provided for adding a new hero poster.!`, data: null });
        return;
    }

    const files = req.files as {
        [fieldname: string]: Express.Multer.File[];
    };

    let heroImageUrl = "";
    let videoFileUrl = "";

    const uploadToCloudinary = (
        fileBuffer: Buffer,
        mimeType: string
    ): Promise<any> => {
        return new Promise((resolve, reject) => {
            const isVideo = mimeType.startsWith("video");

            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: "hero",
                    resource_type: isVideo ? "video" : "image",
                    timeout: 900000
                },
                (error, result) => {
                    if (error) return reject(error);
                    resolve(result);
                }
            );

            uploadStream.end(fileBuffer);
        });
    };


    if (files?.heroImage?.[0]) {
        const file = files.heroImage[0];
        const result = await uploadToCloudinary(file.buffer, file.mimetype);
        heroImageUrl = result.secure_url;
    }

    if (files?.videoFile?.[0]) {
        const file = files.videoFile[0];
        const result = await uploadToCloudinary(file.buffer, file.mimetype);
        videoFileUrl = result.secure_url;
    }

    try {

        const newHero = new Hero({
            imageUrl: heroImageUrl,
            videoUrl: videoFileUrl,
            description,
            movieId
        });

        const savedHero = await newHero.save();

        res.status(200).json({ message: `Successfully added new hero poster!`, data: savedHero });
        return;
    }
    catch (e) {
        res.status(500).json({ message: `Fail to add new hero poster!`, data: null });
        return;
    }
}


export const getAllHeroPostersForAdmin = async (req: AuthRequest, res: Response) => {

    try {
        const posters = await Hero.find().populate('movieId');

        res.status(200).json({ message: `Successfully load all hero poster!`, data: posters });
        return;
    }
    catch (e) {
        res.status(500).json({ message: `Fail to load all hero poster!`, data: null });
        return;
    }
}


export const deleteAHeroPoster = async (req: AuthRequest, res: Response) => {

    const id = req.params.id;

    if (!id) {
        res.status(400).json({ message: `Hero poster id not provided.!`, data: null });
        return;
    }

    try {
        const result = await Hero.deleteOne({ _id: id });

        if (result.deletedCount > 0) {
            res.status(200).json({ message: `Successfully delete the poster!`, data: null });
            return;
        }
        res.status(500).json({ message: `Fail to delete the hero poster!`, data: null });
        return;
    }
    catch (e) {
        res.status(500).json({ message: `Fail to delete the hero poster!`, data: null });
        return;
    }
}


export const getAllHeroPosters = async (req: AuthRequest, res: Response) => {

    try {
        const posters = await Hero.find().populate('movieId');

        let arr = [];
        for (let i = 0; i < posters.length; i++) {
            const e: any = posters[i];

            const data = {
                movieId: e.movieId._id,
                image: e.imageUrl,
                trailer: e.videoUrl,
                title: e.movieId.title,
                description: e.description,
                status: e.movieId.status
            }
            arr.push(data);
        }

        res.status(200).json({ message: `Successfully load all hero poster!`, data: arr });
        return;
    }
    catch (e) {
        res.status(500).json({ message: `Fail to load all hero poster!`, data: null });
        return;
    }
}