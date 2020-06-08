const mongoose = require('mongoose');

const Schema = mongoose.Schema;

let sesionEsquema = new Schema({
    username: {
        type: String,
        required: true,
        lowercase: true
    },
    token: {
        type: String,
        required: true,
        unique: true
    },
    valido: {
        type: Boolean,
        required: true
    },
    fechaCreacion: {
        type: Date,
        required: true
    },
    fechaExpiracion: {
        type: Date,
        required: true
    },
    periodoValidez: {
        type: Number,
        required: true
    }
});

// Determinar si la sesión actual es válida
// La firma de la retrollamada es:
// function(error: Error, esValida: Boolean)
sesionEsquema.methods.esValida = function(retrollamada){
    let sesion = this;
    let diferenciaDeFechas = Date.now() - sesion.fechaCreacion.getTime();
    if(diferenciaDeFechas < sesion.periodoValidez){
        sesion.fechaCreacion = new Date();
        sesion.fechaExpiracion = new Date(Date.now() + sesion.periodoValidez);
    } else {
        sesion.valido = false;
    }
    let respuesta = sesion.valido;

    sesion.save(function(saveError, docSesion){
        if(saveError) return retrollamada(saveError, false);
        retrollamada(null, respuesta);
    });
};

// Determinar si existe una sesion válida asociada al usuario solicitado
// La firma de la retrollamada es:
// function(error: Error, token: String)
sesionEsquema.statics.esValidaYExiste = function(username, retrollamada){
    let proxy = this;
    proxy.findOne({username: username, valido: true}, function(error, sesion){
        if(error) return retrollamada(error, null);
        if(!sesion) return retrollamada(null, null);
        sesion.esValida(function(validaError, validez){
            if(validaError) return retrollamada(validaError, null);
            if(!validez) return retrollamada(null, null);
            retrollamada(null, sesion.token);
        });
    });
};

// Utilizando un token en lugar de usuario, determinar si la sesion existe y sigue siendo valida
// La firma de la retrollamada es la siguiente:
// function(error: Error, objSesion: Object)
sesionEsquema.statics.encontrarPorToken = function(token, retrollamada){
    let proxy = this;
    proxy.findOne({ token: token, valido: true}, function(findError, sesion){
        if(findError) return retrollamada(findError, null);
        if(!sesion) return retrollamada(new Error("Token inválido o expirado"), null);
        sesion.esValida(function(validaError, valida){
            if(validaError) return retrollamada(validaError, null);
            if(!valida) return retrollamada(new Error("Token expirado"), null);
            retrollamada(null, sesion);
        });
    });
};

module.exports = mongoose.model("Sesion", sesionEsquema);