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
        if (!controladorIndex.controlSwitch) {
            controladorIndex.mensajeError = "";
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
            fetch("http://localhost:3000/api/login", opcionesFetch)
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
            controladorIndex.mensajeError = "";
            let cuerpoRegistrar = JSON.stringify({
                username: controladorIndex.txtUsername,
                pass: controladorIndex.txtPassword,
                primerNombre: controladorIndex.txtName
            });
            let opcionesFetchRegistrar = {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: cuerpoRegistrar
            };
            fetch("http://localhost:3000/api/registrar", opcionesFetchRegistrar)
                .then(function (response) {
                    return response.text();
                })
                .then(function (valor) {
                    let respuesta = JSON.parse(valor);
                    console.log(respuesta)
                    if (!respuesta.token) {
                        controladorIndex.mensajeError = respuesta.error;
                        return $scope.$apply();
                    }
                    localStorage.setItem("notasToken", respuesta.token);
                    console.log("Aca redireccionamos con el token recibido de regreso");
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