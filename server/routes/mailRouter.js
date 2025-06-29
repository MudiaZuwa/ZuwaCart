const express = require("express");
const { sendEmail } = require("../controllers/mailController");

const mailRouter = express.Router();

mailRouter.post("/send", sendEmail);

module.exports = mailRouter;
