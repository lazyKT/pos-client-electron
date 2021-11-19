console.log('page select scripts');

const cancelButton = document.getElementById('select-page-cancel');
const selectButton = document.getElementById("select-page");


cancelButton.addEventListener ("click", e => {
    e.preventDefault();
    window.selectPageAPI.send("dismiss-page-selection-window");
});

selectButton.addEventListener ("click", e => {
    
    e.preventDefault();
    //check user choice and direct the pagename
    const patientRadio = document.getElementById('patientRadio').checked;
    const userRadio = document.getElementById('userRadio').checked;
    if(patientRadio == true){
        window.selectPageAPI.send("login", 'patient');
    }
    else if(userRadio == true){
        window.selectPageAPI.send("login", 'user');
    }
});
