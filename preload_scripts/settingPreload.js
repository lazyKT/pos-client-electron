/**
# Preload scripts for setting
**/

const {
  ipcRenderer,
  contextBridge
} = require("electron");


const ALLOWED_SEND_CHANNELS = [
  "close-setting"
]

const ALLOWED_RECEIVED_CHANNELS = [
  "load-setting"
];

contextBridge.exposeInMainWorld ("settingAPI", {
  send: (channel, args) => {
    if (ALLOWED_SEND_CHANNELS.includes(channel)) {
      ipcRenderer.send(channel, args);
    }
    else throw new Error ("Unknown IPC CHANNEL detected at setting preload send.");
  },
  receive: (channel, callback) => {
    if (ALLOWED_RECEIVED_CHANNELS.includes(channel)) {
      ipcRenderer.receive (channel, (event, ...args) => callback(..args));
    }
    else throw new Error ("Unknown IPC CHANNEL detected at setting preload receive")
  }
});
