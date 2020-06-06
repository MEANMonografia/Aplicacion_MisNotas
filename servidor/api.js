const express = require('express');
const router = express.Router();

const CrudRouter = require('./CrudRouter');
const Usuario = require('./Modelos/Usuario');
const NO_DATA_ERROR = require('../Globales').NO_DATA_ERROR;

router.use(express.json());

// Contestar a las llamadas a localhost/api aunque no se reciban datos
router.post('/', (req, res, next)=>{
    if(!req.body){
        res.json(NO_DATA_ERROR);
    } else {
        res.json({
            confirmacion: true,
            consulta: JSON.stringify(req.body),
            error: null
        });
    }
    res.end();
});

// Crear un hash y registrar en la base de datos la sesión
// Entrada esperada { usuario, pass }
router.post('/login', function(req, res, next){
    if(!req.body){
        res.json(NO_DATA_ERROR);
        return res.end();
    }
    Usuario.iniciarSesion(req.body.username, req.body.pass, function(error, token){
        res.json({
            error: error? error.message: null,
            token
        });
        res.end();
    });
});

router.post('/registrar', (req, res, next)=>{
    if(!req.body){
        res.json(NO_DATA_ERROR);
        return res.end();
    }
    Usuario.crearUsuario({
        username: req.body.username,
        pass: req.body.pass,
        primerNombre: req.body.primerNombre,
        primerApellido: req.body.primerApellido
    }, function(error, token){
        res.json({
            error: error ? error.message: null,
            token
        });
        res.end();
    });
});

router.use('/crud', CrudRouter);

module.exports = router;