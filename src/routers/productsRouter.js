import { Router, json } from 'express'
import { ProductManagerDB } from '../services/productManagerDB.js'
import { dbProducts } from '../models/products.mongoose.js'

export const productsRouter = Router()
const ProductManager = new ProductManagerDB();

productsRouter.use(json())


//aca se pone la vista
productsRouter.get('/', async (req, res) => {
    try {
        const user = req.session['user'];

        if (!user) {
            return res.redirect('/login');
        }


        const { limit = 10, page = 1, sort, query } = req.query;
        const pageNumber = parseInt(page, 10);
        const skip = (pageNumber - 1) * limit;

        let filter = {};
        if (query) {
        filter = { $or: [{ Category: query }, { Availability: query }] };
        }

        const totalProducts = await dbProducts.countDocuments(filter).lean();
        const totalPages = Math.ceil(totalProducts / limit);

        let sortOptions = {};
        if (sort) {
        sortOptions = { Price: sort === 'asc' ? 1 : -1 };
        }

        const products = await dbProducts.find(filter)
            .sort(sortOptions)
            .skip(skip)
            .limit(parseInt(limit))
            .lean()
            .exec();

        const hasPrevPage = pageNumber > 1;
        const hasNextPage = pageNumber < totalPages;
        const prevLink = hasPrevPage ? `/products?page=${pageNumber - 1}&limit=${limit}&sort=${sort}${query ? `&query=${query}` : ''}` : null;
        const nextLink = hasNextPage ? `/products?page=${pageNumber + 1}&limit=${limit}&sort=${sort}${query ? `&query=${query}` : ''}` : null;
        
        console.log('Filter:', filter);
        console.log('Sort Options:', sortOptions);
        console.log('Total Pages:', totalPages);
        console.log('Page:', pageNumber);
        console.log('Has Prev Page:', hasPrevPage);
        console.log('Has Next Page:', hasNextPage);
        console.log('Prev Link:', prevLink);
        console.log('Next Link:', nextLink);
        
        res.render('products', {
            status: 'success',
            user,
            products: products,
            totalPages,
            prevPage: pageNumber - 1,
            nextPage: pageNumber + 1,
            page: pageNumber,
            hasPrevPage,
            hasNextPage,
            prevLink,
            nextLink,
        });
    } catch (error) {
        console.error('Error al obtener productos:', error);
        res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
    }
});

productsRouter.get('/:id', async (req, res) => {
    try {
        const getProductById = await ProductManager.findById(req.params.id)
        res.json(getProductById)
    } catch (error) {
        res.status(404).json({
            status: 'error',
            message: error.message
        })
    }
})

productsRouter.post('/', async (req, res) => {
    try {
        const createdProduct = await ProductManager.create(req.body)
        res.status(201).json(createdProduct)
    } catch (error) {
        res.status(400).json({
            status: 'error',
            message: error.message
        })
    }
})

productsRouter.put('/:id', async (req, res) => {
    try {
        const updatedProduct = await ProductManager.updateById(req.params.id, req.body)
        res.json(updatedProduct)
    } catch (error) {
        if (error.message === 'id not found') {
            res.status(404)
        } else {
        res.status(400)
        }

        res.json({
            status: 'error',
            message: error.message
        })
    }
})

productsRouter.delete('/:id', async (req, res) => {
    try {
        const deletedProduct = await ProductManager.deleteById(req.params.id)
        res.json(deletedProduct)
    } catch (error) {
        return res.status(404).json({
            status: 'error',
            message: error.message
        })
    }
})