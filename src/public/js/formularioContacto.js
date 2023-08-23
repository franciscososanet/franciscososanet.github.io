import axios from "axios";

document.getElementById('form').addEventListener('submit', async (e) => {

    e.preventDefault();

    const data = {
        name: e.target.name.value,
        email: e.target.email.value,
        title: e.target.title.value,
        message: e.target.message.value
    };

    try{
    
        const response = await axios.post('/sendContactEmail', data);
        
        if(response.status === 200){
            alert("Mensaje enviado exitosamente!");
        }else{
            alert("Ocurrió un error al enviar el mensaje.");
        }

    }catch(error){
        console.error('Hubo un error al enviar el formulario:', error);
        alert("Error al enviar el mensaje. Por favor, inténtalo de nuevo.");
    }
});
