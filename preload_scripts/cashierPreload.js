/**
# Preload Scripts for cashier browser window
**/

const {
  ipcRenderer,
  contextBridge
} = require('electron');



const ALLOWED_SEND_CHANNELS = [
  "member-checkout-window",
  "open-payment-summary",
  "cashier-close"
];


const ALLOWED_RECEIVED_CHANNELS = [
  "member-select",
  "reset-cashier-window"
];

//
// const ALLOWED_INVOKED_CHANNELS = [
//
// ];



contextBridge.exposeInMainWorld('cashierAPI', {
  send: (channel, data) => {
    if (ALLOWED_SEND_CHANNELS.includes(channel)) {

      ipcRenderer.send(channel, data);
    }
    else throw new Error ("Unkown IPC Channels detected at chashierAPI.send");
  },
  receive: (channel, cb) => {
    if (ALLOWED_RECEIVED_CHANNELS.includes(channel)) {
      ipcRenderer.on(channel, (event, ...args) => cb(...args));
    }
    else throw new Error ("Unkown IPC Channels detected at chashierAPI.reciee");
  }
});
