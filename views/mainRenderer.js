/** renderer file for main.html */
const { ipcRenderer } = require('electron');
const { redirectToAdminPannel } = require('./helper.js');

// DOM nodes
const registerUser = document.getElementById("register");

console.log('Renderer JS Running...');


registerUser.addEventListener('click', () => {
  console.log('Register New User!');
  /* request login Modal to register new users */
  sendIpcMsgToMain('login', 'register');
})


ipcRenderer.on('redirect-page', async response => {
  console.log(response);
  await redirectToAdminPannel('user-register');
});


/* send ip message to main process */
function sendIpcMsgToMain(msg, content) {
  ipcRenderer.send(msg, content);
}
