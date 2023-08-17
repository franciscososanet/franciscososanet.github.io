import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
    transactionId: String,
    platform: String,
    purchaseDate: Date,
    buyer: {
        firstName: String,
        lastName: String,
        email: String,
        address: String,
        phoneNumber: String
    },
    product: {
        name: String,
        description: String,
        productId: String,
        price: Number,
        currency: String,
        expirationDate: Date
    },
    status: String,
    paymentMethod: String,
    paymentDetails: {
        transactionNumber: String,
        fee: Number
    }
});

const Transaction = mongoose.model('Transaction', transactionSchema);

export default Transaction;