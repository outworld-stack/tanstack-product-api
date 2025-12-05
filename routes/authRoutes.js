import express from "express";
import User from "../models/User.js";
import { jwtVerify } from "jose";
import { JWT_SECRET } from "../utils/getJwtSecret.js";
import { generateToken } from "../utils/generateToken.js";

const router = express.Router();

//@route  POST api/auth/register
//@desc   Register user
//@access Public
router.post("/register", async (req, res, next) => {
    // Ensure JSON response
    res.setHeader("Content-Type", "application/json");

    try {
        const { name, email, password } = req.body || {};

        if (!name || !email || !password) {
            res.status(400);
            throw new Error("Please add all fields");
        }

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            res.status(400);
            throw new Error("User already exists");
        }

        const user = await User.create({
            name,
            email,
            password,
        });

        //create tokens
        const payload = { userId: user._id.toString() };
        const accessToken = await generateToken(payload, "1m");
        const refreshToken = await generateToken(payload, "30d");


        // set refresh token in http-only cookie
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
            // path: "/api/auth/refresh_token",
            maxAge: 30 * 24 * 60 * 60 * 1000,  //30 days
        })

        res.status(201).json({
            accessToken,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
            }
        })

    } catch (err) {
        console.log(err);
        next(err);
    }
});

//@route  POST api/auth/login
//@desc   Authenticate user
//@access Public
router.post("/login", async (req, res, next) => {
    // Ensure JSON response
    res.setHeader("Content-Type", "application/json");

    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400);
            throw new Error("Please add all fields");
        }

        const user = await User.findOne({ email });

        if (!user) {
            res.status(401);
            throw new Error("Invalid Credentials");
        }

        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            res.status(401);
            throw new Error("Invalid credentials");
        }

        //create tokens
        const payload = { userId: user._id.toString() };
        const accessToken = await generateToken(payload, "1m");
        const refreshToken = await generateToken(payload, "30d");


        // set refresh token in http-only cookie
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
            // path: "/api/auth/refresh_token",
            maxAge: 30 * 24 * 60 * 60 * 1000,  //30 days
        })

        res.status(201).json({
            accessToken,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
            }
        })
    } catch (err) {
        console.log(err);
        next(err);
    }
})

//@route  POST api/auth/logout
//@desc   Logout user and clean refreshToken
//@access Private
router.post("/logout", async (req, res, next) => {
    // Ensure JSON response
    res.setHeader("Content-Type", "application/json");

    try {
        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "none",
        })
        res.status(200).json({ message: "Logout success" });
    } catch (err) {
        console.log(err);
    }
})



//@route  POST api/auth/refresh
//@desc   Generate new acess token from refresh token
//@access Public(need valid refresh token in cookie)
router.post("/refresh", async (req, res, next) => {
    try {
        const token = req.cookies?.refreshToken;

        if (!token) {
            res.status(401);
            throw new Error("Not token");
        }
        const { payload } = await jwtVerify(token, JWT_SECRET);
        const user = await User.findById(payload.userId);

        if (!user) {
            res.status(401);
            throw new Error("Invalid user");
        }
        const newAccessToken = await generateToken({ userId: user._id.toString() }, "1m");
        res.json({
            accessToken: newAccessToken,
            user:{
                id: user._id,
                name: user.name,
                email: user.email,
            }
        })
    } catch (err) {
        res.status(401);
        next(err);
    }
})



export default router;
