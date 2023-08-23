const form = document.getElementById("formcontacto");

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

        if(response.ok){
            const responseData = await response.json();
            alert(responseData.message);
        }else {
            const responseData = await response.json();
            alert(responseData.message);
        }
    }catch (error){
        console.error('Hubo un error al enviar el mensaje:', error);
        alert('Error al enviar el mensaje. Por favor, inténtalo de nuevo.');
    }
});
