console.log('Edit Or Show User Scripts');

const { ipcRenderer } = require('electron');

// DOM Nodes
const cancelButton = document.getElementById('dismiss-window');

ipcRenderer.on('response-user-data', (e, data) => {
  console.log(data);
  const userId = document.getElementById('user-id');
  const username = document.getElementById('username');
  const email = document.getElementById('email');
  userId.value = data.id;
  username.value = data.username;
  email.value = data.email;
});


cancelButton.addEventListener('click', () => {
  ipcRenderer.send('dismiss-form-window', '');
})
