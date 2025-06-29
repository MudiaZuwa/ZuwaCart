const fetch = require("node-fetch");

const verifyPayment = async (req, res) => {
  if (req.method !== "POST") return res.status(405).end();

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
};

module.exports = { verifyPayment };
