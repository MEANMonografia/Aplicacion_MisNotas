const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let notaEsquema = new Schema({
    titulo: {
        type: String,
        required: true
    },
    contenido: String,
    fechaCreacion: {
        type: Date,
        required: true
    },
    ultimaEdicion: {
        type: Date,
        required: true
    }
});

module.exports = notaEsquema;