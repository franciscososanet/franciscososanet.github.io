import express from "express";
import morgan from "morgan";
import mercadopagoPaymentRoutes from './payments/mercadopago/mercadopago.routes.js'
import paypalPaymentRoutes from './payments/paypal/paypal.routes.js';
import { PORT } from "./config.js";
import path from "path";

const app = express();

app.use(express.json());
app.use(morgan('dev'));
app.use(mercadopagoPaymentRoutes);
app.use(paypalPaymentRoutes);
app.use(express.static(path.resolve('src/public')));

app.listen(PORT);
console.log('Servidor en puerto', PORT);
