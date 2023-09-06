import Product from "../../models/products.model.js";

const initialProducts = [
    {
        name: 'Licencia mensual',
        pricePesos: 8125,
        priceDolar: 10,
        totalPrice: {
            pricePesos: 10400,
            priceDolar: 27,
        }
    },
    {
        name: 'Licencia anual',
        pricePesos: 80000,
        priceDolar: 100,
        totalPrice: {
            pricePesos: 82400,
            priceDolar: 216,
        }
    },
    {
        name: 'Licencia semestral',
        pricePesos: 48000,
        priceDolar: 50,
        totalPrice: {
            pricePesos: 54240,
            priceDolar: 148,
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