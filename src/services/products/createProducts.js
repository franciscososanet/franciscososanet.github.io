import Product from "../../models/products.model.js";

const initialProducts = [
    {
        name: 'Licencia mensual',
        pricePesos: 8125,
        priceDolar: 23.21,
        totalPrice: {
            pricePesos: 10400,
            priceDolar: 29.01,
        }
    },
    {
        name: 'Licencia anual',
        pricePesos: 80000,
        priceDolar: 228.57,
        totalPrice: {
            pricePesos: 82400,
            priceDolar: 228.57,
        }
    },
    {
        name: 'Licencia semestral',
        pricePesos: 48000,
        priceDolar: 137.14,
        totalPrice: {
            pricePesos: 54240,
            priceDolar: 150.86,
        }
    },
]

async function initializeProducts(){

    try{
        const productsExist = await Promise.all(initialProducts.map(async product => {
            const count = await Product.countDocuments({ name: product.name });
            return count > 0;
        }));

        await Promise.all(productsExist.map(async (exist, index) => {
            if(!exist){
                const product = new Product(initialProducts[index]);
                await product.save();
            }
        }));
    }catch(error){
        console.error('Error initializing products:', error);
    }
}

export default initializeProducts;