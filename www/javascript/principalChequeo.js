(function(){
    let token = localStorage.getItem("notasToken");
    let notas = sessionStorage.getItem("notas");
    if(token){
        if(!notas){
            window.location.replace('/');
        }
    } else {
        window.location.replace('/');
    }
})();