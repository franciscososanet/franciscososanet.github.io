import mercadopago from "mercadopago";
import { HOST, MERCADOPAGO_API_KEY, PORT } from "../config.js";

export const createOrder = async(req, res) => {
    
    mercadopago.configure({
        access_token: MERCADOPAGO_API_KEY
    });

    const result = await mercadopago.preferences.create({
        items: [
            {
                title: "Producto de prueba de cobro",
                unit_price: 5,
                currency_id: "ARS",
                quantity: 1
            },
        ],
        back_urls: {
            success: `${HOST}/success`,
            failure: `${HOST}/licencias.html`,
            pending: `${HOST}/pending`
        },
        notification_url:  "https://2e94-2800-810-548-8427-a9ee-20df-9013-cc03.ngrok.io/webhook",
        // `http://localhost:${PORT}/webhook` -> notification url
    });

    console.log(result);

    res.send(result.body);
}

export const receiveWebhook = async(req, res) => {

    console.log(req.query);

    const payment = req.query;

    try{

        if(payment.type === "payment"){
            const data = await mercadopago.payment.findById(payment['data.id']);
            console.log(data);
            // aca guardaria en la base de datos toda la data
        }
        res.sendStatus(204);
    }catch(error){
        console.log(error);
        return res.sendStatus(500).json({error: error.message });
    }
}