import mercadopago from "mercadopago";
import { MERCADOPAGO_API_KEY} from "../mercadopago/mercadopago.config.js";
import { HOST } from '../../config.js'
import Transaction from "../../models/transaction.model.js";
import License from "../../models/license.model.js";
import Product from "../../models/products.model.js";
import sendEmailPurchase from "../../services/email/mailCompra.js";
import generateUniqueLicenseKey from "../../services/purchase/generacionLicencia.js";

let _email = null;

export const createOrder = async(req, res) => {

    mercadopago.configure({
        access_token: MERCADOPAGO_API_KEY
    });
    
    const email = req.body.email; //Obtener el email desde el cuerpo de la solicitud
    const productType = req.body.product;

    _email = email;
    let productName;

    switch (productType) {
        case 'checkoutMensual':
            productName = "Licencia mensual";
            break;
        case 'checkoutSemestral':
            productName = "Licencia semestral";
            break;
        case 'checkoutAnual':
            productName = "Licencia anual";
            break;
        default:
            return res.status(400).send('Producto no válido');
    }

    const productFromDB = await Product.findOne({ name: productName })

    if(!productFromDB){
        return res.status(400).send('Producto no encontrado en la base de datos.');
    }

    const item = {
        title: `${productName} franciscososa.net`,
        unit_price: productFromDB.totalPrice.pricePesos,
        currency_id: "ARS",
        quantity: 1,
    }

    const result = await mercadopago.preferences.create({
        items: [item], //Producto seleccionado
        back_urls: {
            success: `${HOST}/compraexitosa.html?email=${email}&product=${item.title}`,
            failure: `${HOST}/comprarechazada.html?email=${email}&product=${item.title}`,
            pending: `${HOST}/compraenproceso.html?email=${email}&product=${item.title}`,
        },
        payment_methods:{
            installments: 1, //Solo permito el pago en 1 cuota
        },
        notification_url: "https://b49c-2800-810-548-ac4-a047-daca-c1ce-b16c.ngrok.io/webhook",
    });

    res.send(result.body);    
}

