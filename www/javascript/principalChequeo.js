(function(){
    let token = localStorage.getItem("valor");
    let notas = sessionStorage.getItem("notas");
    if(token){
        if(!notas){
            window.location.replace('/');
        }
    } else {
        window.location.replace('/');
    }
})();