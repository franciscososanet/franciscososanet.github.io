const form = document.getElementById("formcontacto");

//Referencias a elementos del modal
const modalTitle = document.querySelector('.email__modal-title');
const modalIcon = document.getElementById('modal-icon');
const modalText = document.querySelector('.email__modal-text');
const emailModal = document.querySelector('.email__modal');
const modalClose = document.querySelector('.email__modal-close');

modalClose.addEventListener('click', () => {
    emailModal.classList.remove('active-modal');
});

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const data = {
        name: form.elements["name"].value,
        email: form.elements["email"].value,
        title: form.elements["title"].value,
        message: form.elements["message"].value
    };

    try{
        const response = await fetch('/sendEmail', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        const responseData = await response.json();
        
        if(response.ok){
            modalTitle.textContent = "¡Mensaje enviado!";
            modalIcon.src = "https://i.imgur.com/BQMyUI8.png";
            modalText.textContent = `Gracias ${data.name} por contactarte con nosotros.\nTe responderemos a la brevedad.`;
        }else{
            modalTitle.textContent = "Error al enviar el mensaje";
            modalIcon.src = "https://i.imgur.com/1erhHPe.png";
            modalText.textContent = "Ocurrió un error al envíar el correo. Asegúrate de haber escrito bien tu dirección email."
            console.log(responseData.message);
        }
        emailModal.classList.add('active-modal');

    }catch(error){

        modalTitle.textContent = "Error al enviar el mensaje";
        modalIcon.src = "https://i.imgur.com/1erhHPe.png";
        modalText.textContent = 'Error al enviar el mensaje. Por favor, inténtalo de nuevo.';
        emailModal.classList.add('active-modal');
        console.log('Hubo un error al enviar el mensaje:', error);
    }
});
