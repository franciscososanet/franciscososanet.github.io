import express from 'express';
import License from '../../models/license.model.js';

const router = express.Router();

router.post('/api/activateLicense', async (req, res) => {

    try{

        console.log(req.body);

        const { licenseKey, currentDate, programType, storeName } = req.body;

        const licenseData = await License.findOne({ licenseKey: licenseKey });
        if(!licenseData) return res.status(404).json({ message: 'Licencia no válida' });

        const used = licenseData.used.status;
        if(used) return res.status(404).json({ message: 'Licencia en uso' });

        const purchaseDate = licenseData.purchaseDate;
        const expirationDate = licenseData.expirationDate;

        licenseData.used = { //Actualizar el licencia.used en DB con los datos recibidos desde Unity
            status: true,
            date: currentDate,
            program: programType,
            storeName: storeName,
        }
        await licenseData.save();
        

        res.status(200).json({
            message: 'Licencia activada exitosamente',
            purchaseDate: purchaseDate,
            expirationDate: expirationDate,
        });

    }catch(error){

        console.log('Error al activar la licencia:', error);
        res.status(500).json({ message: 'Error al activar la licencia' });
    }
})

export default router;