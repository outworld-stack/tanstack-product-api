import express from "express";
import Product from "../models/Product.js";
import mongoose from "mongoose";
import { protect } from "../middleware/authMiddleware.js";


const router = express.Router();


// @route    GET /api/products
// @desc     Get all products
// @access   Public
// @query    _limit (optional limit for ideas)
router.get("/", async (req, res, next) => {
    try {
        const limit = parseInt(req.query._limit);
        const query = Product.find().sort({ createdAt: -1 });

        if (!isNaN(limit)) {
            query.limit(limit);
        }

        const products = await query.exec();
        res.json(products);
    } catch (err) {
        next(err);
    }
});



// @route    GET /api/product/:id
// @desc     Get Single product
// @access   Public
router.get("/:id", async (req, res, next) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(404);
        throw new Error("product not found");
    };
    try {
        const product = await Product.findById(id);
        if (!product) {
            res.status(404);
            throw new Error("product not found");
        }
        res.json(product);
    } catch (err) {
        next(err);
    }
});



// @route    POST /api/products
// @desc     Create a new product
// @access   Private
router.post("/", protect, async (req, res, next) => {
    try {
        const { title, summary, description, tags } = req.body || {};
        if (!title?.trim() || !summary?.trim() || !description?.trim()) {
            res.status(400);
            throw new Error("Please fill in all fields");
        }

        const newProduct = new Product({
            title,
            summary,
            description,
            tags: typeof tags === "string" ? tags.split(",").map((tag) => tag.trim()).filter(Boolean).map(tag => tag.replace(/\s+/g, '_')) : Array.isArray(tags) ? tags : [],
            user: req.user._id,
        });

        const savedProduct = await newProduct.save();
        res.status(201).json(savedProduct);

    } catch (err) {
        next(err);
    }
});



// @route    DELETE /api/product/:id
// @desc     Delete Single product
// @access   Private
router.delete("/:id", protect, async (req, res, next) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(404);
        throw new Error("Idea not found");
    };
    try {
        const product = await Product.findByIdAndDelete(id);
        if (!product) {
            res.status(404);
            throw new Error("product not found");
        }
        if (product.user.toString() !== req.user._id.toString()) {
            res.status(403);
            throw new Error("You are not authorized to delete this product");
        }
        await product.deleteOne();
        res.json({
            message: 'product deleted successfully'
        });
    } catch (err) {
        next(err);
    }
});


// @route    PUT /api/products
// @desc     Update a new product
// @access   Private
router.put("/:id", protect, async (req, res, next) => {
    try {

        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            res.status(404);
            throw new Error("Invalid Id as Params");
        };

        const product = await Product.findById(id);

        if (!product) {
            res.status(404);
            throw new Error("product not found");
        }

        const { title, summary, description, tags } = req.body || {};
        if (!title?.trim() || !summary?.trim() || !description?.trim()) {
            res.status(400);
            throw new Error("Please fill in all fields");
        }
        const sanitizeTags = (tagsInput) => {
            if (!tagsInput) {
                return []; // Return an empty array if input is null, undefined, or empty
            }
            if (Array.isArray(tagsInput)) {
                // If it's already an array, process each element
                return tagsInput.map(tag => String(tag).trim().replace(/\s+/g, '_')).filter(Boolean);
            }
            // If it's a string, split it and then process each element
            return String(tagsInput).split(',').map(tag => tag.trim().replace(/\s+/g, '_')).filter(Boolean);
        };
        const updatedProduct = await Product.findByIdAndUpdate(id,
            {
                title: title,
                summary: summary,
                description: description,
                tags: sanitizeTags(tags),
            }, { new: true, runValidators: true });

        if (!updatedProduct) {
            res.status(400);
            throw new Error("There is a problem");
        }

        const savedProduct = await updatedProduct.save();
        res.status(201).json(savedProduct);

    } catch (err) {
        next(err);
    }
});


export default router;