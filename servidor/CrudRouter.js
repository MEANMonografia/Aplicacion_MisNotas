const router = require('express').Router();

const Usuario = require('./Modelos/Usuario');
const NO_DATA_ERROR = require('../Globales').NO_DATA_ERROR;

router.post('/crear', (req, res, next)=>{
    if(!req.body){
        res.json(NO_DATA_ERROR);
    } else {
        // TODO: Llamar a la funcion para crear nota
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