/**
 # Preload Scripts for Booking List Window
 **/

const {
  ipcRenderer,
  contextBridge
} = require('electron');


const ALLOWED_SEND_CHANNELS = [
  'close-booking-list'
];

const ALLOWED_RECEIVED_CHANNELS = [
  'filter'
];


contextBridge.exposeInMainWorld ('bookingListAPI', {
  send: (channel, data) => {
    if (ALLOWED_SEND_CHANNELS.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
    else
      throw new Error (`Unknown IPC Message, ${channel} detected at bookingListAPI.send`);
  },
  receive: (channel, cb) => {
    if (ALLOWED_RECEIVED_CHANNELS.includes(channel)) {
      ipcRenderer.on(channel, (event, ...args) => cb(...args));
    }
    else
      throw new Error (`Unkown IPC Message, ${channel} detected at bookingListAPI.receive`);
  },
  removeListeners: () => {
    try {
      removeEventListeners (ipcRenderer, ALLOWED_RECEIVED_CHANNELS);
    }
    catch (error) {
      console.error("Error Removing Event Listeners at bookingDetailsAPI");
    }
  }
})
