/**
# Preload Scripts for booking Details
**/

const {
  contextBridge,
  ipcRenderer
} = require ('electron');
const { removeEventListeners } = require ('../ipcHelper');


const ALLOWED_RECEIVED_CHANNELS = [
  'bookingId'
];



contextBridge.exposeInMainWorld ('bookingDetailsAPI', {
  receive : (channel, cb) => {
    if (ALLOWED_RECEIVED_CHANNELS.includes(channel)) {
      ipcRenderer.on(channel, (event, ...args) => cb(...args));
    }
    else
      throw new Error (`Unknown IPC Channel, ${channel} detected @ bookingDetailsAPI.recieve!`);
  },
  removeListeners: () => {
    try {
      removeEventListeners (ipcRenderer, ALLOWED_RECEIVED_CHANNELS);
    }
    catch (error) {
      console.error("Error Removing Event Listeners at bookingDetailsAPI");
    }
  }
});
