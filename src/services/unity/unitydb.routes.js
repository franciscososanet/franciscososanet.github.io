import express from "express";
import License from "../../models/license.model.js";

const router = express.Router();

router.get('/api/getUnityDb', async (req, res) => {

    try{
        const licenseData = await License.findOne({ licenseKey: 'V4X1-KYFD-XGI8-YTZJ'})

        if(!licenseData){
            res.status(404).send('Licencia no valida');
        }

        res.json({
            buyer:{
                email: licenseData.buyer.email,
                ip: licenseData.buyer.ip
            }
        });
    }
    catch(error){
        res.status(500).send('Error al capturar la licencia');
    }


});


export default router;