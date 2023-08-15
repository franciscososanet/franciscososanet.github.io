import { PAYPAL_API, PAYPAL_API_CLIENT, PAYPAL_API_SECRET } from "../paypal/paypal.config.js"
import { HOST } from '../../config.js'
import axios from "axios"

export const createOrder = async(req, res) => {

    const product = req.body.product;

    let amount;
    let title;

    switch(product){

        case 'checkoutMensual':
            title = "Licencia mensual franciscososa.net";
            amount = "5.00";
            break;

        case 'checkoutSemestral':
            title = "Licencia semestral franciscososa.net";
            amount = "10.00";
            break;

        case 'checkoutAnual':
            title = "Licencia anual franciscososa.net";
            amount = "20.00";
            break;

        default: 
            return res.status(400).send('Producto no valido');

    }

    const order = {
        intent: "CAPTURE",
        purchase_units: [
            {
                amount: {
                    currency_code: "USD",
                    value: amount
                }
            },
        ],
        application_context: {
            brand_name: "FRANCISCOSOSA.NET",
            landing_page: "NO_PREFERENCE",
            user_action: "PAY_NOW",
            return_url: `${HOST}/capture-order`,
            cancel_url: `${HOST}/cancel-order`
        }
    }

    const params = new URLSearchParams();
    params.append('grant_type', 'client_credentials');

    const {data: {access_token}} = await axios.post(`${PAYPAL_API}/v1/oauth2/token`, params, {
        auth: {
            username: PAYPAL_API_CLIENT,
            password: PAYPAL_API_SECRET
        }
    });

    const response = await axios.post(`${PAYPAL_API}/v2/checkout/orders`, order, {
        headers: {
            Authorization: `Bearer ${access_token}`
        }
    })

    return res.json(response.data);
}

export const captureOrder = async(req, res) => {

    const { token } = req.query;

    const response = await axios.post(`${PAYPAL_API}/v2/checkout/orders/${token}/capture`, {}, {
        auth:{
            username: PAYPAL_API_CLIENT,
            password: PAYPAL_API_SECRET
        }
    })

    console.log(response.data);

    return res.send('payed');
}

export const cancelPayment = (req, res) => res.redirect('/');