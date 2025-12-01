import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'thenurinathangi@gmail.com',
    pass: process.env.EMAIL_PASS || 'sqmw oftj xfca tblu'
  }
});

export default transporter;