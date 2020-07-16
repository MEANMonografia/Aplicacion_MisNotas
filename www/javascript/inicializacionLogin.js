(function() {
    let token = localStorage.getItem("notasToken");
    // console.log(token)
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
        fetch("/api/crud/getnotas", opcionesFetch).then(function(response){
            return response.text();
        }).then(function(valor){
            let respuesta = JSON.parse(valor);
            if (respuesta.error){ 
                localStorage.removeItem("notasToken");
                sessionStorage.removeItem("notas");
                return console.error(respuesta.error);
            }
            // console.log(respuesta.notas);
            sessionStorage.setItem("notas", JSON.stringify(respuesta.notas));
            window.location.replace('/principal');
        }).catch(function(error){
            console.error(error);
        });
    }
})();

