/** renderer file for main.html */
const { ipcRenderer } = require('electron');

// DOM nodes
const registerUser = document.getElementById("register");

console.log('Renderer JS Running...');


registerUser.addEventListener('click', () => {
  console.log('Register New User!');
  /* request login Modal to register new users */
  sendIpcMsgToMain('login', 'register');
})



/* send ip message to main process */
function sendIpcMsgToMain(msg, content) {
  ipcRenderer.send(msg, content);
}
