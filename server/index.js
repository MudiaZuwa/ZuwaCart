const express = require("express");
const nodemailer = require("nodemailer");
const bodyParser = require("body-parser");
const cors = require("cors");
const fetch = require("node-fetch");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors({ origin: "*" }));
app.use(bodyParser.json());

// 📦 Route: Send Email via Nodemailer
app.post("/api/send-email", async (req, res) => {
  const { email, subject, message } = req.body;

  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER, 
      pass: process.env.EMAIL_PASS,
    },
  });

  let mailOptions = {
    from: process.env.ADMIN_EMAIL,
    to: email,
    cc: process.env.ADMIN_EMAIL, 
    subject: subject,
    html: message, 
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).send("Email sent successfully");
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).send("Failed to send email");
  }
});

// 💳 Route: Paystack Payment Verification
app.post("/verify-payment", async (req, res) => {
  const { reference } = req.body;

  try {
    const response = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const data = await response.json();

    if (data.data && data.data.status === "success") {
      res.status(200).json({
        verified: true,
        email: data.data.customer.email,
        reference: data.data.reference,
      });
    } else {
      res.status(400).json({ verified: false });
    }
  } catch (err) {
    console.error("Verification error:", err);
    res.status(500).json({ verified: false });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
