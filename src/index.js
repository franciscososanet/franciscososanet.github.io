import express from "express";
import morgan from "morgan";
import path from "path";
import mongoose from "mongoose";
import cors from "cors";
import sendContactEmail from "./services/email/mailContacto.js";
import mercadopagoPaymentRoutes from './payments/mercadopago/mercadopago.routes.js';
import paypalPaymentRoutes from './payments/paypal/paypal.routes.js';
import { PORT, MONGO_URI } from "./config.js";

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
app.use(express.static(path.resolve('src/public')));

//Ruta para el envío de correos desde el formulario de contacto
app.post('/sendContactEmail', async (req, res) => {
    try{
        await sendContactEmail(req.body);
        res.status(200).send({ message: 'Email enviado exitosamente.' });
    }catch (error){
        console.error('Error enviando el email:', error);
        res.status(500).send({ message: 'Error interno del servidor.' });
    }
});

app.listen(PORT);
console.log('Servidor en puerto', PORT);
