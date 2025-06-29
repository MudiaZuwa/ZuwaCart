const nodemailer = require("nodemailer");

const sendEmail = async (req, res) => {
  if (req.method !== "POST") return res.status(405).end();

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
    subject,
    html: message,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).send("Email sent successfully");
  } catch (error) {
    console.error(error);
    res.status(500).send("Failed to send email");
  }
};

module.exports = { sendEmail };
