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
        unique: true,
        lowercase: true
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
        let hashedPass = hashPass.digest('hex');
        if(user.pass != hashedPass){
            return retrollamada(new Error(`Pass Incorrecto.`), null);
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
                username: usuario,
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

// Crear un usuario y automáticamente iniciar sesión
// La retrollamada posee la misma firma anterior:
// function(error, token)
usuarioEsquema.statics.crearUsuario = function(usuarioObj, retrollamada){
    // Crear el documento de Usuario
    let UsuarioModel = this;
    const propiedadesRecibidas = Object.getOwnPropertyNames(usuarioObj);

    // Crear un arreglo de validación (true si la propiedad existe, false si no)
    const validaciones = ['username', 'pass', 'primerNombre'].map(function(valor){
        return propiedadesRecibidas.indexOf(valor) > -1;
    });

    // Si hace falta alguna de las propiedades obligatorias, retornar un error
    if(validaciones.indexOf(false) > -1) {
        return retrollamada(new Error("No se recibieron todas las propiedades obligatorias"), null);
    }
    
    // Generar el hash de la contraseña
    let nuevoHash = crypto.createHash('sha256');
    let sal = new Date().toString();
    nuevoHash.update(usuarioObj.pass + sal);

    // Crear el objeto de usuario base
    let prototipoUsuario = {
        username: usuarioObj.username,
        pass: nuevoHash.digest('hex'),
        sal,
        primerNombre: usuarioObj.primerNombre,
        notas: []
    };

    // Agregar el valor opcional al objeto de usuario(si existe)
    if(usuarioObj.primerApellido) prototipoUsuario.primerApellido = usuarioObj.primerApellido;

    // Crear un documento
    let nuevoUsuario = new UsuarioModel(prototipoUsuario);

    // Insertar el documento en la base de datos
    nuevoUsuario.save(function(saveError, documento){
        if(saveError) return retrollamada(saveError, null);

        // Crear una sesión y retornar la sesión a través de la retrollamada
        UsuarioModel.iniciarSesion(documento.username, usuarioObj.pass, retrollamada);
    });
};

// Crear una nota con los datos Titulo:String, Contenido:String, esFija:Boolean
// La firma de la retrollamada es la siguiente:
// function(error, objetoNota)
usuarioEsquema.methods.crearNota = function(datosNota, retrollamada){
    let proxy = this;

    // Realizando las validaciones básicas
    const propiedadesRecibidas = Object.getOwnPropertyNames(datosNota);
    let validaciones = ['titulo', 'contenido', 'esFija'].map(function(valor){
        return propiedadesRecibidas.indexOf(valor) > -1;
    });

    if(validaciones.indexOf(false)){
        return retrollamada(new Error("No se recibieron los datos obligatorios completos."), null);
    }

    // Agregar la nota al arreglo del usuario
    proxy.notas.push(datosNota);

    // Guardar los cambios en la base de datos
    proxy.save(function(saveError, doc){
        if(saveError) return retrollamada(saveError, null);

        // Retornar la última nota insertada (para que contenga el _id generado por mongo)
        retrollamada(null, doc.notas[doc.notas.length - 1]);
    });
};

module.exports = mongoose.model('Usuario', usuarioEsquema);