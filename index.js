const express = require('express');
const path = require('path');
const mongoose = require('mongoose');

const api = require('./servidor/Api');

const app = express();
const PORT = 5000;

mongoose.connect('mongodb://localhost:27017/aplicacionFinal', {useNewUrlParser: true, useUnifiedTopology: true},
    function(mongoError){
        if(mongoError) return console.error(mongoError.message);
        console.log("Conexión exitosa a la BD!");
    }
);

app.use(express.static(path.join(__dirname, 'www')));

app.get('/', function(req, res, next){
    res.sendFile(path.resolve(__dirname, 'www/index.html'), function(errBack){
        if(errBack) console.error(errBack.message);
        res.end();
    });
});

app.use('/api', api);

app.use((req, res, next)=>{
    res.status(404).write("Oops! Error 404: Parece que esta ruta es incorrecta");
    res.end();
});

app.listen(PORT, function(){
    console.log("Escuchando en localhost:" + PORT);
});
