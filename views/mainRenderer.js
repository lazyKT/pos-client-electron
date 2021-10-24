/**
 WE ARE NOT USING RENDERER FILES ANYMORE.
 INSTEAD, WE WILL USED PRELOAD SCRIPTS
 */
<<<<<<< HEAD
 function openCreateUserModal() {
   console.log('requesting create new user')
   // request create user modal by sending ipc message to main process
   sendIpcMsgToMain('create-modal', 'user'); // 'channel-name', 'modal-type'
 }

/* send ip message to main process */
function sendIpcMsgToMain(msg, content) {
  ipcRenderer.send(msg, content);
}
=======

// /** renderer file for main.html */
// console.log('Main Renderer');
//
// // const { ipcRenderer } = require('electron');
// // const { redirectToAdminPannel, logoutToMainMenu, reloadData } = require('./helper.js');
// //
// // DOM nodes
// const registerUser = document.getElementById("user");
// const setting = document.getElementById("setting");
// const view_inventory = document.getElementById("inventory")
// const logout = document.getElementById('logout');
// const contents = document.getElementById('contents');
// // const createUserBtn = document.getElementById('create-user');
// //
// // console.log('Renderer JS Running...');
// // /* hide contents*/
// // contents.style.display = 'none';
// //
// //
//
// window.api.receive("fromMain", data => {
//   console.log(`Received ${data} from Main Process`);
// });
// window.api.send("toMain", 'some data');
//
// logout.addEventListener('click', () => {
//   // making logout request to server
//   window.api.send('logout', 'logout');
// });
// //
// //
// console.log('setting node', setting);
// setting.addEventListener('click', () => {
//   console.log('Setting!');
//   // request login window to enter into application setting page
//   window.api.send('login', 'setting');
// })
//
// // function redirectPage(pageName) {
// //   console.log('pageName', pageName);
// // }
// //
// // registerUser.addEventListener('click', () => {
// //   // request login window to enter into user management page
// //   sendIpcMsgToMain('login', 'user');
// // })
// //
// // view_inventory.addEventListener('click', () => {
// //
// //   console.log('View Inventory');
// //   // request login window to enter into inventory management page
// //   sendIpcMsgToMain('login', 'inventory');
// // })
// //
// //
// // ipcRenderer.on('redirect-page', async (e, response) => {
// //   // redirect to the new page after successful login
// //   await redirectToAdminPannel(response);
// // });
// //
// //
// // ipcRenderer.on('reload-data', async (e, data) => {
// //
// //   await reloadData(data);
// // });
// //
// // ipcRenderer.on('logout-response', (e, response) => {
// //   if (response === 200)
// //     logoutToMainMenu();
// // });
// //
// // /*
// //  * Request to open Create User Modal
// //  */
// //  function openCreateUserModal() {
// //    // request create user modal by sending ipc message to main process
// //    sendIpcMsgToMain('create-modal', 'user'); // 'channel-name', 'modal-type'
// //  }
// //
// //
// // /* send ip message to main process */
// // function sendIpcMsgToMain(msg, content) {
// //   ipcRenderer.send(msg, content);
// // }
>>>>>>> d8cfe81f5458e2d3a902a2c1acd614b691e2ae10
