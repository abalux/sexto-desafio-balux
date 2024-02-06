import { Schema, model } from 'mongoose'
import mongoose from 'mongoose'


const productSchema = new Schema({
    _id: { type: mongoose.Schema.Types.ObjectId, default: new mongoose.Types.ObjectId() , required: true },
    Title: { type: String, required: true },
    Description: { type: String, required: true },
    Price: { type: Number, required: true },
    Stock: { type: Number, required: true },
    Category: {type: String, required: true},
}, {
    versionKey: false,
})

export const dbProducts = model('products', productSchema)