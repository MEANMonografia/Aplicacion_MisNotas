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
            return retrollamada(new Error("Pass Incorrecto."), null);
        }
        // Verificar si la sesión existe y sigue siendo válida (de lo contrario, crear una)
        SesionModelo.esValidaYExiste(usuario, function(error, token){
            if(error) return retrollamada(error, null);
            if(token) return retrollamada(null, token);
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

// Encontrar al usuario dueño de un token y crear una nueva nota
// La firma de la retrollamada es la siguiente:
// function(error, objetoNota)
usuarioEsquema.statics.crearNota = function(token, datosNota, retrollamada){
    let proxy = this;
    // Realizando las validaciones básicas
    if(!datosNota){
        return retrollamada(new Error("No se recibio el campo esperado 'estructuraNota'"), null);
    }
    const propiedadesRecibidas = Object.getOwnPropertyNames(datosNota);
    let validaciones = ['titulo', 'contenido', 'esFija'].map(function(valor){
        return propiedadesRecibidas.indexOf(valor) > -1;
    });
    
    if(validaciones.indexOf(false) > -1){
        return retrollamada(new Error("Datos recibidos incorrectos/incompletos"), null);
    }

    // Encontrando la sesion por token
    SesionModelo.encontrarPorToken(token, function(encontrarError, sesion){
        if(encontrarError) return retrollamada(encontrarError, null);
        if(!sesion) return retrollamada(new Error("No existe una sesion valida pertenenciente al token recibido."), null);
        // Verificar si la sesion es válida
        sesion.esValida(function(validaError, esValida){
            if(validaError) return retrollamada(validaError, null);
            if(!esValida) return retrollamada(new Error("Token expirado"), null);
            // Encontrar el usuario asociado a la sesion
            proxy.findOne({username: sesion.username}, function(findError, usuario){
                if(findError) return retrollamada(findError, null);
                // Insertar la nota y retornar el documento de la nueva nota insertada
                usuario.insertarNota(datosNota, function(insertarError, docNota){
                    if(insertarError) return retrollamada(insertarError, null);
                    if(!docNota) return retrollamada(new Error("No se obtuvo el documento de la nota insertada"), null);
                    retrollamada(null, docNota);
                });
            });
        });
    });
};


// Insertar una nota con los datos Titulo:String, Contenido:String, esFija:Boolean
// La firma de la retrollamada es la siguiente:
// function(error, objetoNota)
usuarioEsquema.methods.insertarNota = function(datosNota, retrollamada){
    let proxy = this;

    // Crear el objeto nota
    let nuevaNota = {
        titulo: datosNota.titulo,
        contenido: datosNota.contenido,
        fechaCreacion: new Date(),
        ultimaEdicion: new Date(),
        esFija: datosNota.esFija
    };

    // Agregar la nota al arreglo del usuario
    proxy.notas.push(nuevaNota);

    // Guardar los cambios en la base de datos
    proxy.save(function(saveError, doc){
        if(saveError) return retrollamada(saveError, null);

        // Retornar la última nota insertada (para que contenga el _id generado por mongo)
        retrollamada(null, doc.notas[doc.notas.length - 1]);
    });
};

// Obtener todas las notas de forma [estructuraNota]
// La firma de la retrollamada es la siguiente:
// function(error: Error, notas: [estructuraNota])
usuarioEsquema.statics.getNotas = function(token, retrollamada){
    let proxy = this;
    if(!token) return retrollamada(new Error("No se recibió un token"), null);

    SesionModelo.encontrarPorToken(token, function(encontrarError, sesion){
        if(encontrarError) return retrollamada(encontrarError, null);
        if(!sesion) return retrollamada(new Error("No existe una sesion valida pertenenciente al token recibido."), null);
        // Si la sesión es válida, usar el nombre de usuario para obtener un usuario
        proxy.findOne({username: sesion.username}, function(findError, usuario){
            if(findError) return retrollamada(findError, null);
            
            // Modificar el _id para que sea una cadena en lugar de un objeto
            let notasRetorno = usuario.notas.map(function(valor){
                valor._id = valor._id.toString();
                return valor;
            });
            // Retormar el arreglo de notas
            retrollamada(null, notasRetorno);
        });
    });
};

// Modificar una nota utilizando la estructura recibida
// la firma de la retrollamada es la siguiente:
// function(error: Error, nota: estructuraNota)
usuarioEsquema.statics.actualizar = function(token, estructuraNota, retrollamada){
    // Verificar los datos requeridos
    if(!token || !estructuraNota || !estructuraNota._id){
        return retrollamada(new Error("No se recibieron todos los datos requeridos"), null);
    };

    let proxy = this;
    SesionModelo.encontrarPorToken(token, function(encontrarError, sesion){
        if(encontrarError) return retrollamada(encontrarError, null);
        if(!sesion) return retrollamada(new Error("No existe una sesión válida perteneciente al token recibido."), null);

        proxy.findOne({username: sesion.username}, function(findError, usuario){
            if(findError) return retrollamada(findError, null);
            
            // Encontrar el indice de la nota que tenga el mismo ID
            let indice = usuario.notas.findIndex(function(elemento){
                return elemento._id.toString() === estructuraNota._id;
            });
            if(indice < 0) return retrollamada(new Error("El _id no es válido"), null);
            // Actualizando los datos
            usuario.notas[indice].titulo =  estructuraNota.titulo;
            usuario.notas[indice].contenido = estructuraNota.contenido;
            usuario.notas[indice].esFija = estructuraNota.esFija;
            usuario.notas[indice].ultimaEdicion = new Date();

            // Guardando los nuevos datos en la BD
            usuario.save(function(saveError, doc){
                if(saveError) return retrollamada(saveError, null);
                // Retornando el documento Nota
                let nuevaNota = doc.notas[indice];
                nuevaNota._id = nuevaNota._id.toString();
                retrollamada(null, nuevaNota);
            });
        });
    });
};

module.exports = mongoose.model('Usuario', usuarioEsquema);