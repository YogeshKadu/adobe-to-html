const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const paymentRoutes = require("./routes/payment");
const convertRoutes = require("./routes/convert");

const allowedOrigins = ['http://allowed-host.com'];

dotenv.config();

const corsOptions = {
    origin: true
};
const port = process.env.PORT || 3000;

const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(cors(corsOptions));


app.use(express.json({ limit: "500mb" }));
app.use(express.urlencoded({ extended: true }));


app.get("/", (req, res) => {
    res.status(200).send({ message: "👋 Hello, World!" });
});

app.use("/api/payment", paymentRoutes);
app.use("/api/json-to-html", convertRoutes);


app.listen(port, () => console.log(`Listening on port ${port}...`));