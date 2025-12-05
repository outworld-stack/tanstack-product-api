import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        // required: true,
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
    },
    summary: {
        type: String,
        required: true,
        trim: true
    },
    tags: {
        type: [String],
        default: []
    }
}, { timestamps: true });

const Product = mongoose.model("Product", ProductSchema);

export default Product;