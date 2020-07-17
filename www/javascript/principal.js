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
    // Estilo para difuminar toda la aplicación al mostrar una caja modal
    const estiloDifuminado = 'difuminar';
    // Ordena las notas para posicionar las notas fijas de primero (de la más reciente a la más antigua)
    const ordenarNotas = function(){
        proxy.empty = proxy.notas.length < 1;
        proxy.notasOrdenadas = proxy.notas;
        proxy.notasOrdenadas.sort(function(a, b){
            if(a.esFija && b.esFija) return 0;
            if(a.esFija) return -1;
            if(b.esFija) return 1;
            return 0;
        });
    };

    // Dividir las notas en filas para poder recorrerlas de una forma más intuitiva en la vista
    const trozear = function(){
        const partesIguales = 4;
        let longitudTotal = proxy.notasOrdenadas.length;
        let extra = longitudTotal % partesIguales;
        let filas = (longitudTotal-extra)/partesIguales;
        let retorno = [];
        for(let i = 0; i < filas; i++){
            let actual = [];
            for(let j = 0; j < partesIguales; j++){
                actual.push(proxy.notasOrdenadas[(i*partesIguales)+j]);
            }
            retorno.push(actual);
        }
        let datosExtra = [];
        for(let j = 0; j < extra; j++) datosExtra.push(proxy.notasOrdenadas[proxy.notasOrdenadas.length - extra + j]);
        retorno.push(datosExtra);
        return retorno;
    };

    // ------------ funciones basicas para modales
    const manejadorBase = {
        hacerPeticion: function(){
            switch(this.tipo){
                case 'crear':
                    servicioPrincipal.crearNota({
                        titulo: proxy.modalDatos.notaTitulo,
                        contenido: proxy.modalDatos.notaContenido,
                        esFija: proxy.modalDatos.notaEsFija? true:false
                    }, function(respuesta){
                        if(respuesta.error) {
                            console.error(respuesta.error);
                            alert('Sesión expirada!');
                            return proxy.cerrarSesion();
                        }
                        proxy.notas.push(respuesta.estructuraNota);
                        ordenarNotas();
                        proxy.notasPorFilas = trozear();
                        sessionStorage.setItem('notas', JSON.stringify(proxy.notas));
                        $scope.$apply();
                    });
                    break;
                case 'modificar':
                    servicioPrincipal.modificarNota({
                        _id: proxy.modalDatos._id,
                        titulo: proxy.modalDatos.notaTitulo,
                        contenido: proxy.modalDatos.notaContenido,
                        esFija: proxy.modalDatos.notaEsFija?true:false
                    }, function(respuesta){
                        if(respuesta.error) {
                            console.error(respuesta.error);
                            alert('Sesión expirada!');
                            return proxy.cerrarSesion();
                        }
                        let i = -1;
                        for(i = 0; i < proxy.notas.length; i++){
                            if(proxy.notas[i]._id === respuesta.estructuraNota._id){
                                break;
                            }
                        }
                        proxy.notas.splice(i, 1, respuesta.estructuraNota);
                        ordenarNotas();
                        proxy.notasPorFilas = trozear();
                        sessionStorage.setItem('notas', JSON.stringify(proxy.notas));
                        $scope.$apply();
                    });
                    break;
            }
            cerrarModal();
        },
        autodestruir: function(){
            let respaldoLocal = proxy.modalDatos;
            servicioPrincipal.eliminarNotas([respaldoLocal._id], function(respuesta){
                if(respuesta.error){
                    console.error(respuesta.error);
                    alert('Sesión expirada!');
                    return proxy.cerrarSesion();
                }
                let i = -1;
                for(i = 0; i < proxy.notas.length; i++){
                    if(proxy.notas[i]._id === respaldoLocal._id){
                        break;
                    }
                }
                proxy.notas.splice(i, 1);
                ordenarNotas();
                proxy.notasPorFilas = trozear();
                sessionStorage.setItem('notas', JSON.stringify(proxy.notas));
                $scope.$apply();
            });
            cerrarModal();
        },
        clickExterno: function(evt){
            this.cancelar(evt);
        },
        clickInterno: function(evt){
            evt.stopPropagation();
        },
        enviar: function(evt){
            evt.stopPropagation();
            this.hacerPeticion();
        },
        cancelar: function(evt){
            evt.stopPropagation();
            cerrarModal();
        },
        eliminar: function(evt){
            evt.stopPropagation();
            this.autodestruir();
        }
    }

    const abrirModal = function(datos){
        proxy.estiloSegundoPlano = estiloDifuminado;
        proxy.modalDatos = Object.assign(datos, manejadorBase);
    };
    const cerrarModal = function(){
        proxy.modalDatos = null;
        proxy.estiloSegundoPlano = null;
    };
    // Obtener el arreglo de notas de sessionStorage
    proxy.notas = JSON.parse(sessionStorage.getItem('notas'));
    // Si el arreglo está vacío, empty es verdadero
    proxy.empty = proxy.notas.length < 1;
    proxy.notasOrdenadas = proxy.notas;
    proxy.estiloSegundoPlano = null;
    ordenarNotas();
    proxy.notasPorFilas = trozear();
    proxy.crearNota = function(){
        abrirModal({
            textoTipo: "Crear Nota",
            tipo: "crear"
        });
    };

    proxy.modificarNota = function(nota){
        abrirModal({
            textoTipo: "Modificar Nota",
            tipo: "modificar",
            _id: nota._id,
            notaTitulo: nota.titulo,
            notaContenido: nota.contenido,
            notaEsFija: nota.esFija
        });
    }

    proxy.cerrarSesion = function(){
        localStorage.removeItem('notasToken');
        sessionStorage.removeItem('notas');
        window.location.assign('/');
    }

    servicioPrincipal.getIdentidad(function(respuesta){
        proxy.datosUsuario = respuesta.usuario;
        proxy.nombreUsuario = respuesta.usuario.primerNombre + 
          (respuesta.usuario.primerApellido? ' ' + respuesta.usuario.primerApellido: '');
        $scope.$apply();
    });
}]);

// ------------------------------ DIRECTIVA NOTA ------------------------------------
ModuloPrincipal.directive("directivaNota", [function(){
    return {
        restrict: 'E',
        scope: {
            datosNota: '=informacion',
            manejadorClick: '&retrollamada'
        },
        templateUrl: './recursos/nota.html'
    };
}]);

// ------------------------------ DIRECTIVA MODAL ------------------------------------
ModuloPrincipal.directive("directivaModal", [function(){
    return {
        restrict: 'E',
        scope: {
            referenciaNota: '=informacion'
        },
        templateUrl: './recursos/modal.html'
    };
}]);