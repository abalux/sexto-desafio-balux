import { dbProducts } from '../models/products.mongoose.js'
import { randomUUID } from 'crypto'

export class ProductManagerDB {

    async create(datosProducto) {
        datosProducto._id = randomUUID()
        const product = await dbProducts.create(datosProducto)
        return product.toObject()
    }
    async findAll() {
        return await dbProducts.find().lean()
    }

    async findById(id) {
        const productFound = await dbProducts.findById(id).lean()
        if (!productFound) {
            throw new Error('id not found')
        }
        return productFound
    }

    async updateById(id, newData) {
        const updatedProduct = await dbProducts.findByIdAndUpdate(id,
            { $set: newData },
            { new: true })
            .lean()
        if (!updatedProduct) {
            throw new Error('id not found')
        }
        return updatedProduct
    }

    async deleteById(id) {
        const deleteProduct = await dbProducts.findByIdAndDelete(id).lean()

        if (!deleteProduct) {
        throw new Error('id not found')
    }

        return deleteProduct
    }
    }