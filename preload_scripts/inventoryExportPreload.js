const {
  ipcRenderer,
  contextBridge
} = require("electron");


const ALLOWED_SEND_CHANNELS = [
  "open-preview",
  "close-export"
]

const ALLOWED_RECEIVE_CHANNELS = [
  "server-addr"
]


contextBridge.exposeInMainWorld( "exportAPI", {
  send: (channel, args) => {
    if (ALLOWED_SEND_CHANNELS.includes(channel)) {
      ipcRenderer.send(channel, args);
    }
    else
      throw new Error ("Unknown IPC Channel detected at exportAPI.send");
  },
  receive: (channel, callback) => {
    if (ALLOWED_RECEIVE_CHANNELS.includes(channel)) {
      ipcRenderer.on (channel, (event, ...args) => callback(...args));
    }
  }
});
