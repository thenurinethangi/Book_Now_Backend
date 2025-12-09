// export const rejectACinema = async (req: AuthRequest, res: Response) => {

//     const id = req.params.id;

//     try {
//         const result = await Cinema.updateOne({ _id: id }, { $set: { status: CinemaStatus.REJECTED } });

//         if (result.modifiedCount === 1) {
//             res.status(200).json({ message: `Successfully rejected cinemas!`, data: null });
//             return;
//         }
//         else {
//             res.status(401).json({ message: `Fail to reject cinemas!`, data: null });
//             return;
//         }
//     }
//     catch (e) {
//         res.status(500).json({ message: `Fail to reject cinema!`, data: null });
//         return;
//     }
// }