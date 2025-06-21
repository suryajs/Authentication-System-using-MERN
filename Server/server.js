import express from "express";
import cors from "cors";
import 'dotenv/config';
import cookieParser from "cookie-parser";
import connectDB from "./config/mongodb.js";
import {authRouter} from "./Routes/authRoutes.js";
import userRouter from "./Routes/userRoutes.js";

const app = express();
const port = process.env.PORT || 5000;
connectDB();

const allowerdOrigins = ["http://localhost:5173"];

app.use(express.json());
app.use(cookieParser());
const corsOptions = {
  origin: "http://localhost:5173",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
};

app.use(cors(corsOptions));


// API Endpoints
app.get("/", (req, res) => {
    res.send("API Working!");
});
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);

app.listen(port, () => console.log(`Server is running on port ${port}`));
