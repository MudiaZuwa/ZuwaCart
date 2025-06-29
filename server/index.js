const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mailRouter  = require("./routes/mailRouter");
const paymentRouter = require("./routes/paymentRoute");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors({ origin: "*" }));
app.use(bodyParser.json());

app.get("/", (req, res) => res.send("API is Working"));
app.use("/api/mail", mailRouter);
app.use("/api/payment", paymentRouter);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
