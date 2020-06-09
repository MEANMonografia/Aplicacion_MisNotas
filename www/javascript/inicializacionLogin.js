$(document).ready(function() {
    let almacenamientoLocal = localStorage;
    let almacenamientoTemporal = sessionStorage;
    let token = almacenamientoLocal.getItem("valor");
    console.log(token)
    if (token) {   
        let cuerpo = JSON.stringify({
            token: token
        });
        let opcionesFetch = {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: cuerpo
        };
        fetch("http://localhost:3000/api/crud/getnotas", opcionesFetch)
        .then(function (response) {
            return response.text();
        })
        .then(function (valor) {
            let respuesta = JSON.parse(valor);
            // crear un css pop-up para mostrar este error
            if (respuesta.error) return console.error(respuesta.error);
            console.log(respuesta.notas);
            almacenamientoTemporal.setItem("notas", respuesta.notas);
            console.log("Aca redirigimos si entra a Login y tiene sesion activa");
        })
        .catch(function (error) {
            console.error(error);
        });
    }
});