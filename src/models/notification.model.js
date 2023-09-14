import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
    id: Number,
    notification: String,
    redirect: String,
    date:{
        creation: String,
        expiration: String,
    },
});

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
