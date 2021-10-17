// console.log('external login scripts');
const { ipcRenderer } = require('electron');
// const { redirectToAdminPannel } = require('./helper.js');

// DOM nodes
const username = document.getElementById('username');
const password = document.getElementById('password');
const loginButton = document.getElementById('login');
const cancelButton  = document.getElementById('login-cancel');
const errorDiv = document.getElementById('error');


function toggleModalButtons(show) {
  if (show) {
    loginButton.disabled = false;
    loginButton.innerText = 'Login';
    cancelButton.style.display = 'block';
  }
  else {
    loginButton.disabled = true;
    loginButton.innerText = 'Loading...';
    cancelButton.style.display = 'none';
  }
}

/* send ip message to main process */
function sendIpcMsgToMain(msg, content) {
  ipcRenderer.send(msg, content);
}


function showErrorMessage(msg) {
  let errorNode = document.createElement('div');
  errorNode.setAttribute('class', 'alert alert-danger');
  errorNode.setAttribute('role', 'alert');
  errorNode.innerHTML = msg;
  errorDiv.appendChild(errorNode);
}

loginButton.addEventListener('click', (e) => {
  e.preventDefault();
  console.log(username.value, password.value);
  if (username.value === '' || password.value === '')
    return;
  sendIpcMsgToMain('register-login-request', {username: username.value, password : password.value});

  toggleModalButtons(false);
})

// handle login response from main process
ipcRenderer.on('register-login-response', async (e, response) => {
  console.log(response);
  if (!response)
    showErrorMessage('Internal Server Error!');
  else if (response.status === 401)
    showErrorMessage(response.message);
  else if (response.status === 200) {
    // await redirectToAdminPannel('user-register');
    console.log('Login Successful!')
    password.value = ''
  }
  else
    showErrorMessage('Unknown Error!');
  toggleModalButtons(true);
});

cancelButton.addEventListener('click', () => {
  console.log('Cancel Login');
  sendIpcMsgToMain('dismiss-login-modal', '');
});
