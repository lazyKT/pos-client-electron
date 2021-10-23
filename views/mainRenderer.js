/** renderer file for main.html */
const { ipcRenderer } = require('electron');
const { redirectToAdminPannel, logoutToMainMenu, reloadData } = require('./helper.js');

// DOM nodes
const registerUser = document.getElementById("user");
const setting = document.getElementById("setting");
const view_inventory = document.getElementById("inventory")
const logout = document.getElementById('logout');
const contents = document.getElementById('contents');
// const createUserBtn = document.getElementById('create-user');

console.log('Renderer JS Running...');
/* hide contents*/
contents.style.display = 'none';


logout.addEventListener('click', () => {
  // making logout request to server
  sendIpcMsgToMain('logout', 'logout');
});


setting.addEventListener('click', () => {
  console.log('Setting!');
  // request login window to enter into application setting page
  sendIpcMsgToMain('login', 'setting');
})

registerUser.addEventListener('click', () => {
  // request login window to enter into user management page
  sendIpcMsgToMain('login', 'user');
})

view_inventory.addEventListener('click', () => {

  console.log('View Inventory');
  // request login window to enter into inventory management page
  sendIpcMsgToMain('login', 'inventory');
})


ipcRenderer.on('redirect-page', async (e, response) => {
  console.log('redirect-page', response);
  await redirectToAdminPannel(response);
});


ipcRenderer.on('reload-data', async (e, data) => {
  console.log('reload-data', data);
  await reloadData(data);
});

ipcRenderer.on('logout-response', (e, response) => {
  if (response === 200)
    logoutToMainMenu();
});

// createUserBtn.addEventListener('click', openCreateUserModal());

/*
 * Request to open Create User Modal
 */
 function openCreateUserModal() {
   console.log('requesting create new user')
   // request create user modal by sending ipc message to main process
   sendIpcMsgToMain('create-modal', 'user'); // 'channel-name', 'modal-type'
 }

/* send ip message to main process */
function sendIpcMsgToMain(msg, content) {
  ipcRenderer.send(msg, content);
}
