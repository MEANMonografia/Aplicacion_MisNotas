const crypto = require('crypto');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const notaEsquema = require('./Esquemas/Nota');
const SesionModelo = require('./Sesion');
const Globales  = require('../../Globales');

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

// Iniciar sesion con un usuario y una contraseña
// La retrollamada tendría la firma:
// function(error, token)
usuarioEsquema.statics.iniciarSesion = function(usuario, pass, retrollamada){
    let proxy = this;
    // Verificar que el usuario existe
    proxy.findOne({username: usuario}, function(error, user){
        if(error) return retrollamada(error, null);
        if(!user) return retrollamada(new Error("No se encuentra el nombre de usuario"), null);
        // Verificar que la contraseña es correcta
        const hashPass = crypto.createHash('sha256');
        hashPass.update(pass + user.sal);
        let hashedPass = hash.digest('hex');
        if(user.pass != hashedPass){
            return retrollamada(new Error("Pass incorrecto"), null);
        }
        // Verificar si la sesión existe y sigue siendo válida (de lo contrario, crear una)
        SesionModelo.esValidaYExiste(usuario, function(error, token, existe){
            if(error) return retrollamada(error, null);
            if(existe) return retrollamada(null, token);
            // Generar un nuevo Token
            const tokenHash = crypto.createHash('sha256');
            tokenHash.update(hashedPass + Date.now().toString());
            // Construir nueva sesión utilizando la validez global
            let nuevaSesion = new SesionModelo({
                nombreUsuario: usuario,
                token: tokenHash.digest('hex'),
                valido: true,
                fechaCreacion: new Date(),
                fechaExpiracion: new Date(Date.now() + Globales.VALIDEZ_SESION),
                periodoValidez: Globales.VALIDEZ_SESION
            });

            // Insertar la nueva sesion en la base de datos y retornar el token generado
            nuevaSesion.save(function(saveError, documento){
                if(saveError) return retrollamada(saveError, null);
                retrollamada(null, documento.token);
            });
        });
    });
};

usuarioEsquema.statics.crearUsuario = function(usuarioObj, retrollamada){
    // Crear el documento de Usuario
    // Crear una sesión y retornar la sesión
};

module.exports = mongoose.model('Usuario', usuarioEsquema);