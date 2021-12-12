/*
 * Create New Patient
 **/

// DOM Nodes
const cancelBtn = document.getElementById('dismiss-window');
const createBtn = document.getElementById('create-patient');
const errorDiv = document.getElementById('error');

let serverUrl


window.onload = () => {
  serverUrl = localStorage.getItem("serverUrl");
}


document.getElementById('fullname').focus();

// close create patient window
cancelBtn.addEventListener('click', () => {
  window.formAPI.send("dismiss-form-window", "");
});


createBtn.addEventListener('click', async (e) => {
  try {
    // prevent default behaviour on form submit
    e.preventDefault();

    const fullname = document.getElementById('fullname').value;
    const age = document.getElementById('age').value;
    const gender = document.getElementById('gender').value;
    const mobile = document.getElementById('mobile').value;
    const address = document.getElementById('address').value;
    const allergies = document.getElementById('allergies').value;

    if (!fullname || fullname === ''|| !age || age === ''|| !gender || gender === '' || !mobile || mobile === '' || !address || address === '' || !allergies || allergies === '') {
      throw new Error ("Missing Required Inputs");
    }

    const data = {
      fullname,
      gender,
      age,
      mobile,
      address,
      allergies
    }

    const response = await fetch(`${serverUrl}/api/patients`, {
      method: "POST",
      headers: {
        "Content-Type" : "application/json",
        "Accept" : "application/json"
      },
      body: JSON.stringify(data)
    });

    if (response && response.ok) {
      const json = await response.json();
      window.formAPI.send('form-data-finish', {method: 'CREATE', data: {fullname}, type: 'patient'});
    }
    else {
      const { message } = await response.json();
      const errMessage = message ? `Error Creating New Patient. ${message}`
                            : "Error Creating New Patient. code 300";

      showErorrMessage(errMessage);
    }
  }
  catch (error) {
    console.log('Error Fetching Create-New-Patient Response', error);
    showErorrMessage(error);
  }
});


function showErorrMessage (message) {

  removeErrorMessage();

  let errorNode = document.createElement('div');
  errorNode.setAttribute('class', 'alert alert-danger');
  errorNode.setAttribute('role', 'alert');
  errorNode.setAttribute("id", "error-message-create");
  errorNode.innerHTML = message;
  errorDiv.appendChild(errorNode);
}


function removeErrorMessage () {
  const errorMessageAlert = document.getElementById("error-message-create");
  if (errorMessageAlert)
    errorMessageAlert.remove();
}
