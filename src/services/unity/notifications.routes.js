import express from "express";
import Notification from "../../models/notification.model.js";

const router = express.Router();

router.get('/api/getNotifications', async (req, res) => {

    try{

        const currentDate = new Date();
        const day = String(currentDate.getDate()).padStart(2, '0');
        const month = String(currentDate.getMonth() + 1).padStart(2, '0');
        const year = currentDate.getFullYear();

        const formattedDate = `${day}/${month}/${year}`; //Fecha actual en dd/mm/yyyy

        const notificationData = await Notification.find({ //Notificaciones cuyas fecha actual estén entre la creation y expiration
            "date.creation": { $lte: formattedDate}, 
            "date.expiration": { $gte: formattedDate},
        });

        if(!notificationData || notificationData.length === 0){
            return res.status(404).send('No se encontraron notificaciones con ese filtro.')
        }

        res.json(notificationData);

    }catch(error){
        console.error('Error al buscar notificaciones:', error);
        res.status(500).send('Error al buscar notificaciones:', error);
    }

});

export default router;