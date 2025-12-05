import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";
import productRoutes from "./routes/productRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import { errorHandler } from "./middleware/errorHandler.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 8000;

//connect to mongo db
connectDB();

//cors config
const allowedOrigins = [
    'http://localhost:3000'
]


app.use(cors({
    origin: allowedOrigins, // allow all origins
    credentials: true, // allow cookies
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

//Routes
app.use("/api/products", productRoutes);
app.use("/api/auth", authRoutes);

//404 fallback
app.use((req,res,next) => {
    res.setHeader('Content-Type', 'application/json');
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error);
})

app.use(errorHandler);


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});