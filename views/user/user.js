console.log('User Scripts Running..');

const { ipcRenderer } = require('electron');


// DOM Nodes
const createUserBtn = document.getElementById('create-user');
const editUser = document.getElementById('edit-user');


createUserBtn.addEventListener('click', () => {
  // send request to open new user create window from main process
  // @param1 - the channel name from which the main process will recive to open the new window to create new data
  // @param2 - the data type
  sendIpcMsgToMain('create-modal', 'user');
});


/*
  send ipc message to Main Process
  @param1 - ipcChannelName: the channel name from which the main process will receive message
  @param2 - msg: the content (or the msg), being sent inside the ipc message
  */
function sendIpcMsgToMain(ipcChannelName, msg) {
  ipcRenderer.send(ipcChannelName, msg);
}


function editOnClick() {
  alert('edit on click')
}
