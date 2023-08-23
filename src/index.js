import express from "express";
import morgan from "morgan";
import path from "path";
import mongoose from "mongoose";
import cors from "cors";
import { PORT, MONGO_URI } from "./config.js";
import mercadopagoPaymentRoutes from './payments/mercadopago/mercadopago.routes.js';
import paypalPaymentRoutes from './payments/paypal/paypal.routes.js';
import mailContactoRoutes from './services/email/mailContacto.routes.js';

const app = express();

mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Error al conectarse a MongoDB'));
db.once('open', function() { console.log('Conectado a MongoDB') });

//Middlewares
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use(mercadopagoPaymentRoutes);
app.use(paypalPaymentRoutes);
app.use(mailContactoRoutes);

app.use(express.static(path.resolve('src/public')));

app.listen(PORT);
console.log('Servidor en puerto', PORT);
