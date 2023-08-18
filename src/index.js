import express from "express";
import morgan from "morgan";
import path from "path";
import mongoose from "mongoose";

import mercadopagoPaymentRoutes from './payments/mercadopago/mercadopago.routes.js'
import paypalPaymentRoutes from './payments/paypal/paypal.routes.js';
import { PORT, MONGO_URI } from "./config.js";

const app = express();

mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Error al conectarse a MongoDB'));
db.once('open', function(){console.log('Conectado a MongoDB')});

app.use(express.json());
app.use(morgan('dev'));
app.use(mercadopagoPaymentRoutes);
app.use(paypalPaymentRoutes);
app.use(express.static(path.resolve('src/public')));


app.listen(PORT);
console.log('Servidor en puerto', PORT);
