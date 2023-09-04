import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        enum: ['Licencia mensual', 'Licencia anual', 'Licencia semestral']
    },
    pricePesos: {
        type: Number,
        required: true,
    },
    priceDolar: {
        type: Number,
        required: true,
    },
    quantitySold:{
        type: Number,
        default: 0
    }
});

const Product = mongoose.model('Product', productSchema);

export default Product;