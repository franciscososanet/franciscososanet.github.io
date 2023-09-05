import express from "express";
import Product from "../../models/products.model.js";

const router = express.Router();

router.get('/api/getPrice', async (req, res) => {
    let productName = req.query.product;

    switch(productName){
        case 'Mensual':
            productName = 'Licencia mensual';
            break;
        case 'Anual':
            productName = 'Licencia anual';
            break;
        case 'Semestral':
            productName = 'Licencia semestral';
            break;
        default:
            res.status(400).send('Nombre de producto no válido');
            return;
    }

    try{
        // Busca el producto en la base de datos
        const productData = await Product.findOne({ name: productName });

        if(!productData){
            res.status(404).send('Producto no encontrado');
            return;
        }

        res.json({ price: productData.pricePesos });
    } catch (error) {
        res.status(500).send('Error al obtener precio');
    }
});


export default router;