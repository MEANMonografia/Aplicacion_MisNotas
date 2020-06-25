const ModuloPrincipal = angular.module("ModuloPrincipal");

// ------------------------------ SERVICIO ------------------------------------
ModuloPrincipal.factory("ServicioPrincipal", [function(){
    let servicioPrincipal = {
        token: localStorage.getItem('notasToken'),
        enviarPeticion: function(ruta, cuerpo, retrollamada){
            fetch(ruta, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(cuerpo)
            }).then(function(objetoResponse){
                return objetoResponse.text();
            }).then(function(respuestaTexto){
                let respuesta = JSON.parse(respuestaTexto);
                retrollamada(respuesta);
            }).catch(function(error){
                console.error(error);
            });
        },
        crearNota: function(objetoNota, retrollamada){
            let cuerpo = {
                token: this.token,
                estructuraNota:{
                    titulo: objetoNota.titulo,
                    contenido: objetoNota.contenido,
                    esFija: objetoNota.esFija
                }
            };
            this.enviarPeticion('/api/crud/crear', cuerpo, retrollamada);
        },
        modificarNota: function(objetoNota, retrollamada){
            let cuerpo = {
                token: this.token,
                estructuraNota: {
                    _id: objetoNota._id,
                    titulo: objetoNota.titulo,
                    contenido: objetoNota.contenido,
                    esFija: objetoNota.esFija
                }
            };
            this.enviarPeticion('/api/crud/modificar', cuerpo, retrollamada);
        },
        eliminarNotas: function(idsNotas, retrollamada){
            let cuerpo = {
                token: this.token,
                ids: idsNotas
            };
            this.enviarPeticion('/api/crud/eliminar', cuerpo, retrollamada);
        },
        getNotas: function(retrollamada){
            let cuerpo = { token: this.token };
            this.enviarPeticion('/api/crud/getnotas', cuerpo, retrollamada);
        },
        setNotasFijas: function(idsNotas, retrollamada){
            let cuerpo = {
                token: this.token,
                ids: idsNotas
            };
            this.enviarPeticion('/api/crud/setnotasfijas', cuerpo, retrollamada);
        }
    };
    return servicioPrincipal;
}]);

// ------------------------------ CONTROLADOR ------------------------------------
ModuloPrincipal.controller("ControladorPrincipal", ['ServicioPrincipal', function(servicioPrincipal){
    let proxy = this;
    proxy.notas = sessionStorage.getItem('notas');
}]);