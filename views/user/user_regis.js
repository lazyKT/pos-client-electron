/*
 * Create New User
 **/

// DOM Nodes
const cancelBtn = document.getElementById('dismiss-window');
const createBtn = document.getElementById('create-user');
const errorDiv = document.getElementById('error');

let serverUrl


window.onload = () => {
  serverUrl = localStorage.getItem("serverUrl");
}


document.getElementById('username').focus();

// close create user window
cancelBtn.addEventListener('click', () => {
  window.formAPI.send("dismiss-form-window", "");
});


createBtn.addEventListener('click', async (e) => {
  try {
    // prevent default behaviour on form submit
    e.preventDefault();

    const username = document.getElementById('username').value;
    const mobile = document.getElementById('mobile').value;
    const password = document.getElementById('password').value;
    const accLevel = document.getElementById('acc-lvl').value;
    const fName = document.getElementById('fName').value;

    if (!username || username === '' || !mobile || mobile === '' || !password || password === '' || !fName || fName === '') {
      throw new Error ("Missing Required Inputs");
    }

    const data = {
      username,
      mobile,
      password,
      fullName: fName,
      level: accLevel
    }

    const response = await fetch(`${serverUrl}/api/employees`, {
      method: "POST",
      headers: {
        "Content-Type" : "application/json",
        "Accept" : "application/json"
      },
      body: JSON.stringify(data)
    });

    if (response && response.ok) {
      const json = await response.json();
      window.formAPI.send('form-data-finish', {method: 'CREATE', data: {username}, type: 'user'});
    }
    else {
      const { message } = await response.json();
      const errMessage = message ? `Error Creating New User. ${message}`
                            : "Error Creating New User. code 300";

      showErorrMessage(errMessage);
    }
  }
  catch (error) {
    console.log('Error Fetching Create-New-User Response', error);
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
