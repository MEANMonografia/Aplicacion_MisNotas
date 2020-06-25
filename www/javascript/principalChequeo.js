(function(){
    let token = localStorage.getItem("notasToken");
    let notas = sessionStorage.getItem("notas");
    if(token){
        if(!notas){
            window.location.replace('/');
        }
        // chequeo de validez
        const cuerpo = JSON.stringify({ token: token });
        const opcionesFetch = {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: cuerpo
        };

        fetch('/api/crud/getnotas', opcionesFetch).then(function(objetoResponse){
            return objetoResponse.text();
        }).then(function(respuestaTexto){
            let respuesta = JSON.parse(respuestaTexto);
            if(respuesta.error){
                localStorage.removeItem("notasToken");
                sessionStorage.removeItem("notas");
                return window.location.assign('/');
            }
            sessionStorage.setItem("notas", JSON.stringify(respuesta.notas));
        }).catch(function(error){
            console.error(error);
        });
    } else {
        window.location.replace('/');
    }
})();