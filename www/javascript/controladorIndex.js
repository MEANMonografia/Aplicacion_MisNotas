angular.module("MainModule")
.controller("controladorIndex", ['$scope', function ($scope) {
        let controladorIndex = this;
        controladorIndex.mensajeError = "";
        let almacenamientoLocal = localStorage;
        controladorIndex.login = function (event) {
            event.preventDefault();
            controladorIndex.mensajeError="";
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
                almacenamientoLocal.setItem("valor", respuesta.token);
                console.log("Aca redireccionamos con el token")
            })
            .catch(function (error) {
                console.error(error);
            });
        }
    }
]);