export const receiveWebhook = async(req, res) => {

    const payment = req.query;

    try{

        if(payment.type === "payment"){

            res.sendStatus(200);

            const data = await mercadopago.payment.findById(payment['data.id']);

            if(data.body.status === "approved"){

                //1) Generar una licencia
                const licenseKey = await generateUniqueLicenseKey();

                    //1.1) Calcular la fecha de expiracion de la licencia
                    const expirationDate = calculateExpirationDate(formatPurchaseDate(data.body.date_created), data.body.description);

                //2) Crear instancia de License
                const newLicense = new License({
                    licenseKey: licenseKey,
                    transactionId: data.body.id,
                    platform: 'mercadopago',
                    purchaseDate: formatPurchaseDate(data.body.date_created),
                    expirationDate: expirationDate,
                    currency: data.body.currency_id,
                    used: {
                        status: false,
                        date: 'N/A',
                        program: 'N/A',
                        storeName: 'N/A',
                    },
                    buyer: {
                        firstName: data.body.payer.first_name || 'N/A',
                        lastName: data.body.payer.last_name || 'N/A',
                        email: data.body.payer.email || 'N/A',
                        phoneNumber: data.body.payer.phone.number || 'N/A',
                        id: data.body.payer.id,
                        ip: data.body.additional_info.ip_address || 'N/A',
                    },
                    product: {
                        name: data.body.description,
                        description: '',
                        productId: data.body.order.id,
                        price: data.body.transaction_amount,
                        currency: data.body.currency_id,
                    },
                    status: data.body.status,
                    paymentMethod: data.body.payment_type_id,
                    paymentDetails: {
                        transactionNumber: data.body.id,
                    }
                });

                //3) Guardar la nueva licencia en la base de datos
                await newLicense.save();

                //4) Crear una nueva instancia de Transaction
                const newTransaction = new Transaction({

                    transactionId: data.body.id,
                    platform: 'mercadopago',
                    purchaseDate: formatPurchaseDate(data.body.date_created),
                    currency: data.body.currency_id,
                    buyer: {
                        firstName: data.body.payer.first_name || 'N/A',
                        lastName: data.body.payer.last_name || 'N/A',
                        email: data.body.payer.email || 'N/A',
                        phoneNumber: data.body.payer.phone.number || 'N/A',
                        id: data.body.payer.id,
                        ip: data.body.additional_info.ip_address || 'N/A',
                    },
                    product: {
                        name: data.body.description,
                        description: '',
                        productId: data.body.order.id,
                        price: data.body.transaction_amount,
                        currency: data.body.currency_id,
                        expirationDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
                    },
                    status: data.body.status,
                    paymentMethod: {
                        method: data.body.payment_method_id,
                        typeId: data.body.payment_type_id || 'N/A',
                    }, 
                    paymentDetails: {
                        transactionNumber: data.body.id,
                    }
                });

                //5) Guardar la nueva transaccion en la base de datos
                await newTransaction.save();
                console.log('Transacción guardada con éxito en la base de datos');

                //6) Enviar correo electronico al comprador
                try{
                    await sendEmailPurchase(_email, newTransaction, licenseKey);
                    console.log("PAGO APROBADO");
                }catch (error) {
                    console.log(error);
                    return res.sendStatus(500).json({error: error.message });
                }

            }else if(data.body.status === "rejected"){ //Procesar pagos rechazados
                console.log("Pago rechazado");
            }else if(data.body.status === 'in_process'){
                console.log("Pago en proceso");
            }else if(data.body.status === 'undefined'){
                console.log("data.body.status = undefined");
            }else{ //Procesar otros estados de pago
                console.log("Estado de pago no reconocido:", data.body.status);
            }

        }else if(payment.type === "merchant_order"){ //Procesar webhooks de tipo merchant_order
            console.log("Webhook de tipo merchant_order recibido");
        }else{ //Procesar otros tipos de webhooks
            console.log("Tipo de webhook no reconocido:", payment.type);
        }

    } catch(error){
        console.log(error);
        return res.sendStatus(500).json({error: error.message });
    }
}

function formatPurchaseDate(date){

    const dateObj = new Date(date);
    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const year = dateObj.getFullYear();
    const hours = String(dateObj.getHours()).padStart(2, '0');
    const minutes = String(dateObj.getMinutes()).padStart(2, '0');
    const seconds = String(dateObj.getSeconds()).padStart(2, '0');
    const ampm = dateObj.getHours() >= 12 ? 'PM' : 'AM';

    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds} ${ampm}`;
}

function calculateExpirationDate(purchaseDate, productName){

    const [datePart, timePart, ampm] = purchaseDate.split(' ');
    const [day, month, year] = datePart.split('/').map(Number);
    const [hours, minutes, seconds] = timePart.split(':').map(Number);
    const dateObj = new Date(year, month - 1, day, hours % 12 + (ampm === 'PM' ? 12 : 0), minutes, seconds);

    const lowerCaseProductName = productName.toLowerCase();

    if(lowerCaseProductName.includes("licencia mensual")){
        dateObj.setMonth(dateObj.getMonth() + 1);
    }else if(lowerCaseProductName.includes("licencia semestral")){
        dateObj.setMonth(dateObj.getMonth() + 6);
    }else if(lowerCaseProductName.includes("licencia anual")){
        dateObj.setFullYear(dateObj.getFullYear() + 1);
    }

    const dayStr = String(dateObj.getDate()).padStart(2, '0');
    const monthStr = String(dateObj.getMonth() + 1).padStart(2, '0');
    const yearStr = dateObj.getFullYear();
    const hoursStr = String(dateObj.getHours() % 12).padStart(2, '0');
    const minutesStr = String(dateObj.getMinutes()).padStart(2, '0');
    const secondsStr = String(dateObj.getSeconds()).padStart(2, '0');
    const ampmStr = dateObj.getHours() >= 12 ? 'PM' : 'AM';

    const expirationDate = `${dayStr}/${monthStr}/${yearStr} ${hoursStr}:${minutesStr}:${secondsStr} ${ampmStr}`;

    return expirationDate;
}
