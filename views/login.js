console.log('external login scripts');
const { ipcRenderer } = require('electron');

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
ipcRenderer.on('register-login-response', (e, response) => {
  console.log(response);
  toggleModalButtons(true);
  showErrorMessage(response);
});

cancelButton.addEventListener('click', () => {
  console.log('Cancel Login');
  sendIpcMsgToMain('dismiss-login-modal', '');
});
