/**
Preload Scripts for Edit/View Contents from
**/

const {
  ipcRenderer,
  contextBridge
} = require("electron");



const ALLOWED_RECEIVED_CHANNELS = [
  "response-user-data",
  "response-item-data"
];


const ALLOWED_SEND_CHANNELS = [
  "dismiss-form-window",
  "form-data-finish",
  "item-form-data-finish"
];


const ALLOWED_INVOKED_CHANNELS = [
  "edit-user",
  "edit-item",
  "edit-detail-item"
];


contextBridge.exposeInMainWorld ("editContentAPI", {
  send: (channel, data) => {
    if (ALLOWED_SEND_CHANNELS.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
    else throw new Error("Unknown IPC Message SEND");
  },
  receive: (channel, callback) => {
    if (ALLOWED_RECEIVED_CHANNELS.includes(channel)) {
      /*
        if the channel name received is listed in allowed received channels, execute callback
        otherwise, throw an error
        */
      ipcRenderer.on(channel, (event, ...args) => {
        // console.log(channel, args);
        callback(...args);
      });
    }
    else throw new Error("Unknown IPC Message Received!");
  },
  invoke: async (channel, data) => {
    if (ALLOWED_INVOKED_CHANNELS.includes(channel)) {
      try {
        const response = await ipcRenderer.invoke(channel, data);

        return response;
      }
      catch (erorr) {
        console.log(erorr);
      }
    }
    else throw new Error("Unknown IPC Message Invoked");
  }
});
