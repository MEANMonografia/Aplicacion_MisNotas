const express = require('express');
const path = require('path');
const mongoose = require('mongoose');

const api = require('./servidor/Api');

const app = express();
const PORT = 3000;

mongoose.connect('mongodb://localhost:27017/aplicacionFinal', {useNewUrlParser: true, useUnifiedTopology: true},
    function(mongoError){
        if(mongoError){
            console.error(mongoError.message);
            console.error("No se pudo conectar a la base de datos!");
            // Abortar el proceso por falta de acceso a una base de datos
            process.exit(-1);
        }
        console.log("Conexión exitosa a la BD!");
    }
);

app.use(express.static(path.join(__dirname, 'www')));

app.get('/', function(req, res, next){
    res.sendFile(path.resolve(__dirname, 'www/index.html'), function(errorLectura){
        if(errorLectura) console.error(errorLectura.message);
        res.end();
    });
});

app.get('/principal', function(req, res, next){
    res.sendFile(path.resolve(__dirname, 'www/principal.html'), function(errorLectura){
        if(errorLectura) console.error(errorLectura.message);
        res.end();
    });
});

app.use('/api', api);

app.use(function(req, res, next){
    res.status(404).write("Oops! Error 404: Parece que esta ruta es incorrecta");
    res.end();
});

app.listen(PORT, function(){
    console.log("Escuchando en localhost:" + PORT);
});
