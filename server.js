const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");

const app = express();
app.use(express.json());
app.use(cors());

let otpStorage = {}; // Stores OTPs temporarily

// Configure Nodemailer transporter
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "trustwayrides@gmail.com",
        pass: "uuzltvgrqkxkmdlo", // Make sure this is an App Password, NOT your actual Gmail password
    },
});

// Function to generate a 6-digit OTP
function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// ✅ Send OTP Route
app.post("/send-otp", (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ success: false, message: "Email is required" });
    }

    const otp = generateOTP();
    otpStorage[email] = otp; // Store OTP temporarily

    const mailOptions = {
        from: "trustwayrides@gmail.com",
        to: email,
        subject: "Your OTP for Login",
        text: `Your OTP is ${otp}. It is valid for 10 minutes.`,
    };

    // Sending email inside this route only ✅
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error("Error sending OTP:", error);
            return res.status(500).json({ success: false, message: "Failed to send OTP" });
        }
        res.json({ success: true, message: "OTP sent successfully!" });
    });
});

// ✅ Verify OTP Route
app.post("/verify-otp", (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        return res.status(400).json({ success: false, message: "Email and OTP are required" });
    }

    if (otpStorage[email] && otpStorage[email] === otp) {
        delete otpStorage[email]; // Remove OTP after successful verification
        return res.json({ success: true, message: "OTP verified successfully" });
    } else {
        return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
    }
});

// Start the server
app.listen(3000, () => {
    console.log("Server running on port 3000");
});
