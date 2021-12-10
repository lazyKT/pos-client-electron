/**
 * Preload Scripts for Clinic Recipt Renderer Process
 **/

const {
  ipcRenderer,
  contextBridge
} = require('electron');
const { removeEventListeners } = require ('../ipcHelper');


const ALLOWED_RECEIVED_CHANNELS = [
  "clinic-invoice"
];

const ALLOWED_SENT_CHANNELS = [

];



contextBridge.exposeInMainWorld ("clinicReciptAPI", {
  send: (channel, data) => {
    if (ALLOWED_SENT_CHANNELS.includes(channel)) {
      ipcRenderer.send(channel, data)
    }
    else
      throw new Error (`Invalid IPC Channel, ${channel} Detected on clinicReceiptAPI send`);
  },
  receive: (channel, cb) => {
    if (ALLOWED_RECEIVED_CHANNELS.includes(channel)) {
      ipcRenderer.on(channel, (event, ...args) => cb(...args));
    }
    else
      throw new Error (`Invalid IPC Channel, ${channel} Detected on clinicReceiptAPI receive`);
  },
  removeListeners: () => {
    try {
      removeEventListeners (ipcRenderer, ALLOWED_RECEIVED_CHANNELS);
    }
    catch (error) {
      console.error("Error Removing Event Listeners at clinicReceiptAPI");
    }
  }
});
