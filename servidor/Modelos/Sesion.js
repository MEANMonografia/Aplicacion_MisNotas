const mongoose = require('mongoose');

const Schema = mongoose.Schema;

let sesionEsquema = new Schema({
    idUsuario: {
        type: mongoose.Types.ObjectId,
        required: true
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

module.exports = mongoose.model("Sesion", sesionEsquema);