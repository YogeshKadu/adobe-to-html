const router = require('express').Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');

router.post("/orders", async (req, res) => {
    try {
        const instance = new Razorpay({
            key_id: process.env.KEY_ID,
            key_secret: process.env.KEY_SECRET,
        });

        const body = req.body;
        console.log("Order ", req.body);

        const options = {
            amount: body.price,
            currency: "INR",
            receipt: crypto.randomBytes(10).toString("hex"),
            notes: {
                'name': body.name,
                'description': body.description
            }
        };

        instance.orders.create(options, (error, order) => {
            if (error) {
                console.log(error);
                return res.status(error.statusCode).json({ message: error.error.description });

                // return res.status(500).json({ message: "Something Went Wrong!" });
            }
            res.status(200).json({ data: order });
        });
    } catch (error) {
        res.status(error.status).json({ message: error.description });
        console.log(error);
    }
});

router.post("/verify", async (req, res) => {
    console.log('verify ', req.body);
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
            req.body;
        const sign = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSign = crypto
            .createHmac("sha256", process.env.KEY_SECRET)
            .update(sign.toString())
            .digest("hex");

        console.log(razorpay_signature === expectedSign)
        if (razorpay_signature === expectedSign) {
            return res.status(200).json({ message: "Payment verified successfully" });
        } else {
            return res.status(400).json({ message: "Invalid signature sent!" });
        }
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error!" });
        console.log(error);
    }
});


module.exports = router