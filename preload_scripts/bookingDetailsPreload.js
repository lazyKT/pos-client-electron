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


const ALLOWED_SEND_CHANNELS = [
  'close-booking-details'
];



contextBridge.exposeInMainWorld ('bookingDetailsAPI', {
  send: (channel, data) => {
    if (ALLOWED_SEND_CHANNELS.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
    else
      throw new Erorr (`Unknown IPC Channel, ${channel} detected @ bookingDetailsAPI.send!`);
  },
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
