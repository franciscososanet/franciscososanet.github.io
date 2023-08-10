import mercadopago from "mercadopago";
import { HOST, MERCADOPAGO_API_KEY } from "../config.js";

export const createOrder = async(req, res) => {
    
    mercadopago.configure({
        access_token: MERCADOPAGO_API_KEY
    });

    const result = await mercadopago.preferences.create({
        items: [
            {
                title: "Auriculares Razer Kitty",
                unit_price: 15000,
                currency_id: "ARS",
                quantity: 1
            },
        ],
        back_urls: {
            success: `${HOST}/success`,
            failure: `${HOST}/failure`,
            pending: `${HOST}/pending`
        },
        notification_url: "https://2e94-2800-810-548-8427-a9ee-20df-9013-cc03.ngrok.io/webhook",
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
        }
        res.sendStatus(204);
    }catch(error){
        console.log(error);
        return res.sendStatus(500).json({error: error.message });
    }
}