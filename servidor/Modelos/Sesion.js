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

sesionEsquema.statics.esValidaYExiste = function(username, retrollamada){
    let proxy = this;
    proxy.findOne({username: username, valido: true}, function(error, sesion){
        if(error) return retrollamada(error, null, false);
        if(!sesion) return retrollamada(null, null, false);
        let diferenciaDeFechas = Date.now() - sesion.fechaCreacion.getTime();
        if(diferenciaDeFechas < sesion.periodoValidez){
            proxy.updateOne({_id: sesion._id}, 
                {$set: {fechaCreacion: new Date(), fechaExpiracion: new Date(Date.now() + sesion.periodoValidez)}}, 
                function(error){
                if(error) return retrollamada(error, null, false);
                else retrollamada(null, sesion.token, true);
            });
        } else {
            proxy.updateOne({_id: sesion._id}, { $set: {valido: false}}, function(error){
                if(error) return retrollamada(error, null, false);
                retrollamada(null, null, false);
            });
        }
    });
};

module.exports = mongoose.model("Sesion", sesionEsquema);