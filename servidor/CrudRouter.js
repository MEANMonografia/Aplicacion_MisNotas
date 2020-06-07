const router = require('express').Router();

const Usuario = require('./Modelos/Usuario');
const NO_DATA_ERROR = require('../Globales').NO_DATA_ERROR;

// Formato esperado de la peticion:
// { token: String, estructuraNota: {titulo: String, contenido: String, esFija: Boolean}}
// Formato de la respuesta:
// { 
//   error: String, 
//   estructuraNota: {
//     _id: String, titulo: String, contenido: String, fechaCreacion: Date, ultimaEdicion: String, esFija: Boolean
//   }
// }
router.post('/crear', function(req, res, next){
    if(!req.body){
        res.json(NO_DATA_ERROR);
        return res.end();
    }
    Usuario.crearNota(req.body.token, req.body.estructuraNota, function(crearError, estructuraNota){
        res.json({
            error: crearError? crearError.message: null,
            estructuraNota: estructuraNota
        });
        res.end();
    });
});

// Formato esperado de la peticion:
// { token: String, estructuraNota: {_id: String, titulo: String, contenido: String, esFija: Boolean}}
// Formato de la respuesta:
// { 
//   error: String, 
//   estructuraNota: {
//     _id: String, titulo: String, contenido: String, fechaCreacion: Date, ultimaEdicion: String, esFija: Boolean
//   }
// }
router.post('/modificar', function(req, res, next){
    if(!req.body){
        res.json(NO_DATA_ERROR);
        return res.end();
    }

});

// Formato esperado de la peticion:
// { token: String, ids: [_id: String]}
// Formato de la respuesta:
// { error: String, eliminados: Number}
router.post('/eliminar', function(req, res, next){
    if(!req.body){
        res.json(NO_DATA_ERROR);
        return res.end();
    }

});

// Formato esperado de la peticion:
// { token: String }
// Formato de la respuesta:
// { error: String, notas: [estructuraNota]}
router.post('/getnotas', function(req, res, next){
    if(!req.body){
        res.json(NO_DATA_ERROR);
        return res.end();
    }

});

// Formato esperado de la peticion:
// { token: String, ids: [_id: String] }
// Formato de la respuesta:
// { error: String, fijadas: Number}
router.post('/setnotasfijas', function(req, res, next){
    if(!req.body){
        res.json(NO_DATA_ERROR);
        return res.end();
    }
    
});

module.exports = router;