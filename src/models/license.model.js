import mongoose from 'mongoose';

const licenseSchema = new mongoose.Schema({
    licenseKey: String,
    transactionId: String,
    platform: String,
    purchaseDate: String,
    expirationDate: String,
    currency: String,
    buyer: {
        firstName: String,
        lastName: String,
        email: String,
        phoneNumber: String,
        id: String,
        ip: String,
    },
    product: {
        name: String,
        description: String,
        productId: String,
        price: Number,
        currency: String,
    },
    status: String,
    paymentMethod: String,
    paymentDetails: {
        transactionNumber: String,
        fee: Number
    }
});

const License = mongoose.model('License', licenseSchema);

export default License;
