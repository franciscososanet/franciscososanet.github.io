import { Router } from "express";
import { captureOrder, createOrder, cancelPayment } from "./paypal.controller.js";

const router = Router();

router.post('/paypal/create-order', createOrder);
router.get('/capture-order', captureOrder)
router.get('/cancel-order', cancelPayment)

export default router;