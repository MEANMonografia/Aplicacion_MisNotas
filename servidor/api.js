const express = require('express');
const router = express.Router();

router.use(express.json());

const NO_DATA_ERROR = {
    confirmacion: false,
    consulta: null,
    error: "No se recibieron datos de entrada"
};

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
router.post('/login', (req, res, next)=>{
    if(!req.body){
        res.json(NO_DATA_ERROR);
        return res.end();
    }
    // TODO: Agregar lógica para: 
    // * Confirmar que el usuario no tenga un token ya
    // * Si el usuario no lo tiene, generarlo e insertar el objeto de sesion
    // * retornar el token al cliente
});

router.post('/registrar', (req, res, next)=>{
    if(!req.body){
        res.json(NO_DATA_ERROR);
        return res.end();
    }
    // TODO: Agregar lógica para: 
    // * Confirmar que el usuario no exista
    // * Insertar el nuevo usuario y abrir una sesion
    // * retornar el token al cliente
});

module.exports = router;