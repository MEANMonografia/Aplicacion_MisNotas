const parsearSegundos = function(seg){
    return 1000*seg;
};

const parsearMinutos = function(min){
    return parsearSegundos(60)*min;
};

const parsearHoras = function(horas){
    return parsearMinutos(60)*horas;
};

const VALIDEZ_SESION = parsearMinutos(10);

module.exports = {
    VALIDEZ_SESION
};