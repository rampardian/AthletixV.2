import express from "express";
import { supabase } from "../supabaseClient.js";
import nodemailer from "nodemailer";

const router = express.Router();

router.post("/", async (req, res) => {
  const { email, currentPassword, newPassword, confirmPassword } = req.body;

  try {
    if (!email || !currentPassword || !newPassword || !confirmPassword)
      return res.status(400).json({ message: "All fields are required" });

    if (newPassword !== confirmPassword)
      return res.status(400).json({ message: "Passwords do not match" });

    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password: currentPassword,
    });
    if (signInError || !signInData?.user)
      return res.status(401).json({ message: "Current password is incorrect" });

    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });
    if (updateError) throw updateError;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.NOTIFY_EMAIL,
        pass: process.env.NOTIFY_PASSWORD,
      },
    });

    const mailOptions = {
      from: `"Athletix Security" <${process.env.NOTIFY_EMAIL}>`,
      to: email,
      subject: "Your Athletix password was changed",
      text: `Hello,

            Your Athletix account password was changed on ${new Date().toLocaleString()}.

            If you did not perform this action, please reset your password immediately or contact support.

            — Athletix Security Team`,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: "Password updated and user notified by email" });
  } catch (err) {
    console.error("Password update error:", err);
    res.status(500).json({ message: "Server error: " + err.message });
  }
});

export default router;
