console.log('Inventory Scripts Running..');

const { ipcRenderer } = require('electron');


// DOM Nodes
const createItemBtn = document.getElementById('create-item');


createItemBtn.addEventListener('click', () => {
  // send request to open new item create window from main process
  // @param1 - the channel name from which the main process will recive to open the new window to create new data
  // @param2 - the data type
  sendIpcMsgToMain('create-modal', 'inventory');
});


/*
  send ipc message to Main Process
  @param1 - ipcChannelName: the channel name from which the main process will receive message
  @param2 - msg: the content (or the msg), being sent inside the ipc message
  */
function sendIpcMsgToMain(ipcChannelName, msg) {
  ipcRenderer.send(ipcChannelName, msg);
}