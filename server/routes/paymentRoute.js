const express = require("express");
const { verifyPayment } = require("../controllers/paymentController");

const paymentRouter = express.Router();

paymentRouter.post("/verify", verifyPayment);

module.exports = paymentRouter;
