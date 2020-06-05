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

// Determinar si existe una sesion valida asociada al usuario solicitado
// La firma de la retrollamada es:
// function(error, token)
sesionEsquema.statics.esValidaYExiste = function(username, retrollamada){
    let proxy = this;
    proxy.findOne({username: username, valido: true}, function(error, sesion){
        if(error) return retrollamada(error, null);
        if(!sesion) return retrollamada(null, null);
        let diferenciaDeFechas = Date.now() - sesion.fechaCreacion.getTime();
        if(diferenciaDeFechas < sesion.periodoValidez){
            proxy.updateOne({_id: sesion._id}, 
                {$set: {fechaCreacion: new Date(), fechaExpiracion: new Date(Date.now() + sesion.periodoValidez)}}, 
                function(error){
                if(error) return retrollamada(error, null);
                else retrollamada(null, sesion.token);
            });
        } else {
            proxy.updateOne({_id: sesion._id}, { $set: {valido: false}}, function(error){
                if(error) return retrollamada(error, null);
                retrollamada(null, null);
            });
        }
    });
};

// Utilizando un token en lugar de usuario, determinar si la sesion existe y sigue siendo valida
// La firma de la retrollamada es la siguiente:
// function(error, objSesion)
sesionEsquema.statics.encontrarPorToken = function(token, retrollamada){
    let proxy = this;
    proxy.findOne({ token: token, valido: true}, function(findError, sesion){
        if(findError) return retrollamada(findError, null);
        retrollamada(null, sesion);
    });
};

module.exports = mongoose.model("Sesion", sesionEsquema);