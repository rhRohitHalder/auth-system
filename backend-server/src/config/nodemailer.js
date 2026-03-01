import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();


const transporter = nodemailer.createTransport({
  service: 'gmail', // Automatically sets host to smtp.gmail.com and port to 465
  auth: {
    user: process.env.EMAIL_USER, // Your full Gmail address
    pass: process.env.EMAIL_PASS, // Your 16-character App Password
  },
});

export default transporter;