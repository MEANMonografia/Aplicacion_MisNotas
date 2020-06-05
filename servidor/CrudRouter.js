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
router.post('/crear', (req, res, next)=>{
    if(!req.body){
        res.json(NO_DATA_ERROR);
    } else {
        Usuario.crearNota(req.body.token, req.body.datosNota, function(crearError, estructuraNota){
            res.json({
                error: crearError? crearError.message: null,
                estructuraNota
            });
        });
    }
    res.end();
});

router.post('/modificar', (req, res, next)=>{

});

router.post('/eliminar', (req, res, next)=>{

});

router.post('/getnotas', (req, res, next)=>{

});

router.post('/setnotasfijas', (req, res, next)=>{

});

module.exports = router;