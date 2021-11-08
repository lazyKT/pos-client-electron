/**
 Preload Script for Form Window
**/

const {
  ipcRenderer,
  contextBridge
} = require("electron");



const ALLOWED_SEND_CHANNELS = [
  "dismiss-form-window",
  "form-data-finish"
];


const ALLOWED_RECEIVE_CHANNELS = [
  "app-config"
];


contextBridge.exposeInMainWorld ( "formAPI", {
  send: (channel, data) => {
    if (ALLOWED_SEND_CHANNELS.includes(channel)) {

      ipcRenderer.send(channel, data);
    }
    else throw new Error(`Unkown IPC Channel, ${channel} in send`);
  },
  receive: (channel, callback) => {
    if (ALLOWED_RECEIVE_CHANNELS.includes(channel)) {
      ipcRenderer.on(channel, (event, ...args) => callback(...args));
    }
    else throw new Error(`Unkown IPC Channel, ${channel} in formAPI.receive`);
  }
});
