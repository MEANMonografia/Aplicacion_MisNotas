const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const notaEsquema = require('./Esquemas/Nota');
const SesionModelo = require('./Sesion');

let usuarioEsquema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    pass: {
        type: String,
        required: true
    },
    sal: {
        type: Date,
        required: true
    },
    primerNombre: {
        type: String,
        required: true
    },
    primerApellido: String,
    notas: [notaEsquema]
});

usuarioEsquema.statics.iniciarSesion = function(usuario, pass, retrollamada){
    let proxy = this;
    proxy.findOne({username: usuario}, function(error, user){
        if(error) return retrollamada(error, null);
        if(!user) return retrollamada(new Error("No se encuentra el nombre de usuario"), null);
        SesionModelo.esValidaYExiste(usuario, function(error, token, existe){
            if(error) return retrollamada(error, null);
            if(existe) return retrollamada(null, token);
            // Construir nueva sesión utilizando la validez global
            // let nuevaSesion = 
        });
    });
};

module.exports = mongoose.model('Usuario', usuarioEsquema);