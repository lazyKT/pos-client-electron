/** renderer file for main.html */
const { ipcRenderer } = require('electron');
const { redirectToAdminPannel, logoutToMainMenu } = require('./helper.js');

// DOM nodes
const registerUser = document.getElementById("user");
const setting = document.getElementById("setting");
const view_inventory = document.getElementById("inventory")
const logout = document.getElementById('logout');
const contents = document.getElementById('contents');

console.log('Renderer JS Running...');
/* hide contents*/
contents.style.display = 'none';


logout.addEventListener('click', () => {
  sendIpcMsgToMain('logout', 'logout');
});


setting.addEventListener('click', () => {
  console.log('Setting!');
  /* request login Modal to register new users */
  sendIpcMsgToMain('login', 'setting');
})

registerUser.addEventListener('click', () => {
  // console.log('Register New User!');
  /* request login Modal to register new users */
  sendIpcMsgToMain('login', 'user');
})

view_inventory.addEventListener('click', () => {
  console.log('View Inventory');
  /* request login Modal to register new users */
  sendIpcMsgToMain('inventory', 'inventory');
})


ipcRenderer.on('redirect-page', async (e, response) => {
  console.log('redirect-page', response);
  await redirectToAdminPannel(response);
});


ipcRenderer.on('logout-response', (e, response) => {
  if (response === 200)
    logoutToMainMenu();
});


/* send ip message to main process */
function sendIpcMsgToMain(msg, content) {
  ipcRenderer.send(msg, content);
}
