import Product from "../../models/products.model.js";

const initialProducts = [
    {
        name: 'Licencia mensual',
        pricePesos: 10000,
        priceDolar: 10,
    },
    {
        name: 'Licencia anual',
        pricePesos: 10000,
        priceDolar: 100,
    },
    {
        name: 'Licencia semestral',
        pricePesos: 50000,
        priceDolar: 50,
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