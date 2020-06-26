const modulo = angular.module("MainModule",[]);
modulo.controller("controladorIndex", ['$scope', function ($scope) {
    let controladorIndex = this;
    let mensajeTextoFooterRegistro = "¿Eres nuevo usuario?";
    let mensajeTextoFooterLogin = "¿Ya eres usuario?";
    let mensajeBotonLogin = "INGRESAR";
    let mensajeBotonRegistro = "REGISTRAR";
    controladorIndex.mensajeError = "";
    controladorIndex.controlSwitch = false;
    controladorIndex.btnPrincipal = mensajeBotonLogin;
    controladorIndex.mensajeFooter = mensajeTextoFooterRegistro;
    controladorIndex.login = function (event) {
        event.preventDefault();
        if(!controladorIndex.txtUsername){
            controladorIndex.mensajeError = "El campo 'Nombre de Usuario' es requerido";
            return;
        }
        if(!controladorIndex.txtPassword){
            controladorIndex.mensajeError = "El campo 'Contraseña' es requerido";
            return;
        }
        controladorIndex.mensajeError = "";
        if (!controladorIndex.controlSwitch) {
            let cuerpo = JSON.stringify({
                username: controladorIndex.txtUsername,
                pass: controladorIndex.txtPassword
            });
            let opcionesFetch = {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: cuerpo
            };
            fetch("/api/login", opcionesFetch)
                .then(function (response) {
                    return response.text();
                })
                .then(function (valor) {
                    let respuesta = JSON.parse(valor);
                    if (!respuesta.token) {
                        controladorIndex.mensajeError = respuesta.error;
                        return $scope.$apply();
                    }
                    localStorage.setItem("notasToken", respuesta.token);
                    window.location.assign('/principal');
                })
                .catch(function (error) {
                    console.error(error);
                });
        }
        else{
            if(!controladorIndex.txtNombre){
                controladorIndex.mensajeError = "El campo 'Nombre' es requerido";
                return;
            }
            if(!controladorIndex.txtConfirmPassword){
                controladorIndex.mensajeError = "El campo 'Confirmar Contraseña' es requerido";
                return;
            }
            if(controladorIndex.txtPassword !== controladorIndex.txtConfirmPassword){
                controladorIndex.mensajeError = "El campo 'Confirmar Contraseña' no coincide con 'Contraseña'";
                return;
            }
            let cuerpoRegistrar = JSON.stringify({
                username: controladorIndex.txtUsername,
                pass: controladorIndex.txtPassword,
                primerNombre: controladorIndex.txtNombre,
                primerApellido: controladorIndex.txtApellido? controladorIndex.txtApellido: null
            });
            let opcionesFetchRegistrar = {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: cuerpoRegistrar
            };
            fetch("/api/registrar", opcionesFetchRegistrar)
                .then(function (response) {
                    return response.text();
                })
                .then(function (valor) {
                    let respuesta = JSON.parse(valor);
                    if (!respuesta.token) {
                        controladorIndex.mensajeError = respuesta.error;
                        return $scope.$apply();
                    }
                    localStorage.setItem("notasToken", respuesta.token);
                    window.location.assign('/principal');
                })
                .catch(function (error) {
                    console.error(error);
                });
        }

    }
    controladorIndex.ngMostrarRegistro = function () {
        controladorIndex.mensajeFooter = controladorIndex.mensajeFooter == mensajeTextoFooterRegistro ? mensajeTextoFooterLogin : mensajeTextoFooterRegistro;
        controladorIndex.btnPrincipal = controladorIndex.btnPrincipal == mensajeBotonLogin ? mensajeBotonRegistro : mensajeBotonLogin;
        controladorIndex.controlSwitch = !controladorIndex.controlSwitch;
    }
}]);