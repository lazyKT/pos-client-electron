/**
Preload Scripts for Edit/View Contents from
**/

const {
  ipcRenderer,
  contextBridge
} = require("electron");



const ALLOWED_RECEIVED_CHANNELS = [
  "response-user-data",
  "response-patient-data",
  "response-edit-item-data",
  "response-services-data",
  "response-doctor-data"
];


const ALLOWED_SEND_CHANNELS = [
  "dismiss-form-window",
  "form-data-finish",
  "item-form-data-finish",
  "dismiss-edit-item-form-window",
  'patient-form-finish',
  'services-form-finish',
  'doctor-form-finish',
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
    catch(error) {
      console.error("Error Removing Event Listeners from editContentAPI\n", error);
    }
  }
});
