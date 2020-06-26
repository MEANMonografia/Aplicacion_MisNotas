const ModuloPrincipal = angular.module("ModuloPrincipal", []);

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
        },
        getIdentidad: function(retrollamada){
            let cuerpo = { token: this.token };
            this.enviarPeticion('/api/crud/getidentidad', cuerpo, retrollamada);
        }
    };
    return servicioPrincipal;
}]);

// ------------------------------ CONTROLADOR ------------------------------------
ModuloPrincipal.controller("ControladorPrincipal", ['ServicioPrincipal', '$scope', function(servicioPrincipal, $scope){
    let proxy = this;
    const ordenarNotas = function(){
        proxy.notas.sort(function(a, b){
            if(a.esFija) return -1;
            if(b.esFija) return 1;
            return 0;
        });
    };
    const trozear = function(){
        let longitudTotal = proxy.notas.length;
        let extra = longitudTotal % 4;
        let filas = (longitudTotal-extra)/4;
        let retorno = [];
        for(let i = 0; i < filas; i++){
            let actual = [];
            for(let j = 0; j < 4; j++){
                actual.push(proxy.notas[(i*4)+j]);
            }
            retorno.push(actual);
        }
        let datosExtra = [];
        for(let j = 0; j < extra; j++) datosExtra.push(proxy.notas[proxy.notas.length - extra + j]);
        retorno.push(datosExtra);
        return retorno;
    };
    proxy.notas = JSON.parse(sessionStorage.getItem('notas'));
    proxy.empty = proxy.notas.length < 1;
    ordenarNotas();
    proxy.notasPorFilas = trozear();
    proxy.crearNota = function(){
        console.log("+Crear presionado");
    };
    servicioPrincipal.getIdentidad(function(respuesta){
        proxy.datosUsuario = respuesta.usuario;
        console.log(proxy.datosUsuario);
        proxy.nombreUsuario = respuesta.usuario.primerNombre + 
          (respuesta.usuario.primerApellido? ' ' + respuesta.usuario.primerApellido: '');
        $scope.$apply();
    });
}]);

// ------------------------------ DIRECTIVA ------------------------------------
ModuloPrincipal.directive("directivaNota", [function(){
    return {
        restrict: 'E',
        scope: {
            datosNota: '=informacion'
        },
        templateUrl: './recursos/nota.html'
    };
}]);