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
  "cashier-close",
  "show-receipt"
];


const ALLOWED_RECEIVED_CHANNELS = [
  "user-details"
];



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
  },
  removeListeners: () => {
    try {
      ALLOWED_RECEIVED_CHANNELS.forEach(
        channel => {
          const func = ipcRenderer.listeners(channel)[0];
          if (func)
            ipcRenderer.removeListener(channel, func);
        }
      )
    }
    catch (error) {
      console.error("Error Removing Event Listeners at cashierAPI");
    }
  }
});
